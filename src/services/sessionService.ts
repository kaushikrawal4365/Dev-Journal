import type { Session, SessionStatus, SessionIntent, SessionRetrospective, LogEntry, LogType } from '../types';
import { storageService } from './storageService';

export const sessionService = {
    // Finite State Machine - Allowed transitions
    canTransition(from: SessionStatus, to: SessionStatus): boolean {
        const allowedTransitions: Record<SessionStatus, SessionStatus[]> = {
            intent: ['active', 'abandoned'],
            active: ['reviewing', 'abandoned'],
            reviewing: ['completed'],
            completed: [],
            abandoned: [],
        };

        return allowedTransitions[from]?.includes(to) ?? false;
    },

    // Create a new session
    createSession(projectId: string, type: Session['type']): Session {
        return {
            schemaVersion: storageService.getSchemaVersion(),
            id: crypto.randomUUID(),
            status: 'intent',
            createdAt: Date.now(),
            intentLocked: false,
            projectId,
            type,
            logs: [],
        };
    },

    // Lock intent and transition to active
    lockIntent(session: Session, intent: SessionIntent): Session {
        if (!this.canTransition(session.status, 'active')) {
            throw new Error(`Cannot transition from ${session.status} to active`);
        }

        return {
            ...session,
            intent,
            intentLocked: true,
            status: 'active',
            startedAt: Date.now(),
        };
    },

    // Add a log entry
    addLog(session: Session, type: LogType, content: string): Session {
        const newLog: LogEntry = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            order: session.logs.length,
            type,
            content,
        };

        return {
            ...session,
            logs: [...session.logs, newLog],
        };
    },

    // Update a log entry
    updateLog(session: Session, logId: string, updates: Partial<LogEntry>): Session {
        return {
            ...session,
            logs: session.logs.map(log =>
                log.id === logId ? { ...log, ...updates } : log
            ),
        };
    },

    // Transition to reviewing
    startReview(session: Session): Session {
        if (!this.canTransition(session.status, 'reviewing')) {
            throw new Error(`Cannot transition from ${session.status} to reviewing`);
        }

        return {
            ...session,
            status: 'reviewing',
            endedAt: Date.now(),
        };
    },

    // Complete session with retrospective
    completeSession(session: Session, retrospective: SessionRetrospective): Session {
        if (!this.canTransition(session.status, 'completed')) {
            throw new Error(`Cannot transition from ${session.status} to completed`);
        }

        const summary = this.generateSummary(session, retrospective);

        return {
            ...session,
            retrospective,
            summary,
            status: 'completed',
        };
    },

    // Abandon session
    abandonSession(session: Session, reason: string): Session {
        if (!this.canTransition(session.status, 'abandoned')) {
            throw new Error(`Cannot transition from ${session.status} to abandoned`);
        }

        return {
            ...session,
            status: 'abandoned',
            abandonedReason: reason,
            endedAt: Date.now(),
        };
    },

    // Generate deterministic summary
    generateSummary(session: Session, retrospective: SessionRetrospective): string {
        const goal = session.intent?.goal || 'No goal specified';
        const outcome = retrospective.outcome.replace('_', ' ');
        const takeaway = retrospective.takeaway;

        return `Goal: ${goal}. Outcome: ${outcome}. Takeaway: ${takeaway}`;
    },

    // Check for incomplete sessions (abandoned detection)
    detectAbandonedSessions(sessions: Session[]): Session[] {
        return sessions.filter(s => s.status === 'intent' || s.status === 'active');
    },

    // Create a new session from a completed session (restart/retry)
    createSessionFromTemplate(templateSession: Session): Session {
        return {
            schemaVersion: storageService.getSchemaVersion(),
            id: crypto.randomUUID(),
            status: 'intent',
            createdAt: Date.now(),
            intentLocked: false,
            projectId: templateSession.projectId,
            type: templateSession.type,
            intent: templateSession.intent,
            logs: [],
            parentSessionId: templateSession.id
        };
    },
};
