import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { storageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ActiveSession } from './pages/ActiveSession';
import { SessionDetail } from './pages/SessionDetail';
import './App.css';

type View = 'dashboard' | 'active' | 'history' | 'session-detail';

function App() {
  const [state, setState] = useAppState();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const activeSession = storageService.getActiveSession(state);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  const handleStartSession = () => {
    setCurrentView('active');
  };

  const handleViewSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentView('session-detail');
  };

  const handleSessionComplete = () => {
    setCurrentView('dashboard');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedSessionId(null);
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeSession={activeSession}
        onNavigate={handleNavigate}
        currentView={currentView}
      />

      <main className="main-content">
        {currentView === 'dashboard' && (
          <Dashboard
            state={state}
            setState={setState}
            onStartSession={handleStartSession}
            onViewSession={handleViewSession}
          />
        )}

        {currentView === 'active' && (
          <ActiveSession
            state={state}
            setState={setState}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {currentView === 'history' && (
          <Dashboard
            state={state}
            setState={setState}
            onStartSession={handleStartSession}
            onViewSession={handleViewSession}
          />
        )}

        {currentView === 'session-detail' && selectedSessionId && (
          <SessionDetail
            sessionId={selectedSessionId}
            state={state}
            setState={setState}
            onBack={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
}

export default App;
