export type SessionStatus = 'intent' | 'active' | 'reviewing' | 'completed' | 'abandoned';

export type SessionType = 'planning' | 'implementation' | 'debugging' | 'exploration' | 'learning';

export type LogType = 'question' | 'blocker' | 'insight' | 'experiment' | 'tried_failed';

export interface SessionIntent {
  goal: string;
  criteria: string;
  unknowns: string;
  hypothesis: string;
  difficultyEstimate: number; // 1-5
}

export interface SessionRetrospective {
  outcome: 'completed' | 'partially_completed' | 'blocked';
  worked: string;
  didntWork: string;
  takeaway: string;
  confidence: number; // 1-5
  actualDifficulty: number; // 1-5
}

export interface LogEntry {
  id: string;
  timestamp: number;
  order: number;
  type: LogType;
  content: string;
  resolved?: boolean;
  resolutionNote?: string;
}

export interface ParkingItem {
  id: string;
  content: string;
  createdAt: number;
  resolvedAt?: number;
  linkedSessionId?: string;
}

export interface Session {
  schemaVersion: string;
  id: string;
  status: SessionStatus;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  intentLocked: boolean;
  summary?: string;
  abandonedReason?: string;
  projectId: string;
  type: SessionType;
  intent?: SessionIntent;
  logs: LogEntry[];
  retrospective?: SessionRetrospective;
}

export interface AppState {
  sessions: Session[];
  parkingLot: ParkingItem[];
  activeSessionId: string | null;
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  lastLoginAt: number;
}
