/**
 * Block Registry - Centralized block management system
 */
import { BlockDefinition, BlockCategory } from './types';

export class BlockRegistry {
  private blocks = new Map<string, BlockDefinition>();

  /**
   * Register a new block definition
   */
  register(definition: BlockDefinition): void {
    if (this.blocks.has(definition.id)) {
      console.warn(`Block ${definition.id} is already registered. Overwriting...`);
    }
    this.blocks.set(definition.id, definition);
  }

  /**
   * Get a block definition by ID
   */
  get(id: string): BlockDefinition | undefined {
    return this.blocks.get(id);
  }

  /**
   * Get all registered blocks
   */
  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  /**
   * Get blocks by category
   */
  getByCategory(category: BlockCategory): BlockDefinition[] {
    return this.getAll().filter(block => block.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): BlockCategory[] {
    const categories = new Set<BlockCategory>();
    this.blocks.forEach(block => {
      categories.add(block.category);
    });
    return Array.from(categories);
  }

  /**
   * Search blocks by name or description
   */
  search(query: string): BlockDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(block => 
      block.name.toLowerCase().includes(lowerQuery) ||
      block.description.toLowerCase().includes(lowerQuery)
    );
  }
}

// Export singleton instance
export const blockRegistry = new BlockRegistry();
