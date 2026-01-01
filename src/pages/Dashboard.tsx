import React, { useState } from 'react';
import type { Session, SessionType, AppState } from '../types';
import { sessionService } from '../services/sessionService';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import './Dashboard.css';

interface DashboardProps {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    onStartSession: () => void;
    onViewSession: (sessionId: string) => void;
}

export function Dashboard({ state, onStartSession, onViewSession }: DashboardProps) {
    const [typeFilter, setTypeFilter] = useState<SessionType | 'all'>('all');

    const completedSessions = state.sessions.filter(s => s.status === 'completed');
    const filteredSessions = typeFilter === 'all'
        ? completedSessions
        : completedSessions.filter(s => s.type === typeFilter);

    // Computed signals
    const lastSession = completedSessions[completedSessions.length - 1];
    const last7Sessions = completedSessions.slice(-7);
    const avgConfidence = last7Sessions.length > 0
        ? (last7Sessions.reduce((sum, s) => sum + (s.retrospective?.confidence || 0), 0) / last7Sessions.length).toFixed(1)
        : 'N/A';

    const last10Sessions = completedSessions.slice(-10);
    const logTypes: Record<string, number> = {};
    last10Sessions.forEach(s => {
        s.logs.forEach(log => {
            logTypes[log.type] = (logTypes[log.type] || 0) + 1;
        });
    });
    const mostCommonLogType = Object.keys(logTypes).length > 0
        ? Object.entries(logTypes).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A';

    // Check for abandoned sessions on mount
    React.useEffect(() => {
        const abandoned = sessionService.detectAbandonedSessions(state.sessions);
        if (abandoned.length > 0 && !localStorage.getItem('abandoned_check_done')) {
            // For now, just log it - we'll handle the UI prompt in a future enhancement
            console.log('Detected abandoned sessions:', abandoned);
            localStorage.setItem('abandoned_check_done', 'true');
        }
    }, [state.sessions]);

    const getStatusBadgeVariant = (status: Session['status']) => {
        switch (status) {
            case 'completed': return 'success';
            case 'abandoned': return 'error';
            case 'active': return 'info';
            default: return 'default';
        }
    };

    const getOutcomeBadgeVariant = (outcome?: string) => {
        switch (outcome) {
            case 'completed': return 'success';
            case 'partially_completed': return 'warning';
            case 'blocked': return 'error';
            default: return 'default';
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="dashboard-subtitle">Track your coding sessions and progress</p>
                </div>
                <Button onClick={onStartSession} size="lg">
                    + Start New Session
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <Card className="stat-card">
                    <div className="stat-label">Total Sessions</div>
                    <div className="stat-value">{completedSessions.length}</div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-label">Last Outcome</div>
                    <div className="stat-value">
                        {lastSession?.retrospective?.outcome ? (
                            <Badge variant={getOutcomeBadgeVariant(lastSession.retrospective.outcome)}>
                                {lastSession.retrospective.outcome.replace('_', ' ')}
                            </Badge>
                        ) : 'N/A'}
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-label">Avg Confidence (Last 7)</div>
                    <div className="stat-value">{avgConfidence} / 5</div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-label">Common Log Type (Last 10)</div>
                    <div className="stat-value stat-log-type">{mostCommonLogType}</div>
                </Card>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <Button
                    variant={typeFilter === 'all' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setTypeFilter('all')}
                >
                    All
                </Button>
                {(['planning', 'implementation', 'debugging', 'exploration', 'learning'] as SessionType[]).map(type => (
                    <Button
                        key={type}
                        variant={typeFilter === type ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setTypeFilter(type)}
                    >
                        {type}
                    </Button>
                ))}
            </div>

            {/* Session List */}
            <div className="session-list">
                {filteredSessions.length === 0 ? (
                    <Card className="empty-state">
                        <p>No sessions yet. Start your first session to begin tracking your work!</p>
                    </Card>
                ) : (
                    filteredSessions.reverse().map(session => (
                        <Card key={session.id} onClick={() => onViewSession(session.id)}>
                            <div className="session-card">
                                <div className="session-card-header">
                                    <div>
                                        <h3>{session.projectId}</h3>
                                        <p className="session-goal">{session.intent?.goal}</p>
                                    </div>
                                    <div className="session-badges">
                                        <Badge>{session.type}</Badge>
                                        <Badge variant={getStatusBadgeVariant(session.status)}>
                                            {session.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="session-card-footer">
                                    <span className="session-date">
                                        {new Date(session.createdAt).toLocaleDateString()}
                                    </span>
                                    {session.retrospective && (
                                        <>
                                            <span className="session-confidence">
                                                Confidence: {session.retrospective.confidence}/5
                                            </span>
                                            <span className="session-difficulty">
                                                Difficulty: {session.retrospective.actualDifficulty}/5
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
