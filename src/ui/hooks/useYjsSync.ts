/**
 * React hook for syncing Y.js document with React state
 */
import { useEffect, useState } from 'react';
import { LogicDocument } from '@/core/crdt/document';
import { LogicDocumentState } from '@/core/crdt/types';

export function useYjsSync(document: LogicDocument): LogicDocumentState {
  const [state, setState] = useState<LogicDocumentState>(() => document.getState());

  useEffect(() => {
    // Subscribe to document updates
    const unsubscribe = document.observe((newState) => {
      setState(newState);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [document]);

  return state;
}
