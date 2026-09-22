import React from 'react';
import { HeartHandshake, ShieldCheck, Sparkles, Brain, Flower2, Zap, Compass, Puzzle, Users, ArrowRight } from 'lucide-react';

export const LandingPage = ({ onNavigate }) => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      {/* Hero Section */}
      <section className="glass-card" style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(238,242,255,0.9) 100%)',
        border: '1px solid rgba(79, 70, 229, 0.15)',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <div className="badge badge-neutral" style={{ marginBottom: '1.25rem', padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
          <Sparkles size={16} /> Emotion-Aware Learning for Children (Ages 7–18)
        </div>

        <h1 style={{ fontSize: '2.75rem', color: '#0f172a', maxWidth: '820px', margin: '0 auto 1.25rem auto' }}>
          Supporting ASD Children Through Emotion-Guided Educational Play
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          BrightMinds combines gentle webcam expression recognition with engaging educational games to match activities to your child's emotional state while providing clear progress insights for caregivers.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('signup')} className="btn btn-primary btn-lg">
            <span>Get Started Free</span>
            <ArrowRight size={20} />
          </button>
          <button onClick={() => onNavigate('login')} className="btn btn-outline btn-lg">
            <span>Log In to Dashboard</span>
          </button>
        </div>

        {/* Roles Pill Bar */}
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2.5rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={18} color="var(--color-primary)" /> Designed for Parents
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={18} color="var(--color-secondary)" /> Teachers
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={18} color="#8b5cf6" /> Therapists
          </span>
        </div>
      </section>

      {/* How It Works Flow */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '0.5rem' }}>How BrightMinds Works</h2>
          <p style={{ color: 'var(--text-muted)' }}>A thoughtful, 4-step workflow tailored for comfort and progress</p>
        </div>

        <div className="grid-4">
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 700, fontSize: '1.2rem' }}>
              1
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Facial Expression</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Webcam analyzes gentle facial indicators for Happy, Sad, Neutral, Angry, or Frustrated states.
            </p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 700, fontSize: '1.2rem' }}>
              2
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Game Matching</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Automatically recommends 1 of 5 tailored educational games best suited to the child's current mood.
            </p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 700, fontSize: '1.2rem' }}>
              3
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Periodic Monitor</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Periodically checks emotional trends during gameplay without frame-by-frame intrusion.
            </p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 700, fontSize: '1.2rem' }}>
              4
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Caregiver Report</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Generates clean progress reports showing score, accuracy, response time, and emotional timeline.
            </p>
          </div>
        </div>
      </section>

      {/* The 5 Educational Games Showcase */}
      <section className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>5 Emotion-Guided Educational Games</h2>
          <p style={{ color: 'var(--text-muted)' }}>Designed with clean graphics suitable for both younger children and teenagers</p>
        </div>

        <div className="grid-3">
          <div style={{ background: '#ecfdf5', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Brain size={20} /> Happy → Memory Quest
            </div>
            <p style={{ fontSize: '0.85rem', color: '#065f46' }}>
              Card matching puzzle with multi-difficulty deck levels to maintain focused positive energy.
            </p>
          </div>

          <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1d4ed8', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Flower2 size={20} /> Sad → Color Garden
            </div>
            <p style={{ fontSize: '0.85rem', color: '#1e40af' }}>
              Pattern sequence challenge where every correct answer blooms a beautiful virtual garden.
            </p>
          </div>

          <div style={{ background: '#f5f3ff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #ddd6fe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6d28d9', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Zap size={20} /> Neutral → Brain Rush
            </div>
            <p style={{ fontSize: '0.85rem', color: '#5b21b6' }}>
              Number sequences, shape logic, and cognitive mini-challenges for active mental agility.
            </p>
          </div>

          <div style={{ background: '#fff7ed', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #ffedd5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c2410c', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Compass size={20} /> Angry → Calm Maze
            </div>
            <p style={{ fontSize: '0.85rem', color: '#9a3412' }}>
              Soothing maze navigation with mindful breathing checkpoints and unhurried pacing.
            </p>
          </div>

          <div style={{ background: '#fdf2f8', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #fbcfe8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#be185d', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Puzzle size={20} /> Frustrated → Step-by-Step Puzzle
            </div>
            <p style={{ fontSize: '0.85rem', color: '#9d174d' }}>
              Progressive multi-stage challenge breaking big tasks into achievable steps with optional hints.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
            <ShieldCheck size={28} color="var(--color-primary)" style={{ margin: '0 auto 0.4rem auto' }} />
            <h4 style={{ fontSize: '0.95rem' }}>Privacy & Security First</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No raw webcam video stored. All processing runs safely in browser.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
