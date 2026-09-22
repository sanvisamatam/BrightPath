import * as faceapi from '@vladmandic/face-api';

export const BRIGHTPATH_EMOTIONS = {
  HAPPY: 'Happy',
  SAD: 'Sad',
  NEUTRAL: 'Neutral',
  ANGRY: 'Angry',
  FRUSTRATED: 'Frustrated'
};

let isModelLoaded = false;
let isModelLoading = false;
let modelLoadPromise = null;
let modelLoadError = null;

/**
 * Timeout promise wrapper to prevent any async operation from hanging indefinitely.
 */
export const withTimeout = (promise, ms = 12000, errorMsg = 'Operation timed out') => {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(errorMsg));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
};

/**
 * Explicitly initialize TFJS backend for browser environment stability.
 */
export const initTFBackend = async () => {
  try {
    if (faceapi.tf) {
      faceapi.tf.env().set('WEBGL_PACK', true);
      const currentBackend = faceapi.tf.getBackend();
      if (!currentBackend) {
        try {
          await faceapi.tf.setBackend('webgl');
          await faceapi.tf.ready();
        } catch (e) {
          console.warn("WebGL backend failed, falling back to CPU backend:", e);
          await faceapi.tf.setBackend('cpu');
          await faceapi.tf.ready();
        }
      }
    }
  } catch (err) {
    console.warn("TFJS backend initialization error:", err);
  }
};

/**
 * Loads face-api tinyFaceDetector and faceExpressionNet models.
 * Reuses cached instance once loaded. Hard timeout prevents hanging.
 */
export const loadEmotionModel = async () => {
  if (isModelLoaded) return true;
  if (modelLoadError) throw modelLoadError;
  if (isModelLoading) return modelLoadPromise;

  isModelLoading = true;

  modelLoadPromise = withTimeout((async () => {
    try {
      await initTFBackend();

      // Try local /models/ directory first
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);

      isModelLoaded = true;
      isModelLoading = false;
      console.log("Real facial expression analysis models loaded successfully from local storage.");
      return true;
    } catch (localErr) {
      console.warn("Local model loading failed, trying CDN fallback:", localErr);
      try {
        const CDN_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(CDN_URL)
        ]);
        isModelLoaded = true;
        isModelLoading = false;
        console.log("Real facial expression analysis models loaded successfully from CDN fallback.");
        return true;
      } catch (cdnErr) {
        isModelLoading = false;
        modelLoadError = new Error("Facial expression detection model could not be loaded. Please check network connectivity.");
        console.error("Failed to load facial expression models:", cdnErr);
        throw modelLoadError;
      }
    }
  })(), 15000, "Model loading timed out after 15 seconds");

  return modelLoadPromise;
};

/**
 * Documented calibration layer:
 * Maps 7 raw facial expression probabilities to BrightPath's 5 target emotions.
 */
export const mapToBrightPathEmotion = (expressions) => {
  if (!expressions) {
    return { emotion: BRIGHTPATH_EMOTIONS.NEUTRAL, confidence: 0.70 };
  }

  const happy = expressions.happy || 0;
  const sad = expressions.sad || 0;
  const neutral = expressions.neutral || 0;
  const angry = expressions.angry || 0;
  const fearful = expressions.fearful || 0;
  const disgusted = expressions.disgusted || 0;
  const surprised = expressions.surprised || 0;

  // Frustration Heuristic for compound negative tension
  const negativeCompound = angry + sad + disgusted + fearful;
  const isFrustrated = 
    (angry > 0.18 && (sad > 0.12 || disgusted > 0.12 || fearful > 0.12)) ||
    (disgusted > 0.32) ||
    (negativeCompound > 0.45 && happy < 0.25 && neutral < 0.45);

  if (isFrustrated) {
    const rawConf = Math.min(0.96, Math.max(0.65, (angry + sad + disgusted + 0.3) / 1.5));
    return {
      emotion: BRIGHTPATH_EMOTIONS.FRUSTRATED,
      confidence: Number(rawConf.toFixed(2))
    };
  }

  const candidates = [
    { emotion: BRIGHTPATH_EMOTIONS.HAPPY, score: happy + (surprised * 0.4) },
    { emotion: BRIGHTPATH_EMOTIONS.SAD, score: sad + (fearful * 0.5) },
    { emotion: BRIGHTPATH_EMOTIONS.NEUTRAL, score: neutral + (surprised * 0.4) },
    { emotion: BRIGHTPATH_EMOTIONS.ANGRY, score: angry }
  ];

  candidates.sort((a, b) => b.score - a.score);
  const top = candidates[0];
  const confidence = Math.min(0.98, Math.max(0.55, Number(top.score.toFixed(2))));

  return {
    emotion: top.emotion,
    confidence: confidence
  };
};

/**
 * Checks video element frame readiness before attempting detection.
 * Retries for up to maxWaitMs before reporting camera frame unavailable.
 */
export const waitForVideoReady = async (videoElement, maxWaitMs = 3000) => {
  if (!videoElement) {
    return { ready: false, code: 'CAMERA_ERROR', message: 'Camera video element is not connected.' };
  }

  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const hasSrc = Boolean(videoElement.srcObject);
    const hasReadyState = videoElement.readyState >= 2; // HAVE_CURRENT_DATA or higher
    const hasDimensions = videoElement.videoWidth > 0 && videoElement.videoHeight > 0;
    const isPlaying = !videoElement.paused && !videoElement.ended;

    if (hasSrc && hasReadyState && hasDimensions) {
      return { ready: true };
    }

    // Try triggering play if video is paused but stream exists
    if (hasSrc && videoElement.paused) {
      try {
        await videoElement.play();
      } catch (e) {}
    }

    await new Promise(res => setTimeout(res, 200));
  }

  return { 
    ready: false, 
    code: 'CAMERA_ERROR', 
    message: 'Camera video stream frames are not ready yet. Please ensure your webcam is allowed and active.' 
  };
};

