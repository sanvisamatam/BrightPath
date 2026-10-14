// Unified Storage & Persistence Service (FastAPI + Firestore + LocalStorage Mirroring)
import { db, isFirebaseConfigured } from './firebase.js';
import api from './apiClient.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc 
} from 'firebase/firestore';

const LOCAL_STORAGE_SESSIONS_KEY = 'brightminds_sessions_db';
const LOCAL_STORAGE_USERS_KEY = 'brightminds_users_db';
const LOCAL_STORAGE_CHILDREN_KEY = 'brightminds_children_db';
const LOCAL_STORAGE_PROGRESS_KEY = 'brightminds_progress_db';

// ==========================================
// Local Storage Helper Utilities
// ==========================================
const getLocalData = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} locally:`, e);
  }
};

// ==========================================
// Age Validation & Mode Resolution
// ==========================================
export const validateChildAge = (age) => {
  const numericAge = parseInt(age, 10);
  if (isNaN(numericAge)) {
    return { valid: false, error: 'Age is required and must be a valid number.' };
  }
  if (numericAge < 3) {
    return { valid: false, error: 'BrightPath activities are designed for children aged 3 and older.' };
  }
  if (numericAge > 17) {
    return { valid: false, error: 'Please enter a child or teen age between 3 and 17 years.' };
  }
  return { valid: true, error: null, age: numericAge };
};

export const resolveActivityMode = (age) => {
  const numericAge = parseInt(age, 10);
  if (!isNaN(numericAge) && numericAge >= 3 && numericAge <= 6) {
    return 'early'; // Ages 3–6: Early/Foundational Activity Mode
  }
  return 'brightpath'; // Ages 7–17: Existing BrightPath Mode
};

// ==========================================
// User Profile Operations
// ==========================================
export const saveUserProfile = async (user) => {
  const profileData = {
    userId: user.uid || user.userId,
    name: user.name || user.displayName || 'Caregiver',
    email: user.email,
    role: user.role || 'Parent',
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 1. Mirror locally
  const users = getLocalData(LOCAL_STORAGE_USERS_KEY, {});
  users[profileData.userId] = profileData;
  setLocalData(LOCAL_STORAGE_USERS_KEY, users);

  // 2. Sync to Python FastAPI Backend
  try {
    await api.saveUserProfile(profileData);
  } catch (e) {
    console.info("Python backend user sync deferred:", e.message);
  }

  // 3. Persist to Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'users', profileData.userId), profileData, { merge: true });
    } catch (err) {
      console.warn("Firestore saveUserProfile error:", err);
    }
  }

  return profileData;
};

export const getUserProfile = async (userId) => {
  // Try local first
  const users = getLocalData(LOCAL_STORAGE_USERS_KEY, {});
  if (users[userId]) return users[userId];

  // Try Python Backend
  try {
    const apiRes = await api.getUserProfile(userId);
    if (apiRes && apiRes.success && apiRes.data) {
      users[userId] = apiRes.data;
      setLocalData(LOCAL_STORAGE_USERS_KEY, users);
      return apiRes.data;
    }
  } catch (e) {}

  // Fallback to Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        users[userId] = data;
        setLocalData(LOCAL_STORAGE_USERS_KEY, users);
        return data;
      }
    } catch (err) {
      console.warn("Firestore getUserProfile error:", err);
    }
  }

  return null;
};

// ==========================================
// Child Profile Operations
// ==========================================
export const saveChildProfile = async (userId, childData) => {
  const ageValidation = validateChildAge(childData.age);
  if (!ageValidation.valid) {
    throw new Error(ageValidation.error);
  }

  const childId = childData.childId || `child_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();

  const formattedChild = {
    childId: childId,
    userId: userId || 'guest_user',
    name: childData.name ? childData.name.trim() : 'Child',
    age: ageValidation.age,
    mode: resolveActivityMode(ageValidation.age),
    notes: childData.notes || '',
    createdAt: childData.createdAt || now,
    updatedAt: now
  };

  // 1. Save locally
  const localChildren = getLocalData(LOCAL_STORAGE_CHILDREN_KEY, []);
  const existingIdx = localChildren.findIndex(c => c.childId === childId);
  if (existingIdx >= 0) {
    localChildren[existingIdx] = { ...localChildren[existingIdx], ...formattedChild };
  } else {
    localChildren.unshift(formattedChild);
  }
  setLocalData(LOCAL_STORAGE_CHILDREN_KEY, localChildren);

  // 2. Sync to Python FastAPI Backend
  try {
    await api.saveChild(formattedChild);
  } catch (err) {
    console.info("Python backend saveChild deferred:", err.message);
  }

  // 3. Persist to Firestore: children/{childId}
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'children', childId), formattedChild, { merge: true });
      console.log("Child profile saved to Firestore successfully:", childId);
    } catch (err) {
      console.warn("Firestore child profile save error:", err);
    }
  }

  return formattedChild;
};

