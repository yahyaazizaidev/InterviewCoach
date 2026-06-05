import os
import uuid
import subprocess
import logging
import warnings
import re
from pathlib import Path
from collections import Counter
import cv2
import numpy as np
import librosa
from scipy.spatial import distance
try:
    from fer import FER
    FER_AVAILABLE = True
except:
    FER_AVAILABLE = False

from faster_whisper import WhisperModel

whisper_model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)

import mediapipe as mp
warnings.filterwarnings("ignore")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("extractor")
# ==================== CONFIG ====================
SAMPLE_RATE = 16000
MAX_FRAME_WIDTH = 640
MAX_SAMPLE_FPS = 5
MAX_FRAMES = 250
LEFT_EYE_IDX = [33, 7, 163, 144, 145, 153]
RIGHT_EYE_IDX = [362, 382, 381, 380, 374, 373]
MOUTH_LEFT = 61
MOUTH_RIGHT = 291
MOUTH_CENTER = 13
MOUTH_TOP = 13
MOUTH_BOTTOM = 14
NOSE_TIP = 1
LEFT_EBROW = [65, 66, 55]

# ==================== HELPERS ====================
def safe_num(x, default=0.0):
    try:
        v = float(x)
        if np.isnan(v) or np.isinf(v):
            return default
        return v
    except:
        return default


def run_ffmpeg_extract(video_path, out_wav, sr=SAMPLE_RATE):
    cmd = [
        "ffmpeg", "-y", "-i", str(video_path),
        "-vn", "-acodec", "pcm_s16le", "-ar", str(sr), "-ac", "1",
        str(out_wav)
    ]
    try:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return Path(out_wav).exists()
    except:
        return False


def eye_aspect_ratio(pts):
    try:
        p = np.asarray(pts, dtype=float)
        v1 = distance.euclidean(p[1], p[5])
        v2 = distance.euclidean(p[2], p[4])
        h = distance.euclidean(p[0], p[3])
        if h <= 1e-6:
            return 0.0
        return float((v1 + v2) / (2.0 * h))
    except:
        return 0.0


def estimate_frame_emotion_geometric(flm):
    try:
        ml = np.array([flm[MOUTH_LEFT].x, flm[MOUTH_LEFT].y])
        mr = np.array([flm[MOUTH_RIGHT].x, flm[MOUTH_RIGHT].y])
        mc = np.array([flm[MOUTH_CENTER].x, flm[MOUTH_CENTER].y])
        smile_w = np.linalg.norm(ml - mr) + 1e-8
        smile_h = np.linalg.norm(mc - (ml + mr) / 2.0)
        smile = smile_h / smile_w

        top = np.array([flm[MOUTH_TOP].x, flm[MOUTH_TOP].y])
        bottom = np.array([flm[MOUTH_BOTTOM].x, flm[MOUTH_BOTTOM].y])
        mouth_open = np.linalg.norm(top - bottom)

        eb = np.mean([np.array([flm[i].x, flm[i].y]) for i in LEFT_EBROW], axis=0)
        nose = np.array([flm[NOSE_TIP].x, flm[NOSE_TIP].y])
        eb_raise = nose[1] - eb[1]

        if smile > 0.018:
            return 1
        if mouth_open > 0.08:
            return 1
        if eb_raise < -0.01:
            return 0
        return 2
    except:
        return 2


