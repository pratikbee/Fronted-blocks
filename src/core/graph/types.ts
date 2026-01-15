/**
 * Graph data structures
 */
import { Block, Connection } from '../models/types';

export interface Graph {
  nodes: Map<string, Block>;
  edges: Map<string, Connection[]>;
  adjacencyList: Map<string, string[]>; // For fast traversal
}

export interface Cycle {
  path: string[];                // Array of block IDs forming the cycle
  message: string;               // Human-readable description
}

export interface ValidationResult {
  isValid: boolean;
  cycles: Cycle[];
  unreachableNodes: string[];
  errors: string[];
  warnings: string[];
}