export const getChildProfiles = async (userId) => {
  let list = [];

  // Local mirror lookup
  const localChildren = getLocalData(LOCAL_STORAGE_CHILDREN_KEY, []);
  if (userId) {
    list = localChildren.filter(c => c.userId === userId);
  } else {
    list = localChildren;
  }

  // Try Python backend
  try {
    const apiRes = await api.getChildren(userId);
    if (apiRes && apiRes.success && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
      const map = new Map();
      [...list, ...apiRes.data].forEach(c => {
        if (c.childId) map.set(c.childId, c);
      });
      list = Array.from(map.values());
      if (userId) list = list.filter(c => c.userId === userId);
    }
  } catch (err) {
    console.info("Python backend getChildren deferred:", err.message);
  }

  // Firestore query if configured
  if (isFirebaseConfigured && db && userId) {
    try {
      const q = query(collection(db, 'children'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const fsChildren = [];
      snapshot.forEach(docSnap => {
        fsChildren.push(docSnap.data());
      });

      if (fsChildren.length > 0) {
        // Merge with local mirror to prevent loss
        const map = new Map();
        [...localChildren, ...fsChildren].forEach(c => {
          if (c.childId) map.set(c.childId, c);
        });
        const merged = Array.from(map.values()).filter(c => c.userId === userId);
        merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setLocalData(LOCAL_STORAGE_CHILDREN_KEY, Array.from(map.values()));
        return merged;
      }
    } catch (err) {
      console.warn("Firestore getChildProfiles query error:", err);
    }
  }

  list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return list;
};

export const updateChildProfile = async (childId, updates) => {
  const localChildren = getLocalData(LOCAL_STORAGE_CHILDREN_KEY, []);
  const existing = localChildren.find(c => c.childId === childId);
  if (!existing) return null;

  let validatedAge = existing.age;
  if (updates.age !== undefined) {
    const check = validateChildAge(updates.age);
    if (!check.valid) throw new Error(check.error);
    validatedAge = check.age;
  }

  const updatedChild = {
    ...existing,
    ...updates,
    age: validatedAge,
    mode: resolveActivityMode(validatedAge),
    updatedAt: new Date().toISOString()
  };

  // Local update
  const updatedList = localChildren.map(c => c.childId === childId ? updatedChild : c);
  setLocalData(LOCAL_STORAGE_CHILDREN_KEY, updatedList);

  // Python backend update
  try {
    await api.updateChild(childId, updatedChild);
  } catch (err) {
    console.info("Python backend updateChild deferred:", err.message);
  }

  // Firestore update
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'children', childId), updatedChild, { merge: true });
    } catch (err) {
      console.warn("Firestore updateChildProfile error:", err);
    }
  }

  return updatedChild;
};

