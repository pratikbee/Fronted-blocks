/**
 * Block system types and definitions
 */

export type BlockCategory = 
  | 'triggers'
  | 'logic'
  | 'data'
  | 'string'
  | 'math'
  | 'variables'
  | 'io';

export type DataType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'date'
  | 'any'
  | 'null';

export interface PortDefinition {
  id: string;
  name: string;
  type: DataType;
  optional?: boolean;
  description?: string;
}

export interface PropertyDefinition {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'code' | 'json' | 'select' | 'textarea';
  default?: any;
  required?: boolean;
  options?: string[]; // For select type
  placeholder?: string;
  description?: string;
  language?: string; // For code type
  template?: string; // For code type
}

export interface BlockDefinition {
  id: string;
  type: string;
  category: BlockCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  properties: PropertyDefinition[];
  execute?: (inputs: Record<string, any>, properties: Record<string, any>) => any;
  validate?: (properties: Record<string, any>) => { isValid: boolean; error?: string };
}

export interface ExecutionContext {
  variables: Map<string, any>;
  getVariable: (name: string) => any;
  setVariable: (name: string, value: any) => void;
}
