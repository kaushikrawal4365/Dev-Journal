import React, { useState } from 'react';
import type { Session, SessionType, SessionIntent, SessionRetrospective, LogType, ParkingItem, AppState } from '../types';
import { sessionService } from '../services/sessionService';
import { storageService } from '../services/storageService';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { LoginModal } from '../components/LoginModal';
import './ActiveSession.css';

interface ActiveSessionProps {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    onSessionComplete: () => void;
}

export function ActiveSession({ state, setState, onSessionComplete }: ActiveSessionProps) {
    const activeSession = storageService.getActiveSession(state);

    if (!activeSession) {
        return <NewSessionForm state={state} setState={setState} />;
    }

    if (activeSession.status === 'intent') {
        return (
            <IntentLockForm
                session={activeSession}
                state={state}
                setState={setState}
            />
        );
    }

    if (activeSession.status === 'active') {
        return (
            <LiveSession
                session={activeSession}
                state={state}
                setState={setState}
            />
        );
    }

    if (activeSession.status === 'reviewing') {
        return (
            <RetrospectiveForm
                session={activeSession}
                state={state}
                setState={setState}
                onComplete={onSessionComplete}
            />
        );
    }

    return null;
}

// New Session Form
function NewSessionForm({ state, setState }: {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
    const [projectId, setProjectId] = useState('');
    const [type, setType] = useState<SessionType>('implementation');
    const { user } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    // If we are showing the login modal, render it
    if (showLogin) {
        return <LoginModal onDismiss={() => setShowLogin(false)} />;
    }

    const handleStart = () => {
        if (!projectId.trim()) return;

        if (!user) {
            setShowLogin(true);
            return;
        }

        const newSession = sessionService.createSession(projectId, type);
        const newState = storageService.addSession(state, newSession);
        const finalState = storageService.setActiveSession(newState, newSession.id);
        setState(finalState);
    };

    return (
        <div className="active-session">
            <h1>Start New Session</h1>
            <Card className="form-card">
                <Input
                    label="Project Name"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="e.g., DevJournal, API Server, Bug Fix #123"
                />

                <div className="input-wrapper">
                    <label className="input-label">Session Type</label>
                    <div className="type-selector">
                        {(['planning', 'implementation', 'debugging', 'exploration', 'learning'] as SessionType[]).map(t => (
                            <Button
                                key={t}
                                variant={type === t ? 'primary' : 'secondary'}
                                onClick={() => setType(t)}
                            >
                                {t}
                            </Button>
                        ))}
                    </div>
                </div>

                <Button onClick={handleStart} disabled={!projectId.trim()} size="lg">
                    Continue
                </Button>
            </Card>
        </div>
    );
}

// Intent Lock Form
function IntentLockForm({
    session,
    state,
    setState
}: {
    session: Session;
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
    const [intent, setIntent] = useState<SessionIntent>({
        goal: '',
        criteria: '',
        unknowns: '',
        hypothesis: '',
        difficultyEstimate: 3,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const unresolvedParking = storageService.getUnresolvedParkingItems(state);
    const [parkingAction, setParkingAction] = useState<Record<string, 'link' | 'dismiss'>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!intent.goal.trim()) newErrors.goal = 'Goal is required';
        if (!intent.criteria.trim()) newErrors.criteria = 'Success criteria required';

        // Check parking lot drain rule
        if (unresolvedParking.length > 0) {
            const allHandled = unresolvedParking.every(item => parkingAction[item.id]);
            if (!allHandled) {
                newErrors.parking = 'You must link or dismiss all unresolved parking items';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLock = () => {
        if (!validate()) return;

        try {
            // Handle parking items
            let updatedState = { ...state };
            unresolvedParking.forEach(item => {
                if (parkingAction[item.id] === 'link') {
                    updatedState = storageService.updateParkingItem(updatedState, item.id, {
                        linkedSessionId: session.id,
                    });
                } else if (parkingAction[item.id] === 'dismiss') {
                    updatedState = storageService.updateParkingItem(updatedState, item.id, {
                        resolvedAt: Date.now(),
                    });
                }
            });

            // Lock intent and transition to active
            const updatedSession = sessionService.lockIntent(session, intent);
            updatedState = storageService.updateSession(updatedState, session.id, updatedSession);
            setState(updatedState);
        } catch (error) {
            console.error('Failed to lock intent:', error);
        }
    };

    return (
        <div className="active-session">
            <h1>Before you start...</h1>
            <p className="subtitle">Define your goal before you code. This locks once you start.</p>

            <Card className="form-card">
                <Input
                    label="What are you working on? *"
                    value={intent.goal}
                    onChange={(e) => setIntent({ ...intent, goal: e.target.value })}
                    placeholder="e.g., Fix the login redirect bug"
                    error={errors.goal}
                />

                <Input
                    label="You'll be done when..."
                    multiline
                    rows={2}
                    value={intent.criteria}
                    onChange={(e) => setIntent({ ...intent, criteria: e.target.value })}
                    placeholder="e.g., User can sign in successfully"
                    error={errors.criteria}
                />

                <details className="advanced-section">
                    <summary>More details (optional)</summary>

                    <Input
                        label="Questions you have"
                        multiline
                        rows={2}
                        value={intent.unknowns}
                        onChange={(e) => setIntent({ ...intent, unknowns: e.target.value })}
                        placeholder="e.g., Not sure how OAuth state param works"
                    />

                    <Input
                        label="Your approach"
                        multiline
                        rows={2}
                        value={intent.hypothesis}
                        onChange={(e) => setIntent({ ...intent, hypothesis: e.target.value })}
                        placeholder="e.g., Will check Redux dev tools for state"
                    />
                </details>

                <div className="input-wrapper">
                    <label className="input-label">How hard will this be? (1-5) *</label>
                    <div className="difficulty-selector">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button
                                key={n}
                                className={`difficulty-btn ${intent.difficultyEstimate === n ? 'active' : ''}`}
                                onClick={() => setIntent({ ...intent, difficultyEstimate: n })}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Parking Lot Drain */}
                {unresolvedParking.length > 0 && (
                    <div className="parking-drain">
                        <h3>Unresolved Parking Items</h3>
                        <p className="parking-drain-subtitle">
                            You must link these items to this session or dismiss them before proceeding.
                        </p>
                        {errors.parking && <div className="error-msg">{errors.parking}</div>}

                        {unresolvedParking.map(item => (
                            <Card key={item.id} className="parking-item">
                                <div className="parking-item-content">{item.content}</div>
                                <div className="parking-item-actions">
                                    <Button
                                        size="sm"
                                        variant={parkingAction[item.id] === 'link' ? 'primary' : 'ghost'}
                                        onClick={() => setParkingAction({ ...parkingAction, [item.id]: 'link' })}
                                    >
                                        Link to Session
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={parkingAction[item.id] === 'dismiss' ? 'danger' : 'ghost'}
                                        onClick={() => setParkingAction({ ...parkingAction, [item.id]: 'dismiss' })}
                                    >
                                        Dismiss
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <Button onClick={handleLock} size="lg">
                    Start Session
                </Button>
            </Card>
        </div>
    );
}

// Live Session Interface
function LiveSession({
    session,
    state,
    setState,
}: {
    session: Session;
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
    const [logType, setLogType] = useState<LogType>('idea');
    const [logContent, setLogContent] = useState('');
    const [parkingContent, setParkingContent] = useState('');

    const sessionDuration = session.startedAt
        ? Math.floor((Date.now() - session.startedAt) / 1000 / 60)
        : 0;

    const handleAddLog = () => {
        if (!logContent.trim()) return;

        const updatedSession = sessionService.addLog(session, logType, logContent);
        const newState = storageService.updateSession(state, session.id, updatedSession);
        setState(newState);
        setLogContent('');
    };

    const handleToggleResolved = (logId: string) => {
        const log = session.logs.find(l => l.id === logId);
        if (!log) return;

        const updatedSession = sessionService.updateLog(session, logId, {
            resolved: !log.resolved,
        });
        const newState = storageService.updateSession(state, session.id, updatedSession);
        setState(newState);
    };

    const handleAddParking = () => {
        if (!parkingContent.trim()) return;

        const parkingItem: ParkingItem = {
            id: crypto.randomUUID(),
            content: parkingContent,
            createdAt: Date.now(),
            linkedSessionId: session.id,
        };

        const newState = storageService.addParkingItem(state, parkingItem);
        setState(newState);
        setParkingContent('');
    };

    const handleEndSession = () => {
        try {
            const updatedSession = sessionService.startReview(session);
            const newState = storageService.updateSession(state, session.id, updatedSession);
            setState(newState);
        } catch (error) {
            console.error('Failed to end session:', error);
        }
    };

    return (
        <div className="active-session">
            <div className="session-header">
                <div>
                    <h1>{session.projectId}</h1>
                    <p className="session-goal">{session.intent?.goal}</p>
                </div>
                <div className="session-timer">
                    <span className="timer-label">Duration</span>
                    <span className="timer-value">{sessionDuration} min</span>
                </div>
            </div>

            <div className="session-layout">
                {/* Main Area - Logs */}
                <div className="session-main">
                    <Card>
                        <h2>Session Log</h2>

                        <div className="log-input-section">
                            <div className="log-type-selector">
                                {(['idea', 'blocker', 'note'] as LogType[]).map(t => (
                                    <Button
                                        key={t}
                                        size="sm"
                                        variant={logType === t ? 'primary' : 'ghost'}
                                        onClick={() => setLogType(t)}
                                    >
                                        {t === 'idea' ? '💡 Idea' : t === 'blocker' ? '🚫 Blocker' : '📝 Note'}
                                    </Button>
                                ))}
                            </div>

                            <div className="log-input-row">
                                <Input
                                    placeholder={`Add a ${logType}...`}
                                    value={logContent}
                                    onChange={(e) => setLogContent(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddLog();
                                        }
                                    }}
                                />
                                <Button onClick={handleAddLog}>Add</Button>
                            </div>
                        </div>

                        <div className="log-entries">
                            {session.logs.length === 0 ? (
                                <div className="empty-logs">No log entries yet. Start adding notes as you code!</div>
                            ) : (
                                session.logs.map(log => (
                                    <div key={log.id} className={`log-entry ${log.resolved ? 'log-resolved' : ''}`}>
                                        <div className="log-header">
                                            <Badge variant={log.type === 'blocker' ? 'error' : log.type === 'idea' ? 'success' : 'default'}>
                                                {log.type === 'idea' ? '💡 Idea' : log.type === 'blocker' ? '🚫 Blocker' : '📝 Note'}
                                            </Badge>
                                            <span className="log-time">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="log-content">{log.content}</div>
                                        {log.type === 'blocker' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleToggleResolved(log.id)}
                                            >
                                                {log.resolved ? '✓ Resolved' : 'Mark Resolved'}
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    <Button onClick={handleEndSession} variant="secondary" size="lg">
                        End Session & Review
                    </Button>
                </div>

                {/* Sidebar - Parking Lot */}
                <div className="session-sidebar">
                    <Card>
                        <h3>Ideas for later</h3>
                        <p className="parking-subtitle">Capture distracting ideas to stay focused</p>

                        <div className="parking-input">
                            <Input
                                placeholder="Add to parking lot..."
                                multiline
                                rows={2}
                                value={parkingContent}
                                onChange={(e) => setParkingContent(e.target.value)}
                            />
                            <Button onClick={handleAddParking} size="sm">Add</Button>
                        </div>

                        <div className="parking-items">
                            {storageService.getUnresolvedParkingItems(state)
                                .filter(item => item.linkedSessionId === session.id)
                                .map(item => (
                                    <div key={item.id} className="parking-item-small">
                                        {item.content}
                                    </div>
                                ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Retrospective Form
function RetrospectiveForm({
    session,
    state,
    setState,
    onComplete,
}: {
    session: Session;
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    onComplete: () => void;
}) {
    const [retro, setRetro] = useState<SessionRetrospective>({
        outcome: 'completed',
        worked: '',
        didntWork: '',
        takeaway: '',
        confidence: 3,
        actualDifficulty: 3,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleComplete = () => {
        const newErrors: Record<string, string> = {};
        if (!retro.takeaway.trim()) newErrors.takeaway = 'Takeaway is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const completedSession = sessionService.completeSession(session, retro);
            let newState = storageService.updateSession(state, session.id, completedSession);
            newState = storageService.setActiveSession(newState, null);
            setState(newState);
            onComplete();
        } catch (error) {
            console.error('Failed to complete session:', error);
        }
    };

    return (
        <div className="active-session">
            <h1>How'd it go?</h1>
            <p className="subtitle">Quick reflection on this session</p>

            <Card className="form-card">
                <div className="input-wrapper">
                    <label className="input-label">Outcome</label>
                    <div className="outcome-selector">
                        {(['completed', 'partially_completed', 'blocked'] as const).map(o => (
                            <Button
                                key={o}
                                variant={retro.outcome === o ? 'primary' : 'secondary'}
                                onClick={() => setRetro({ ...retro, outcome: o })}
                            >
                                {o.replace('_', ' ')}
                            </Button>
                        ))}
                    </div>
                </div>

                <Input
                    label="What Worked?"
                    multiline
                    rows={3}
                    value={retro.worked}
                    onChange={(e) => setRetro({ ...retro, worked: e.target.value })}
                    placeholder="What went well? What helped you make progress?"
                />

                <Input
                    label="What Didn't Work?"
                    multiline
                    rows={3}
                    value={retro.didntWork}
                    onChange={(e) => setRetro({ ...retro, didntWork: e.target.value })}
                    placeholder="What slowed you down? What would you do differently?"
                />

                <Input
                    label="One Key Takeaway (Required)"
                    value={retro.takeaway}
                    onChange={(e) => setRetro({ ...retro, takeaway: e.target.value })}
                    placeholder="Single sentence - the most important thing you learned"
                    error={errors.takeaway}
                />

                <div className="rating-row">
                    <div className="input-wrapper">
                        <label className="input-label">Confidence (1-5)</label>
                        <div className="difficulty-selector">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button
                                    key={n}
                                    className={`difficulty-btn ${retro.confidence === n ? 'active' : ''}`}
                                    onClick={() => setRetro({ ...retro, confidence: n })}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="input-wrapper">
                        <label className="input-label">
                            How hard was it really? (1-5)
                            {session.intent && ` (You thought: ${session.intent.difficultyEstimate})`}
                        </label>
                        <div className="difficulty-selector">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button
                                    key={n}
                                    className={`difficulty-btn ${retro.actualDifficulty === n ? 'active' : ''}`}
                                    onClick={() => setRetro({ ...retro, actualDifficulty: n })}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <Button onClick={handleComplete} size="lg">
                    Complete Session
                </Button>
            </Card>
        </div>
    );
}
