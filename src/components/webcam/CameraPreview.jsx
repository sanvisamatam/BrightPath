import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, ShieldAlert, CheckCircle, Video, UserCheck, UserX, Loader2 } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { checkFacePresence, loadEmotionModel } from '../../services/emotionDetector';

export const CameraPreview = ({ onCameraReady, isAnalyzing }) => {
  const { cameraActive, setCameraActive, cameraStream, setCameraStream, stopCamera } = useSession();
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [permissionState, setPermissionState] = useState(cameraActive ? 'granted' : 'idle'); // 'idle' | 'prompting' | 'granted' | 'denied'
  const [errorMessage, setErrorMessage] = useState('');
  const [faceStatus, setFaceStatus] = useState({ detected: false, message: 'Camera starting...' });
  const [isModelLoading, setIsModelLoading] = useState(false);

  // Request browser camera access
  const requestCameraPermission = async () => {
    setPermissionState('prompting');
    setErrorMessage('');
    setIsModelLoading(true);

    try {
      // Start ML model load concurrently
      loadEmotionModel().then(() => setIsModelLoading(false)).catch(() => setIsModelLoading(false));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });

      setCameraStream(stream);
      setCameraActive(true);
      setPermissionState('granted');
    } catch (err) {
      console.warn("Camera permission denied or camera unavailable:", err);
      setPermissionState('denied');
      setCameraActive(false);
      setIsModelLoading(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser address bar and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No webcam device was found on this system. You can continue using Demo Mode.');
      } else {
        setErrorMessage('Could not connect to camera. Please verify your camera connection and try again.');
      }
    }
  };

  // Bind cameraStream to video element whenever cameraStream or permissionState changes
  useEffect(() => {
    if (permissionState === 'granted' && cameraStream && videoRef.current) {
      const videoEl = videoRef.current;
      videoEl.srcObject = cameraStream;
      
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Video play error:", err);
        });
      }

      if (onCameraReady) {
        onCameraReady(videoEl);
      }
    }
  }, [permissionState, cameraStream, onCameraReady]);

  // Periodic Face Presence Detection Check & Face Oval Overlay
  useEffect(() => {
    let checkInterval;
    let animId;

    if (permissionState === 'granted' && videoRef.current) {
      const videoEl = videoRef.current;
      const canvas = canvasRef.current;

      // Face presence loop
      const runPresenceCheck = async () => {
        if (videoEl && videoEl.readyState === 4) {
          const res = await checkFacePresence(videoEl);
          setFaceStatus(res);
        }
      };

      runPresenceCheck();
      checkInterval = setInterval(runPresenceCheck, 1500);

      // Smooth canvas guide overlay loop
      const drawOverlay = () => {
        if (canvas && videoEl && videoEl.readyState === 4) {
          const ctx = canvas.getContext('2d');
          canvas.width = videoEl.videoWidth || 400;
          canvas.height = videoEl.videoHeight || 300;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Subtle face guide oval
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radiusX = canvas.width * 0.22;
          const radiusY = canvas.height * 0.32;

          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
          ctx.strokeStyle = faceStatus.detected ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.6)';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 6]);
          ctx.stroke();

          // Scanning indicator line
          const time = Date.now() * 0.002;
          const scanY = centerY + Math.sin(time) * (radiusY - 10);
          ctx.beginPath();
          ctx.moveTo(centerX - radiusX + 15, scanY);
          ctx.lineTo(centerX + radiusX - 15, scanY);
          ctx.strokeStyle = faceStatus.detected ? 'rgba(16, 185, 129, 0.9)' : 'rgba(245, 158, 11, 0.7)';
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.stroke();
        }
        animId = requestAnimationFrame(drawOverlay);
      };

      drawOverlay();
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [permissionState, faceStatus.detected]);

  const handleStopCamera = () => {
    stopCamera();
    setPermissionState('idle');
    setFaceStatus({ detected: false, message: 'Camera turned off' });
  };

  return (
    <div className="glass-card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="flex-between mb-3">
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Camera size={20} color="var(--color-primary)" />
          <span>Facial Emotion Camera Feed</span>
        </h3>
        
        {permissionState === 'granted' && (
          <span className={`badge ${faceStatus.detected ? 'badge-happy' : 'badge-neutral'}`} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Video size={14} />
            {faceStatus.detected ? 'Camera Ready' : 'Camera Active'}
          </span>
        )}
      </div>

      {/* State 1: Idle - Privacy Info & Allow Camera Button */}
      {permissionState === 'idle' && (
        <div style={{ padding: '2rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1.5px dashed #cbd5e1' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Camera size={28} />
          </div>

          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Camera Access Required</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
            Camera access is used strictly for temporary client-side facial expression analysis during this session. 
            <strong style={{ color: '#0f172a' }}> No raw webcam images or video will be stored or uploaded to any server.</strong>
          </p>

          <button onClick={requestCameraPermission} className="btn btn-primary btn-lg">
            <CheckCircle size={20} />
            <span>Allow Camera</span>
          </button>
        </div>
      )}

      {/* State 2: Requesting Permission / Loading Model */}
      {permissionState === 'prompting' && (
        <div style={{ padding: '2.5rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
          <RefreshCw className="pulse-animation" size={32} color="var(--color-primary)" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ fontWeight: 600 }}>Requesting Camera Access & Loading AI Model...</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Please accept the browser camera prompt to continue.</p>
        </div>
      )}

      {/* State 3: Active Video Feed */}
      {permissionState === 'granted' && (
        <div>
          <div style={{ position: 'relative', width: '100%', maxWidth: '480px', height: '320px', margin: '0 auto', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
            <canvas
              ref={canvasRef}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            />

            {/* Overlaid Status Bar */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              right: '12px',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              fontSize: '0.8rem'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: faceStatus.detected ? '#10b981' : '#f59e0b',
                  flexShrink: 0
                }}></span>
                <span>{isAnalyzing ? 'Analyzing facial expression...' : faceStatus.message}</span>
              </span>

              <button
                onClick={handleStopCamera}
                style={{
                  background: 'rgba(239, 68, 68, 0.8)',
                  border: 'none',
                  color: '#fff',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginLeft: '0.5rem',
                  flexShrink: 0
                }}
              >
                Stop Camera
              </button>
            </div>
          </div>

          {/* Model status footer */}
          {isModelLoading && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Loader2 className="pulse-animation" size={14} />
              <span>Loading facial emotion recognition model...</span>
            </div>
          )}
        </div>
      )}

      {/* State 4: Permission Denied / Unavailable Error */}
      {permissionState === 'denied' && (
        <div style={{ padding: '2rem 1rem', background: '#fff1f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecdd3' }}>
          <ShieldAlert size={36} color="#e11d48" style={{ margin: '0 auto 0.75rem auto' }} />
          <h4 style={{ color: '#9f1239', marginBottom: '0.5rem' }}>Camera Unavailable</h4>
          <p style={{ fontSize: '0.875rem', color: '#be123c', maxWidth: '440px', margin: '0 auto 1.25rem auto' }}>
            {errorMessage}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={requestCameraPermission} className="btn btn-outline" style={{ borderColor: '#f43f5e', color: '#be123c' }}>
              <RefreshCw size={16} />
              <span>Retry Camera Permission</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraPreview;
