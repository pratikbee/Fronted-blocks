/**
 * CRDT-related types
 */
import { Block, Connection, DocumentMetadata } from '../models/types';

export interface LogicDocumentState {
  blocks: Map<string, Block>;
  connections: Connection[];
  metadata: DocumentMetadata;
}

export type DocumentUpdateCallback = (state: LogicDocumentState) => void;
