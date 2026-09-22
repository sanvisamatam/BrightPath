import React, { useState } from 'react';
import { UserPlus, User, Mail, Lock, ShieldCheck, HeartHandshake, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateChildAge } from '../services/sessionStorage';

export const SignupPage = ({ onNavigate }) => {
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Parent'); // 'Parent' | 'Teacher' | 'Therapist'

  // Optional child setup right on signup
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required account fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    let childInfo = null;
    if (childName || childAge) {
      if (!childName || !childAge) {
        setError('Please provide both child name and age, or set it up later in your profile.');
        return;
      }
      const validation = validateChildAge(childAge);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      childInfo = { name: childName.trim(), age: validation.age };
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, name, role, childInfo);
      onNavigate('dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to create account. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '520px', margin: '2rem auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
          <h2 style={{ fontSize: '1.75rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join BrightMinds to monitor progress and game sessions</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Caregiver Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <User size={18} color="var(--text-light)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="caregiver@example.com"
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Your Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {['Parent', 'Teacher', 'Therapist'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`btn ${role === r ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.6rem 0.5rem', fontSize: '0.85rem' }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Initial Child Profile Info */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', margin: '1rem 0' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
              <Sparkles size={14} /> CHILD PROFILE (OPTIONAL)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '0.65rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Child's Name (e.g. Leo)"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
              <input
                type="number"
                min="3"
                max="17"
                className="form-input"
                placeholder="Age (3–17)"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Age determines Early Mode (3–6) or BrightPath Mode (7–17).
            </span>
          </div>

          <button type="submit" className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`} style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            <UserPlus size={18} />
            <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