// ==========================================
// Session Storage Operations
// ==========================================
export const saveSessionData = async (sessionData) => {
  const now = new Date().toISOString();
  const sessionId = sessionData.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const childId = sessionData.childId || 'default_child';

  // Construct complete session document
  const formattedSession = {
    id: sessionId,
    sessionId: sessionId,
    childId: childId,
    userId: sessionData.userId || 'guest_user',
    childName: sessionData.childName || 'Child',
    childAge: sessionData.childAge || 5,
    activityId: sessionData.gameId || sessionData.activityId || 'bubble-pop',
    activityName: sessionData.recommendedGame || sessionData.activityName || 'Activity',
    activityMode: sessionData.activityMode || resolveActivityMode(sessionData.childAge || 5),
    startTime: sessionData.startTime || now,
    endTime: sessionData.endTime || now,
    duration: sessionData.completionTime || 120,
    completionStatus: sessionData.completionStatus || 'completed',
    
    // Core game metrics
    score: typeof sessionData.score === 'number' ? sessionData.score : 100,
    accuracy: typeof sessionData.accuracy === 'number' ? sessionData.accuracy : 100,
    responseTime: typeof sessionData.responseTime === 'number' ? sessionData.responseTime : 2.0,
    completionTime: sessionData.completionTime || 120,
    mistakes: sessionData.mistakes || 0,
    hintsUsed: sessionData.hintsUsed || 0,
    engagement: sessionData.engagement || 'High',
    isDemoMode: Boolean(sessionData.isDemoMode),

    // Observed Facial Expression Progressions (Non-Medical Wording)
    initialEmotion: sessionData.initialEmotion || 'Neutral',
    initialConfidence: sessionData.initialConfidence || 0.85,
    finalEmotion: sessionData.finalEmotion || sessionData.initialEmotion || 'Neutral',
    finalConfidence: sessionData.finalConfidence || 0.85,
    emotionTimeline: sessionData.emotionTimeline || [
      { timestamp: '00:00', timeSeconds: 0, emotion: sessionData.initialEmotion || 'Neutral', confidence: 0.85, checkpoint: 'initial' }
    ],

    // 5 New Developmental Observational Indicators
    motorMetrics: sessionData.motorMetrics || {
      tapAccuracy: sessionData.accuracy || 100,
      dragAccuracy: sessionData.accuracy || 100,
      avgResponseTime: sessionData.responseTime || 2.0,
      missedInteractions: sessionData.mistakes || 0,
      repeatedAttempts: 0,
      completionTime: sessionData.completionTime || 120,
      score: sessionData.score || 100
    },

    repetitiveMetrics: sessionData.repetitiveMetrics || {
      repeatedActionsCount: 0,
      repetitionFrequency: 0,
      repeatedSequences: 0,
      rhythmConsistency: 85,
      notes: 'Repeated interaction patterns observed during this session.'
    },

    communicationMetrics: sessionData.communicationMetrics || {
      promptResponsesCount: 0,
      voiceInteractionAttempts: null,
      responseLatency: null,
      repeatedPromptsCount: 0,
      completionRate: null,
      hasData: false // Insufficient communication data flag
    },

    stimulationMetrics: sessionData.stimulationMetrics || {
      colorChangeResponses: 0,
      animationEvents: 0,
      soundEvents: 0,
      transitionReactions: 0,
      timeline: []
    },

    socialMetrics: sessionData.socialMetrics || {
      characterInteractions: 0,
      socialPromptResponses: 0,
      responseTime: null,
      sharedAttentionEvents: 0,
      notes: 'Observed social interaction indicators within BrightPath activities.'
    },

    createdAt: sessionData.createdAt || now
  };

  // 1. Sync & Process via Python FastAPI Backend
  try {
    const apiRes = await api.saveSession(formattedSession);
    if (apiRes && apiRes.success && apiRes.data) {
      if (apiRes.data.diagnosticResults) {
        formattedSession.diagnosticResults = apiRes.data.diagnosticResults;
      }
    }
  } catch (err) {
    console.info("Python backend session sync deferred:", err.message);
  }

  // 2. Mirror session to local storage
  const localSessions = getLocalData(LOCAL_STORAGE_SESSIONS_KEY, []);
  // Ensure no duplicate session ID overwrite
  const existingIdx = localSessions.findIndex(s => s.id === sessionId);
  if (existingIdx >= 0) {
    localSessions[existingIdx] = formattedSession;
  } else {
    localSessions.unshift(formattedSession);
  }
  setLocalData(LOCAL_STORAGE_SESSIONS_KEY, localSessions);

  // 3. Persist to Cloud Firestore
  // Recommended hierarchy: children/{childId}/sessions/{sessionId}
  // AND flat collection 'sessions' for simple querying
  if (isFirebaseConfigured && db) {
    try {
      // Subcollection write: children/{childId}/sessions/{sessionId}
      await setDoc(doc(db, 'children', childId, 'sessions', sessionId), formattedSession);
      // Flat sessions collection write for caregiver index queries
      await setDoc(doc(db, 'sessions', sessionId), formattedSession);
      console.log("Session saved to Firestore under child and sessions collections successfully:", sessionId);
    } catch (err) {
      console.warn("Firestore session save error:", err);
    }
  }

  // 4. Update Child Aggregated Progress
  await updateCumulativeProgress(childId);

  return formattedSession;
};

