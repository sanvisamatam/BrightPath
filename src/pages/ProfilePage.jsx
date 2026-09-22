import React, { useState } from 'react';
import { User, Mail, ShieldCheck, Database, CheckCircle2, UserPlus, Sparkles, Check, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebase';
import { validateChildAge } from '../services/sessionStorage';

export const ProfilePage = () => {
  const { userProfile, currentUser, logout, childrenList, activeChild, setActiveChild, addChildProfile, updateChild } = useAuth();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit child modal/state
  const [editingChildId, setEditingChildId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');

  const handleAddChild = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const validation = validateChildAge(age);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      setLoading(true);
      await addChildProfile(name, validation.age);
      setName('');
      setAge('');
      setSuccessMsg(`Child profile for "${name}" created successfully! Mode set to ${validation.age <= 6 ? 'Early Foundational (Ages 3–6)' : 'BrightPath Interactive (Ages 7–17)'}.`);
    } catch (err) {
      setError(err.message || 'Failed to save child profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (child) => {
    setEditingChildId(child.childId);
    setEditName(child.name);
    setEditAge(String(child.age));
    setError('');
  };

  const handleSaveEdit = async (childId) => {
    setError('');
    const validation = validateChildAge(editAge);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      await updateChild(childId, { name: editName, age: validation.age });
      setEditingChildId(null);
      setSuccessMsg(`Updated ${editName}'s profile (Age ${validation.age}).`);
    } catch (err) {
      setError(err.message || 'Failed to update child profile.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Caregiver Account Overview */}
      <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <User size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#0f172a' }}>{userProfile?.name || 'User Profile'}</h2>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.25rem 0.8rem', borderRadius: '9999px', background: '#e0e7ff', color: '#3730a3', marginTop: '0.4rem', display: 'inline-block' }}>
            Caregiver Role: {userProfile?.role || 'Parent'}
          </span>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Mail size={20} color="var(--text-muted)" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>EMAIL ADDRESS</span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{userProfile?.email || currentUser?.email || 'N/A'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database size={20} color="var(--text-muted)" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>DATABASE CONNECTION</span>
              <strong style={{ fontSize: '0.95rem', color: isFirebaseConfigured ? '#059669' : '#d97706', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={16} />
                {isFirebaseConfigured ? 'Firebase Cloud Firestore Connected' : 'Local Storage Session Mirror Active'}
              </strong>
            </div>
          </div>
        </div>

        <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#15803d' }}>
            <ShieldCheck size={18} /> Privacy Protection Verified
          </strong>
          Camera feeds are processed strictly in browser memory. No raw video files or video frames are stored on servers or database collections.
        </div>

        <button onClick={logout} className="btn btn-outline" style={{ width: '100%', borderColor: '#f43f5e', color: '#be123c' }}>
          Log Out of BrightMinds
        </button>
      </div>

      {/* Child Profiles Management Card */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <Sparkles size={22} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 700, margin: 0 }}>
            Child Profiles & Activity Mode
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          The child's chronological age determines their automatic activity mode: <strong>Ages 3–6</strong> receive the 5 Early Foundational Activities, and <strong>Ages 7–17</strong> receive the BrightPath Interactive Games suite.
        </p>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {successMsg}
          </div>
        )}

        {/* Existing Child Profiles List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            REGISTERED CHILDREN ({childrenList.length})
          </span>

          {childrenList.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1.5px dashed #cbd5e1', color: 'var(--text-muted)' }}>
              No child profiles registered yet. Add a profile below to get started.
            </div>
          ) : (
            childrenList.map((child) => {
              const isActive = activeChild?.childId === child.childId;
              const isEditing = editingChildId === child.childId;

              return (
                <div
                  key={child.childId}
                  style={{
                    background: isActive ? '#f0fdf4' : '#ffffff',
                    border: isActive ? '2px solid #86efac' : '1px solid #cbd5e1',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: child.age <= 6 ? '#dbeafe' : '#f3e8ff',
                      color: child.age <= 6 ? '#1d4ed8' : '#7c3aed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem'
                    }}>
                      {child.name.charAt(0).toUpperCase()}
                    </div>

                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{ width: '130px', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                        />
                        <input
                          type="number"
                          min="3"
                          max="17"
                          className="form-input"
                          value={editAge}
                          onChange={(e) => setEditAge(e.target.value)}
                          style={{ width: '70px', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(child.childId)}
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingChildId(null)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>{child.name}</h4>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>• Age {child.age}</span>
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          background: child.age <= 6 ? '#dbeafe' : '#f3e8ff',
                          color: child.age <= 6 ? '#1d4ed8' : '#6b21a8',
                          display: 'inline-block',
                          marginTop: '4px'
                        }}>
                          {child.age <= 6 ? 'Early Mode (Ages 3–6)' : 'BrightPath Mode (Ages 7–17)'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(child)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                        title="Edit age"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}

                    {isActive ? (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#16a34a',
                        background: '#dcfce7',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '9999px'
                      }}>
                        <Check size={14} /> Active Child
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveChild(child)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Set as Active
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add New Child Form */}
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <UserPlus size={18} color="var(--color-primary)" />
            <span>Add a Child Profile</span>
          </h4>

          <form onSubmit={handleAddChild}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Child Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Maya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Age (3–17)</label>
                <input
                  type="number"
                  min="3"
                  max="17"
                  className="form-input"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Live Mode Preview */}
            {age && (
              <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                Mode Preview: {parseInt(age, 10) >= 3 && parseInt(age, 10) <= 6 ? (
                  <strong style={{ color: '#1d4ed8' }}>Early/Foundational Activity Mode (Bubble Pop, Grow the Garden, Balloon Smash, etc.)</strong>
                ) : parseInt(age, 10) >= 7 && parseInt(age, 10) <= 17 ? (
                  <strong style={{ color: '#7c3aed' }}>BrightPath Mode (Memory Quest, Color Garden, Brain Rush, etc.)</strong>
                ) : (
                  <span style={{ color: '#dc2626' }}>Invalid age: Please enter between 3 and 17.</span>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              <UserPlus size={18} />
              <span>{loading ? 'Saving Profile...' : 'Save Child Profile'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
