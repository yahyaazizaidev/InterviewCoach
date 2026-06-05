import sys
import json
import os
import numpy as np
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
from extractor import extract_features_for_backend
import mysql.connector
from decimal import Decimal
import traceback
import sys
from sentence_transformers import SentenceTransformer
sys.stdout.reconfigure(encoding='utf-8')
model = SentenceTransformer("all-MiniLM-L6-v2")


model_columns = [
    "wpm",
    "filler_word_count",
    # "pitch_mean",
    "energy_mean",
    "pause_frequency",
    "gaze_straight_ratio",
    "blink_rate_per_min",
    # "head_movement_avg",
    "posture_score",
    "gesture_frequency",
    "smile_intensity",
    # "dominant_emotion",
    "audio_emotion"
]
feature_store = {}
IDEAL_VALUES = {
    "gaze_straight_ratio": 0.6,
    "blink_rate_per_min": 20,
    "head_movement_avg": 0.015,
    "posture_score": 0.7,
    "gesture_frequency": 0.7,
    "smile_intensity": 0.02,
    "wpm": 140,
    "pitch_mean": 110,
    "energy_mean": 0.03,
    "pause_frequency": 1.2
}

def reasoning_suggestions_all(features: dict):
    """
    Input: extracted feature dict
    Output: structured suggestions with your value, ideal value, percentage, and feedback
    Only includes features that are actually present in the input dict.
    """

    suggestions = []

    def add(feature, your, ideal, feedback, percentage):
        suggestions.append({
            "feature": feature,
            "your": your,
            "ideal": ideal,
            "percentage": round(percentage, 1),
            "feedback": feedback
        })

    # ================= Eye Contact =================
    if "gaze_straight_ratio" in features:
        gaze = features["gaze_straight_ratio"]
        ideal_gaze = 0.6
        percentage = min((gaze / ideal_gaze) * 100, 100)

        if gaze >= 0.5:
            add("Eye Contact", f"{gaze:.2f}", f"{ideal_gaze:.2f}", "Maintained good eye contact.", percentage)
        elif 0.35 <= gaze < 0.5:
            add("Eye Contact", f"{gaze:.2f}", f"{ideal_gaze:.2f}", "Try to increase eye contact slightly.", percentage)
        else:
            add("Eye Contact", f"{gaze:.2f}", f"{ideal_gaze:.2f}", "Increase eye contact with the person.", percentage)

    # ================= Blink Rate =================
    if "blink_rate_per_min" in features:
        blink = features["blink_rate_per_min"]

        if 15 <= blink <= 25:
            percentage = 100
        elif blink < 15:
            percentage = min((blink / 15) * 100, 100)
        else:  # blink > 25
            percentage = min((25 / blink) * 100, 100)

        if 15 <= blink <= 25:
            add("Blink Rate", f"{blink:.1f}/min", "15-25/min", "Blink rate is normal.", percentage)
        elif 8 <= blink < 15 or 26 <= blink <= 30:
            add("Blink Rate", f"{blink:.1f}/min", "15-25/min", "Blink naturally to appear relaxed.", percentage)
        else:
            add("Blink Rate", f"{blink:.1f}/min", "15-25/min", "Blink rate is too low or high; stay relaxed.", percentage)


    # ================= Posture =================
    if "posture_score" in features:
        posture = features["posture_score"]
        ideal_posture = 0.7

        percentage = min((posture / ideal_posture) * 100, 100)

        if posture >= 0.8:
            add("Posture", f"{posture:.2f}", f">= {ideal_posture:.2f}", "Posture is professional and upright.", percentage)
        elif 0.7 <= posture < 0.8:
            add("Posture", f"{posture:.2f}", f">= {ideal_posture:.2f}", "Posture is okay, but could be more upright.", percentage)
        else:
            add("Posture", f"{posture:.2f}", f">= {ideal_posture:.2f}", "Maintain upright posture to appear professional.", percentage)

    # ================= Gestures =================
    if "gesture_frequency" in features:
        gesture = features["gesture_frequency"]
        ideal_min, ideal_max = 0.2, 1.2

        if ideal_min <= gesture <= ideal_max:
            percentage = 100
        elif gesture < ideal_min:
            percentage = min((gesture / ideal_min) * 100, 100)
        else:  # gesture > ideal_max
            percentage = min((ideal_max / gesture) * 100, 100)

        if ideal_min <= gesture <= ideal_max:
            add("Gestures", f"{gesture:.2f}", f"{ideal_min}-{ideal_max}", "Gestures are balanced and supportive.", percentage)
        elif 0.15 <= gesture < ideal_min or ideal_max < gesture <= 1.5:
            add("Gestures", f"{gesture:.2f}", f"{ideal_min}-{ideal_max}", "Gestures are slightly off; adjust for clarity.", percentage)
        else:
            if gesture < 0.15:
                add("Gestures", f"{gesture:.2f}", f"{ideal_min}-{ideal_max}", "Too few gestures; use gestures to improve clarity.", percentage)
            else:
                add("Gestures", f"{gesture:.2f}", f"{ideal_min}-{ideal_max}", "Too many gestures; control them for clarity.", percentage)

    # ================= Smile =================
    if "smile_intensity" in features:
        smile = features["smile_intensity"]
        percentage = min((smile / 0.02) * 100, 100)

        if smile < 0.02:
            add("Smile", f"{smile:.2f}", ">=0.02", "Add a slight natural smile to appear approachable.", percentage)
        else:
            add("Smile", f"{smile:.2f}", ">=0.02", "Facial expressions are friendly.", percentage)

    # ================= Speaking Rate =================
    if "wpm" in features:
        wpm = features["wpm"]

        if 110 <= wpm <= 170:
            percentage = 100
        elif wpm < 110:
            percentage = min((wpm / 110) * 100, 100)
        else:
            percentage = min((170 / wpm) * 100, 100)

        if wpm < 110:
            add("Speaking Rate", int(wpm), "110-170 WPM", "Increase speaking pace slightly.", percentage)
        elif wpm > 170:
            add("Speaking Rate", int(wpm), "110-170 WPM", "Slow down for clarity.", percentage)
        else:
            add("Speaking Rate", int(wpm), "110-170 WPM", "Speaking pace is good.", percentage)


    # ================= Energy =================
    if "energy_mean" in features:
        energy = features["energy_mean"]
        percentage = min((energy / 0.03) * 100, 100)

        if energy >= 0.06:
            add("Energy", f"{energy:.2f}", ">=0.03", "Vocal energy is strong and enthusiastic.", percentage)
        elif 0.03 <= energy < 0.06:
            add("Energy", f"{energy:.2f}", ">=0.03", "Vocal energy is okay; speak with slightly more energy.", percentage)
        else:
            add("Energy", f"{energy:.2f}", ">=0.03", "Speak with more energy to sound enthusiastic.", percentage)

   #================= Pauses =================
    if "pause_frequency" in features:
        pause = features["pause_frequency"]

        if pause <= 1.2:
            percentage = 100
        else:
            percentage = max(0, (1.2 / pause) * 100)

        if pause <= 1.0:
            add("Pauses", f"{pause:.2f}", "<=1.2", "Pauses are natural and well-paced.", percentage)
        elif 1.0 < pause <= 1.5:
            add("Pauses", f"{pause:.2f}", "<=1.2", "Pauses are slightly long; try to maintain flow.", percentage)
        else:
            add("Pauses", f"{pause:.2f}", "<=1.2", "Pauses are too long; reduce them for better flow.", percentage)

   
    # ================= Audio Emotion =================
    if "audio_emotion" in features:
        audio_emotion = features["audio_emotion"]

        if audio_emotion ==1:
            percentage = 100
            add("Vocal Emotion", "Happy", "Positive/Confident", "Vocal emotion is confident and engaging.", percentage)
        elif audio_emotion == 2:
            percentage = 70
            add("Vocal Emotion", "Neutral", "Positive/Confident", "Vocal emotion is okay; add enthusiasm.", percentage)
        else:
            percentage = 40
            add("Vocal Emotion", "sad", "Positive/Confident", "Add vocal enthusiasm to engage listener.", percentage)

    return suggestions



