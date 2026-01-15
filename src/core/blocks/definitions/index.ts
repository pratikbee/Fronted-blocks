/**
 * Register all block definitions
 */
import { registerMathBlocks } from './math';
import { registerLogicBlocks } from './logic';
import { registerDataBlocks } from './data';
import { BlockDefinition } from '../types';
import { blockRegistry } from '../registry';

// Register existing basic blocks
export function registerBasicBlocks(): void {
  // Trigger block
  const triggerBlock: BlockDefinition = {
    id: 'trigger',
    type: 'trigger',
    category: 'triggers',
    name: 'Trigger',
    description: 'Entry point for your flow',
    icon: '▶',
    color: '#4caf50',
    inputs: [],
    outputs: [
      { id: 'output', name: 'output', type: 'any' },
    ],
    properties: [],
  };

  // Action block
  const actionBlock: BlockDefinition = {
    id: 'action',
    type: 'action',
    category: 'triggers',
    name: 'Action',
    description: 'Perform an action',
    icon: '⚡',
    color: '#4caf50',
    inputs: [
      { id: 'input', name: 'input', type: 'any' },
    ],
    outputs: [
      { id: 'output', name: 'output', type: 'any' },
    ],
    properties: [],
  };

  // Condition block
  const conditionBlock: BlockDefinition = {
    id: 'condition',
    type: 'condition',
    category: 'logic',
    name: 'Condition',
    description: 'Evaluate a condition',
    icon: '❓',
    color: '#2196f3',
    inputs: [
      { id: 'input', name: 'input', type: 'any' },
    ],
    outputs: [
      { id: 'true', name: 'true', type: 'boolean' },
      { id: 'false', name: 'false', type: 'boolean' },
    ],
    properties: [],
  };

  // Transform block
  const transformBlock: BlockDefinition = {
    id: 'transform',
    type: 'transform',
    category: 'data',
    name: 'Transform',
    description: 'Transform data',
    icon: '🔄',
    color: '#ff9800',
    inputs: [
      { id: 'input', name: 'input', type: 'any' },
    ],
    outputs: [
      { id: 'output', name: 'output', type: 'any' },
    ],
    properties: [],
  };

  // Variable block
  const variableBlock: BlockDefinition = {
    id: 'variable',
    type: 'variable',
    category: 'variables',
    name: 'Variable',
    description: 'Store and retrieve variables',
    icon: '📦',
    color: '#607d8b',
    inputs: [
      { id: 'input', name: 'input', type: 'any' },
    ],
    outputs: [
      { id: 'output', name: 'output', type: 'any' },
    ],
    properties: [],
  };

  blockRegistry.register(triggerBlock);
  blockRegistry.register(actionBlock);
  blockRegistry.register(conditionBlock);
  blockRegistry.register(transformBlock);
  blockRegistry.register(variableBlock);
}

/**
 * Register all blocks
 */
export function registerAllBlocks(): void {
  registerBasicBlocks();
  registerMathBlocks();
  registerLogicBlocks();
  registerDataBlocks();
}
