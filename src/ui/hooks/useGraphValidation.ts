/**
 * React hook for real-time graph validation
 */
import { useMemo } from 'react';
import { GraphEngine } from '@/core/graph/engine';
import { ValidationResult } from '@/core/graph/types';
import { Block, Connection } from '@/core/models/types';

export function useGraphValidation(
  blocks: Map<string, Block>,
  connections: Connection[]
): ValidationResult {
  const validation = useMemo(() => {
    const engine = new GraphEngine();
    const graph = engine.buildGraph(blocks, connections);
    return engine.validatePaths(graph);
  }, [blocks, connections]);

  return validation;
}
