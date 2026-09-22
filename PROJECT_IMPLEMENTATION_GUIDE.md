# BrightPath: Project Implementation & Technical Guide

This document provides a comprehensive, beginner-friendly explanation of the **BrightPath** codebase. It is written specifically for project reviews, viva voice examinations, and technical presentations. Every explanation in this guide is based **strictly** on the current implementation found in the repository.

---

# 1. Project Overview

### What BrightPath Currently Does
**BrightPath** (also referred to as *BrightMinds* in internal logs) is an educational, emotion-guided web application designed for children and caregivers. It uses a computer's webcam to detect a user's current facial expression, maps that expression into one of five emotional states (**Happy**, **Sad**, **Neutral**, **Angry**, **Frustrated**), and automatically recommends a customized educational mini-game tailored to that mood.

### Main Purpose of the Application
The primary goal is to provide a supportive educational play experience. By understanding how a child feels before and during gameplay, BrightPath matches them with an appropriate activity (e.g., calming activities when angry or frustrated, focus/memory games when happy or neutral). Caregivers can then review reports showing how the user's emotion changed from the start of the game to the end.

### End-to-End User Experience Journey
1. **Entry & Login**: The user or caregiver opens the app. If logged in, they reach the Dashboard.
2. **Session Launch**: The user navigates to the "Start Session" page.
3. **Camera Initialization & Initial Emotion Check**: The application prompts for camera permission. Once the webcam feed is active, client-side Artificial Intelligence (AI) analyzes 3–5 video frames to detect the initial facial emotion. (Alternatively, the user can turn on **Demo Mode** to manually pick a test emotion).
4. **Game Recommendation**: The app looks up the detected emotion and displays a recommended educational mini-game.
5. **Gameplay & Mid-Game Checkpoint**: The user plays the game. At **10 seconds** into gameplay, the app silently samples the camera feed to record a mid-game emotion.
6. **Victory & Final Emotion Check**: When the user completes the game, a final facial emotion check takes place.
7. **Results & Report Generation**: The session metrics (score, accuracy, time taken) and 3-stage emotional progression timeline (*Initial → During → Final*) are saved to storage (LocalStorage / Cloud Firestore) and rendered in a printable caregiver report.

### Major Components / Modules
* **Authentication Module**: Manages user login, signup, and profiles using Firebase Auth with LocalStorage backup.
* **Camera & Preview Module**: Manages browser media streams and live face framing overlays.
* **Facial Emotion Recognition Engine**: Runs real-time machine learning inference inside the browser using TensorFlow.js and `@vladmandic/face-api`.
* **Recommendation System**: Maps detected emotions to specific game modules.
* **Game Suite**: 5 mini-games (*Memory Quest*, *Color Garden*, *Brain Rush*, *Calm Maze*, *Step-by-Step Puzzle*).
* **Session & State Management**: Tracks active session state, timing, and checkpoint history.
* **Storage & Reporting Service**: Saves sessions locally or to Firebase Firestore and renders progression charts/PDF reports.

---

# 2. Complete Application Flow

Below is the step-by-step technical pipeline of a full session:

```
[ User Opens App ] 
       │
       ▼
[ Authentication Check ] ── (LoginPage.jsx / AuthContext.jsx)
       │
       ▼
[ Start Session Page ] ── (StartSessionPage.jsx)
       │
       ├─────────────────────────────────────────┐
       ▼                                         ▼
[ Real Camera Mode ]                      [ Demo Mode ]
       │                                         │
       ▼                                         ▼
[ Request Camera Permission ]             [ Manual Emotion Selector ]
       │ (CameraPreview.jsx)                     │ (e.g. "Frustrated")
       ▼                                         │
[ Webcam Feed Initialized ]                      │
       │                                         │
       ▼                                         │
[ Initial Emotion Detection ] ◄──────────────────┘
       │ (detectFacialEmotion in emotionDetector.js)
       ▼
[ Game Recommendation Lookup ] ── (getRecommendedGame)
       │
       ▼
[ Game Launch ] ── (GamePlayPage.jsx)
       │
       ├─► [ 00:00 ] Initial Emotion Recorded to Timeline
       │
       ├─► [ 00:10 ] Mid-Game Checkpoint 2 Triggered (Automated 10s Sampling)
       │
       └─► [ Victory ] Game Completed ──► Final Checkpoint 3 Triggered
                                                │
                                                ▼
                                   [ Complete & Save Session ]
                                                │ (sessionStorage.js)
                                                ▼
                                   [ Session Results / Caregiver Report ]
                                    (SessionResultsPage.jsx / ReportsPage.jsx)
```

### Detailed Step Breakdown

