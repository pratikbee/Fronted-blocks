/**
 * Core data models for the Visual Logic Builder
 */

export type BlockType = 
  | 'trigger'    // Entry point (e.g., "On Click", "On Load")
  | 'action'     // Side effect (e.g., "Send Email", "Log Message")
  | 'condition'  // Logic gate (e.g., "If X > Y", "Switch")
  | 'transform'  // Data processing (e.g., "Format Date", "Parse JSON")
  | 'variable';   // State storage (e.g., "Set Counter", "Store Value")

export interface Port {
  id: string;
  name: string;
  type: string; // e.g., "string", "number", "boolean"
}

export interface Block {
  id: string;                    // Unique ID (UUID)
  type: BlockType;               // Block category
  position: { x: number; y: number; }; // Canvas coordinates
  data: Record<string, any>;     // Block-specific configuration
  inputs: Port[];                // Input ports (0-N)
  outputs: Port[];               // Output ports (1-N)
  label?: string;                // Display name
  version?: number;               // For optimistic updates
}

export interface Connection {
  id: string;                    // Unique connection ID
  sourceBlockId: string;         // Source block ID
  sourcePortId: string;          // Source port ID
  targetBlockId: string;         // Target block ID
  targetPortId: string;          // Target port ID
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

export interface DocumentMetadata {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  version: number;
}
