# InterviewCoach

InterviewCoach is a React Native and Python-based interview preparation application. The purpose of this app is to help users practice interview questions, record interview responses, analyze their performance, and receive AI-based feedback.

The system uses a mobile frontend, a Python backend, a MySQL database, and trained machine learning models to evaluate interview performance.

---

## Project Purpose

The main purpose of InterviewCoach is to help students and job seekers improve their interview skills.

The app allows users to:

* Create or select interview fields
* View interview questions
* Record interview video responses
* Analyze interview performance
* Get feedback based on facial, audio, posture, and speech features
* View interview history and results

This project is designed as an AI-based interview coaching system.

---

## Technologies Used

### Frontend

* React Native
* TypeScript
* Android
* iOS project structure
* Node.js / npm

### Backend

* Python
* Flask
* MySQL
* Machine Learning models
* Video/audio feature extraction

### Database

* MySQL Workbench 8.0

### Machine Learning

The project uses trained ML model files for interview performance prediction and analysis.

Included model/helper files:

```text
confidence_predictor.cbm
feature_scaler.pkl
model_columns.pkl
```

The main trained model file is not included in this GitHub repository because it is larger than GitHub's 100 MB file size limit.

Download the main model file from Google Drive:

```text
https://drive.google.com/file/d/1Xic--cVkrYDZmt0vt5XEHd63tWx-7MhF/view?usp=sharing
```

After downloading, place it in the project root folder:

```text
InterviewCoach/interview_coach_model.pkl
```

The final structure should look like this:

```text
InterviewCoach/
│
├── interview_coach_model.pkl
├── confidence_predictor.cbm
├── feature_scaler.pkl
├── model_columns.pkl
├── main.py
├── test.py
├── extractor.py
├── predict_ai.py
├── package.json
└── Screens/
```

---

## Database Setup

This project uses MySQL.

The database name must be:

```text
interviewcoach
```

Create a MySQL database with this exact name before importing the dump.

### Step 1: Create Database

Open MySQL Workbench and run:

```sql
CREATE DATABASE interviewcoach;
```

### Step 2: Import Database Dump

The database dump is available inside the project folder:

```text
database/mysql_dump/
```

or:

```text
database/Dump20260605/
```

depending on the exported folder name.

To import it using MySQL Workbench:

1. Open MySQL Workbench.
2. Connect to your MySQL server.
3. Go to:

```text
Server > Data Import
```

4. Select:

```text
Import from Dump Project Folder
```

5. Select the dump folder from the project:

```text
InterviewCoach/database/mysql_dump
```

6. Select target schema:

```text
interviewcoach
```

7. Click:

```text
Start Import
```

---

## Python Virtual Environment Setup

This project requires a Python virtual environment named:

```text
venv310
```

Python 3.10 is recommended.

### Step 1: Create Virtual Environment

Open PowerShell or CMD inside the project folder:

```powershell
cd C:\reactnativeprojects\InterviewCoach
```

Create the virtual environment:

```powershell
py -3.10 -m venv venv310
```

If `py -3.10` does not work, use:

```powershell
python -m venv venv310
```

### Step 2: Activate Virtual Environment

```powershell
venv310\Scripts\activate
```

After activation, you should see something like:

```text
(venv310) PS C:\reactnativeprojects\InterviewCoach>
```

### Step 3: Upgrade pip

```powershell
python -m pip install --upgrade pip
```

### Step 4: Install Python Libraries

If the project contains a `requirements.txt` file, install all dependencies using:

```powershell
pip install -r requirements.txt
```

If `requirements.txt` is not available, install the required libraries manually:

```powershell
pip install flask flask-cors mysql-connector-python numpy pandas scikit-learn opencv-python mediapipe librosa soundfile moviepy catboost joblib
```

If any library gives an error, install it separately.

---

## Node.js / React Native Setup

Install frontend dependencies:

```powershell
npm install
```

For Android, run:

```powershell
npx react-native run-android
```

If Metro does not start automatically, run:

```powershell
npx react-native start
```

---

## Running the Backend

Activate the Python virtual environment:

```powershell
venv310\Scripts\activate
```

Run the backend file:

```powershell
python main.py
```

If your backend starts from another file, use that file instead, for example:

```powershell
python test.py
```

---

## Running the Complete Project

### Step 1: Start MySQL Server

Make sure MySQL Server is running.

### Step 2: Import Database

Import the database dump into a database named:

```text
interviewcoach
```

### Step 3: Download Main Model File

Download the missing model file from Google Drive:

```text
https://drive.google.com/file/d/1Xic--cVkrYDZmt0vt5XEHd63tWx-7MhF/view?usp=sharing
```

Place it in the project root:

```text
InterviewCoach/interview_coach_model.pkl
```

### Step 4: Start Python Backend

```powershell
cd C:\reactnativeprojects\InterviewCoach
venv310\Scripts\activate
python main.py
```

### Step 5: Start React Native App

Open another terminal:

```powershell
cd C:\reactnativeprojects\InterviewCoach
npm install
npx react-native run-android
```

---

## How the App Works

1. The user opens the mobile application.
2. The app connects with the backend server.
3. The user selects an interview field or question.
4. The user records an interview video response.
5. The backend processes the video.
6. Feature extraction is performed using Python.
7. The trained ML models analyze the response.
8. The system predicts interview performance.
9. The result is saved in MySQL.
10. The user can view feedback and interview history inside the app.

---

## Important Files

```text
App.tsx
Screens/
main.py
test.py
extractor.py
predict_ai.py
config.py
config.js
database/
confidence_predictor.cbm
feature_scaler.pkl
model_columns.pkl
```

The missing large model file must be downloaded separately:

```text
interview_coach_model.pkl
```

---

## Notes

* Do not delete the `venv310` environment if the backend is already configured with it.
* The database must be named exactly `interviewcoach`.
* The file `interview_coach_model.pkl` must be placed in the root project folder.
* MySQL Server must be running before using the backend.
* Android emulator or physical Android device is required to run the mobile app.

---

## Author

Developed by Yahya Aziz AI Developer.