def calculate_feature_percentage(feature_store):

    result = {}

    # Define direction rules per feature
    # True = higher is better
    # False = lower is better
    direction_map = {
        "wpm": True,
        "energy_mean": True,
        "posture_score": True,
        "gaze_straight_ratio": True,
        "gesture_frequency": True,
        "smile_intensity": True,

        "pause_frequency": False,
        "filler_word_count": False,
        "head_movement_avg": False,
        "blink_rate_per_min": False,
    }

    # Define expected reference ranges (important for scaling)
    reference_map = {
        "wpm": 140,
        "energy_mean": 0.03,
        "posture_score": 0.7,
        "gaze_straight_ratio": 0.6,
        "gesture_frequency": 0.7,
        "smile_intensity": 0.02,

        "pause_frequency": 1.2,
        "filler_word_count": 5,
        "head_movement_avg": 0.015,
        "blink_rate_per_min": 20,
    }

    for feature, values in feature_store.items():

        if not values:
            continue

        avg = sum(values) / len(values)

        ref = IDEAL_VALUES.get(feature)
        if not ref:
            continue

        higher_is_better = direction_map.get(feature, True)

        # NORMALIZED PERCENTAGE LOGIC
        if higher_is_better:
            percentage = (avg / ref) * 100
        else:
            # lower is better → inverse scoring
            percentage = (ref / avg) * 100 if avg != 0 else 100

        # cap between 0 and 100
        percentage = max(0, min(percentage, 100))

        result[feature] = percentage

    return result

