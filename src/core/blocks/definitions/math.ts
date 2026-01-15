/**
 * Math block definitions
 */
import { BlockDefinition } from '../types';
import { blockRegistry } from '../registry';

// Calculate Block
export const calculateBlock: BlockDefinition = {
  id: 'calculate',
  type: 'transform',
  category: 'math',
  name: 'Calculate',
  description: 'Perform mathematical operations on two numbers',
  icon: '🔢',
  color: '#f44336',
  inputs: [
    { id: 'a', name: 'A', type: 'number', description: 'First number' },
    { id: 'b', name: 'B', type: 'number', description: 'Second number' },
  ],
  outputs: [
    { id: 'result', name: 'Result', type: 'number', description: 'Calculation result' },
  ],
  properties: [
    {
      id: 'operation',
      name: 'Operation',
      type: 'select',
      default: '+',
      required: true,
      options: ['+', '-', '*', '/', '%', '^', 'min', 'max'],
      description: 'Mathematical operation to perform',
    },
  ],
  execute: (inputs, properties) => {
    const { a, b } = inputs;
    const { operation } = properties;

    if (typeof a !== 'number' || typeof b !== 'number') {
      return null;
    }

    switch (operation) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return b !== 0 ? a / b : null;
      case '%':
        return b !== 0 ? a % b : null;
      case '^':
        return Math.pow(a, b);
      case 'min':
        return Math.min(a, b);
      case 'max':
        return Math.max(a, b);
      default:
        return null;
    }
  },
};

// Round Block
export const roundBlock: BlockDefinition = {
  id: 'round',
  type: 'transform',
  category: 'math',
  name: 'Round',
  description: 'Round a number to specified decimal places',
  icon: '🔢',
  color: '#f44336',
  inputs: [
    { id: 'value', name: 'Value', type: 'number', description: 'Number to round' },
    { id: 'decimals', name: 'Decimals', type: 'number', optional: true, description: 'Number of decimal places' },
  ],
  outputs: [
    { id: 'result', name: 'Result', type: 'number', description: 'Rounded number' },
  ],
  properties: [
    {
      id: 'decimals',
      name: 'Decimal Places',
      type: 'number',
      default: 0,
      description: 'Number of decimal places (0 = round to integer)',
    },
  ],
  execute: (inputs, properties) => {
    const { value } = inputs;
    const decimals = inputs.decimals ?? properties.decimals ?? 0;

    if (typeof value !== 'number') {
      return null;
    }

    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  },
};

// Random Block
export const randomBlock: BlockDefinition = {
  id: 'random',
  type: 'transform',
  category: 'math',
  name: 'Random',
  description: 'Generate a random number between min and max',
  icon: '🎲',
  color: '#f44336',
  inputs: [
    { id: 'min', name: 'Min', type: 'number', optional: true, description: 'Minimum value' },
    { id: 'max', name: 'Max', type: 'number', optional: true, description: 'Maximum value' },
  ],
  outputs: [
    { id: 'result', name: 'Result', type: 'number', description: 'Random number' },
  ],
  properties: [
    {
      id: 'min',
      name: 'Minimum',
      type: 'number',
      default: 0,
      description: 'Minimum value (inclusive)',
    },
    {
      id: 'max',
      name: 'Maximum',
      type: 'number',
      default: 100,
      description: 'Maximum value (inclusive)',
    },
  ],
  execute: (inputs, properties) => {
    const min = inputs.min ?? properties.min ?? 0;
    const max = inputs.max ?? properties.max ?? 100;

    if (typeof min !== 'number' || typeof max !== 'number') {
      return Math.random();
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

// Register all math blocks
export function registerMathBlocks(): void {
  blockRegistry.register(calculateBlock);
  blockRegistry.register(roundBlock);
  blockRegistry.register(randomBlock);
}
