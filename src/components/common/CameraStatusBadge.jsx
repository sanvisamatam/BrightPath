import React from 'react';
import { Camera, CameraOff, Video } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

export const CameraStatusBadge = () => {
  const { cameraActive, stopCamera } = useSession();

  if (!cameraActive) {
    return (
      <div className="badge" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}>
        <CameraOff size={14} />
        <span>Camera: OFF</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <div className="badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
        <span className="pulse-animation" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
        <Video size={14} />
        <span>Camera: ON</span>
      </div>
      <button 
        onClick={stopCamera}
        className="btn btn-outline"
        style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '9999px' }}
        title="Stop Camera Feed"
      >
        Stop Camera
      </button>
    </div>
  );
};

export default CameraStatusBadge;
