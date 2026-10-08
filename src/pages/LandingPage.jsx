import React from 'react';
import { HeartHandshake, ShieldCheck, Sparkles, Brain, Flower2, Zap, Compass, Puzzle, Users, ArrowRight, Play, Star, Smile, Sparkle } from 'lucide-react';
import { 
  PipOwl, 
  SunnyStar, 
  BarnabyBear, 
  HoppyBunny, 
  RainbowClouds, 
  TrophyMascot,
  MiloMouse,
  MayaExplorer,
  PennyPig,
  CleoCat,
  CuteFlower,
  CuteSun,
  CuteBalloons
} from '../components/common/CuteIllustrations';

export const LandingPage = ({ onNavigate }) => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* 1. Welcoming Hero Section: "Welcome! Let's Learn & Play!" */}
      <section className="glass-card" style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(238, 242, 255, 0.95) 50%, rgba(240, 253, 244, 0.96) 100%)',
        border: '3px solid rgba(199, 210, 254, 0.9)',
        borderRadius: '32px',
        boxShadow: '0 20px 35px -5px rgba(79, 70, 229, 0.12), 0 10px 18px -4px rgba(16, 185, 129, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating Background Balloons & Rainbow */}
        <div style={{ position: 'absolute', top: '15px', right: '25px', opacity: 0.85, pointerEvents: 'none' }} className="float-slow">
          <CuteBalloons size={72} />
        </div>
        <div style={{ position: 'absolute', top: '15px', left: '25px', opacity: 0.85, pointerEvents: 'none' }} className="mascot-bounce">
          <CuteSun size={64} />
        </div>

        {/* Friendly Welcoming Mascots Greeting the Child */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div title="Maya the Explorer" className="mascot-wave">
            <MayaExplorer size={84} animate={true} />
          </div>
          <div title="Milo the Explorer Mouse" className="mascot-bounce">
            <MiloMouse size={78} animate={true} />
          </div>
          <RainbowClouds width={135} height={68} />
          <div title="Pip the Wise Owl" className="mascot-bounce">
            <PipOwl size={74} animate={true} />
          </div>
          <div title="Penny the Piggy" className="mascot-sway">
            <PennyPig size={72} animate={true} />
          </div>
          <div title="Cleo the Kitten" className="mascot-bounce">
            <CleoCat size={72} animate={true} />
          </div>
        </div>

        {/* Cheerful Adventure Badge */}
        <div className="badge badge-neutral" style={{
          marginBottom: '1.25rem',
          padding: '0.5rem 1.4rem',
          fontSize: '1rem',
          background: 'linear-gradient(135deg, #e0e7ff 0%, #d1fae5 100%)',
          color: '#3730a3',
          border: '2px solid #c7d2fe',
          borderRadius: '9999px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 700
        }}>
          <Sparkles size={18} color="#4f46e5" />
          <span>Welcome! Let's Learn & Play! 🌈✨</span>
        </div>

        {/* Primary Children's Adventure Headline */}
        <h1 style={{
          fontSize: '2.95rem',
          color: '#0f172a',
          maxWidth: '860px',
          margin: '0 auto 1.25rem auto',
          lineHeight: 1.22,
          fontWeight: 700
        }}>
          A Fun, Emotion-Guided Learning Adventure for Every Child! 🌟
        </h1>

        <p style={{
          fontSize: '1.18rem',
          color: '#334155',
          maxWidth: '700px',
          margin: '0 auto 2.25rem auto',
          lineHeight: 1.6,
          fontWeight: 500
        }}>
          BrightPath gently recognizes your child's feelings to match them with cheerful, calming, or brain-boosting mini-games — turning every expression into a joyful learning moment!
        </p>

        {/* Large, Colorful, Rounded Child-Friendly Buttons */}
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('signup')}
            className="btn btn-primary btn-lg"
            style={{
              padding: '1.15rem 2.5rem',
              fontSize: '1.2rem',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 8px 0 #3730a3, 0 14px 24px rgba(79, 70, 229, 0.35)'
            }}
          >
            <span>Start Free Adventure 🚀</span>
            <ArrowRight size={22} />
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="btn btn-outline btn-lg"
            style={{
              padding: '1.15rem 2.2rem',
              fontSize: '1.15rem',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <Compass size={22} color="var(--color-primary)" />
            <span>Log In to Dashboard 📊</span>
          </button>
        </div>

        {/* Roles Pill Bar */}
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2.5rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={18} color="var(--color-primary)" /> Designed for Parents & Families
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Star size={18} color="var(--color-secondary)" /> Loved by Kids & Teachers
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={18} color="#8b5cf6" /> Trusted by Therapists
          </span>
        </div>
      </section>

      {/* 2. How It Works: 4 Child-Friendly Adventure Steps */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#4f46e5', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
            <Sparkles size={16} /> 4 Simple Steps
          </div>
          <h2 style={{ fontSize: '2.1rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            How Your Learning Journey Works 🎈
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '580px', margin: '0 auto' }}>
            A gentle, playful workflow tailored for comfort, smiles, and developmental progress
          </p>
        </div>

        <div className="grid-4">
          <div className="glass-card" style={{ textAlign: 'center', borderRadius: '24px', padding: '1.75rem 1.25rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 700, fontSize: '1.4rem', border: '2px solid #c7d2fe' }}>
              1
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
              <SunnyStar size={44} animate={true} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Smile & Check In</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              A quick, gentle webcam check recognizes facial expressions: Happy, Calm, Sad, Angry, or Frustrated.
            </p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', borderRadius: '24px', padding: '1.75rem 1.25rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 700, fontSize: '1.4rem', border: '2px solid #99f6e4' }}>
              2
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
              <MiloMouse size={46} animate={true} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Game Matching</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              BrightPath instantly suggests the perfect educational game best suited to your child's mood and age group.
            </p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', borderRadius: '24px', padding: '1.75rem 1.25rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 700, fontSize: '1.4rem', border: '2px solid #ddd6fe' }}>
              3
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
              <PipOwl size={46} animate={true} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Mid-Game Check</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              At 10 seconds into gameplay, a quiet checkpoint checks engagement without interrupting fun!
            </p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', borderRadius: '24px', padding: '1.75rem 1.25rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 700, fontSize: '1.4rem', border: '2px solid #a7f3d0' }}>
              4
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
              <TrophyMascot size={46} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Praise & Graphs</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Hear encouraging voice cheers and view colorful progress graphs of scores and emotional shifts.
            </p>
          </div>
        </div>
      </section>

      {/* 3. The 5 Emotion-Guided Educational Games Showcase */}
      <section className="glass-card" style={{ padding: '2.5rem 2rem', borderRadius: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.1rem', marginBottom: '0.5rem', color: '#0f172a' }}>
            5 Tailored Educational Games 🎮
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Specially designed activities that turn feelings into fun learning opportunities
          </p>
        </div>

        <div className="grid-3">
          <div style={{ background: '#ecfdf5', padding: '1.5rem', borderRadius: '24px', border: '2px solid #a7f3d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>⭐</span> Happy → Memory Quest
              </div>
              <HoppyBunny size={36} animate={false} />
            </div>
            <p style={{ fontSize: '0.9rem', color: '#065f46', lineHeight: 1.5 }}>
              Match colorful pairs of stars, gems, and rockets to channel high positive energy into memory focus.
            </p>
          </div>

          <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '24px', border: '2px solid #bfdbfe' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1d4ed8', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>🌸</span> Sad → Color Garden
              </div>
              <CuteFlower size={36} />
            </div>
            <p style={{ fontSize: '0.9rem', color: '#1e40af', lineHeight: 1.5 }}>
              Follow soothing color patterns where every correct answer blooms bright flowers in a virtual garden.
            </p>
          </div>

          <div style={{ background: '#f5f3ff', padding: '1.5rem', borderRadius: '24px', border: '2px solid #ddd6fe' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6d28d9', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>⚡</span> Neutral → Brain Rush
              </div>
              <PipOwl size={36} animate={false} />
            </div>
            <p style={{ fontSize: '0.9rem', color: '#5b21b6', lineHeight: 1.5 }}>
              Quick number sequences and pattern recognition challenges for active cognitive agility.
            </p>
          </div>

          <div style={{ background: '#ffedd5', padding: '1.5rem', borderRadius: '24px', border: '2px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c2410c', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>🌀</span> Angry → Calm Maze
              </div>
              <BarnabyBear size={36} animate={false} />
            </div>
            <p style={{ fontSize: '0.9rem', color: '#9a3412', lineHeight: 1.5 }}>
              Slow, mindful maze navigation with calming breathing stops to help self-regulate and relax.
            </p>
          </div>

          <div style={{ background: '#fdf2f8', padding: '1.5rem', borderRadius: '24px', border: '2px solid #fbcfe8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#be185d', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>🧩</span> Frustrated → Step Puzzle
              </div>
              <MiloMouse size={36} animate={false} />
            </div>
            <p style={{ fontSize: '0.9rem', color: '#9d174d', lineHeight: 1.5 }}>
              Gentle step-by-step challenges that break big tasks into small, rewarding wins with helpful hints.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '24px', border: '2px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
            <ShieldCheck size={36} color="var(--color-primary)" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.3rem 0' }}>100% Private & Safe 🔒</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              All webcam processing runs privately in your browser. No video frames or faces are ever uploaded.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