// Get sessions for a specific child
export const getChildSessions = async (childId) => {
  const localList = getLocalData(LOCAL_STORAGE_SESSIONS_KEY, []);
  let sessions = localList.filter(s => s.childId === childId);

  // 1. Fetch from Python FastAPI Backend
  try {
    const apiRes = await api.getSessions({ childId });
    if (apiRes && apiRes.success && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
      const map = new Map();
      [...sessions, ...apiRes.data].forEach(s => {
        if (s.id) map.set(s.id, s);
      });
      sessions = Array.from(map.values());
      const mergedLocal = new Map([...localList.map(s => [s.id, s]), ...sessions.map(s => [s.id, s])]);
      setLocalData(LOCAL_STORAGE_SESSIONS_KEY, Array.from(mergedLocal.values()));
    }
  } catch (err) {
    console.info("Python backend getChildSessions deferred:", err.message);
  }

  // 2. Firestore query if configured
  if (isFirebaseConfigured && db && childId) {
    try {
      const subColRef = collection(db, 'children', childId, 'sessions');
      const snapshot = await getDocs(subColRef);
      const fsSessions = [];
      snapshot.forEach(docSnap => {
        fsSessions.push(docSnap.data());
      });

      if (fsSessions.length > 0) {
        const map = new Map();
        [...sessions, ...fsSessions].forEach(s => {
          if (s.id) map.set(s.id, s);
        });
        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return merged;
      }
    } catch (err) {
      console.warn("Firestore getChildSessions error:", err);
    }
  }

  sessions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return sessions;
};

