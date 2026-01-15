/**
 * Categorized block palette with tabs
 */
import { useState } from 'react';
import { BlockCategory, BlockDefinition } from '@/core/blocks/types';
import { blockRegistry } from '@/core/blocks/registry';
import { BlockFactory } from '@/core/models/block';
import { LogicDocument } from '@/core/crdt/document';
import './CategorizedPalette.css';

interface CategorizedPaletteProps {
  document: LogicDocument;
}

const categories: Array<{ id: BlockCategory; name: string; icon: string; color: string }> = [
  { id: 'triggers', name: 'Triggers', icon: '🎯', color: '#4caf50' },
  { id: 'logic', name: 'Logic', icon: '🔀', color: '#2196f3' },
  { id: 'data', name: 'Data', icon: '📊', color: '#ff9800' },
  { id: 'string', name: 'Strings', icon: '🔤', color: '#9c27b0' },
  { id: 'math', name: 'Math', icon: '🔢', color: '#f44336' },
  { id: 'variables', name: 'Variables', icon: '💾', color: '#607d8b' },
  { id: 'io', name: 'I/O', icon: '🔌', color: '#795548' },
];

export function CategorizedPalette({ document }: CategorizedPaletteProps) {
  const [selectedCategory, setSelectedCategory] = useState<BlockCategory>('triggers');
  const blocks = blockRegistry.getByCategory(selectedCategory);

  const handleAddBlock = (definition: BlockDefinition) => {
    // Create block from definition
    const block = BlockFactory.createFromDefinition(
      definition,
      { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 }
    );
    document.addBlock(block);
  };

  return (
    <div className="categorized-palette">
      <div className="categorized-palette__header">Blocks</div>
      
      <div className="categorized-palette__categories">
        {categories.map((category) => {
          const categoryBlocks = blockRegistry.getByCategory(category.id);
          if (categoryBlocks.length === 0) return null;
          
          return (
            <button
              key={category.id}
              className={`categorized-palette__category ${
                selectedCategory === category.id ? 'categorized-palette__category--active' : ''
              }`}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                borderLeftColor: category.color,
              }}
            >
              <span className="categorized-palette__category-icon">{category.icon}</span>
              <span className="categorized-palette__category-name">{category.name}</span>
              <span className="categorized-palette__category-count">({categoryBlocks.length})</span>
            </button>
          );
        })}
      </div>

      <div className="categorized-palette__blocks">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="categorized-palette__item"
            draggable
            onClick={() => handleAddBlock(block)}
            style={{
              borderLeftColor: block.color,
            }}
          >
            <span className="categorized-palette__item-icon">{block.icon}</span>
            <div className="categorized-palette__item-info">
              <span className="categorized-palette__item-name">{block.name}</span>
              <span className="categorized-palette__item-description">{block.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