| Step | Component / File | Function | Input Data | Output Data | Simple Explanation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Access Camera** | [`CameraPreview.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/components/webcam/CameraPreview.jsx) | `requestCameraPermission()` | User click / browser prompt | `MediaStream` video object | Requests access to the user's webcam via standard browser API (`navigator.mediaDevices.getUserMedia`). |
| **2. Video Binding** | [`CameraPreview.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/components/webcam/CameraPreview.jsx) | `useEffect` hook | `MediaStream` | `<video>` element playing stream | Connects the webcam video stream to an HTML `<video>` element so frames can be read by AI. |
| **3. Face Presence Check** | [`emotionRecognition.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/emotionRecognition.js) | `checkFacePresence()` | HTML `<video>` element | `{ detected: true/false, count: N }` | Checks if a face is visible in the frame before running expression recognition. |
| **4. Initial Emotion AI Analysis** | [`emotionRecognition.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/emotionRecognition.js) | `analyzeCurrentExpression()` | Video element, options (`frameCount: 3`, `checkpoint: 'initial'`) | `{ status: 'SUCCESS', emotion: 'Happy', confidence: 0.92 }` | Samples 3–5 video frames, runs ML inference, averages probabilities, and returns the top mapped emotion. |
| **5. Recommendation Lookup** | [`emotionDetector.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/emotionDetector.js) | `getRecommendedGame()` | Emotion string (e.g. `'Frustrated'`) | Game Object (ID, Name, Description, Color) | Looks up the matching game object from `GAME_RECOMMENDATIONS`. |
| **6. Game Launch & State Init** | [`SessionContext.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/context/SessionContext.jsx) | `initSession()` | Detection result, Game object, `isDemo` flag | Initialized session state | Sets initial emotion, starts timer, and seeds the `emotionTimeline` array with Checkpoint 1. |
| **7. Mid-Game Checkpoint (10s)** | [`GamePlayPage.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/pages/GamePlayPage.jsx) | `trigger10SecondAnalysis()` | Active `<video>` element, 10s timestamp | Recorded sample added to `emotionTimeline` | Runs a background emotion analysis 10 seconds into gameplay without pausing the game. |
| **8. Game Completion** | Individual Game components (e.g., [`BrainRush.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/games/BrainRush.jsx)) | `onComplete()` / `finishGame()` | Game stats (score, mistakes, time) | `gameResults` object | Triggers confetti, calculates score & accuracy, and notifies parent page. |
| **9. Final Emotion Check** | [`GamePlayPage.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/pages/GamePlayPage.jsx) | `runFinalAnalysis()` | `<video>` element, `gameResults` | Final emotion sample | Displays a brief post-game overlay and records Checkpoint 3 emotion. |
| **10. Save Session** | [`sessionStorage.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/sessionStorage.js) | `saveSessionData()` | Complete session payload | Saved session object with ID | Writes the completed session to `localStorage` and (if configured) Firebase Firestore. |
| **11. Render Report** | [`SessionResultsPage.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/pages/SessionResultsPage.jsx) | Page Component | Saved session object | Rendered timeline, charts, PDF export | Displays 3-checkpoint emotion transition badges, performance metrics, and timeline chart. |

---

# 3. Project File/Folder Structure

```
BrightPath/
├── index.html                       # HTML root entry point
├── package.json                     # Node dependencies & project scripts
├── vite.config.js                   # Vite build configuration
├── public/
│   ├── favicon.svg                  # App favicon icon
│   └── models/                      # Local pre-trained face-api.js ML weight files
│       ├── tiny_face_detector_model-weights_manifest.json
│       ├── tiny_face_detector_model.bin
│       ├── face_expression_model-weights_manifest.json
│       └── face_expression_model.bin
└── src/
    ├── main.jsx                     # React application entry DOM mount point
    ├── App.jsx                      # Main app router & tab navigator component
    ├── App.css                      # Utility styles & page layouts
    ├── index.css                    # Design system tokens, variables, & glassmorphism CSS
    ├── assets/                      # Static assets
    ├── components/
    │   ├── charts/
    │   │   ├── EmotionTimelineChart.jsx  # Visual timeline of initial -> mid -> final emotions
    │   │   └── PerformanceChart.jsx     # Score, accuracy, & response time metrics card
    │   ├── common/
    │   │   ├── CameraStatusBadge.jsx    # UI badge displaying camera status
    │   │   ├── EmotionBadge.jsx         # Color-coded pill displaying an emotion label
    │   │   ├── Footer.jsx               # Global application footer
    │   │   └── Navbar.jsx               # Global navigation header
    │   └── webcam/
    │       └── CameraPreview.jsx        # Camera permission handler, video feed, & canvas overlay
    ├── context/
    │   ├── AuthContext.jsx          # Context provider for login, signup, & user profile
    │   └── SessionContext.jsx       # Context provider for active game session & emotion state
    ├── games/                       # Educational Mini-Games Suite
    │   ├── BrainRush.jsx            # Cognitive speed & logic mini-game
    │   ├── CalmMaze.jsx             # Maze navigation & mindfulness game
    │   ├── ColorGarden.jsx          # Soothing pattern completion game
    │   ├── MemoryQuest.jsx          # Card flipping memory game
    │   └── StepPuzzle.jsx           # Multi-stage progressive puzzle game
    ├── pages/                       # Screen Views
    │   ├── DashboardPage.jsx        # Caregiver overview dashboard & recent metrics
    │   ├── GamePlayPage.jsx         # Active game container & background emotion tracker
    │   ├── LandingPage.jsx          # Public welcome page
    │   ├── LoginPage.jsx            # User authentication login view
    │   ├── ProfilePage.jsx          # User settings view
    │   ├── ReportsPage.jsx          # Caregiver historical reports list
    │   ├── SessionDetailPage.jsx    # Individual printable report detail view
    │   ├── SessionResultsPage.jsx   # Post-game immediate summary view
    │   ├── SignupPage.jsx           # Account creation view
    │   └── StartSessionPage.jsx     # Pre-game emotion detection & game recommendation view
    └── services/                    # Core Business Logic & AI Services
        ├── emotionDetector.js       # Bridge layer connecting AI models with recommendation rules
        ├── emotionRecognition.js    # Client-side face-api.js ML pipeline & frame sampler
        ├── firebase.js              # Firebase SDK initialization & local storage fallback
        ├── gameAnalysisConfig.js    # Game checkpoint definitions
        └── sessionStorage.js        # Data persistence layer (Firestore + LocalStorage)
```

---

# 4. Facial Emotion Recognition — COMPLETE EXPLANATION

### Detailed AI Technical Pipeline

1. **Camera Initialization**: Handled in [`CameraPreview.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/components/webcam/CameraPreview.jsx#L18-L49) via `requestCameraPermission()`. The browser API `navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } })` requests webcam access.
2. **Video Display**: The resulting `MediaStream` object is attached to an HTML `<video>` element (`videoRef.current.srcObject = stream`) with `autoPlay`, `muted`, and `playsInline` attributes.
3. **Passing Video to AI**: The raw `<video>` HTML element DOM node is passed directly as an input parameter into the `faceapi.detectAllFaces()` method.
4. **Model Loading & Source**: 
   * Loaded in [`emotionRecognition.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/emotionRecognition.js#L60-L104) via `loadEmotionModel()`.
   * **Primary Source**: Loaded locally from the repository's [`public/models`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/public/models/) folder (`/models`).
   * **Fallback Source**: If local loading fails (e.g. static server misconfiguration), it falls back to a CDN URL: `https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model`.
5. **Libraries & Frameworks**:
   * **Wrapper Library**: `@vladmandic/face-api` (v1.7.15), an actively maintained fork of `face-api.js`.
   * **Underlying ML Engine**: **TensorFlow.js** (`faceapi.tf`).
   * **Execution Backend**: WebGL GPU acceleration with CPU fallback (initialized in `initTFBackend()`).
6. **Inference Location**: **100% Client-Side**. All machine learning processing runs locally inside the user's browser CPU/GPU. No video frames or images are ever transmitted to an external server.
7. **Frame Capture Mechanism**:
   * Frames are **NOT** processed continuously at 60 FPS (to prevent browser lag).
   * Instead, frames are **sampled periodically** in short bursts of **3 to 5 frames** with a `250ms` delay between frame samples.
8. **Face Detection Method**:
   * Uses **`TinyFaceDetector`**, a lightweight Convolutional Neural Network (CNN) optimized for real-time mobile and web browsers.
   * Parameter options used: `{ inputSize: 320, scoreThreshold: 0.35 }`.
   * If multiple faces appear in frame, the app calculates the bounding box area of each face (`width * height`) and automatically selects the **largest face**.
9. **Expression Classification**:
   * Uses **`faceExpressionNet`**, a neural network that extracts facial landmark features and outputs prediction probabilities across **7 raw expression categories**:
     1. Neutral
     2. Happy
     3. Sad
     4. Angry
     5. Fearful
     6. Disgusted
     7. Surprised
10. **Mapping Model Output to BrightPath Emotions**:
    * Managed by `mapToBrightPathEmotion()` in [`emotionRecognition.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/emotionRecognition.js#L110-L153).
    * BrightPath defines **5 target emotions**: **Happy**, **Sad**, **Neutral**, **Angry**, **Frustrated**.
    * Since `faceExpressionNet` does not natively output a "Frustrated" class, BrightPath uses a specialized **Frustration Heuristic** based on compound negative emotion scores:
      * Frustration is triggered if `angry > 0.18` combined with `sad`, `disgusted`, or `fearful > 0.12`, or if `disgusted > 0.32`, or if total negative compound score `> 0.45` while `happy < 0.25`.
      * Otherwise, the app ranks candidates (`Happy`, `Sad`, `Neutral`, `Angry`) using weighted combinations (e.g., `Happy` score = `happy + surprised * 0.4`) and selects the highest score.

### Key Emotion Functions

* **`loadEmotionModel()`**: Asynchronously initializes TensorFlow.js backends and loads `tinyFaceDetector` and `faceExpressionNet` weight manifests. Includes a 15-second timeout wrapper (`withTimeout`).
* **`checkFacePresence(videoElement)`**: Performs a quick single-frame check to confirm whether a face is positioned inside the camera bounds.
* **`waitForVideoReady(videoElement, maxWaitMs)`**: Polls the HTML video element to confirm it has an active stream, non-zero width/height, and `readyState >= 2` before attempting AI analysis.
* **`analyzeCurrentExpression(videoElement, options)`**: Performs multi-frame sampling (default 3 frames), aggregates predictions, maps probabilities to BrightPath emotions, and handles errors/timeouts.
* **`detectFacialEmotion(videoElement, demoEmotion, options)`**: High-level bridge function called by pages. Routes execution to Demo Mode (if `demoEmotion` is set) or calls `analyzeCurrentExpression()`.

---

# 5. DATASET / TRAINING DATA INVESTIGATION

### Deep-Dive Investigation of Model & Data Files

A comprehensive search of the codebase was conducted across all files, manifest JSONs, binary weight files, and import paths:

* **Pre-trained Package**: `@vladmandic/face-api` (npm dependency).
* **Model Files Present in Project**: Located in [`public/models/`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/public/models/):
  * `tiny_face_detector_model-weights_manifest.json` & `tiny_face_detector_model.bin` (193 KB)
  * `face_expression_model-weights_manifest.json` & `face_expression_model.bin` (329 KB)
  * `face_landmark_68_model-weights_manifest.json` & `.bin`
  * `face_landmark_68_tiny_model-weights_manifest.json` & `.bin`
  * `age_gender_model-weights_manifest.json` & `.bin`
  * `face_recognition_model-weights_manifest.json` & `.bin`
  * `ssd_mobilenetv1_model-weights_manifest.json` & `.bin`

### Dataset Audit Results

| Dataset Property | Status / Value | Source Evidence |
| :--- | :--- | :--- |
| **Model Type** | **Pre-trained Open-Source Model** | Imported via `@vladmandic/face-api` |
| **Custom Training** | **NONE** | No training scripts (`.py`, `.ipynb`), loss functions, or raw dataset images exist in the repository. |
| **Training Dataset Name** | **Not found in the current codebase** | Manifest JSON files only list architecture layers (`conv0`, `dense0`, `fc/weights`). The dataset name is not stated. |
| **Dataset Source / URL** | **Not found in the current codebase** | No dataset URL or Kaggle/HuggingFace dataset link exists in code. |
| **Number of Model Output Classes** | **7 Classes** | Confirmed by manifest layer `fc/weights` shape `[256, 7]` in [`face_expression_model-weights_manifest.json`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/public/models/face_expression_model-weights_manifest.json#L52). |
| **Model Classes** | Neutral, Happy, Sad, Angry, Fearful, Disgusted, Surprised | Standard output schema of `faceExpressionNet`. |
| **Evidence of Fine-Tuning** | **NONE** | Weights are static pre-quantized binary blobs. |

> [!IMPORTANT]
> **Official Viva Verification Statement:**  
> *"The current codebase uses a pre-trained model (`faceExpressionNet` provided by `@vladmandic/face-api`), but the exact training dataset cannot be confirmed from the repository."*  
> (Note: While standard `face-api.js` documentation historically notes training on datasets like FER2013 or custom web-crawled facial images, **only pre-trained weights** are included in this codebase, and no dataset name is declared in the project files.)

---

# 6. Emotion Recognition Model

### Technical Specifications Summary

* **Model Name**: `faceExpressionNet` (paired with `TinyFaceDetector`).
* **Architecture**: Lightweight Depthwise Separable Convolutional Neural Network (MobileNet-style architecture) followed by a dense fully-connected classifier layer (`fc/weights`).
* **Input Format**: HTML `<video>` element frame buffers.
* **Input Dimensions**: Resized dynamically to **320x320 pixels** by `TinyFaceDetectorOptions({ inputSize: 320 })`.
* **Preprocessing & Normalization**: Handled automatically by TensorFlow.js inside `face-api` (pixel scaling to `[0, 1]` or `[-1, 1]` range, canvas RGB tensor conversion).
* **Face Detection Stage**: `TinyFaceDetector` locates bounding box coordinates around human faces in the frame.
* **Classification Stage**: `faceExpressionNet` extracts spatial features from the face region and applies a Softmax activation function to generate probability distribution scores for 7 expressions.
* **Output Format**: JavaScript object containing raw normalized probability scores totaling 1.0 (e.g., `{ happy: 0.85, neutral: 0.10, sad: 0.02, ... }`).
* **Confidence Score**: Calculated as the floating-point probability score (range `0.55` to `0.98`) assigned to the winning mapped emotion class.

---

# 7. The Five BrightPath Emotions

BrightPath maps model predictions into five tailored target emotions:

| BrightPath Emotion | Model Output / Label Source | Technical Meaning & Detection Logic | Recommended Game |
| :--- | :--- | :--- | :--- |
| **Happy** | `happy` (+ `surprised * 0.4`) | High positive valence, smiling, open expression. | **Memory Quest** |
| **Sad** | `sad` (+ `fearful * 0.5`) | Low valence, downturned mouth, lowered brow. | **Color Garden** |
| **Neutral** | `neutral` (+ `surprised * 0.4`) | Baseline calm facial expression, no dominant tension. | **Brain Rush** |
| **Angry** | `angry` | Furrowed brow, tense jaw, compressed lips. | **Calm Maze** |
| **Frustrated** | Heuristic combination (`angry` + `sad` / `disgusted` / `fearful`) | Compound negative state indicating stress or challenge struggle. | **Step-by-Step Puzzle** |

### How BrightPath Selects Games Based on Emotion
The application matches emotions to games using a deterministic lookup table defined in [`emotionDetector.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/emotionDetector.js#L12-L53):
* If **Happy** → Recommends **Memory Quest** (maintains positive engagement with memory challenges).
* If **Sad** → Recommends **Color Garden** (soothing, gentle pattern-matching garden blooming).
* If **Neutral** → Recommends **Brain Rush** (dynamic cognitive speed puzzles suitable for ready focus).
* If **Angry** → Recommends **Calm Maze** (peaceful maze navigation with breathing checkpoints).
* If **Frustrated** → Recommends **Step-by-Step Puzzle** (breaks puzzles into small achievable stages with hints).

---

# 8. Game Recommendation System

### Technical Implementation
The recommendation system is implemented across two key structures in [`emotionDetector.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/emotionDetector.js):

1. **`GAME_RECOMMENDATIONS` Dictionary**: An object storing metadata for all 5 games.
2. **`getRecommendedGame(emotion)` Function**: Accepts an emotion string and returns the matching game configuration object.

```javascript
export const getRecommendedGame = (emotion) => {
  return GAME_RECOMMENDATIONS[emotion] || GAME_RECOMMENDATIONS[EMOTIONS.NEUTRAL];
};
```

### Fallback Behavior
* If an invalid, null, or unknown emotion string is provided to `getRecommendedGame()`, the function defaults to **`GAME_RECOMMENDATIONS[EMOTIONS.NEUTRAL]`** (**Brain Rush**).

### Example Execution
> *"If the AI detects `Frustrated` → `getRecommendedGame('Frustrated')` looks up `GAME_RECOMMENDATIONS['Frustrated']` → returns `{ name: 'Step-by-Step Puzzle', id: 'step-puzzle', ... }`."*

---

# 9. Game Modules

BrightPath contains 5 educational mini-games located in `src/games/`:

### 1. Memory Quest ([`MemoryQuest.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/games/MemoryQuest.jsx))
* **Purpose**: Card-matching memory activity.
* **How It Works**: User flips face-down cards to find matching emoji pairs (⭐, 🪐, 💎, 🚀, ☀️, ⚡, 🌙, 🧭).
* **Difficulty Levels**: `Easy` (4 pairs / 8 cards), `Medium` (6 pairs / 12 cards), `Hard` (8 pairs / 16 cards).
* **Randomization**: Card deck is shuffled randomly using `.sort(() => Math.random() - 0.5)` upon game init.
* **Scoring Formula**: `score = Math.min(100, Math.max(40, Math.round(100 - (mistakes * 5) - (elapsedSeconds * 0.5))))`.
* **Completion Condition**: Finding all card pairs (`matchedIds.length === cards.length`). Triggers confetti and calls `onComplete()`.

### 2. Color Garden ([`ColorGarden.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/games/ColorGarden.jsx))
* **Purpose**: Soothing pattern completion activity.
* **How It Works**: User views a sequence of colors/emojis (e.g. 🔴 🔵 🟡 🔴 🔵 ❓) and selects the option that completes the pattern.
* **Challenges Stored**: 5 fixed pattern challenges (`PATTERN_CHALLENGES` array).
* **Garden Progression**: Each correct answer advances the visual garden stage (`🌱 Seedling` → `🌿 Sprout` → `🌷 Blooming Flower` → `🌺 Garden Bed` → `🦋 Vibrant Paradise`).
* **Hints**: Incorrect answers display a gentle hint (e.g. *"Notice how Red, Blue, Yellow repeat!"*).
* **Scoring Formula**: 20 points per correct challenge; max score 100. Accuracy calculated as `(5 / (5 + mistakes)) * 100`.

### 3. Brain Rush ([`BrainRush.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/games/BrainRush.jsx))
* **Purpose**: Cognitive speed & logic puzzle game.
* **How It Works**: User answers multiple-choice questions involving number series, shape patterns, odd-one-out items, and logic puzzles.
* **Questions Stored**: **25 Total Questions** organized into 5 sets of 5 questions each (`ALL_BRAIN_RUSH_CHALLENGES`).
* **Set Rotation**: Rotation through question sets is tracked persistently using `localStorage` (`brightminds_brain_rush_completed_sessions`). Each session automatically advances to the next set.
* **Scoring Formula**: 20 points per correct answer; max score 100.

### 4. Calm Maze ([`CalmMaze.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/games/CalmMaze.jsx))
* **Purpose**: Peaceful maze navigation and mindfulness activity.
* **How It Works**: User navigates a tranquil avatar (🧘) through a 7x7 grid maze matrix (`MAZE_GRID`) to reach the goal (🕊️).
* **Controls**: On-screen D-Pad buttons or keyboard Arrow Keys (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`).
* **Mindful Checkpoint**: Landing on tile type `2` triggers a "Mindful Pause Checkpoint" modal requiring 3 slow deep breaths before continuing.
* **Scoring Formula**: `score = Math.min(100, Math.max(50, Math.round(100 - (wrongTurns * 4))))`.

### 5. Step-by-Step Puzzle ([`StepPuzzle.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/games/StepPuzzle.jsx))
* **Purpose**: Progressive multi-stage puzzle activity for building mastery.
* **How It Works**: Breaks complex puzzles into 3 sequential stages: Stage 1 (Easy Shape Fit), Stage 2 (Medium Sequence), Stage 3 (Mastery Assembly).
* **Questions Stored**: **15 Total Puzzles** organized into 5 sets of 3 stages each (`ALL_STEP_PUZZLES`).
* **Hints**: Dedicated "Need a Hint?" button opens a modal with a supportive solution clue.
* **Set Rotation**: Advances through sets using `localStorage` (`brightminds_step_puzzle_completed_sessions`).
* **Scoring Formula**: `score = Math.min(100, Math.max(50, Math.round(100 - (extraAttempts * 8) - (hintsUsed * 5))))`.

---

# 10. Emotion Tracking During the Game

BrightPath tracks emotional changes across **three distinct session checkpoints**:

```
[ START SESSION ]
       │
       ▼
1. CHECKPOINT 1: Initial Emotion
   - Captured on StartSessionPage before game launch.
   - Used to select and recommend the appropriate game.
       │
       ▼
2. GAMEPLAY BEGINS
   - GamePlayPage starts secondsElapsed timer.
       │
       ▼
3. CHECKPOINT 2: Mid-Game Checkpoint (At 10 Seconds)
   - Triggered automatically when secondsElapsed === 10.
   - Non-intrusive banner appears: "Checking your expression...".
   - 3 frame samples analyzed via webcam in background.
   - Sample saved to timeline as checkpoint: 'during'.
       │
       ▼
4. GAME CONTINUES & VICTORY REACHED
       │
       ▼
5. CHECKPOINT 3: Final Checkpoint (Game Victory)
   - Triggered upon game completion.
   - Brief overlay requests user to look at camera.
   - 4 frame samples analyzed via webcam.
   - Sample saved to timeline as checkpoint: 'final'.
       │
       ▼
6. COMPLETE SESSION & GENERATE REPORT
   - Session stored with 3-step emotion timeline.
```

---

# 11. Emotion Data Storage

Emotion session records are stored in React state during execution and persisted to both **LocalStorage** and **Firebase Firestore**.

### Structure of a Saved Session Record (`formattedSession`)

Every recorded session object in [`sessionStorage.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/sessionStorage.js#L86-L110) contains the following exact fields:

```javascript
{
  id: "session_1771234567890_a1b2c",      // Unique session identifier string
  userId: "user_123456789",               // ID of user or 'guest_user'
  startTime: "2026-08-18T13:00:00.000Z",  // ISO timestamp when session began
  endTime: "2026-08-18T13:02:00.000Z",    // ISO timestamp when session completed
  initialEmotion: "Frustrated",            // Checkpoint 1 emotion string
  initialConfidence: 0.88,                // Checkpoint 1 AI confidence score (0.0 - 1.0)
  finalEmotion: "Happy",                  // Checkpoint 3 emotion string
  finalConfidence: 0.95,                  // Checkpoint 3 AI confidence score (0.0 - 1.0)
  recommendedGame: "Step-by-Step Puzzle",  // Display name of matched game
  gameId: "step-puzzle",                  // Machine ID of matched game
  score: 92,                              // Game score (0 - 100)
  accuracy: 90,                           // Percentage accuracy metric
  responseTime: 2.3,                      // Average seconds per item
  completionTime: 120,                    // Total game duration in seconds
  mistakes: 1,                            // Total mistakes / wrong moves count
  hintsUsed: 1,                           // Total hints requested count
  engagement: "High",                     // Rating ('High' | 'Moderate' | 'Developing')
  isDemoMode: false,                      // Boolean flag (true if Demo Mode was used)
  emotionTimeline: [                      // Array of 3 checkpoint observations
    { timestamp: '00:00', timeSeconds: 0, emotion: 'Frustrated', confidence: 0.88, checkpoint: 'initial' },
    { timestamp: '00:10', timeSeconds: 10, emotion: 'Neutral', confidence: 0.82, checkpoint: 'during' },
    { timestamp: '02:00', timeSeconds: 120, emotion: 'Happy', confidence: 0.95, checkpoint: 'final' }
  ],
  createdAt: "2026-08-18T13:02:00.000Z"   // Record creation timestamp
}
```

---

# 12. Firebase / Database

### Firebase Architecture & Services Used
Configured in [`firebase.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/firebase.js):
* **Firebase Authentication**: User signup, login, logout, and session state persistence via `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `onAuthStateChanged`.
* **Cloud Firestore**: NoSQL Cloud Database.
  * Collection **`users`**: Document key `user.uid` → stores `{ userId, name, email, role, createdAt }`.
  * Collection **`sessions`**: Auto-generated document ID → stores complete `formattedSession` objects.

### Dual-Storage Fallback Mechanism
If environment variables (`VITE_FIREBASE_API_KEY`, etc.) are missing or unconfigured:
1. `firebase.js` logs a message: *"Firebase credentials not set. Running in Local Storage Mode."*
2. [`sessionStorage.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/sessionStorage.js) seamlessly mirrors all reads and writes to browser `localStorage`:
   * `brightminds_sessions_db` (stores sessions array)
   * `brightminds_users_db` (stores users dictionary)
   * `brightminds_active_user` (stores currently authenticated demo user profile)

### Privacy & Sensitive Data Safety
> [!IMPORTANT]
> **No raw webcam video frames, camera pictures, or biometric facial vector templates are EVER sent to Firebase or saved to storage.** Only numerical text metadata (emotion string, confidence float, timestamp) is recorded.

---

# 13. Reports and Analysis

Caregiver reports are generated by [`SessionResultsPage.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/pages/SessionResultsPage.jsx), [`ReportsPage.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/pages/ReportsPage.jsx), and [`SessionDetailPage.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/pages/SessionDetailPage.jsx):

```
[ Saved Session Object ]
       │
       ├─► Emotion Progression Badges ── Initial → During (10s) → Final
       │
       ├─► EmotionTimelineChart ── Render Checkpoint Timeline Cards
       │
       ├─► PerformanceChart ── Render Score, Accuracy, Response Time & Engagement
       │
       └─► PDF Export / Print Document ── Triggered via window.print()
```

### Caregiver Report Contents
1. **Header Metadata**: Session ID, Date, Time, Child Name, Game Played.
2. **3-Stage Emotional Transition Summary**: Visual side-by-side comparison badges displaying emotion labels and AI confidence percentages at Initial, 10s Mid-Game, and Final checkpoints.
3. **Gameplay Performance Metrics**: Visual progress bars for Score (out of 100), Accuracy (%), Average Response Time (seconds), Total Duration, Mistakes Count, and Hints Used.
4. **Print / PDF Generation**: A dedicated "Print / Save PDF Report" button calls native browser `window.print()` formatted with print CSS.
5. **Caregiver Disclaimer**: Clarifies that BrightPath is an educational play platform and that reported emotional trends are not medical/psychological diagnoses.

---

# 14. Demo Mode

### Implementation Details
Demo Mode allows users, examiners, or reviewers to test the complete application flow without activating a real webcam or when a camera is unavailable.

* **Activation**: User clicks *"Switch to Demo Mode"* or selects one of the 5 demo emotion pills (**Happy**, **Sad**, **Neutral**, **Angry**, **Frustrated**) on [`StartSessionPage.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/pages/StartSessionPage.jsx#L89-L94).
* **Code Logic**: Located in [`emotionDetector.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/emotionDetector.js#L60-L72):
  ```javascript
  if (demoEmotion && Object.values(EMOTIONS).includes(demoEmotion)) {
    return {
      status: 'SUCCESS',
      faceDetected: true,
      emotion: demoEmotion,
      confidence: 0.95,
      isDemo: true,
      timestamp: new Date().toISOString(),
      checkpoint: options.checkpoint || 'demo',
      label: 'Demo Mode — Simulated Emotion'
    };
  }
  ```
* **Bypassing the AI Engine**: When Demo Mode is active, camera calls are skipped, face detection is marked as `true`, confidence is set to `0.95` (95%), and `isDemo: true` is attached to session records.

---

# 15. Error Handling

BrightPath implements robust fallback handlers for edge cases:

| Failure Case | Component / File | System Reaction & User Experience |
| :--- | :--- | :--- |
| **Camera Permission Denied** | [`CameraPreview.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/components/webcam/CameraPreview.jsx#L41-L48) | Shows a clear error card explaining camera access was denied, offering a "Retry Camera Permission" button and an option to switch to Demo Mode. |
| **No Webcam Hardware Found** | [`CameraPreview.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/components/webcam/CameraPreview.jsx#L44) | Displays *"No webcam device was found on this system"* and prompts the user to use Demo Mode. |
| **Local Model Loading Fails** | [`emotionRecognition.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/emotionRecognition.js#L82-L99) | Automatically catches local load error and retries downloading model weights from CDN (`https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model`). |
| **No Face Detected in Frame** | [`emotionRecognition.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/emotionRecognition.js#L307-L318) | Returns `status: 'NO_FACE'`. UI displays a banner: *"No face detected — please position your face inside the camera frame."* |
| **AI Inference Timeout** | [`emotionRecognition.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/emotionRecognition.js#L19-L30) | All async AI calls are wrapped in `withTimeout()`. If AI takes longer than 12–15 seconds, it cleanly rejects with `status: 'TIMEOUT'` and provides a "Retry Analysis" button. |
| **Firebase Disconnected / Offline** | [`firebase.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/firebase.js#L46-L51) | Silently catches initialization errors and switches storage and authentication to LocalStorage Mode. |

---

# 16. Data Flow Diagram

```
+-------------------------------------------------------------------+
|                            USER                                   |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|               WEBCAM / CAMERA STREAM (MediaStream)                |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                 HTML5 <video> ELEMENT (DOM Ref)                   |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|     EMOTION RECOGNITION ENGINE (face-api.js + TensorFlow.js)      |
|  - TinyFaceDetector (320x320 bounding box face detection)         |
|  - faceExpressionNet (7-class expression probabilities)           |
|  - mapToBrightPathEmotion (Heuristic mapping to 5 emotions)       |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                     EMOTION DETECTION RESULT                      |
|       { status: 'SUCCESS', emotion: 'Happy', confidence: 0.92 }   |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|          GAME RECOMMENDATION ENGINE (getRecommendedGame)          |
|                 Maps Emotion --> Recommended Game                 |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                         EDUCATIONAL GAME                          |
|    (Memory Quest / Color Garden / Brain Rush / Calm Maze / Step)  |
|  - Checkpoint 1: Initial Emotion                                  |
|  - Checkpoint 2: Mid-Game Emotion (Automated at 10 seconds)       |
|  - Checkpoint 3: Final Emotion (Game Victory)                     |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|            UNIFIED STORAGE LAYER (sessionStorage.js)              |
|              - LocalStorage (brightminds_sessions_db)             |
|              - Cloud Firestore ('sessions' collection)            |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                  CAREGIVER REPORT & ANALYTICS                     |
|           (EmotionTimelineChart, PerformanceChart, PDF)           |
+-------------------------------------------------------------------+
```

---

# 17. Function-by-Function Explanation

| Function | File | Input Parameters | What It Does | Output | Used By |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`loadEmotionModel`** | `src/services/emotionRecognition.js` | None | Initializes TensorFlow.js backend and loads TinyFaceDetector & faceExpressionNet neural networks. | `Promise<boolean>` | `CameraPreview.jsx`, `emotionDetector.js` |
| **`initTFBackend`** | `src/services/emotionRecognition.js` | None | Sets up WebGL backend for GPU acceleration with CPU fallback. | `Promise<void>` | `loadEmotionModel()` |
| **`checkFacePresence`** | `src/services/emotionRecognition.js` | `videoElement` | Checks if a face bounding box is currently present in the video frame. | `Promise<{ detected, count, message }>` | `CameraPreview.jsx` |
| **`waitForVideoReady`** | `src/services/emotionRecognition.js` | `videoElement, maxWaitMs` | Polls the HTML video element until stream dimensions and readyState are active. | `Promise<{ ready, code, message }>` | `analyzeCurrentExpression()` |
| **`mapToBrightPathEmotion`** | `src/services/emotionRecognition.js` | `expressions` (7 probabilities) | Applies frustration heuristic rules and selects top BrightPath emotion. | `{ emotion, confidence }` | `analyzeCurrentExpression()` |
| **`analyzeCurrentExpression`** | `src/services/emotionRecognition.js` | `videoElement, options` | Samples 3–5 frames, runs face detection & expression classification, averages scores. | `Promise<AnalysisResult>` | `detectFacialEmotion()` |
| **`detectFacialEmotion`** | `src/services/emotionDetector.js` | `videoElement, demoEmotion, options` | Main bridge function. Handles Demo Mode simulation or calls real webcam AI analysis. | `Promise<AnalysisResult>` | `StartSessionPage.jsx`, `GamePlayPage.jsx` |
| **`getRecommendedGame`** | `src/services/emotionDetector.js` | `emotion` (string) | Looks up game configuration corresponding to detected emotion, with Neutral fallback. | `GameObject` | `StartSessionPage.jsx`, `SessionContext.jsx` |
| **`getGameAnalysisConfig`** | `src/services/gameAnalysisConfig.js` | `gameId` (string) | Returns the analysis schedule & checkpoints for a game. | `ConfigObject` | Analysis scheduling |
| **`saveSessionData`** | `src/services/sessionStorage.js` | `sessionData` | Writes session payload to `localStorage` and Firebase Firestore. | `Promise<FormattedSession>` | `SessionContext.jsx` |
| **`getUserSessions`** | `src/services/sessionStorage.js` | `userId` | Fetches all session records for a user from Firestore or LocalStorage. | `Promise<Array<Session>>` | `DashboardPage.jsx`, `ReportsPage.jsx` |
| **`saveUserProfile`** | `src/services/sessionStorage.js` | `user` | Saves user profile data to `localStorage` and Firestore. | `Promise<ProfileData>` | `AuthContext.jsx` |
| **`requestCameraPermission`** | `src/components/webcam/CameraPreview.jsx` | None | Prompts browser for camera stream access via `getUserMedia`. | `Promise<void>` | `CameraPreview.jsx` |
| **`initSession`** | `src/context/SessionContext.jsx` | `detectedResult, gameObj, isDemo` | Initializes session state, timer, and seeds Checkpoint 1 into timeline. | `void` | `StartSessionPage.jsx` |
| **`recordEmotionSample`** | `src/context/SessionContext.jsx` | `sampleResult, secondsElapsed, isDemo, checkpointKey` | Appends a checkpoint emotion observation to `emotionTimeline`. | `void` | `GamePlayPage.jsx` |
| **`completeSession`** | `src/context/SessionContext.jsx` | `gameResults, customFinalSample` | Stops camera, aggregates metrics, saves session, and updates state. | `Promise<SavedSession>` | `GamePlayPage.jsx` |

---

# 18. Important Libraries and Technologies

| Library / Technology | Version | Purpose in THIS Project |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | UI library used for rendering application pages, components, and managing reactive state. |
| **Vite** | `^8.2.0` | Development server and build bundler for compiling the React application. |
| **`@vladmandic/face-api`** | `^1.7.15` | Core AI/ML library providing pre-trained TensorFlow.js models (`TinyFaceDetector` and `faceExpressionNet`) for client-side face detection and expression classification. |
| **TensorFlow.js** | Bundled with `face-api` | Machine learning runtime executing neural network tensor calculations inside the web browser via WebGL/CPU. |
| **Firebase** | `^12.17.1` | Backend-as-a-Service providing user authentication (`firebase/auth`) and cloud database storage (`firebase/firestore`). |
| **`lucide-react`** | `^1.31.0` | Icon package providing UI icons throughout pages and navigation headers. |
| **`canvas-confetti`** | `^1.9.4` | Visual animation library that fires a celebratory confetti canvas burst upon completing a game. |
| **Oxlint** | `^1.75.0` | JavaScript linter tool for static code quality checking. |

---

# 19. What Is Actually AI/ML vs Normal Programming?

This distinction is crucial for viva presentations:

### Genuine AI / Machine Learning Parts 🤖
1. **Face Bounding Box Detection (`TinyFaceDetector`)**: A Convolutional Neural Network (CNN) trained on facial images that takes raw video frame pixels and predicts bounding box coordinates `(x, y, width, height)` of human faces.
2. **Landmark & Feature Extraction**: Convolutional neural layers that extract facial structures (eyes, eyebrows, mouth curvature).
3. **Facial Expression Classification (`faceExpressionNet`)**: A deep neural network classifier that processes facial feature maps and outputs probability distribution tensors across expression classes (`happy`, `sad`, `neutral`, `angry`, etc.).

### Normal Software Engineering / Programming Parts 💻
1. **Webcam Stream Access**: Standard browser HTML5 JavaScript API (`navigator.mediaDevices.getUserMedia`).
2. **Frame Sampling Timers**: Standard JavaScript `setTimeout` and `setInterval` loops that trigger frame analysis every 10 seconds.
3. **Frustration Heuristic (`mapToBrightPathEmotion`)**: Normal `if/else` conditional logic written by the developer to map raw probability scores to BrightPath target emotions.
4. **Game Recommendation System**: A standard JavaScript key-value object lookup (`GAME_RECOMMENDATIONS[emotion]`).
5. **Game Logic & Score Math**: Standard React state, mathematical equations for scoring, and card shuffling logic.
6. **Data Storage & Sync**: Firebase Firestore API calls and `localStorage.setItem()` calls.
7. **UI Component Rendering**: Standard React JSX rendering, CSS glassmorphic styling, and DOM events.

---

# 20. End-to-End Example

### Scenario Walkthrough: "Child starts a session feeling Frustrated"

1. **User Opens Application**: The child logs in and navigates to the "Start Session" page.
2. **Camera Activated**: The app prompts for camera permission. `requestCameraPermission()` in `CameraPreview.jsx` launches the webcam.
3. **Model Loaded**: `loadEmotionModel()` in `emotionRecognition.js` loads the binary model weights from `/models` into browser memory.
4. **Initial Face Sampling**: `analyzeCurrentExpression()` captures 3 frames from the live video feed. `TinyFaceDetector` isolates the child's face.
5. **Neural Network Inference**: `faceExpressionNet` analyzes facial muscle tension and outputs raw probabilities: `{ angry: 0.42, sad: 0.28, neutral: 0.15, happy: 0.05, ... }`.
6. **Heuristic Mapping**: `mapToBrightPathEmotion()` evaluates the scores. Because `angry (0.42) > 0.18` and `sad (0.28) > 0.12`, the frustration rule triggers and returns **`Frustrated`** with `0.88` confidence.
7. **Game Recommendation**: `getRecommendedGame('Frustrated')` looks up the recommendation table and selects **Step-by-Step Puzzle**.
8. **Session Initialization**: The user clicks "Launch Step-by-Step Puzzle". `initSession()` records Checkpoint 1 (`Frustrated`, 0.88) to the `emotionTimeline`.
9. **Gameplay & 10-Second Mid-Game Checkpoint**: At 10 seconds into the puzzle, `trigger10SecondAnalysis()` runs a background 3-frame webcam sample. The child is now focused; the model returns `Neutral` (0.82 confidence), which is saved as Checkpoint 2.
10. **Game Victory & Final Checkpoint**: The child completes all puzzle stages. Upon victory, `runFinalAnalysis()` samples the webcam. The child is smiling; the model returns `Happy` (0.95 confidence), saved as Checkpoint 3.
11. **Report Storage & Display**: `completeSession()` saves the full record (`Frustrated → Neutral → Happy`, score 100) to `localStorage` and Cloud Firestore. `SessionResultsPage.jsx` displays the caregiver report and progression charts.

---

## 21. How I Can Explain This Project in a Viva

Here are clear, concise answers to questions examiners frequently ask:

* **Q: What is the main purpose of your project?**  
  *A: BrightPath is an emotion-guided educational web application. It uses client-side facial expression recognition to detect a child's current emotional state, automatically recommends a matching educational game, and tracks how their emotion improves across three checkpoints (Start, Mid-game, and Victory).*

* **Q: How does facial emotion recognition work in your project?**  
  *A: It uses the `@vladmandic/face-api` library powered by TensorFlow.js inside the browser. The video feed from the webcam is passed to a Convolutional Neural Network called `TinyFaceDetector` to detect the face, and then `faceExpressionNet` classifies the facial expression into emotion probability scores.*

* **Q: Which model are you using?**  
  *A: We use `TinyFaceDetector` for real-time face detection and `faceExpressionNet` for facial expression classification.*

* **Q: Which dataset was used to train the model?**  
  *A: The codebase uses a pre-trained open-source model. The binary weight files are included in the repository under `public/models/`, but the exact training dataset name is not specified in the repository files.*

* **Q: Did you train the model yourself?**  
  *A: No. We used a pre-trained model and developed a client-side execution pipeline, frame-sampling engine, frustration mapping heuristic, and game recommendation architecture around it.*

* **Q: Is the AI running on the client or the server?**  
  *A: 100% on the client side inside the browser using WebGL GPU acceleration. No raw camera images or video frames ever leave the user's computer, ensuring privacy.*

* **Q: How does the camera communicate with the AI?**  
  *A: The camera stream is bound to an HTML `<video>` element. The JavaScript DOM reference of that video element is passed directly into `faceapi.detectAllFaces(videoElement)` to extract image frame data.*

* **Q: How do you detect the five emotions when the model outputs seven?**  
  *A: The model outputs 7 raw classes (Neutral, Happy, Sad, Angry, Fearful, Disgusted, Surprised). We built a calibration function `mapToBrightPathEmotion()` that maps these to our 5 target emotions. For example, Frustration is detected using a compound heuristic combining Angry, Sad, and Disgusted scores.*

* **Q: How does emotion lead to game recommendation?**  
  *A: We built a recommendation mapping function `getRecommendedGame()`. Each emotion is mapped to a specific educational activity designed for that emotional state (e.g. Frustrated → Step-by-Step Puzzle, Happy → Memory Quest, Angry → Calm Maze).*

* **Q: How do you track emotion changes during the game?**  
  *A: We track emotions at 3 checkpoints: Initial (before game launch), Mid-Game (automatically sampled at 10 seconds into gameplay), and Final (sampled upon game victory). These three samples create an emotional progression timeline.*

* **Q: Where is the data stored?**  
  *A: Sessions are stored in browser `localStorage` and synced to Cloud Firestore under a `sessions` collection if Firebase credentials are configured.*

* **Q: What is Demo Mode?**  
  *A: Demo Mode is a built-in simulation feature that allows testing or presenting the entire application flow by manually selecting a test emotion without requiring an active webcam.*

* **Q: What part of the project is actually AI vs normal programming?**  
  *A: The AI part is the neural network face bounding box detection and expression classification. The normal programming part includes webcam media handling, the 10-second timer, frustration heuristic logic, game recommendation mapping, React UI rendering, and database storage.*

---

# 22. CONFIRMED vs UNKNOWN

### Confirmed From Code
* Facial emotion recognition is executed entirely client-side in the browser using `@vladmandic/face-api` and TensorFlow.js.
* Models loaded are `TinyFaceDetector` (input size 320x320) and `faceExpressionNet` (7 output classes).
* Binary model files are stored locally in `public/models/` with CDN fallback to jsDelivr.
* 5 BrightPath emotions supported: **Happy**, **Sad**, **Neutral**, **Angry**, **Frustrated**.
* Frustration is calculated using a compound heuristic rule in `mapToBrightPathEmotion()`.
* 5 educational games implemented: **Memory Quest**, **Color Garden**, **Brain Rush**, **Calm Maze**, **Step-by-Step Puzzle**.
* 3 emotion checkpoints tracked: **Initial**, **Mid-game (10s)**, and **Final (Victory)**.
* Dual storage layer: LocalStorage mirror + Firebase Firestore (`sessions` and `users` collections).
* Includes a fully functional Demo Mode that bypasses camera hardware.

### Not Confirmed From Code
* The exact original training dataset name (e.g., FER2013, AffectNet) for `faceExpressionNet` is not mentioned in the repository code or weight manifest files.
* No evidence of custom training or fine-tuning scripts in the codebase.

### Assumptions / Possible Sources
* Open-source `face-api.js` documentation historically references training `faceExpressionNet` on dataset combinations of public facial expression benchmark datasets (such as FER2013), but since this cannot be verified from local code manifests, it is treated as unconfirmed for viva purposes.

---

# 23. Source References Inside the Documentation

* Camera Initialization & Video Binding: [`src/components/webcam/CameraPreview.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/components/webcam/CameraPreview.jsx#L18-L68)
* ML Model Loading & Frustration Heuristic: [`src/services/emotionRecognition.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/emotionRecognition.js#L60-L153)
* Emotion Detection Bridge & Recommendations: [`src/services/emotionDetector.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/emotionDetector.js#L12-L105)
* Storage Service & Firestore Fallback: [`src/services/sessionStorage.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/sessionStorage.js#L28-L165)
* Firebase Config: [`src/services/firebase.js`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/services/firebase.js#L24-L53)
* Game Checkpoints & Gameplay Tracker: [`src/pages/GamePlayPage.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/pages/GamePlayPage.jsx#L71-L194)
* Game Modules:
  * Memory Quest: [`src/games/MemoryQuest.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/games/MemoryQuest.jsx)
  * Color Garden: [`src/games/ColorGarden.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/games/ColorGarden.jsx)
  * Brain Rush: [`src/games/BrainRush.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/games/BrainRush.jsx)
  * Calm Maze: [`src/games/CalmMaze.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/games/CalmMaze.jsx)
  * Step-by-Step Puzzle: [`src/games/StepPuzzle.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/games/StepPuzzle.jsx)
* Report Generation & Progression Timeline: [`src/pages/SessionResultsPage.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/pages/SessionResultsPage.jsx), [`src/pages/SessionDetailPage.jsx`](file:///c:/Users/bless/OneDrive/Desktop/BrightPath/src/pages/SessionDetailPage.jsx)
