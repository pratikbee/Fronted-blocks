/**
 * CRDT Document wrapper using Y.js
 * Handles real-time collaboration and offline persistence
 */
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';
import { Block, Connection, DocumentMetadata } from '../models/types';
import { LogicDocumentState, DocumentUpdateCallback } from './types';

export class LogicDocument {
  private doc: Y.Doc;
  private blocks: Y.Map<Block>;
  private connections: Y.Array<Connection>;
  private metadata: Y.Map<DocumentMetadata>;
  private indexeddbProvider: IndexeddbPersistence | null = null;
  private webrtcProvider: WebrtcProvider | null = null;
  private updateCallbacks: Set<DocumentUpdateCallback> = new Set();
  private roomId: string;

  constructor(roomId: string, enablePersistence = true, enableWebRTC = true) {
    this.roomId = roomId;
    this.doc = new Y.Doc();

    // Initialize CRDT structures
    this.blocks = this.doc.getMap('blocks');
    this.connections = this.doc.getArray('connections');
    this.metadata = this.doc.getMap('metadata');

    // Setup persistence (IndexedDB)
    if (enablePersistence) {
      try {
        this.indexeddbProvider = new IndexeddbPersistence(roomId, this.doc);
        this.indexeddbProvider.on('synced', () => {
          console.log('IndexedDB synced');
          this.notifyUpdate();
        });
      } catch (error) {
        console.warn('IndexedDB not available:', error);
      }
    }

    // Setup P2P sync (WebRTC)
    if (enableWebRTC) {
      try {
        // Use multiple signaling servers for redundancy
        // If one fails, it will try the others
        const signalingServers = [
          'wss://signaling.yjs.dev',
          'wss://y-webrtc-signaling-eu.herokuapp.com',
          'wss://y-webrtc-signaling-us.herokuapp.com',
        ];

        // Suppress WebSocket errors by wrapping in try-catch and using setTimeout
        // This allows the provider to initialize without blocking
        setTimeout(() => {
          try {
            this.webrtcProvider = new WebrtcProvider(roomId, this.doc, {
              signaling: signalingServers,
              maxConns: 20 + Math.floor(Math.random() * 15), // Randomize connection count
              filterBcConns: true, // Filter broadcast connections
            });

            // Note: y-webrtc events may vary by version
            if (this.webrtcProvider.on) {
              try {
                (this.webrtcProvider as any).on('status', (event: { status: string }) => {
                  if (event.status === 'connected') {
                    console.log('✅ WebRTC connected successfully');
                  }
                });
              } catch (e) {
                // Event API may not be available
              }
            }
          } catch (error) {
            console.warn('⚠️ WebRTC provider creation failed:', error);
          }
        }, 100);

        // Log connection attempts (non-blocking)
        console.log('🌐 WebRTC provider initializing...');
        console.log('💡 Note: WebSocket errors are expected if signaling servers are down.');
        console.log('💡 The app works offline - changes sync when connection is restored.');
        console.log('💡 To disable WebRTC, add ?webrtc=false to your URL');
      } catch (error) {
        console.warn('⚠️ WebRTC initialization failed:', error);
        console.warn('💡 Collaboration will work offline, but won\'t sync with other clients.');
      }
    } else {
      console.log('ℹ️ WebRTC disabled. Collaboration works on same network only.');
    }

    // Listen for updates
    this.doc.on('update', () => {
      this.notifyUpdate();
    });

    // Observe changes to blocks and connections
    this.blocks.observe(() => {
      this.notifyUpdate();
    });

    this.connections.observe(() => {
      this.notifyUpdate();
    });

    // Initialize metadata if not present
    if (!this.metadata.has('document')) {
      const initialMetadata: DocumentMetadata = {
        id: roomId,
        name: `Logic Flow ${roomId.slice(0, 8)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };
      this.metadata.set('document', initialMetadata);
    }
  }

  /**
   * Get current document state
   */
  getState(): LogicDocumentState {
    const blocks = new Map<string, Block>();
    this.blocks.forEach((block, id) => {
      blocks.set(id, block);
    });

    const connections: Connection[] = [];
    this.connections.forEach((conn) => {
      connections.push(conn);
    });

    const metadata = this.metadata.get('document') || {
      id: this.roomId,
      name: 'Untitled',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    return {
      blocks,
      connections,
      metadata,
    };
  }

  /**
   * Subscribe to document updates
   */
  observe(callback: DocumentUpdateCallback): () => void {
    this.updateCallbacks.add(callback);
    
    // Immediately call with current state
    callback(this.getState());

    // Return unsubscribe function
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  /**
   * Notify all subscribers of updates
   */
  private notifyUpdate(): void {
    const state = this.getState();
    this.updateCallbacks.forEach((callback) => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in update callback:', error);
      }
    });
  }

  /**
   * Add a block to the document
   */
  addBlock(block: Block): void {
    this.blocks.set(block.id, block);
    this.updateMetadata();
  }

  /**
   * Update a block
   */
  updateBlock(id: string, updates: Partial<Block>): void {
    const block = this.blocks.get(id);
    if (block) {
      const updatedBlock = { ...block, ...updates };
      this.blocks.set(id, updatedBlock);
      this.updateMetadata();
    }
  }

  /**
   * Delete a block
   */
  deleteBlock(id: string): void {
    this.blocks.delete(id);
    // Also delete connections involving this block
    this.deleteConnectionsForBlock(id);
    this.updateMetadata();
  }

  /**
   * Add a connection
   */
  addConnection(connection: Connection): void {
    this.connections.push([connection]);
    this.updateMetadata();
  }

  /**
   * Delete a connection
   */
  deleteConnection(id: string): void {
    const index = this.connections
      .toArray()
      .findIndex((conn) => conn.id === id);
    if (index !== -1) {
      this.connections.delete(index, 1);
      this.updateMetadata();
    }
  }

  /**
   * Delete all connections for a block
   */
  private deleteConnectionsForBlock(blockId: string): void {
    const connectionsToDelete: number[] = [];
    this.connections.forEach((conn, index) => {
      if (
        conn.sourceBlockId === blockId ||
        conn.targetBlockId === blockId
      ) {
        connectionsToDelete.push(index);
      }
    });

    // Delete in reverse order to maintain indices
    for (let i = connectionsToDelete.length - 1; i >= 0; i--) {
      this.connections.delete(connectionsToDelete[i], 1);
    }
  }

  /**
   * Update metadata timestamp
   */
  private updateMetadata(): void {
    const currentMeta = this.metadata.get('document');
    if (currentMeta) {
      this.metadata.set('document', {
        ...currentMeta,
        updatedAt: Date.now(),
        version: (currentMeta.version || 0) + 1,
      });
    }
  }

  /**
   * Get WebRTC connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    peerCount: number;
  } {
    if (!this.webrtcProvider) {
      return { connected: false, peerCount: 0 };
    }

    // y-webrtc doesn't expose peer count directly
    // Check if provider is active
    const connected = (this.webrtcProvider as any).shouldConnect !== false;
    
    // Try to get peer count from provider if available
    let peerCount = 0;
    try {
      const peers = (this.webrtcProvider as any).peers;
      if (peers && typeof peers === 'object') {
        peerCount = Object.keys(peers).length;
      }
    } catch (e) {
      // Peer count not available
    }

    return {
      connected,
      peerCount: connected ? Math.max(peerCount, 1) : 0,
    };
  }

  /**
   * Clear all blocks and connections (reset canvas)
   */
  clearAll(): void {
    // Delete all connections first
    const connectionCount = this.connections.length;
    if (connectionCount > 0) {
      this.connections.delete(0, connectionCount);
    }

    // Delete all blocks
    const blockIds: string[] = [];
    this.blocks.forEach((_block, id) => {
      blockIds.push(id);
    });
    blockIds.forEach((id) => {
      this.blocks.delete(id);
    });

    this.updateMetadata();
  }

  /**
   * Destroy the document and cleanup resources
   */
  destroy(): void {
    this.updateCallbacks.clear();
    
    if (this.indexeddbProvider) {
      this.indexeddbProvider.destroy();
    }
    
    if (this.webrtcProvider) {
      this.webrtcProvider.destroy();
    }
    
    this.doc.destroy();
  }
}