# ==================== VISUAL FEATURES ====================
def extract_visual_features(video_path):
    mp_pose = mp.solutions.pose
    mp_face = mp.solutions.face_mesh
    mp_hands = mp.solutions.hands

    if FER_AVAILABLE:
        try:
            emotion_detector = FER(mtcnn=True)
        except:
            emotion_detector = FER()
    else:
        emotion_detector = None

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return None

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    stride = max(1, int(round(fps / MAX_SAMPLE_FPS)))

    head_moves, posture_scores, smile_scores = [], [], []
    gaze_ratios, emotions_geometric = [], []
    gesture_count = 0
    prev_hand_center = None

    ear_history = []
    in_blink = False
    blink_start = None
    last_blink = None
    blink_count = 0

    frames_processed = 0
    frames_read = 0

    with mp_pose.Pose() as pose, mp_face.FaceMesh(refine_landmarks=True) as face, mp_hands.Hands() as hands:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frames_read += 1
            if (frames_read - 1) % stride != 0:
                continue

            h, w = frame.shape[:2]
            if w > MAX_FRAME_WIDTH:
                frame = cv2.resize(frame, (MAX_FRAME_WIDTH, int(h * (MAX_FRAME_WIDTH / w))))

            img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames_processed += 1
            timestamp = frames_processed / min(fps, MAX_SAMPLE_FPS)

            # POSE
            p = pose.process(img)
            if p.pose_landmarks:
                lm = p.pose_landmarks.landmark
                nose = np.array([lm[0].x, lm[0].y])
                head_moves.append(nose[1])

                left_sh = lm[11].y
                right_sh = lm[12].y
                posture_scores.append(max(0, 1 - abs(left_sh - right_sh) * 4))

            # FACE
            f = face.process(img)
            ear_mean = None
            if f.multi_face_landmarks:
                flm = f.multi_face_landmarks[0].landmark

                left_eye_pts = [(flm[i].x, flm[i].y) for i in LEFT_EYE_IDX]
                right_eye_pts = [(flm[i].x, flm[i].y) for i in RIGHT_EYE_IDX]

                le = eye_aspect_ratio(left_eye_pts)
                re = eye_aspect_ratio(right_eye_pts)
                ear_mean = (le + re) / 2
                ear_history.append((timestamp, ear_mean))

                # Gaze
                left_eye_center = np.mean([(flm[33].x, flm[33].y), (flm[133].x, flm[133].y)], axis=0)
                right_eye_center = np.mean([(flm[362].x, flm[362].y), (flm[263].x, flm[263].y)], axis=0)
                eye_center = (left_eye_center + right_eye_center) / 2
                nose_tip = np.array([flm[NOSE_TIP].x, flm[NOSE_TIP].y])
                gaze_ratios.append(max(0, 1 - (np.linalg.norm(eye_center - nose_tip) / 0.12)))

                # Smile
                ml = np.array([flm[MOUTH_LEFT].x, flm[MOUTH_LEFT].y])
                mr = np.array([flm[MOUTH_RIGHT].x, flm[MOUTH_RIGHT].y])
                mc = np.array([flm[MOUTH_CENTER].x, flm[MOUTH_CENTER].y])
                smile_scores.append(np.linalg.norm(mc - (ml + mr) / 2) / (np.linalg.norm(ml - mr) + 1e-8))

                emotions_geometric.append(estimate_frame_emotion_geometric(flm))

            # HANDS
            hres = hands.process(img)
            if hres.multi_hand_landmarks:
                centers = []
                for hand in hres.multi_hand_landmarks:
                    pts = hand.landmark
                    xs = [pts[i].x for i in [0, 1, 5, 9, 13, 17]]
                    ys = [pts[i].y for i in [0, 1, 5, 9, 13, 17]]
                    centers.append(np.array([np.mean(xs), np.mean(ys)]))

                cur = np.mean(centers, axis=0)
                if prev_hand_center is not None:
                    if np.linalg.norm(cur - prev_hand_center) > 0.03:
                        gesture_count += 1
                prev_hand_center = cur

            # BLINK LOGIC
            if ear_mean is not None:
                arr = np.array([e for _, e in ear_history[-50:]])
                if arr.size:
                    med = np.median(arr)
                    std = np.std(arr)
                    blink_thresh = max(0.11, med - 0.6 * std)
                else:
                    blink_thresh = 0.18

                if ear_mean < blink_thresh and not in_blink:
                    in_blink = True
                    blink_start = timestamp

                if in_blink and ear_mean >= blink_thresh:
                    dur = timestamp - (blink_start or timestamp)
                    if dur >= 0.04:
                        if last_blink is None or (timestamp - last_blink) >= 0.18:
                            blink_count += 1
                            last_blink = timestamp
                    in_blink = False

            if frames_processed >= MAX_FRAMES:
                break

    cap.release()
    secs = max(1.0, frames_processed / min(fps, MAX_SAMPLE_FPS))

    # FINAL EMOTION
    dominant_emotion = Counter(emotions_geometric).most_common(1)[0][0]

    return {
        "gaze_straight_ratio": safe_num(np.mean(gaze_ratios)),
        "blink_rate_per_min": safe_num((blink_count / secs) * 60),
        "head_movement_avg": safe_num(np.mean(np.diff(head_moves))) if len(head_moves) > 1 else 0,
        "posture_score": safe_num(np.mean(posture_scores)),
        "gesture_frequency": safe_num(gesture_count / secs),
        "smile_intensity": safe_num(np.mean(smile_scores)),
        "dominant_emotion": dominant_emotion,
    }


# ==================== AUDIO FEATURES ====================
def extract_acoustic_features(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=SAMPLE_RATE)

        # Pitch detection
        pitch_mean = 0.0
        try:
            f0, _, _ = librosa.pyin(y, fmin=50, fmax=400, sr=sr)
            if f0 is not None:
                f0_clean = f0[~np.isnan(f0)]
                if f0_clean.size:
                    pitch_mean = float(np.mean(f0_clean))
        except:
            pitch_mean = 0.0

        rms = librosa.feature.rms(y=y)[0]
        energy_mean = float(np.mean(rms)) if rms.size else 0.0

        duration = len(y) / sr

        return pitch_mean, energy_mean, duration

    except:
        return 0.0, 0.0, 1.0


def detect_audio_emotion(pitch, energy):
    if energy > 0.06 and pitch > 200:
        return 1
    if energy > 0.06:
        return 0
    if energy < 0.03:
        return 0
    return 2


# def extract_verbal_features(audio_path):
#     if aai is None:
#         raise Exception("AssemblyAI not installed")

#     aai.settings.api_key = ASSEMBLYAI_KEY

#     pitch_mean, energy_mean, duration = extract_acoustic_features(audio_path)

#     cfg = aai.TranscriptionConfig(
#         punctuate=True,
#         disfluencies=True
#     )

