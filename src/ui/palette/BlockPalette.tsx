/**
 * Block palette component for dragging blocks onto canvas
 */
import { useCallback } from 'react';
import { BlockType } from '@/core/models/types';
import { BlockFactory } from '@/core/models/block';
import { LogicDocument } from '@/core/crdt/document';
import './BlockPalette.css';

interface BlockPaletteProps {
  document: LogicDocument;
}

const blockTypes: { type: BlockType; label: string; icon: string }[] = [
  { type: 'trigger', label: 'Trigger', icon: '▶' },
  { type: 'action', label: 'Action', icon: '⚡' },
  { type: 'condition', label: 'Condition', icon: '❓' },
  { type: 'transform', label: 'Transform', icon: '🔄' },
  { type: 'variable', label: 'Variable', icon: '📦' },
];

export function BlockPalette({ document }: BlockPaletteProps) {
  const handleDragStart = useCallback(
    (event: React.DragEvent, blockType: BlockType) => {
      // Store block type in drag data
      event.dataTransfer.setData('application/reactflow', blockType);
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  const handleAddBlock = useCallback(
    (blockType: BlockType) => {
      // Add block at center of canvas (will be positioned by user)
      const block = BlockFactory.create(
        blockType,
        { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
        {},
        blockTypes.find((bt) => bt.type === blockType)?.label
      );
      document.addBlock(block);
    },
    [document]
  );

  return (
    <div className="block-palette">
      <div className="block-palette__header">Blocks</div>
      <div className="block-palette__list">
        {blockTypes.map(({ type, label, icon }) => (
          <div
            key={type}
            className="block-palette__item"
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            onClick={() => handleAddBlock(type)}
          >
            <span className="block-palette__icon">{icon}</span>
            <span className="block-palette__label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
