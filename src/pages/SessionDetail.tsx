
import type { Session, AppState } from '../types';
import { sessionService } from '../services/sessionService';
import { storageService } from '../services/storageService';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import './SessionDetail.css';

interface SessionDetailProps {
    sessionId: string;
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    onBack: () => void;
}

export function SessionDetail({ sessionId, state, setState, onBack }: SessionDetailProps) {
    const session = storageService.getSession(state, sessionId);

    const handleRestartSession = () => {
        if (!session) return;

        const newSession = sessionService.createSessionFromTemplate(session);
        const newState = storageService.addSession(state, newSession);
        const finalState = storageService.setActiveSession(newState, newSession.id);
        setState(finalState);

        // Navigate to active session
        window.location.hash = '#active';
    };

    if (!session) {
        return (
            <div>
                <p>Session not found</p>
                <Button onClick={onBack}>Back to Dashboard</Button>
            </div>
        );
    }

    const duration = session.startedAt && session.endedAt
        ? Math.floor((session.endedAt - session.startedAt) / 1000 / 60)
        : 'N/A';

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
        <div className="session-detail">
            <div className="detail-header-actions">
                <Button onClick={onBack} variant="ghost" size="sm">← Back</Button>
                {session.status === 'completed' && (
                    <Button variant="primary" onClick={handleRestartSession}>
                        🔄 Restart Session
                    </Button>
                )}
            </div>

            <div className="detail-header">
                <div>
                    <h1>{session.projectId}</h1>
                    <div className="detail-badges">
                        <Badge>{session.type}</Badge>
                        <Badge variant={getStatusBadgeVariant(session.status)}>
                            {session.status}
                        </Badge>
                    </div>
                </div>
                <div className="detail-meta">
                    <div className="meta-item">
                        <span className="meta-label">Created</span>
                        <span className="meta-value">
                            {new Date(session.createdAt).toLocaleDateString()} {new Date(session.createdAt).toLocaleTimeString()}
                        </span>
                    </div>
                    {session.startedAt && (
                        <div className="meta-item">
                            <span className="meta-label">Duration</span>
                            <span className="meta-value">{duration} min</span>
                        </div>
                    )}
                </div>
            </div>

            {session.summary && (
                <Card className="summary-card">
                    <h3>Summary</h3>
                    <p className="summary-text">{session.summary}</p>
                </Card>
            )}

            {session.intent && (
                <Card>
                    <h2>Intent</h2>
                    <div className="intent-grid">
                        <div className="intent-item">
                            <h4>Primary Goal</h4>
                            <p>{session.intent.goal}</p>
                        </div>
                        <div className="intent-item">
                            <h4>Success Criteria</h4>
                            <p>{session.intent.criteria}</p>
                        </div>
                        {session.intent.unknowns && (
                            <div className="intent-item">
                                <h4>Known Unknowns</h4>
                                <p>{session.intent.unknowns}</p>
                            </div>
                        )}
                        {session.intent.hypothesis && (
                            <div className="intent-item">
                                <h4>Initial Hypothesis</h4>
                                <p>{session.intent.hypothesis}</p>
                            </div>
                        )}
                        <div className="intent-item">
                            <h4>Difficulty Estimate</h4>
                            <p>{session.intent.difficultyEstimate} / 5</p>
                        </div>
                    </div>
                </Card>
            )}

            {session.logs.length > 0 && (
                <Card>
                    <h2>Session Log ({session.logs.length} entries)</h2>
                    <div className="log-timeline">
                        {session.logs.map(log => (
                            <div key={log.id} className="timeline-entry">
                                <div className="timeline-marker">
                                    <Badge variant={
                                        log.type === 'blocker' ? 'error' :
                                            log.type === 'insight' ? 'success' :
                                                'default'
                                    }>
                                        {log.type.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-time">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </div>
                                    <div className="timeline-text">{log.content}</div>
                                    {log.resolved && (
                                        <div className="timeline-resolved">✓ Resolved</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {session.retrospective && (
                <Card>
                    <h2>Retrospective</h2>
                    <div className="retro-grid">
                        <div className="retro-item">
                            <h4>Outcome</h4>
                            <Badge variant={getOutcomeBadgeVariant(session.retrospective.outcome)}>
                                {session.retrospective.outcome.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div className="retro-item">
                            <h4>Confidence</h4>
                            <p>{session.retrospective.confidence} / 5</p>
                        </div>
                        <div className="retro-item">
                            <h4>Actual Difficulty</h4>
                            <p>{session.retrospective.actualDifficulty} / 5</p>
                        </div>
                        {session.retrospective.worked && (
                            <div className="retro-item full-width">
                                <h4>What Worked</h4>
                                <p>{session.retrospective.worked}</p>
                            </div>
                        )}
                        {session.retrospective.didntWork && (
                            <div className="retro-item full-width">
                                <h4>What Didn't Work</h4>
                                <p>{session.retrospective.didntWork}</p>
                            </div>
                        )}
                        <div className="retro-item full-width highlight">
                            <h4>Key Takeaway</h4>
                            <p>{session.retrospective.takeaway}</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
