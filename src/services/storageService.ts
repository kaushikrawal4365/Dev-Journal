import type { AppState, Session, ParkingItem } from '../types';

const STORAGE_KEY = 'dev_journal_state';
const SCHEMA_VERSION = '1.0';

export const storageService = {
    loadState(): AppState {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return this.getDefaultState();
            }
            const parsed = JSON.parse(stored) as AppState;
            // TODO: Add migration logic when schema changes
            return parsed;
        } catch (error) {
            console.error('Failed to load state:', error);
            return this.getDefaultState();
        }
    },

    saveState(state: AppState): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    },

    getDefaultState(): AppState {
        return {
            sessions: [],
            parkingLot: [],
            activeSessionId: null,
        };
    },

    // Session CRUD
    addSession(state: AppState, session: Session): AppState {
        return {
            ...state,
            sessions: [...state.sessions, session],
        };
    },

    updateSession(state: AppState, sessionId: string, updates: Partial<Session>): AppState {
        return {
            ...state,
            sessions: state.sessions.map(s =>
                s.id === sessionId ? { ...s, ...updates } : s
            ),
        };
    },

    getSession(state: AppState, sessionId: string): Session | undefined {
        return state.sessions.find(s => s.id === sessionId);
    },

    // Parking Lot CRUD
    addParkingItem(state: AppState, item: ParkingItem): AppState {
        return {
            ...state,
            parkingLot: [...state.parkingLot, item],
        };
    },

    updateParkingItem(state: AppState, itemId: string, updates: Partial<ParkingItem>): AppState {
        return {
            ...state,
            parkingLot: state.parkingLot.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
            ),
        };
    },

    getUnresolvedParkingItems(state: AppState): ParkingItem[] {
        return state.parkingLot.filter(item => !item.resolvedAt);
    },

    // Active session management
    setActiveSession(state: AppState, sessionId: string | null): AppState {
        return {
            ...state,
            activeSessionId: sessionId,
        };
    },

    getActiveSession(state: AppState): Session | null {
        if (!state.activeSessionId) return null;
        return this.getSession(state, state.activeSessionId) || null;
    },

    getSchemaVersion(): string {
        return SCHEMA_VERSION;
    },
};
