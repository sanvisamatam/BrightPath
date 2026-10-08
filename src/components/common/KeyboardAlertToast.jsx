import React, { useState, useEffect } from 'react';
import { Bell, Volume2, Sparkles, X, HeartHandshake, ShieldAlert } from 'lucide-react';
import keyboardAlertService from '../../utils/keyboardAlert';
import rapidKeyAlarmService from '../../utils/rapidKeyAlarm';

export const KeyboardAlertToast = () => {
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    // Initialize both keyboard monitoring services
    keyboardAlertService.init();
    rapidKeyAlarmService.init();

    // 1. Subscribe to simultaneous key combination alert (B + P)
    const unsubCombo = keyboardAlertService.subscribe((data) => {
      setAlertInfo({
        id: Date.now(),
        type: 'combo',
        title: 'Keyboard Alert Activated! 🔔',
        message: `Keys detected: ${data.matchedCombo ? data.matchedCombo.map(k => k.toUpperCase()).join(' + ') : 'Required Keys'}. Melodic chime played.`
      });
    });

    // 2. Subscribe to rapid key press alarm (fast mashing)
    const unsubRapid = rapidKeyAlarmService.subscribe((data) => {
      setAlertInfo({
        id: Date.now(),
        type: 'rapid',
        title: data.message || 'Whoa! Slow down! 😊',
        message: data.subMessage || "Let's take a little break! 🌟"
      });
    });

    return () => {
      unsubCombo();
      unsubRapid();
      keyboardAlertService.destroy();
      rapidKeyAlarmService.destroy();
    };
  }, []);

  // Auto-dismiss after 3.5 seconds
  useEffect(() => {
    if (!alertInfo) return;
    const timer = setTimeout(() => {
      setAlertInfo(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [alertInfo]);

  if (!alertInfo) return null;

  const isRapid = alertInfo.type === 'rapid';

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        background: isRapid 
          ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
          : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: '#ffffff',
        borderRadius: '24px',
        padding: '1.1rem 1.4rem',
        boxShadow: isRapid 
          ? '0 14px 30px -4px rgba(234, 88, 12, 0.45)'
          : '0 14px 30px -4px rgba(79, 70, 229, 0.45)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        animation: 'slideUpBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        border: '2px solid rgba(255, 255, 255, 0.35)',
        maxWidth: '400px'
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {isRapid ? (
          <Sparkles size={26} className="mascot-bounce" />
        ) : (
          <Bell size={26} className="mascot-bounce" />
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '1.05rem' }}>
          <span>{alertInfo.title}</span>
          <Volume2 size={16} />
        </div>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.95, lineHeight: 1.4 }}>
          {alertInfo.message}
        </p>
      </div>

      <button
        onClick={() => setAlertInfo(null)}
        style={{
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          padding: '6px',
          opacity: 0.85,
          borderRadius: '8px'
        }}
        aria-label="Dismiss alert"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default KeyboardAlertToast;
