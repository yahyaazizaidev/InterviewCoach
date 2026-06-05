from flask import Flask, request, jsonify,send_from_directory
import logging as logger
from flask_cors import CORS
from datetime import datetime
import mysql.connector
from mysql.connector import connect, Error
from werkzeug.utils import secure_filename
import os
import subprocess
import json
from collections import defaultdict
from config import BASE_URL

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'

# --- MySQL connection ---
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",            # MySQL server
        user="root",                 # change if different
        password="Amysql_1",    # change to your MySQL password
        database="InterviewCoach",   # your DB name
        port=3306
    )

@app.route('/uploads/videos/<path:filename>')
def serve_video(filename):
    return send_from_directory(
        os.path.join("uploads", "videos"),
        filename
    )    

#---------------------------------------------------------------------Screen 1 -------------------------
# --- Login route ---
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM users WHERE email=%s AND password=%s", (email, password)
    )
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        return jsonify({
            "user_id": user["user_id"],   # <-- Add this
            "name": user["name"],
            "role": user["role"]
        }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

#---------------------------------------------------------------------Screen 2 -------------------------
# --- signup route ---
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Check if email already exists
        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        existing = cursor.fetchone()
        if existing:
            return jsonify({"error": "Email is already registered"}), 400

        # Insert new user
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, 'user')",
            (name, email, password)
        )
        conn.commit()
        return jsonify({"message": "Account created successfully!"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

#---------------------------------------------------------------------Screen 3 -------------------------
# ----------------- GET Fields -----------------
@app.route('/fields', methods=['GET'])
def get_fields():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT field_id, field_name FROM fields")
        fields = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(fields), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route('/interviews', methods=['POST'])
def create_interview():
    data = request.get_json()
    user_id = data.get('user_id')
    field_id = data.get('field_id')
   

    if not user_id or not field_id:
        return jsonify({"status": "error", "error": "user_id and field_id are required"}), 400
    
    feature_summary = {
        "wpm": "weak",
        # "filler_word_count": "weak",
        # "pitch_mean": "weak",
        "energy_mean": "weak",
        "pause_frequency": "weak",
        "gaze_straight_ratio": "weak",
        "blink_rate_per_min": "weak",
        # "head_movement_avg": "weak",
        "posture_score": "weak",
        "gesture_frequency": "weak",
        "smile_intensity": "weak",
        # "dominant_emotion": "weak",
        "audio_emotion": "weak"
    }

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert interview row with feature_summary as JSON
        cursor.execute(
            "INSERT INTO interviews (user_id, field_id, start_time, feature_summary) VALUES (%s, %s, %s, %s)",
            (user_id, field_id, datetime.now(), json.dumps(feature_summary))
        )
        conn.commit()
        interview_id = cursor.lastrowid

        cursor.close()
        conn.close()
        return jsonify({"interview_id": interview_id}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500  
    
    
#---------------------------------------------------------------------Screen 10 -------------------------
@app.route('/reset_overall_confidence', methods=['POST'])
def reset_overall_confidence():

    data = request.json
    interview_id = data.get("interview_id")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE interviews
        SET overall_confidence = NULL,
            overall_knowledge = NULL
        WHERE interview_id = %s
    """, (interview_id,))
    
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "message": "overall_confidence reset to NULL"
    })


@app.route("/get_questions/<int:field_id>", methods=["GET"])
def get_questions(field_id):
    level = request.args.get("level", "Easy")
    interview_id = request.args.get("interview_id")

    LIMIT = 1

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # 1. latest attempt number
    cursor.execute("""
        SELECT MAX(attempt_number) AS max_attempt
        FROM responses
        WHERE interview_id = %s
    """, (interview_id,))
    row = cursor.fetchone()
    latest_attempt = row["max_attempt"] or 1

    # 2. weak questions
    cursor.execute("""
        SELECT DISTINCT q.question_id, q.question_text
        FROM responses r
        JOIN questions q ON q.question_id = r.question_id
        WHERE r.interview_id = %s
        AND r.attempt_number = %s
        AND r.knowledge < 70
    """, (interview_id, latest_attempt))

    weak_questions = cursor.fetchall()

    # 3. cap weak to LIMIT
    weak_questions = weak_questions[:LIMIT]

    remaining = LIMIT - len(weak_questions)

    # 4. fetch fresh questions only if space available
    fresh_questions = []
    if remaining > 0:
        cursor.execute("""
            SELECT q.question_id, q.question_text
            FROM questions q
            WHERE q.field_id = %s
            AND q.level = %s
            AND q.question_id NOT IN (
                SELECT r.question_id
                FROM responses r
                WHERE r.interview_id = %s
            )
            LIMIT %s
        """, (field_id, level, interview_id, remaining))

        fresh_questions = cursor.fetchall()

    cursor.close()
    conn.close()

    # 5. merge
    final_questions = weak_questions + fresh_questions

    return jsonify({"questions": final_questions})


@app.route('/upload-video', methods=['POST'])
def upload_video():
    try:
        if 'video' not in request.files:
            return jsonify({
                "success": False,
                "message": "No video file found"
            }), 400

        video = request.files['video']

        interview_id = request.form.get('interview_id')
        question_id = request.form.get('question_id')

        if not video:
            return jsonify({"success": False, "message": "Empty video"}), 400

        # Secure filename
        filename = secure_filename(video.filename)

        # Create folder if not exists
        upload_folder = os.path.join("uploads", "videos")
        os.makedirs(upload_folder, exist_ok=True)

        # Full save path
        file_path = os.path.join(upload_folder, filename)

        # Save file
        video.save(file_path)

        # OPTIONAL: save path in DB (responses table)
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO responses (interview_id, question_id, video_url)
            VALUES (%s, %s, %s)
        """, (interview_id, question_id, file_path))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Video uploaded successfully",
            "path": file_path
        })

    except Exception as e:
        print("Upload error:", e)
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
    