// Get sessions for a user (all children)
export const getUserSessions = async (userId) => {
  const localList = getLocalData(LOCAL_STORAGE_SESSIONS_KEY, []);
  let sessions = userId 
    ? localList.filter(s => s.userId === userId || s.userId === 'guest_user')
    : localList;

  // 1. Fetch from Python FastAPI Backend
  try {
    const apiRes = await api.getSessions({ userId });
    if (apiRes && apiRes.success && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
      const map = new Map();
      [...sessions, ...apiRes.data].forEach(s => {
        if (s.id) map.set(s.id, s);
      });
      sessions = Array.from(map.values());
      const mergedLocal = new Map([...localList.map(s => [s.id, s]), ...sessions.map(s => [s.id, s])]);
      setLocalData(LOCAL_STORAGE_SESSIONS_KEY, Array.from(mergedLocal.values()));
    }
  } catch (err) {
    console.info("Python backend getUserSessions deferred:", err.message);
  }

  // 2. Firestore query if configured
  if (isFirebaseConfigured && db && userId) {
    try {
      const q = query(collection(db, 'sessions'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const fsSessions = [];
      querySnapshot.forEach(docSnap => {
        fsSessions.push(docSnap.data());
      });

      if (fsSessions.length > 0) {
        const map = new Map();
        [...sessions, ...fsSessions].forEach(s => {
          if (s.id) map.set(s.id, s);
        });
        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return merged;
      }
    } catch (err) {
      console.warn("Firestore getUserSessions error:", err);
    }
  }

  sessions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return sessions;
};

export const getSessionById = async (sessionId) => {
  // 1. Try Python Backend
  try {
    const apiRes = await api.getSessionById(sessionId);
    if (apiRes && apiRes.success && apiRes.data) {
      return apiRes.data;
    }
  } catch (err) {}

  const localList = getLocalData(LOCAL_STORAGE_SESSIONS_KEY, []);
  const found = localList.find(s => s.id === sessionId);
  if (found) return found;

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'sessions', sessionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (err) {}
  }

  return null;
};

// ==========================================
// Child Cumulative Progress Tracking
// ==========================================
export const updateCumulativeProgress = async (childId) => {
  if (!childId) return null;

  // 1. Prioritize Python Backend calculation
  try {
    const apiRes = await api.recalculateProgress(childId);
    if (apiRes && apiRes.success && apiRes.data && apiRes.data.totalSessions > 0) {
      const progressSummary = apiRes.data;
      const progressDb = getLocalData(LOCAL_STORAGE_PROGRESS_KEY, {});
      progressDb[childId] = progressSummary;
      setLocalData(LOCAL_STORAGE_PROGRESS_KEY, progressDb);

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'children', childId, 'progress', 'summary'), progressSummary, { merge: true });
        } catch (err) {
          console.warn("Firestore progress summary save error:", err);
        }
      }
      return progressSummary;
    }
  } catch (e) {}

  // 2. Offline fallback calculation
  const sessions = await getChildSessions(childId);
  const total = sessions.length;
  if (total === 0) return null;

  const completed = sessions.filter(s => s.completionStatus === 'completed').length;
  const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const avgScore = Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / total);
  const avgAccuracy = Math.round(sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / total);

  // Motor trend averages
  const avgMotorAccuracy = Math.round(
    sessions.reduce((acc, s) => acc + (s.motorMetrics?.tapAccuracy || s.accuracy || 100), 0) / total
  );

  // Repetition frequency average
  const avgRepetitionFreq = Number(
    (sessions.reduce((acc, s) => acc + (s.repetitiveMetrics?.repetitionFrequency || 0), 0) / total).toFixed(1)
  );

  const progressSummary = {
    childId: childId,
    totalSessions: total,
    completedSessions: completed,
    completionRate: Math.round((completed / total) * 100),
    totalDurationSeconds: totalDuration,
    avgScore: avgScore,
    avgAccuracy: avgAccuracy,
    avgMotorAccuracy: avgMotorAccuracy,
    avgRepetitionFreq: avgRepetitionFreq,
    recentSessionId: sessions[0]?.id,
    updatedAt: new Date().toISOString()
  };

  // 1. Mirror to local storage
  const progressDb = getLocalData(LOCAL_STORAGE_PROGRESS_KEY, {});
  progressDb[childId] = progressSummary;
  setLocalData(LOCAL_STORAGE_PROGRESS_KEY, progressDb);

  // 2. Persist to Firestore: children/{childId}/progress/summary
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'children', childId, 'progress', 'summary'), progressSummary, { merge: true });
    } catch (err) {
      console.warn("Firestore progress summary save error:", err);
    }
  }

  return progressSummary;
};

export const getChildProgress = async (childId) => {
  // 1. Try Python Backend
  try {
    const apiRes = await api.getChildProgress(childId);
    if (apiRes && apiRes.success && apiRes.data && apiRes.data.totalSessions > 0) {
      const progressDb = getLocalData(LOCAL_STORAGE_PROGRESS_KEY, {});
      progressDb[childId] = apiRes.data;
      setLocalData(LOCAL_STORAGE_PROGRESS_KEY, progressDb);
      return apiRes.data;
    }
  } catch (err) {}

  const progressDb = getLocalData(LOCAL_STORAGE_PROGRESS_KEY, {});
  if (progressDb[childId]) return progressDb[childId];

  if (isFirebaseConfigured && db && childId) {
    try {
      const docRef = doc(db, 'children', childId, 'progress', 'summary');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        progressDb[childId] = data;
        setLocalData(LOCAL_STORAGE_PROGRESS_KEY, progressDb);
        return data;
      }
    } catch (err) {}
  }

  return updateCumulativeProgress(childId);
};

