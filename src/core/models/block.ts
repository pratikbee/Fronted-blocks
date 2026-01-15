/**
 * Block factory and utilities
 */
import { v4 as uuidv4 } from 'uuid';
import { Block, BlockType, Port } from './types';

export class BlockFactory {
  /**
   * Create a new block with default values
   */
  static create(
    type: BlockType,
    position: { x: number; y: number },
    data: Record<string, any> = {},
    label?: string
  ): Block {
    const id = uuidv4();
    const { inputs, outputs } = this.getDefaultPorts(type);

    return {
      id,
      type,
      position,
      data,
      inputs,
      outputs,
      label: label || this.getDefaultLabel(type),
      version: 0,
    };
  }

  /**
   * Get default ports for a block type
   */
  private static getDefaultPorts(type: BlockType): { inputs: Port[]; outputs: Port[] } {
    switch (type) {
      case 'trigger':
        return {
          inputs: [],
          outputs: [{ id: 'output', name: 'output', type: 'any' }],
        };
      case 'action':
        return {
          inputs: [{ id: 'input', name: 'input', type: 'any' }],
          outputs: [{ id: 'output', name: 'output', type: 'any' }],
        };
      case 'condition':
        return {
          inputs: [{ id: 'input', name: 'input', type: 'any' }],
          outputs: [
            { id: 'true', name: 'true', type: 'boolean' },
            { id: 'false', name: 'false', type: 'boolean' },
          ],
        };
      case 'transform':
        return {
          inputs: [{ id: 'input', name: 'input', type: 'any' }],
          outputs: [{ id: 'output', name: 'output', type: 'any' }],
        };
      case 'variable':
        return {
          inputs: [{ id: 'input', name: 'input', type: 'any' }],
          outputs: [{ id: 'output', name: 'output', type: 'any' }],
        };
      default:
        return { inputs: [], outputs: [] };
    }
  }

  /**
   * Get default label for a block type
   */
  private static getDefaultLabel(type: BlockType): string {
    const labels: Record<BlockType, string> = {
      trigger: 'Trigger',
      action: 'Action',
      condition: 'Condition',
      transform: 'Transform',
      variable: 'Variable',
    };
    return labels[type];
  }

  /**
   * Clone a block with a new ID and position
   */
  static clone(block: Block, newPosition: { x: number; y: number }): Block {
    return {
      ...block,
      id: uuidv4(),
      position: newPosition,
      version: 0,
    };
  }

  /**
   * Create a block from a block definition
   */
  static createFromDefinition(
    definition: any,
    position: { x: number; y: number },
    data: Record<string, any> = {}
  ): Block {
    const id = uuidv4();
    
    // Convert port definitions to ports
    const inputs = definition.inputs?.map((port: any) => ({
      id: port.id,
      name: port.name,
      type: port.type,
    })) || [];

    const outputs = definition.outputs?.map((port: any) => ({
      id: port.id,
      name: port.name,
      type: port.type,
    })) || [];

    // Set default property values
    const blockData: Record<string, any> = { ...data };
    if (definition.properties) {
      for (const prop of definition.properties) {
        if (prop.default !== undefined && !(prop.id in blockData)) {
          blockData[prop.id] = prop.default;
        }
      }
    }

    return {
      id,
      type: definition.type as BlockType,
      position,
      data: blockData,
      inputs,
      outputs,
      label: definition.name,
      version: 0,
    };
  }
}
