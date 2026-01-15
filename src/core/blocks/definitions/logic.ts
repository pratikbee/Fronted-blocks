/**
 * Logic block definitions
 */
import { BlockDefinition } from '../types';
import { blockRegistry } from '../registry';

// If/Else Block
export const ifElseBlock: BlockDefinition = {
  id: 'if-else',
  type: 'condition',
  category: 'logic',
  name: 'If/Else',
  description: 'Conditional branching - execute different paths based on condition',
  icon: '🔀',
  color: '#2196f3',
  inputs: [
    { id: 'condition', name: 'Condition', type: 'boolean', description: 'Boolean condition to evaluate' },
  ],
  outputs: [
    { id: 'true', name: 'True', type: 'any', description: 'Output when condition is true' },
    { id: 'false', name: 'False', type: 'any', description: 'Output when condition is false' },
  ],
  properties: [
    {
      id: 'conditionExpression',
      name: 'Condition Expression',
      type: 'code',
      language: 'javascript',
      template: '(value) => { return value > 0; }',
      description: 'JavaScript expression that returns a boolean',
    },
  ],
  execute: (inputs, properties) => {
    const { condition } = inputs;
    
    // If condition is explicitly a boolean, use it
    if (typeof condition === 'boolean') {
      return { true: condition, false: !condition };
    }

    // Otherwise, evaluate as truthy/falsy
    const isTrue = Boolean(condition);
    return { true: isTrue, false: !isTrue };
  },
};

// Switch Block
export const switchBlock: BlockDefinition = {
  id: 'switch',
  type: 'condition',
  category: 'logic',
  name: 'Switch',
  description: 'Multi-way branching based on value',
  icon: '🔀',
  color: '#2196f3',
  inputs: [
    { id: 'value', name: 'Value', type: 'any', description: 'Value to match against cases' },
  ],
  outputs: [
    { id: 'default', name: 'Default', type: 'any', description: 'Output when no case matches' },
  ],
  properties: [
    {
      id: 'cases',
      name: 'Cases',
      type: 'json',
      default: '[]',
      description: 'Array of case objects: [{value: "case1", output: "result1"}]',
    },
  ],
  execute: (inputs, properties) => {
    const { value } = inputs;
    let cases: Array<{ value: any; output: any }> = [];

    try {
      cases = typeof properties.cases === 'string' 
        ? JSON.parse(properties.cases) 
        : properties.cases;
    } catch (e) {
      return { default: null };
    }

    // Find matching case
    const match = cases.find(c => c.value === value);
    if (match) {
      return { [match.value]: match.output, default: null };
    }

    return { default: null };
  },
};

// Register all logic blocks
export function registerLogicBlocks(): void {
  blockRegistry.register(ifElseBlock);
  blockRegistry.register(switchBlock);
}