def get_db_connection():
    """Get database connection"""
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Amysql_1",
        database="InterviewCoach",
        port=3306
    )

def process_interview_videos(interview_id):
    """Process all videos for a specific interview"""
    try:
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
    SELECT COALESCE(MAX(attempt_number), 0) AS max_attempt
    FROM responses
    WHERE interview_id = %s;
""", (interview_id,))

        result = cursor.fetchone()
        attempt_number = result["max_attempt"] + 1
        
        conn.commit() 
        # 1. Fetch all video paths for this interview
        cursor.execute("""
            SELECT response_id, interview_id, question_id, video_url, confidence
            FROM responses 
            WHERE interview_id = %s 
            AND video_url IS NOT NULL 
            AND (confidence IS NULL)
        """, (interview_id,))
        videos = cursor.fetchall() 
        if not videos:
            return {"success": False, "message": "No unprocessed videos found for this interview"}
        
        print(f"Found {len(videos)} videos to process for interview {interview_id}")
        
        results = []
        confidences = []
        knowledges = []
        
        cursor.execute(
    "SELECT feature_summary FROM interviews WHERE interview_id = %s",
    (interview_id,)
)

        result = cursor.fetchone()
        feature_summary = json.loads(result["feature_summary"])
        print(feature_summary)

        # 2. Process each video
        for video in videos:
            video_path = video['video_url']
            response_id = video['response_id']
            question_id = video['question_id']
            
            print(f"\nProcessing response_id {response_id}: {video_path}")
            
            try:
                # Check if file exists
                if not os.path.exists(video_path):
                    print(f"Warning: Video file not found at {video_path}")
                    # Try to find it
                    base_name = os.path.basename(video_path)
                    current_dir = os.getcwd()
                    
                    # Try in user_videos folder
                    user_videos_path = os.path.join(current_dir, "user_videos", base_name)
                    if os.path.exists(user_videos_path):
                        video_path = user_videos_path
                        print(f"Found at: {video_path}")
                    else:
                        results.append({
                            "response_id": response_id,
                            "question_id": question_id,
                            "video_path": video['video_url'],
                            "error": f"File not found: {base_name}",
                            "status": "failed"
                        })
                        continue
                
                # Extract confidence using your existing function
                print(f"Analyzing video: {video_path}")
                confidence_result = extract_features_for_backend(video_path)
                confidence_value = confidence_result.get("conf", 0)
                confidences.append(confidence_value)
                transcript = confidence_result.get("transcript", "")
                features = confidence_result.get("features",{})
                # print(features)
                # Store features in dictionary

                for feature_name, value in features.items():

                    if feature_name == "transcript":
                        continue

    # skip string features
                    if isinstance(value, str):
                        continue

                    feature_store.setdefault(feature_name, []).append(value)


                # print("feature_store =", feature_store)

                filtered_features = {
    k: v
    for k, v in features.items()
    if k in feature_summary and feature_summary[k] == "weak"
}
                print("filteredfeatures==================",filtered_features)
                feedback_text = json.dumps(reasoning_suggestions_all(filtered_features))
                features_list = [features.get(col, 0) for col in model_columns]
                user_answer = str(transcript)
                cursor.execute("""
                    SELECT answer_text, embedding
                    FROM answers
                    WHERE question_id = %s
                    AND embedding IS NOT NULL
                    """, (question_id,))
                ideal_answers = cursor.fetchall()

                user_embedding = model.encode(user_answer, normalize_embeddings=True)
                best_answer = ""
                best_score=0
                for row in ideal_answers:
                    answer_text = row["answer_text"]
                    embedding_json = row["embedding"]
                    ideal_embedding = np.array(json.loads(embedding_json))
                    similarity = float(np.dot(user_embedding, ideal_embedding))
                    if similarity > best_score:
                        best_score = similarity
                    
                        
                knowledges.append(best_score)
                if best_score >= 0.80:
                    verdict = "✅ Excellent answer"
                elif best_score >= 0.60:
                    verdict = "🟢 Good answer"
                elif best_score >= 0.40:
                    verdict = "🟡 Partially correct"
                else:
                    verdict = "🔴 Incorrect / irrelevant"
                # print(f"Evaluation: {verdict}")
                # print("\n📌 Closest Ideal Answer:")
                # print(best_answer)
                # Create a flat list of values, not a list containing lists              
                query = f"""
    UPDATE responses
    SET confidence = %s,
        knowledge = %s,
        transcript = %s,
        attempt_number=%s,
        feedback = %s,
        {', '.join([f'{col} = %s' for col in model_columns])}
        
    WHERE response_id = %s
