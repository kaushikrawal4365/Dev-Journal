import './Sidebar.css';
import type { Session } from '../types';
import { Badge } from './Badge';
import { useAuth } from '../hooks/useAuth';
import './Sidebar.css';

interface SidebarProps {
    activeSession: Session | null;
    onNavigate: (view: 'dashboard' | 'active' | 'history') => void;
    currentView: string;
}

export function Sidebar({ activeSession, onNavigate, currentView }: SidebarProps) {
    const { user, logout } = useAuth();

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">Dev Journal</h2>
                <p className="sidebar-subtitle">Think. Code. Learn.</p>
            </div>

            <nav className="sidebar-nav">
                <button
                    className={`nav-item ${currentView === 'dashboard' ? 'nav-item-active' : ''}`}
                    onClick={() => onNavigate('dashboard')}
                >
                    <span className="nav-icon">📊</span>
                    Dashboard
                </button>

                {activeSession && (
                    <button
                        className={`nav-item ${currentView === 'active' ? 'nav-item-active' : ''}`}
                        onClick={() => onNavigate('active')}
                    >
                        <span className="nav-icon">⚡</span>
                        Active Session
                        <Badge variant="success">Live</Badge>
                    </button>
                )}

                <button
                    className={`nav-item ${currentView === 'history' ? 'nav-item-active' : ''}`}
                    onClick={() => onNavigate('history')}
                >
                    <span className="nav-icon">📚</span>
                    History
                </button>
            </nav>

            {activeSession && (
                <div className="active-session-indicator">
                    <div className="indicator-dot"></div>
                    <div className="indicator-text">
                        <div className="indicator-title">Active Session</div>
                        <div className="indicator-project">{activeSession.projectId}</div>
                    </div>
                </div>
            )}

            <div className="sidebar-footer">
                {user ? (
                    <div className="user-profile">
                        <div className="user-info">
                            <span className="user-name">{user.displayName}</span>
                            <span className="user-email">{user.email}</span>
                        </div>
                        <button className="btn-logout" onClick={logout}>Sign Out</button>
                    </div>
                ) : (
                    <p className="footer-text">Local-first • No tracking</p>
                )}
            </div>
        </div>
    );
}