/**
 * Helper to check face presence in video element
 */
export const checkFacePresence = async (videoElement) => {
  const readyCheck = await waitForVideoReady(videoElement, 1500);
  if (!readyCheck.ready) {
    return { detected: false, message: readyCheck.message };
  }

  try {
    await loadEmotionModel();
    const detections = await faceapi.detectAllFaces(
      videoElement,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 })
    );

    if (!detections || detections.length === 0) {
      return {
        detected: false,
        message: 'No face detected — please position your face inside the camera frame.'
      };
    }

    return {
      detected: true,
      count: detections.length,
      message: `Camera ready — ${detections.length > 1 ? 'face detected (multi-face: largest selected)' : 'face detected'}`
    };
  } catch (err) {
    console.warn("Face presence check warning:", err);
    return { detected: false, message: 'Could not perform face check' };
  }
};

/**
 * Main facial expression analysis pipeline.
 * Guaranteed to return one of:
 * - status: 'SUCCESS' (emotion detected)
 * - status: 'NO_FACE' (no face detected)
 * - status: 'MODEL_ERROR' (model failed)
 * - status: 'CAMERA_ERROR' (camera frame unavailable)
 * - status: 'TIMEOUT' (took longer than timeoutMs)
 */
export const analyzeCurrentExpression = async (videoElement, options = {}) => {
  const { frameCount = 3, delayMs = 250, timeoutMs = 12000, checkpoint = 'initial' } = options;

  const runPipeline = async () => {
    // 1. Verify Video Frame Readiness
    const readyCheck = await waitForVideoReady(videoElement, 3000);
    if (!readyCheck.ready) {
      return {
        status: 'CAMERA_ERROR',
        faceDetected: false,
        emotion: BRIGHTPATH_EMOTIONS.NEUTRAL,
        confidence: 0.0,
        timestamp: new Date().toISOString(),
        checkpoint: checkpoint,
        label: 'Camera frame unavailable',
        message: readyCheck.message
      };
    }

    // 2. Load ML Model with timeout
    try {
      await loadEmotionModel();
    } catch (modelErr) {
      console.error("Model load error during expression analysis:", modelErr);
      return {
        status: 'MODEL_ERROR',
        faceDetected: false,
        emotion: BRIGHTPATH_EMOTIONS.NEUTRAL,
        confidence: 0.0,
        timestamp: new Date().toISOString(),
        checkpoint: checkpoint,
        label: 'Emotion AI model error',
        message: 'Facial expression AI model failed to load. Please click retry.'
      };
    }

    // 3. Sample 3–5 Frames with delay between samples
    const validFrameExpressions = [];

    for (let i = 0; i < frameCount; i++) {
      try {
        const detections = await faceapi
          .detectAllFaces(
            videoElement,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 })
          )
          .withFaceExpressions();

        if (detections && detections.length > 0) {
          // Sort by bounding box area descending and pick largest face
          detections.sort((a, b) => {
            const areaA = a.detection.box.width * a.detection.box.height;
            const areaB = b.detection.box.width * b.detection.box.height;
            return areaB - areaA;
          });

          const primaryFace = detections[0];
          if (primaryFace && primaryFace.expressions) {
            validFrameExpressions.push(primaryFace.expressions);
          }
        }
      } catch (err) {
        console.warn(`Frame ${i + 1} analysis warning:`, err);
      }

      if (i < frameCount - 1) {
        await new Promise(res => setTimeout(res, delayMs));
      }
    }

    // 4. Handle No Face Detected
    if (validFrameExpressions.length === 0) {
      return {
        status: 'NO_FACE',
        faceDetected: false,
        emotion: BRIGHTPATH_EMOTIONS.NEUTRAL,
        confidence: 0.0,
        timestamp: new Date().toISOString(),
        checkpoint: checkpoint,
        label: 'No face detected',
        message: 'No face detected — please position your face inside the camera frame.'
      };
    }

    // 5. Aggregate predictions across sampled frames
    const aggregatedExpressions = {
      happy: 0,
      sad: 0,
      neutral: 0,
      angry: 0,
      fearful: 0,
      disgusted: 0,
      surprised: 0
    };

    validFrameExpressions.forEach((exp) => {
      Object.keys(aggregatedExpressions).forEach((key) => {
        aggregatedExpressions[key] += (exp[key] || 0) / validFrameExpressions.length;
      });
    });

    // 6. Map to BrightPath 5 Emotions
    const mapped = mapToBrightPathEmotion(aggregatedExpressions);

    return {
      status: 'SUCCESS',
      faceDetected: true,
      emotion: mapped.emotion,
      confidence: mapped.confidence,
      timestamp: new Date().toISOString(),
      checkpoint: checkpoint,
      isDemo: false,
      label: `Real AI Expression Analysis (${validFrameExpressions.length}-frame aggregate)`
    };
  };

  try {
    return await withTimeout(runPipeline(), timeoutMs, `Facial analysis timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
  } catch (timeoutErr) {
    console.error("Facial expression analysis timeout:", timeoutErr);
    return {
      status: 'TIMEOUT',
      faceDetected: false,
      emotion: BRIGHTPATH_EMOTIONS.NEUTRAL,
      confidence: 0.0,
      timestamp: new Date().toISOString(),
      checkpoint: checkpoint,
      label: 'Analysis timed out',
      message: 'Facial analysis took too long. Please position yourself in front of the camera and click Retry.'
    };
  }
};