"""
                values =tuple([float(confidence_value), best_score, transcript,attempt_number, feedback_text]
    + features_list
    + [response_id])


                cursor.execute(query, values)
                results.append({
                    "response_id": response_id,
                    "question_id": question_id,
                    "confidence": float(confidence_value),
                    "video_path": video_path,
                    "status": "success"
                })
                
                print(f"Updated database for response_id {response_id}")
                
            except Exception as e:
                print(f"Error processing response_id {response_id}: {str(e)}")
                traceback.print_exc()
                results.append({
                    "response_id": response_id,
                    "question_id": question_id,
                    "video_path": video_path,
                    "error": str(e),
                    "status": "failed"
                })
        
        percentages = calculate_feature_percentage(feature_store)
        # print(percentages)
        THRESHOLD = 70  # Percentage threshold to upgrade to 'good'
    
    # 1️⃣ Fetch current feature_summary
        cursor.execute(
        "SELECT feature_summary FROM interviews WHERE interview_id = %s",
        (interview_id,)
    )
        row = cursor.fetchone()
        if not row or not row["feature_summary"]:
            current_summary = {}
        else:
            current_summary = json.loads(row["feature_summary"])
        
        improve=0        
    # 2️⃣ Update features based on percentage
        for feature, percent in percentages.items():
            current_status = current_summary.get(feature, "weak")  # default weak
    # Only upgrade, never downgrade
            if current_status == "good":
                continue
    # Handle numeric features
            if isinstance(percent, (int, float)):
                if percent >= THRESHOLD:
                    current_summary[feature] = "good"
                    improve+=1
                else:
                    current_summary[feature] = "weak"
    # Handle string features
            elif isinstance(percent, str):
        # Define your criteria for "good" string
        # Example: if string is not empty or is positive emotion
                if percent.lower() in ["happy", "excited", "positive", "neutral"]:
                    current_summary[feature] = "good"
                    improve+=1
                else:
                    current_summary[feature] = "weak"
    # Optional: fallback for unexpected types
            else:
                current_summary[feature] = "weak"
    # 3️⃣ Save updated feature_summary back to database
        if improve>-1:
            cursor.execute(
        "UPDATE interviews SET feature_summary = %s WHERE interview_id = %s",
        (json.dumps(current_summary), interview_id)
    )
    
        # Calculate average confidence
        avg_knowledge = 0
        avg_confidence = 0
        if confidences and knowledges:
            avg_confidence = sum(confidences) / len(confidences)
            # print(f"\n📊 Average confidence: {avg_confidence:.2f}")
            
            avg_knowledge = sum(knowledges) / len(knowledges)
            # print(f"\n📊 Average knowledge: {avg_knowledge:.2f}")
            # 4. Save average confidence to interviews table
            try:
                cursor.execute("""
                    UPDATE interviews 
                    SET overall_confidence = %s,
                        overall_knowledge = %s
                    WHERE interview_id = %s
                """, (float(avg_confidence),float(avg_knowledge), interview_id))
                
                # print(f"✅ Saved overall_confidence {avg_confidence:.2f} to interviews table for interview {interview_id}")
                
            except Exception as e:
                print(f"❌ Error saving to interviews table: {str(e)}")
        
        # Commit all changes
        conn.commit()
        
        # Get final statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_videos,
                SUM(CASE WHEN confidence IS NOT NULL THEN 1 ELSE 0 END) as processed_videos
            FROM responses 
            WHERE interview_id = %s AND video_url IS NOT NULL
        """, (interview_id,))
        
        stats = cursor.fetchone()
        
        response_data = {
            "success": True,
            "interview_id": interview_id,
            "total_videos": int(stats['total_videos']),
            "processed_this_run": len([r for r in results if r['status'] == 'success']),
            "failed": len([r for r in results if r['status'] == 'failed']),
            "average_confidence": round(avg_confidence, 2),
            "overall_confidence_saved": avg_confidence > 0,
            "results": results
        }
        
        cursor.close()
        conn.close()
        
        return response_data
        
    except Exception as e:
        print(f"Global error: {str(e)}")
        traceback.print_exc()
        return {"success": False, "error": str(e)}

class DecimalEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle Decimal objects"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return json.JSONEncoder.default(self, obj)

if __name__ == "__main__":
    # For command line usage
    if len(sys.argv) > 1:
        interview_id = int(sys.argv[1])
        result = process_interview_videos(interview_id)
        # Use custom encoder to handle Decimal objects
        # print(json.dumps(result, indent=2, cls=DecimalEncoder))
    else:
        print("Please provide interview_id: python test.py <interview_id>")
        print("Example: python test.py 136")