// ==========================================
// Historical Diagnostic-Categories Evaluation
// ==========================================
export const getSessionDiagnostics = async (sessionId, sessionObj = null) => {
  if (sessionId) {
    try {
      const res = await api.getSessionDiagnostics(sessionId);
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch (err) {}
  }

  if (sessionObj) {
    try {
      const evalRes = await api.evaluateSessionDiagnostics(sessionObj);
      if (evalRes && evalRes.success && evalRes.data) {
        return evalRes.data;
      }
    } catch (err) {}
  }

  // Ethical, evidence-based fallback adhering strictly to medical integrity
  return {
    model_available: false,
    model_status: "EXPERIMENTAL_UNAVAILABLE",
    honest_message: "Diagnostic prediction model not available",
    clinical_disclaimer: "Important Medical Disclaimer: BrightPath is an educational play and developmental engagement platform. Game performance, facial expression analysis, and keyboard interaction metrics CANNOT diagnose autism spectrum disorders or historical subtypes. Formal clinical diagnosis requires comprehensive evaluation by qualified healthcare professionals.",
    historical_context_summary: "Autistic Disorder, Asperger Syndrome, Childhood Disintegrative Disorder, and PDD-NOS are historical diagnostic categories from DSM-IV. In DSM-5 and ICD-11, these subtypes were unified under Autism Spectrum Disorder (ASD).",
    categories: [
      {
        category_id: "autistic_disorder",
        category_name: "Autistic Disorder",
        display_value: "Diagnostic prediction model not available",
        prediction_percentage: null,
        current_status: "Reclassified under Autism Spectrum Disorder (ASD) in DSM-5 / ICD-11.",
        clinical_note: "Single-session educational gameplay or facial expressions cannot diagnose Autistic Disorder."
      },
      {
        category_id: "asperger_syndrome",
        category_name: "Asperger Syndrome",
        display_value: "Diagnostic prediction model not available",
        prediction_percentage: null,
        current_status: "Consolidated into Autism Spectrum Disorder (ASD) in DSM-5 / ICD-11.",
        clinical_note: "A game interface or webcam emotion detection cannot establish Asperger traits."
      },
      {
        category_id: "childhood_disintegrative_disorder",
        category_name: "Childhood Disintegrative Disorder",
        display_value: "Diagnostic prediction model not available",
        prediction_percentage: null,
        current_status: "Subsumed into Autism Spectrum Disorder (ASD) in DSM-5.",
        clinical_note: "This rare historical condition involves profound neurodevelopmental regression that cannot be detected by web application interactions."
      },
      {
        category_id: "pdd_nos",
        category_name: "Pervasive Developmental Disorder - Not Otherwise Specified (PDD-NOS)",
        display_value: "Diagnostic prediction model not available",
        prediction_percentage: null,
        current_status: "Reclassified within unified Autism Spectrum Disorder (ASD) in DSM-5.",
        clinical_note: "Subthreshold diagnostic categories are not computable from client-side mini-game metrics."
      }
    ],
    observational_indicators: sessionObj ? [
      {
        name: "Motor Tap & Interaction Accuracy",
        value: sessionObj.accuracy || 100,
        unit: "%",
        category: "Motor & Coordination",
        non_diagnostic_note: "Touch accuracy during gameplay challenge."
      },
      {
        name: "Interaction Response Latency",
        value: sessionObj.responseTime || 2.0,
        unit: "seconds",
        category: "Processing Speed",
        non_diagnostic_note: "Average response delay following in-game prompts."
      }
    ] : []
  };
};

export const getDiagnosticModelInfo = async () => {
  try {
    const res = await api.getModelInfo();
    if (res && res.success && res.data) {
      return res.data;
    }
  } catch (err) {}

  return {
    model_available: false,
    model_status: "EXPERIMENTAL_UNAVAILABLE",
    honest_message: "Diagnostic prediction model not available",
    disclaimer: "BrightPath is an educational learning app. Formal clinical evaluation is required for medical diagnosis."
  };
};

