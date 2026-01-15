/**
 * UUID utilities
 */
import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

export function generateShortId(): string {
  return Math.random().toString(36).substr(2, 9);
}
