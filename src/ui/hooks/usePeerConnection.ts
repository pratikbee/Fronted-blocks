/**
 * React hook for WebRTC peer connection status
 */
import { useEffect, useState } from 'react';
import { LogicDocument } from '@/core/crdt/document';

export interface PeerConnectionStatus {
  connected: boolean;
  peerCount: number;
}

export function usePeerConnection(document: LogicDocument): PeerConnectionStatus {
  const [status, setStatus] = useState<PeerConnectionStatus>(() =>
    document.getConnectionStatus()
  );

  useEffect(() => {
    // Poll connection status (y-webrtc doesn't have event-based status updates)
    const interval = setInterval(() => {
      setStatus(document.getConnectionStatus());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [document]);

  return status;
}
