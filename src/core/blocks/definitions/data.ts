/**
 * Data processing block definitions
 */
import { BlockDefinition } from '../types';
import { blockRegistry } from '../registry';

// Map Block
export const mapBlock: BlockDefinition = {
  id: 'map',
  type: 'transform',
  category: 'data',
  name: 'Map',
  description: 'Transform each element in an array',
  icon: '📊',
  color: '#ff9800',
  inputs: [
    { id: 'array', name: 'Array', type: 'array', description: 'Array to transform' },
  ],
  outputs: [
    { id: 'result', name: 'Result', type: 'array', description: 'Transformed array' },
  ],
  properties: [
    {
      id: 'expression',
      name: 'Transform Expression',
      type: 'code',
      language: 'javascript',
      template: '(item, index) => { return item; }',
      description: 'Function to transform each element',
    },
  ],
  execute: (inputs, properties) => {
    const { array } = inputs;
    
    if (!Array.isArray(array)) {
      return [];
    }

    // For now, return the array as-is
    // In a full implementation, you'd evaluate the expression
    return array.map((item, index) => item);
  },
};

// Filter Block
export const filterBlock: BlockDefinition = {
  id: 'filter',
  type: 'transform',
  category: 'data',
  name: 'Filter',
  description: 'Filter array elements based on condition',
  icon: '📊',
  color: '#ff9800',
  inputs: [
    { id: 'array', name: 'Array', type: 'array', description: 'Array to filter' },
  ],
  outputs: [
    { id: 'result', name: 'Result', type: 'array', description: 'Filtered array' },
  ],
  properties: [
    {
      id: 'condition',
      name: 'Filter Condition',
      type: 'code',
      language: 'javascript',
      template: '(item) => { return true; }',
      description: 'Function that returns true to keep element',
    },
  ],
  execute: (inputs, properties) => {
    const { array } = inputs;
    
    if (!Array.isArray(array)) {
      return [];
    }

    // For now, return all items
    // In a full implementation, you'd evaluate the condition
    return array.filter(() => true);
  },
};

// Reduce Block
export const reduceBlock: BlockDefinition = {
  id: 'reduce',
  type: 'transform',
  category: 'data',
  name: 'Reduce',
  description: 'Aggregate array to a single value',
  icon: '📊',
  color: '#ff9800',
  inputs: [
    { id: 'array', name: 'Array', type: 'array', description: 'Array to reduce' },
    { id: 'initial', name: 'Initial Value', type: 'any', optional: true, description: 'Initial accumulator value' },
  ],
  outputs: [
    { id: 'result', name: 'Result', type: 'any', description: 'Reduced value' },
  ],
  properties: [
    {
      id: 'reducer',
      name: 'Reducer Function',
      type: 'code',
      language: 'javascript',
      template: '(accumulator, item, index) => { return accumulator; }',
      description: 'Function to reduce array',
    },
    {
      id: 'initialValue',
      name: 'Initial Value',
      type: 'string',
      default: '0',
      description: 'Initial accumulator value (JSON)',
    },
  ],
  execute: (inputs, properties) => {
    const { array } = inputs;
    
    if (!Array.isArray(array)) {
      return inputs.initial ?? properties.initialValue ?? null;
    }

    // For now, return first item or initial value
    return array.length > 0 ? array[0] : (inputs.initial ?? properties.initialValue ?? null);
  },
};

// Register all data blocks
export function registerDataBlocks(): void {
  blockRegistry.register(mapBlock);
  blockRegistry.register(filterBlock);
  blockRegistry.register(reduceBlock);
}