@app.route("/get_feature_summary/<int:interview_id>", methods=["GET"])
def get_feature_summary(interview_id):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT MAX(attempt_number) AS max_attempt
            FROM responses
            WHERE interview_id = %s
        """, (interview_id,))

        res = cursor.fetchone()

        num = res["max_attempt"]
        print(num)

        if num is not None:

            cursor.execute("""
                SELECT feature_summary
                FROM interviews
                WHERE interview_id = %s
            """, (interview_id,))

            result = cursor.fetchone()

            if not result:
                return {
                    "status": "error",
                    "message": "Interview not found"
                }, 404

            feature_summary = result["feature_summary"]

            # NULL SAFETY
            if not feature_summary:
                feature_summary = {}

            # STRING -> JSON OBJECT
            elif isinstance(feature_summary, str):
                feature_summary = json.loads(feature_summary)

            return {
                "status": "success",
                "feature_summary": feature_summary
            }, 200

        return {
            "status": "waiting"
        }, 200

    except Exception as e:
        print("ERROR:", e)

        return {
            "status": "error",
            "message": str(e)
        }, 500

    finally:
        cursor.close()
        conn.close()
#---------------------------------------------------------------------Screen 11 -------------------------
@app.route('/interview_Score', methods=['GET'])
def get_interview_history():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                i.interview_id,
                i.user_id,
                i.overall_confidence,
                i.overall_knowledge,   -- ✅ ADDED
                f.field_name
            FROM interviews i
            JOIN fields f ON i.field_id = f.field_id
            WHERE i.user_id = %s
            ORDER BY i.interview_id DESC
        """
        cursor.execute(query, (user_id,))
        result = cursor.fetchall()

        return jsonify(result)

    except Error as e:
        print("Error:", e)
        return jsonify({'error': 'Database error'}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


#---------------------------------------------------------------------Result Screen -------------------------
@app.route('/run_test', methods=['POST'])
def run_test():
    data = request.json
    interview_id = data['interview_id']
    BASE_DIR = r"C:\reactnativeprojects\InterviewCoach"
    script_path = os.path.join(BASE_DIR, "test.py")
    
    # Use Python from your venv
    python_executable = os.path.join(BASE_DIR, "venv310", "Scripts", "python.exe")

    subprocess.Popen(
        [python_executable, script_path, str(interview_id)],
        cwd=BASE_DIR,
        stdout=open(os.path.join(BASE_DIR, "test_log.txt"), "a"),
        stderr=open(os.path.join(BASE_DIR, "test_log.txt"), "a")
    )

    return {"success": True, "message": "Processing started"}, 200

@app.route('/get_overall_confidence/<int:interview_id>', methods=['GET'])
def get_overall_confidence(interview_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Fetch overall confidence & knowledge from interviews table
    cursor.execute("""
        SELECT overall_confidence, overall_knowledge
        FROM interviews
        WHERE interview_id = %s
    """, (interview_id,))
    interview = cursor.fetchone()

    if not interview or interview["overall_confidence"] is None or interview["overall_knowledge"] is None:
        cursor.close()
        conn.close()
        return {
            "success": False,
            "message": "Still processing..."
        }

    # Fetch question-wise responses
    cursor.execute("""
    SELECT question_id, confidence, knowledge, feedback ,video_url
    FROM responses
    WHERE interview_id = %s
      AND attempt_number = (
          SELECT MAX(attempt_number)
          FROM responses
          WHERE interview_id = %s
      )
    ORDER BY question_id;
""", (interview_id, interview_id))

    rows = cursor.fetchall()
    for row in rows:
        if row["video_url"]:

            filename = os.path.basename(row["video_url"])

            row["video_url"] = (
            f"{BASE_URL}/uploads/videos/{filename}"
        )
    


    cursor.close()
    conn.close()

    return {
        "success": True,
        "overall_confidence": float(interview["overall_confidence"]),
        "overall_knowledge": float(interview["overall_knowledge"]),
        "individual_scores": rows
    }


@app.route('/check_features_status/<int:interview_id>', methods=['GET'])
def check_features_status(interview_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get feature summary from interviews table
        cursor.execute("""
            SELECT feature_summary
            FROM interviews
            WHERE interview_id = %s
        """, (interview_id,))

        row = cursor.fetchone()

        if not row:
            return jsonify({
                "success": False,
                "message": "Interview not found"
            }), 404

        summary = row["feature_summary"]

        # If stored as JSON string
        if isinstance(summary, str):
            summary = json.loads(summary)

        weak_features = []

        # Check weak features
        for feature, status in summary.items():
            if str(status).lower() == "weak":
                weak_features.append(feature)

        return jsonify({
            "success": True,
            "all_good": len(weak_features) == 0,
            "weak_features": weak_features
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
#---------------------------------------------------------------------History in History ----------------------


@app.route('/get_overall_history/<int:interview_id>', methods=['GET'])
def get_overall_history(interview_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Fetch overall confidence & knowledge from interviews table
    cursor.execute("""
        SELECT overall_confidence, overall_knowledge
        FROM interviews
        WHERE interview_id = %s
    """, (interview_id,))
    interview = cursor.fetchone()

    if not interview or interview["overall_confidence"] is None or interview["overall_knowledge"] is None:
        cursor.close()
        conn.close()
        return {
            "success": False,
            "message": "Still processing..."
        }

    # Fetch question-wise responses
    cursor.execute("""
    SELECT question_id, confidence, knowledge, feedback, attempt_number ,video_url
FROM responses
WHERE interview_id = %s
ORDER BY attempt_number ASC, question_id ASC     
""", (interview_id,))

    rows = cursor.fetchall()
    
    grouped = defaultdict(list)

    for row in rows:
        if row["video_url"]:

            filename = os.path.basename(row["video_url"])

            row["video_url"] = (
            f"{BASE_URL}/uploads/videos/{filename}"
        )
        attempt = row["attempt_number"]
        grouped[attempt].append({
        "question_id": row["question_id"],
        "confidence": row["confidence"],
        "knowledge": row["knowledge"],
        "video_url":row["video_url"],
        "feedback": row["feedback"]
    })

# convert to structured list
    attempts = []
    for attempt_num, questions in grouped.items():
        attempts.append({
        "attempt_number": attempt_num,
        "questions": questions
    })

    cursor.close()
    conn.close()

    return {
    "success": True,
    "overall_confidence": float(interview["overall_confidence"]),
    "overall_knowledge": float(interview["overall_knowledge"]),
    "attempts": attempts
}

@app.route('/api/interviews', methods=['GET'])
def get_interviews():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT overall_confidence, overall_knowledge
    FROM (
        SELECT interview_id, overall_confidence, overall_knowledge
        FROM interviews
        WHERE user_id = %s
        ORDER BY interview_id DESC
    ) AS last_interviews
    ORDER BY interview_id ASC
"""
    cursor.execute(query, (user_id,))
    results = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(results), 200


#-------------------------------------------------------------------------------------------------#
@app.route('/admin/users', methods=['GET'])
def admin_get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT user_id, name, email FROM users where role=%s",("user",)  )
    users = cursor.fetchall()
    return jsonify(users)

@app.route('/admin/user/<int:user_id>', methods=['GET'])
def admin_get_user(user_id):
    db =get_db_connection()
    cur = db.cursor(dictionary=True)
    cur.execute(
        "SELECT user_id, name, email, role FROM users WHERE user_id=%s",
        (user_id,)
    )
    user = cur.fetchone()
    return jsonify(user)

@app.route('/admin/user/<int:user_id>', methods=['DELETE'])
def admin_delete_user(user_id):
    db =get_db_connection()
    cur = db.cursor()
    cur.execute("DELETE FROM users WHERE user_id=%s", (user_id,))
    db.commit()
    return jsonify({"message": "User deleted"})

@app.route('/admin/user/<int:user_id>/history', methods=['GET'])
def admin_user_history(user_id):
    db = get_db_connection()
    cur = db.cursor(dictionary=True)
    cur.execute("""
        SELECT i.interview_id, f.field_name, i.overall_confidence,i.overall_knowledge
        FROM interviews i
        JOIN fields f ON i.field_id = f.field_id
        WHERE i.user_id=%s
        ORDER BY i.interview_id DESC
    """, (user_id,))
    return jsonify(cur.fetchall())

@app.route('/admin/fields', methods=['GET'])
def admin_get_fields():
    db = get_db_connection()
    cur = db.cursor(dictionary=True)
    cur.execute("SELECT field_id, field_name FROM fields")
    return jsonify(cur.fetchall())

@app.route('/admin/field', methods=['POST'])
def admin_add_field():
    data = request.json
    field_name = data.get('field_name')

    if not field_name:
        return jsonify({"error": "Field name required"}), 400

    db = get_db_connection()
    cur = db.cursor()
    cur.execute(
        "INSERT INTO fields (field_name) VALUES (%s)",
        (field_name,)
    )
    db.commit()
    return jsonify({"message": "Field added"})

@app.route('/admin/field/<int:field_id>', methods=['DELETE'])
def admin_delete_field(field_id):
    db = get_db_connection()
    cur = db.cursor()
    cur.execute("DELETE FROM fields WHERE field_id=%s", (field_id,))
    db.commit()
    return jsonify({"message": "Field deleted"})

@app.route('/admin/field/<int:field_id>/questions', methods=['GET'])
def admin_get_questions(field_id):
    db = get_db_connection()
    cur = db.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            question_id,
            question_text,
            level
        FROM questions 
        WHERE field_id = %s
    """, (field_id,))

    return jsonify(cur.fetchall())


@app.route('/admin/question', methods=['POST'])
def admin_add_question():
    data = request.json

    field_id = data.get('fieldId')
    question_text = data.get('question')
    level = data.get('level')

    if not field_id or not question_text or not level:
        return jsonify({'error': 'Missing data'}), 400

    db = get_db_connection()
    cur = db.cursor()

    # 1️⃣ Insert question
    cur.execute(
        "INSERT INTO questions (field_id, question_text,level) VALUES (%s,%s, %s)",
        (field_id, question_text,level)
    )
    question_id = cur.lastrowid
    db.commit()

    return jsonify({
        'message': 'Question added successfully',
        'question_id': question_id
    })

@app.route('/admin/question/<int:question_id>/answers', methods=['GET'])
def get_answers(question_id):
    db = get_db_connection()
    cur = db.cursor(dictionary=True)
    cur.execute("SELECT answer_id, answer_text FROM answers WHERE question_id=%s", (question_id,))
    answers = cur.fetchall()
    cur.close()
    db.close()
    return jsonify(answers)

@app.route('/admin/answer', methods=['POST'])
def add_answer():
    data = request.json
    db = get_db_connection()
    cur = db.cursor()
    cur.execute("INSERT INTO answers (question_id, answer_text) VALUES (%s, %s)",
                (data['question_id'], data['answer_text']))
    db.commit()
    cur.close()
    db.close()
    return jsonify({"status": "success"})

@app.route('/admin/answer/<int:answer_id>', methods=['PUT'])
def update_answer(answer_id):
    data = request.json
    db = get_db_connection()
    cur = db.cursor()
    cur.execute("UPDATE answers SET answer_text=%s WHERE answer_id=%s", (data['answer_text'], answer_id))
    db.commit()
    cur.close()
    db.close()
    return jsonify({"status": "success"})

@app.route('/admin/answer/<int:answer_id>', methods=['DELETE'])
def delete_answer(answer_id):
    db = get_db_connection()
    cur = db.cursor()
    cur.execute("DELETE FROM answers WHERE answer_id=%s", (answer_id,))
    db.commit()
    cur.close()
    db.close()
    return jsonify({"status": "success"})

@app.route('/api/user_feature_avg', methods=['GET'])
def user_feature_avg():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Numeric features average
    numeric_query = """
        SELECT 
            AVG(wpm) AS wpm,
            AVG(filler_word_count) AS filler_word_count,
            AVG(pitch_mean) AS pitch_mean,
            AVG(energy_mean) AS energy_mean,
            AVG(pause_frequency) AS pause_frequency,
            AVG(gaze_straight_ratio) AS gaze_straight_ratio,
            AVG(blink_rate_per_min) AS blink_rate_per_min,
            AVG(head_movement_avg) AS head_movement_avg,
            AVG(posture_score) AS posture_score,
            AVG(gesture_frequency) AS gesture_frequency,
            AVG(smile_intensity) AS smile_intensity
        FROM responses r
        JOIN interviews i ON r.interview_id = i.interview_id
        WHERE i.user_id = %s
    """
    cursor.execute(numeric_query, (user_id,))
    numeric_avgs = cursor.fetchone()

    # Categorical features (most frequent emotion)
    emotion_query = """
        SELECT dominant_emotion
        FROM responses r
        JOIN interviews i ON r.interview_id = i.interview_id
        WHERE i.user_id = %s
        GROUP BY dominant_emotion
        ORDER BY COUNT(*) DESC
        LIMIT 1
    """
    cursor.execute(emotion_query, (user_id,))
    dominant_emotion = cursor.fetchone()
    dominant_emotion = dominant_emotion['dominant_emotion'] if dominant_emotion else None

    audio_emotion_query = """
        SELECT audio_emotion
        FROM responses r
        JOIN interviews i ON r.interview_id = i.interview_id
        WHERE i.user_id = %s
        GROUP BY audio_emotion
        ORDER BY COUNT(*) DESC
        LIMIT 1
    """
    cursor.execute(audio_emotion_query, (user_id,))
    audio_emotion = cursor.fetchone()
    audio_emotion = audio_emotion['audio_emotion'] if audio_emotion else None

    cursor.close()
    conn.close()

    result = {
        **numeric_avgs,
        "dominant_emotion": dominant_emotion,
        "audio_emotion": audio_emotion
    }

    return jsonify(result), 200


# --- Run Flask ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
