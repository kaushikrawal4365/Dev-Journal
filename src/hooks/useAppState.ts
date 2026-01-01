import { useState, useEffect } from 'react';
import type { AppState } from '../types';
import { storageService } from '../services/storageService';

export function useAppState() {
    const [state, setState] = useState<AppState>(() => storageService.loadState());

    // Autosave on every state change
    useEffect(() => {
        storageService.saveState(state);
    }, [state]);

    return [state, setState] as const;
}
