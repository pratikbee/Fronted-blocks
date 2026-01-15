/**
 * Type declarations for y-webrtc
 */
declare module 'y-webrtc' {
  import * as Y from 'yjs';

  export interface WebrtcProviderOptions {
    signaling?: string[];
    password?: string;
    awareness?: any;
    maxConns?: number;
    filterBcConns?: boolean;
    peerOpts?: any;
  }

  export class WebrtcProvider {
    constructor(
      roomName: string,
      doc: Y.Doc,
      options?: WebrtcProviderOptions
    );
    
    roomName: string;
    doc: Y.Doc;
    awareness: any;
    shouldConnect: boolean;
    signalingUrls: string[];
    peers: Map<string, any>;
    
    destroy(): void;
    disconnect(): void;
    connect(): void;
    
    on?(event: string, callback: (event: any) => void): void;
    off?(event: string, callback: (event: any) => void): void;
  }
}
