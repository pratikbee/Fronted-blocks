/**
 * Custom React Flow node component for blocks
 */
import { Handle, Position } from 'reactflow';
import { Block } from '@/core/models/types';
import './BlockNode.css';

interface BlockNodeProps {
  data: {
    block: Block;
    isValid?: boolean;
    hasError?: boolean;
  };
}

export function BlockNode({ data }: BlockNodeProps) {
  const { block, isValid = true, hasError = false } = data;

  const blockClass = `block-node block-node--${block.type} ${
    hasError ? 'block-node--error' : ''
  } ${!isValid ? 'block-node--invalid' : ''}`;

  return (
    <div className={blockClass}>
      <div className="block-node__header">
        <span className="block-node__type">{block.type}</span>
        {block.label && <span className="block-node__label">{block.label}</span>}
      </div>

      {/* Input handles */}
      <div className="block-node__inputs">
        {block.inputs.map((input) => (
          <Handle
            key={input.id}
            type="target"
            position={Position.Left}
            id={input.id}
            style={{
              top: `${(block.inputs.indexOf(input) + 1) * 25}px`,
            }}
            className="block-node__handle block-node__handle--input"
          />
        ))}
      </div>

      {/* Output handles */}
      <div className="block-node__outputs">
        {block.outputs.map((output) => (
          <Handle
            key={output.id}
            type="source"
            position={Position.Right}
            id={output.id}
            style={{
              top: `${(block.outputs.indexOf(output) + 1) * 25}px`,
            }}
            className="block-node__handle block-node__handle--output"
          />
        ))}
      </div>

      {/* Block content */}
      <div className="block-node__content">
        {block.data.actionName && (
          <div className="block-node__action-name">{block.data.actionName}</div>
        )}
        {block.data.message && (
          <div className="block-node__message">{block.data.message}</div>
        )}
        {block.data.eventName && (
          <div className="block-node__event-name">{block.data.eventName}</div>
        )}
        {block.data.variableName && (
          <div className="block-node__variable-name">
            {block.data.variableName}
            {block.data.initialValue && ` = ${block.data.initialValue}`}
          </div>
        )}
        {block.data.conditionType && (
          <div className="block-node__condition">
            {block.data.leftValue} {block.data.conditionType} {block.data.rightValue}
          </div>
        )}
        {!block.data.actionName && 
         !block.data.message && 
         !block.data.eventName && 
         !block.data.variableName && 
         !block.data.conditionType &&
         Object.keys(block.data).length > 0 && (
          <div className="block-node__data">
            {JSON.stringify(block.data, null, 2)}
          </div>
        )}
        {Object.keys(block.data).length === 0 && (
          <div className="block-node__placeholder">Click to edit</div>
        )}
      </div>
    </div>
  );
}
