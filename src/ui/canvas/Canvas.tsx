/**
 * Main canvas component using React Flow
 */
import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { LogicDocument } from '@/core/crdt/document';
import { useYjsSync } from '../hooks/useYjsSync';
import { useGraphValidation } from '../hooks/useGraphValidation';
import { BlockNode } from './BlockNode';
import { ConnectionFactory } from '@/core/models/connection';
import { BlockPropertiesPanel } from '../properties/BlockPropertiesPanel';
import { Block } from '@/core/models/types';

interface CanvasProps {
  document: LogicDocument;
}

const nodeTypes: NodeTypes = {
  block: BlockNode,
};

export function Canvas({ document }: CanvasProps) {
  const { blocks, connections } = useYjsSync(document);
  const validation = useGraphValidation(blocks, connections);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  // Convert blocks to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    return Array.from(blocks.values()).map((block) => {
      const hasError = validation.cycles.some((cycle) =>
        cycle.path.includes(block.id)
      );
      const isUnreachable = validation.unreachableNodes.includes(block.id);

      return {
        id: block.id,
        type: 'block',
        position: block.position,
        data: {
          block,
          isValid: validation.isValid,
          hasError: hasError || isUnreachable,
        },
      };
    });
  }, [blocks, validation]);

  // Convert connections to React Flow edges
  const edges: Edge[] = useMemo(() => {
    return connections.map((conn) => ({
      id: conn.id,
      source: conn.sourceBlockId,
      target: conn.targetBlockId,
      sourceHandle: conn.sourcePortId,
      targetHandle: conn.targetPortId,
      style: {
        stroke: validation.cycles.some((cycle) =>
          cycle.path.includes(conn.sourceBlockId) &&
          cycle.path.includes(conn.targetBlockId)
        )
          ? '#f44336'
          : '#2196f3',
        strokeWidth: 2,
      },
    }));
  }, [connections, validation]);

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const conn = ConnectionFactory.create(
          connection.source,
          connection.sourceHandle || 'output',
          connection.target,
          connection.targetHandle || 'input'
        );

        const validationResult = ConnectionFactory.validate(conn);
        if (validationResult.isValid) {
          document.addConnection(conn);
        } else {
          console.warn('Invalid connection:', validationResult.error);
        }
      }
    },
    [document]
  );

  // Handle node position changes
  const onNodesChange = useCallback(
    (changes: any[]) => {
      for (const change of changes) {
        if (change.type === 'position' && change.position) {
          const block = blocks.get(change.id);
          if (block) {
            document.updateBlock(change.id, {
              position: change.position,
            });
          }
        }
      }
    },
    [document, blocks]
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const block = blocks.get(node.id);
      if (block) {
        setSelectedBlock(block);
      }
    },
    [blocks]
  );

  // Handle pane click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedBlock(null);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        
        {/* Validation status */}
        {!validation.isValid && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: selectedBlock ? 320 : 10,
              background: '#fff3e0',
              border: '1px solid #ff9800',
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '12px',
              zIndex: 1000,
              transition: 'right 0.3s',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              Validation Issues:
            </div>
            {validation.errors.map((error, i) => (
              <div key={i} style={{ color: '#f44336' }}>
                {error}
              </div>
            ))}
            {validation.warnings.map((warning, i) => (
              <div key={i} style={{ color: '#ff9800' }}>
                {warning}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Properties Panel */}
      {selectedBlock && (
        <BlockPropertiesPanel
          block={selectedBlock}
          document={document}
          onClose={() => setSelectedBlock(null)}
        />
      )}
    </div>
  );
}
