import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import KeyboardAlertToast from './components/common/KeyboardAlertToast';
import CartoonNatureBackground from './components/common/CartoonNatureBackground';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import StartSessionPage from './pages/StartSessionPage';
import GamePlayPage from './pages/GamePlayPage';
import SessionResultsPage from './pages/SessionResultsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';

const AppContent = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('landing');
  const [activeSessionResult, setActiveSessionResult] = useState(null);
  const [selectedReportSession, setSelectedReportSession] = useState(null);

  // Auto route to dashboard if logged in and on landing/login page
  const handleNavigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
  };

  const handleStartGame = (gameId) => {
    setActiveTab('game-play');
    window.scrollTo(0, 0);
  };

  const handleGameFinished = (savedSession) => {
    setActiveSessionResult(savedSession);
    setActiveTab('session-results');
    window.scrollTo(0, 0);
  };

  const handleSelectReportSession = (session) => {
    setSelectedReportSession(session);
    setActiveTab('reports');
    window.scrollTo(0, 0);
  };

  return (
    <div className="app-container">
      <CartoonNatureBackground />
      <Navbar activeTab={activeTab} setActiveTab={handleNavigate} />

      <main className="main-content">
        {/* Unauthenticated / Public Routes */}
        {!currentUser && activeTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {!currentUser && activeTab === 'login' && <LoginPage onNavigate={handleNavigate} />}
        {!currentUser && activeTab === 'signup' && <SignupPage onNavigate={handleNavigate} />}

        {/* Authenticated / Application Flow Routes */}
        {currentUser && activeTab === 'landing' && <DashboardPage onNavigate={handleNavigate} onSelectSession={handleSelectReportSession} />}
        {currentUser && activeTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} onSelectSession={handleSelectReportSession} />}
        {currentUser && activeTab === 'start-session' && <StartSessionPage onStartGame={handleStartGame} />}
        {currentUser && activeTab === 'game-play' && (
          <GamePlayPage
            onGameFinished={handleGameFinished}
            onCancelSession={() => handleNavigate('dashboard')}
          />
        )}
        {currentUser && activeTab === 'session-results' && (
          <SessionResultsPage
            session={activeSessionResult}
            onViewReports={() => handleNavigate('reports')}
            onStartNew={() => handleNavigate('start-session')}
          />
        )}
        {currentUser && activeTab === 'reports' && (
          <ReportsPage
            onSelectSession={handleSelectReportSession}
            selectedSession={selectedReportSession}
            onClearSelectedSession={() => setSelectedReportSession(null)}
          />
        )}
        {currentUser && activeTab === 'profile' && <ProfilePage />}
      </main>

      <KeyboardAlertToast />
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;
