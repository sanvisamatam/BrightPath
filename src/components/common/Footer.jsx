import React from 'react';
import { ShieldCheck, Heart, Info } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid var(--border-card)',
      padding: '2rem 1.5rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        fontSize: '0.875rem',
        color: 'var(--text-muted)'
      }}>
        {/* Brand & Purpose */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            <Heart size={18} />
            <span>BrightMinds</span>
          </div>
          <p style={{ lineHeight: 1.5 }}>
            An emotion-aware educational game and progress monitoring platform designed for children with Autism Spectrum Disorder (ages 7–18).
          </p>
        </div>

        {/* Safety & Non-Medical Notice */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            <Info size={16} />
            <span>Educational Support Tool</span>
          </div>
          <p style={{ lineHeight: 1.5, fontSize: '0.825rem' }}>
            BrightMinds is NOT a medical diagnostic or treatment system. It does not diagnose autism or clinical emotions, nor treat medical conditions. Its sole purpose is to provide engaging educational games and help caregivers understand observed trends.
          </p>
        </div>

        {/* Privacy Notice */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            <ShieldCheck size={16} />
            <span>Webcam Privacy</span>
          </div>
          <p style={{ lineHeight: 1.5, fontSize: '0.825rem' }}>
            Webcam access is strictly requested for real-time facial expression analysis. No raw video feed or video frames are ever recorded or stored permanently.
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: '1240px',
        margin: '1.5rem auto 0 auto',
        paddingTop: '1rem',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#94a3b8'
      }}>
        © {new Date().getFullYear()} BrightMinds Educational Platform. Built with care and inclusion.
      </div>
    </footer>
  );
};

export default Footer;
