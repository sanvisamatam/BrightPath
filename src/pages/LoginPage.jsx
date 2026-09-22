import React, { useState } from 'react';
import { LogIn, Lock, Mail, UserCheck, HeartHandshake, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      onNavigate('dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to log in. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    try {
      setLoading(true);
      await login(`${role.toLowerCase()}@brightminds.demo`, 'demopassword123');
      onNavigate('dashboard');
    } catch (e) {
      setError('Demo login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 0.75rem auto'
          }}>
            <HeartHandshake size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Log in to access your BrightMinds dashboard</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button type="submit" className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`} style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            <LogIn size={18} />
            <span>{loading ? 'Logging in...' : 'Log In'}</span>
          </button>
        </form>

        {/* Quick Demo Login Buttons */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>
            ⚡ QUICK DEMO LOGINS FOR COLLEGE PRESENTATION:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button onClick={() => handleQuickDemoLogin('Parent')} className="btn btn-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
              Parent Demo
            </button>
            <button onClick={() => handleQuickDemoLogin('Teacher')} className="btn btn-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
              Teacher Demo
            </button>
            <button onClick={() => handleQuickDemoLogin('Therapist')} className="btn btn-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
              Therapist Demo
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button onClick={() => onNavigate('signup')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
