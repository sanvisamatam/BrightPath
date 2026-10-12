# BrightPath - Full-Stack Educational & Developmental Learning Platform

BrightPath is a full-stack educational web application designed for children aged 3–17, featuring adaptive learning mini-games, client-side facial expression checkpoints, and developmental telemetry.

---

## 🌟 Architecture Overview

- **Frontend**: React 19 + Vite (Single Page Application)
  - Nature / cartoon children's storybook theme
  - 10 adaptive educational games (Early Mode 3–6 & BrightPath Mode 7–17)
  - On-device camera facial expression recognition with `@vladmandic/face-api`
  - Keyboard safety alerts & rapid typing alarm
  - Speech synthesis celebration voice feedback
  - Multi-session charts and progress reports
- **Backend**: Python 3.14 + FastAPI
  - High-performance asynchronous REST API running on `http://127.0.0.1:8000`
  - Automatic interactive Swagger documentation at `http://127.0.0.1:8000/docs`
  - Session recording and telemetry analysis
  - Child profile and user profile persistence
  - Cumulative progress tracking & statistics calculation
  - **Historical Diagnostic Categories Pipeline**: Analyzes completed sessions across the four historical DSM-IV categories with medical and scientific integrity.

---

## 🚀 How to Run the Application

### Option A: One-Click Launcher (Windows)
Double-click `start-all.bat` in the project root. This automatically opens:
1. The Python FastAPI backend on `http://127.0.0.1:8000`
2. The React frontend on `http://localhost:5173`

---

### Option B: Terminal Commands

#### 1. Start the Python FastAPI Backend:
```powershell
python backend/run.py
```
*Or using uvicorn directly:*
```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend health check: `http://127.0.0.1:8000/api/health`
* Interactive API Documentation: `http://127.0.0.1:8000/docs`

#### 2. Start the React Frontend:
In a separate terminal window:
```powershell
npm.cmd run dev
```
Open your browser at: `http://localhost:5173`

---

## 🔬 Four Historical Diagnostic Categories

BrightPath includes a dedicated research section displaying the **four historical diagnostic categories** defined under DSM-IV:

1. **Autistic Disorder** (Classic autism under DSM-IV)
2. **Asperger Syndrome** (Historical subtype with preserved early speech/cognition)
3. **Childhood Disintegrative Disorder** (Heller's syndrome; severe developmental regression)
4. **Pervasive Developmental Disorder – Not Otherwise Specified (PDD-NOS)** (Subthreshold or atypical presentations)

### Medical & Ethical Compliance:
* **Honest Model Reporting**: Because no clinically validated machine-learning model trained on regulatory-cleared diagnostic patient data is integrated, the system reports:
  > **"Diagnostic prediction model not available"**
* **Zero Fabrication**: Predictions are not fabricated or generated randomly.
* **Modern Clinical Status**: In current clinical diagnostic manuals (DSM-5 and ICD-11), these four historical categories are consolidated into the unified **Autism Spectrum Disorder (ASD)** diagnosis with support level dimensions.
* **Clinical Disclaimer**: Single-session educational gameplay, webcam facial expressions, and keyboard interaction metrics **CANNOT diagnose autism**. Formal diagnosis requires multidisciplinary clinical assessment by licensed developmental pediatricians or child psychologists.

---

## 📁 Project Structure

```text
BrightPath/
├── backend/                        # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py                 # FastAPI application & middleware
│   │   ├── core/
│   │   │   └── config.py           # Configuration & CORS settings
│   │   ├── schemas/                # Pydantic data models
│   │   │   ├── session_schema.py
│   │   │   ├── child_schema.py
│   │   │   ├── user_schema.py
│   │   │   ├── diagnostic_schema.py
│   │   │   └── progress_schema.py
│   │   ├── services/               # Business logic services
│   │   │   ├── storage_service.py  # Thread-safe JSON persistence
│   │   │   ├── diagnostic_service.py # Diagnostic & telemetry pipeline
│   │   │   └── progress_service.py # Cumulative statistics tracker
│   │   └── api/
│   │       ├── api_router.py       # Root API router
│   │       └── routes/             # REST endpoints (/sessions, /diagnostics, etc.)
│   ├── data/                       # Local backend persistent records
│   ├── tests/                      # Python unit tests
│   ├── requirements.txt            # Python dependencies
│   └── run.py                      # Standalone backend launcher
├── src/                            # Frontend React Application
│   ├── components/                 # UI components, illustrations, charts
│   │   └── charts/
│   │       └── DiagnosticCategoriesCard.jsx # Four categories display card
│   ├── context/                    # Auth and Session state contexts
│   ├── games/                      # 10 interactive educational games
│   ├── pages/                      # Dashboard, GamePlay, Reports, etc.
│   ├── services/
│   │   ├── apiClient.js            # Python backend HTTP client
│   │   ├── sessionStorage.js       # Unified persistence service
│   │   ├── emotionDetector.js      # Face expression detection
│   │   └── firebase.js             # Firebase auth/Firestore
│   └── utils/                      # Audio feedback & safety alarms
├── start-all.bat                   # One-click full-stack launcher
├── start-backend.bat               # Backend launcher
├── start-frontend.bat              # Frontend launcher
├── vite.config.js                  # Vite configuration with /api proxy
└── package.json                    # Node dependencies & scripts
```
