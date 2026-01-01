# Developer's Journal (V1)

A fast, minimal, local-first web application that helps developers think clearly before coding, stay focused during coding, and extract learnings after coding.

## Product Overview

**This is not a diary. This is a Developer Session Recorder.**

Each journal entry represents a single focused coding session. The app optimizes for:
1. **Clarity before action** (Intent Lock)
2. **Minimal friction during work** (Live Logging)
3. **Reflection after execution** (Structured Retrospective)

It is built to be a personal operating system for deep work, optimizing judgment over raw output.

## Features & Usage

### 1. Intent Lock (Before You Code)
You cannot start a live session without defining your intent. This hard gate prevents aimless coding.
- **Goal**: Single sentence objective.
- **Success Criteria**: measurable "done".
- **Difficulty Estimate**: 1-5 rating of expected effort.
- **Parking Lot Drain**: You must address unfinished ideas from previous sessions before starting.

### 2. Live Session (While Coding)
A low-friction interface to capture thoughts as they happen.
- **Log Types**: Insight, Question, Blocker, Experiment, Tried & Failed.
- **Parking Lot**: Dump distracting ideas here to address later.
- **Visual Timer**: Tracks session duration (focus, not policing).

### 3. Retrospective (After Session)
Convert effort into learning immediately after finishing.
- **Outcome**: Completed, Partially Completed, or Blocked.
- **Reflections**: What worked, what didn't.
- **Confidence Score**: 1-5 rating of your solution quality.
- **Actual Difficulty**: Compare with your estimate to improve planning.

### 4. Dashboard & History
- **Signals**: View your average confidence, common blockers, and recent outcomes.
- **Session History**: Filterable list of all past sessions.
- **Detail View**: Full replay of logs and intents.

## Data Model

The application uses a local-first architecture with `localStorage`.

### Session
- **Status State Machine**: `intent` -> `active` -> `reviewing` -> `completed` (or `abandoned`)
- **Timestamps**: Created, Started, Ended.
- **Intent**: Goal, Criteria, Unknowns, Hypothesis, Difficulty Estimate.
- **Logs**: Array of ordered entries with types.
- **Retrospective**: Outcome, Takeaway, Confidence, Actual Difficulty.

### Privacy & Storage
- **Local Only**: All data lives in your browser's `localStorage`.
- **No Tracking**: No analytics, no cloud sync, no external servers.
- **Export**: Currently manual (inspect `localStorage`), JSON export coming in V2.

## How to Use (Daily Routine)

1. **Start** a session when you sit down to solve a specific problem.
2. **Spend 2-3 minutes** filling out the Intent Lock. Be specific.
3. **Code.** Keep the journal open.
   - Hit a blocker? Log it.
   - Have a random idea? Put it in the Parking Lot.
   - Solved it? Log the insight.
4. **Stop.** When you're done or out of time, end the session.
5. **Reflect.** Spend 1 minute on the Retrospective. Be honest about the difficulty.
6. **Close.**

## Deployment

**Live URL**: [https://dev-journal-v1.web.app](https://dev-journal-v1.web.app)

### Deploy to Firebase Hosting

```bash
# Build production bundle
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## Technical Details

- **Stack**: React, TypeScript, Vite
- **Styling**: Vanilla CSS with CSS Variables (Dark Mode default)
- **State**: React Hooks + LocalStorage
- **Auth**: Firebase Authentication (Google Sign-In)
- **User Tracking**: Firestore (users collection)
- **Hosting**: Firebase Hosting
- **License**: MIT
