import React, { useState } from 'react';
import { Sparkles, LayoutDashboard, PlayCircle, BarChart3, User, LogOut, Menu, X, HeartHandshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CameraStatusBadge from './CameraStatusBadge';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { currentUser, userProfile, logout, activeChild, childrenList, setActiveChild } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Teacher': return { bg: '#e0f2fe', color: '#0369a1' };
      case 'Therapist': return { bg: '#f3e8ff', color: '#6b21a8' };
      default: return { bg: '#e0e7ff', color: '#3730a3' }; // Parent
    }
  };

  const roleStyle = getRoleColor(userProfile?.role);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button 
            onClick={() => handleNavClick('dashboard')} 
            className="brand-logo"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <HeartHandshake size={22} />
            </div>
            <span>BrightMinds</span>
          </button>

          {/* Active Child & Mode Pill */}
          {currentUser && activeChild && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              background: activeChild.mode === 'early' ? '#dbeafe' : '#f3e8ff',
              border: `1px solid ${activeChild.mode === 'early' ? '#bfdbfe' : '#ddd6fe'}`,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: activeChild.mode === 'early' ? '#1e40af' : '#6b21a8'
            }}>
              <span>👶 {activeChild.name} ({activeChild.age}y)</span>
              <span style={{ opacity: 0.7 }}>• {activeChild.mode === 'early' ? 'Early Mode' : 'BrightPath Mode'}</span>
            </div>
          )}

          {userProfile?.role && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: roleStyle.bg,
              color: roleStyle.color,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {userProfile.role}
            </span>
          )}
        </div>

        {/* Desktop Navigation */}
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <CameraStatusBadge />
            
            <ul className="nav-links" style={{ display: 'flex' }}>
              <li>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('start-session')}
                  className={`nav-link ${activeTab === 'start-session' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <PlayCircle size={18} />
                  <span>Start Session</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('reports')}
                  className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <BarChart3 size={18} />
                  <span>Reports</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('profile')}
                  className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <User size={18} />
                  <span>Profile</span>
                </button>
              </li>
            </ul>

            <button
              onClick={logout}
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}

        {!currentUser && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => handleNavClick('login')} className="btn btn-outline">
              Log In
            </button>
            <button onClick={() => handleNavClick('signup')} className="btn btn-primary">
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
