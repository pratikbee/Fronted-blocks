/**
 * Connection utilities
 */
import { v4 as uuidv4 } from 'uuid';
import { Connection } from './types';

export class ConnectionFactory {
  /**
   * Create a new connection
   */
  static create(
    sourceBlockId: string,
    sourcePortId: string,
    targetBlockId: string,
    targetPortId: string
  ): Connection {
    return {
      id: uuidv4(),
      sourceBlockId,
      sourcePortId,
      targetBlockId,
      targetPortId,
    };
  }

  /**
   * Validate a connection
   */
  static validate(connection: Connection): { isValid: boolean; error?: string } {
    if (connection.sourceBlockId === connection.targetBlockId) {
      return {
        isValid: false,
        error: 'Cannot connect a block to itself',
      };
    }

    if (!connection.sourceBlockId || !connection.targetBlockId) {
      return {
        isValid: false,
        error: 'Source and target blocks must be specified',
      };
    }

    if (!connection.sourcePortId || !connection.targetPortId) {
      return {
        isValid: false,
        error: 'Source and target ports must be specified',
      };
    }

    return { isValid: true };
  }
}