#     # FIX: load file bytes instead of passing path
#     with open(audio_path, "rb") as f:
#         audio_bytes = f.read()

#     # Send bytes for transcription
#     tr = aai.Transcriber().transcribe(audio_bytes, cfg)

#     # -----------------------------
#     # Extract verbal features
#     # -----------------------------
#     words = tr.words
#     text_words = [w.text.lower() for w in words]
#     total_words = len(text_words)

#     audio_duration = getattr(tr, "audio_duration", duration)
#     wpm = total_words / max(audio_duration / 60, 1e-6)

#     filler_patterns = [
#         r"\bum+\b", r"\buh+\b", r"\bah+\b", r"\bokay\b", r"\bwell\b"
#     ]

#     full_text = " ".join(text_words)
#     filler_count = sum(len(re.findall(p, full_text)) for p in filler_patterns)
#     fillers=0
#     if filler_count>0:
#         fillers=(filler_count/total_words)*100

#     pauses = []
#     for i in range(1, len(words)):
#         prev_end = words[i - 1].end
#         cur_start = words[i].start
#         gap = (cur_start - prev_end) / 1000
#         if 0.15 <= gap <= 2.5:
#             pauses.append(gap)

#     avg_pause = float(np.mean(pauses)) if pauses else 0.5

#     reps = sum(
#         1 for i in range(1, len(text_words))
#         if text_words[i] == text_words[i - 1]
#     )

#     audio_emotion = detect_audio_emotion(pitch_mean, energy_mean)
#     return {
#         "wpm": float(wpm),
#         "filler_word_count": int(fillers),
#         "pitch_mean": float(pitch_mean),
#         "energy_mean": float(energy_mean),
#         "pause_frequency": float(avg_pause),
#         "audio_emotion": audio_emotion,
#         "transcript": tr.text,
# }

def extract_verbal_features(audio_path):

    pitch_mean, energy_mean, duration = extract_acoustic_features(audio_path)

    segments, info = whisper_model.transcribe(
        str(audio_path),
        beam_size=5,
        word_timestamps=True
    )

    words = []
    transcript_parts = []

    for segment in segments:
        transcript_parts.append(segment.text)

        if segment.words:
            for w in segment.words:
                words.append({
                    "text": w.word.strip(),
                    "start": w.start,
                    "end": w.end
                })

    transcript = " ".join(transcript_parts).strip()

    text_words = [w["text"].lower() for w in words]
    total_words = len(text_words)

    wpm = total_words / max(duration / 60, 1e-6)

    filler_patterns = [
        r"\bum+\b",
        r"\buh+\b",
        r"\bah+\b",
        r"\bokay\b",
        r"\bwell\b"
    ]

    full_text = " ".join(text_words)

    filler_count = sum(
        len(re.findall(p, full_text))
        for p in filler_patterns
    )

    fillers = 0
    if total_words > 0:
        fillers = (filler_count / total_words) * 100

    pauses = []

    for i in range(1, len(words)):
        gap = words[i]["start"] - words[i - 1]["end"]

        if 0.15 <= gap <= 2.5:
            pauses.append(gap)

    avg_pause = float(np.mean(pauses)) if pauses else 0.5

    audio_emotion = detect_audio_emotion(
        pitch_mean,
        energy_mean
    )

    return {
        "wpm": float(wpm),
        "filler_word_count": int(fillers),
        "pitch_mean": float(pitch_mean),
        "energy_mean": float(energy_mean),
        "pause_frequency": float(avg_pause),
        "audio_emotion": audio_emotion,
        "transcript": transcript,
    }
# ==================== FINAL FUNCTION CALLED BY API ====================
def process_single_video(video_path):
    tmp_audio = Path(f"tmp_{uuid.uuid4().hex}.wav")

    try:
        ok = run_ffmpeg_extract(video_path, tmp_audio)

        visual = extract_visual_features(video_path)
        if visual is None:
            visual = {
                "gaze_straight_ratio": 0,
                "blink_rate_per_min": 0,
                "head_movement_avg": 0,
                "posture_score": 0,
                "gesture_frequency": 0,
                "smile_intensity": 0,
                "dominant_emotion": "neutral",
            }
            
       

        verbal = extract_verbal_features(tmp_audio) if ok else {
            "wpm": 0,
            "filler_word_count": 0,
            "pitch_mean": 0,
            "energy_mean": 0,
            "pause_frequency": 0,
            "audio_emotion": "neutral",
        }

        return {
            **visual,
            **verbal
        }

    finally:
        if tmp_audio.exists():
            tmp_audio.unlink()

from predict_ai import model_columns,predict_confidence_from_features  # <-- IMPORT TRAINED ORDER
def extract_features_for_backend(video_path: str):
    data = process_single_video(Path(video_path))  # dict with features + transcript (if using AssemblyAI)
    # Extract transcript
    transcript = data.get("transcript", "")
    print(data)

    # Extract model features in order
    features = []
    for col in model_columns:
        features.append(float(data.get(col, 0)))
    conf=predict_confidence_from_features(features)
    
    return {
        "features": data,
        "transcript": transcript,
        "conf":conf
    }
    