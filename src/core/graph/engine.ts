/**
 * Graph Engine - O(V+E) algorithms for cycle detection and validation
 */
import { Block, Connection } from '../models/types';
import { Graph, Cycle, ValidationResult } from './types';

export class GraphEngine {
  /**
   * Build a graph structure from blocks and connections
   * Time Complexity: O(V + E)
   */
  buildGraph(blocks: Map<string, Block>, connections: Connection[]): Graph {
    const nodes = new Map(blocks);
    const edges = new Map<string, Connection[]>();
    const adjacencyList = new Map<string, string[]>();

    // Initialize adjacency list and edges map
    for (const blockId of blocks.keys()) {
      adjacencyList.set(blockId, []);
      edges.set(blockId, []);
    }

    // Build edges and adjacency list
    for (const conn of connections) {
      // Add to edges map
      const sourceEdges = edges.get(conn.sourceBlockId) || [];
      sourceEdges.push(conn);
      edges.set(conn.sourceBlockId, sourceEdges);

      // Add to adjacency list
      const adj = adjacencyList.get(conn.sourceBlockId) || [];
      if (!adj.includes(conn.targetBlockId)) {
        adj.push(conn.targetBlockId);
        adjacencyList.set(conn.sourceBlockId, adj);
      }
    }

    return { nodes, edges, adjacencyList };
  }

  /**
   * Detect cycles in the graph using DFS
   * Time Complexity: O(V + E)
   */
  detectCycles(graph: Graph): Cycle[] {
    const cycles: Cycle[] = [];
    const color = new Map<string, 'white' | 'gray' | 'black'>();
    const parent = new Map<string, string>();
    const path = new Map<string, string[]>(); // Track path to each node

    // Initialize colors and paths
    for (const nodeId of graph.nodes.keys()) {
      color.set(nodeId, 'white');
      path.set(nodeId, []);
    }

    // DFS to detect cycles
    const dfs = (nodeId: string, currentPath: string[]): void => {
      color.set(nodeId, 'gray');
      const newPath = [...currentPath, nodeId];
      path.set(nodeId, newPath);

      const neighbors = graph.adjacencyList.get(nodeId) || [];
      for (const neighborId of neighbors) {
        const neighborColor = color.get(neighborId);
        
        if (neighborColor === 'gray') {
          // Cycle detected! Find the cycle path
          const cycleStartIndex = newPath.indexOf(neighborId);
          const cyclePath = [
            ...newPath.slice(cycleStartIndex),
            neighborId,
          ];
          cycles.push({
            path: cyclePath,
            message: `Cycle detected: ${cyclePath.join(' → ')}`,
          });
        } else if (neighborColor === 'white') {
          parent.set(neighborId, nodeId);
          dfs(neighborId, newPath);
        }
      }

      color.set(nodeId, 'black');
    };

    // Run DFS on all white nodes (handles disconnected components)
    for (const nodeId of graph.nodes.keys()) {
      if (color.get(nodeId) === 'white') {
        dfs(nodeId, []);
      }
    }

    return cycles;
  }

  /**
   * Find entry nodes (nodes with no incoming edges)
   * Time Complexity: O(V + E)
   */
  private findEntryNodes(graph: Graph): string[] {
    const inDegree = new Map<string, number>();

    // Initialize in-degrees
    for (const nodeId of graph.nodes.keys()) {
      inDegree.set(nodeId, 0);
    }

    // Calculate in-degrees
    for (const connections of graph.edges.values()) {
      for (const conn of connections) {
        const degree = inDegree.get(conn.targetBlockId) || 0;
        inDegree.set(conn.targetBlockId, degree + 1);
      }
    }

    // Return nodes with in-degree 0
    return Array.from(inDegree.entries())
      .filter(([_, degree]) => degree === 0)
      .map(([nodeId]) => nodeId);
  }

  /**
   * Validate that all nodes are reachable from entry nodes
   * Time Complexity: O(V + E)
   */
  validatePaths(graph: Graph): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const cycles = this.detectCycles(graph);

    // Check for cycles
    if (cycles.length > 0) {
      errors.push(`Found ${cycles.length} cycle(s) in the graph`);
    }

    // Find entry nodes (nodes with no incoming edges)
    const entryNodes = this.findEntryNodes(graph);

    if (entryNodes.length === 0 && graph.nodes.size > 0) {
      // All nodes have incoming edges - might be a cycle or disconnected
      if (cycles.length === 0) {
        warnings.push('No entry nodes found - graph may be disconnected');
      }
    }

    // BFS from entry nodes to find reachable nodes
    const visited = new Set<string>();
    const queue: string[] = [...entryNodes];

    // Mark entry nodes as visited
    for (const entryNode of entryNodes) {
      visited.add(entryNode);
    }

    // BFS traversal
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const neighbors = graph.adjacencyList.get(nodeId) || [];

      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      }
    }

    // Check for unreachable nodes
    const unreachableNodes = Array.from(graph.nodes.keys())
      .filter(id => !visited.has(id));

    if (unreachableNodes.length > 0) {
      warnings.push(
        `Found ${unreachableNodes.length} unreachable node(s): ${unreachableNodes.join(', ')}`
      );
    }

    const isValid = cycles.length === 0 && unreachableNodes.length === 0;

    return {
      isValid,
      cycles,
      unreachableNodes,
      errors,
      warnings,
    };
  }

  /**
   * Get execution order using topological sort (Kahn's algorithm)
   * Time Complexity: O(V + E)
   * Returns empty array if cycles are detected
   */
  getExecutionOrder(graph: Graph): string[] {
    // First check for cycles
    const cycles = this.detectCycles(graph);
    if (cycles.length > 0) {
      return []; // Cannot determine execution order with cycles
    }

    const inDegree = new Map<string, number>();
    const queue: string[] = [];
    const result: string[] = [];

    // Calculate in-degrees
    for (const nodeId of graph.nodes.keys()) {
      inDegree.set(nodeId, 0);
    }

    for (const connections of graph.edges.values()) {
      for (const conn of connections) {
        const degree = inDegree.get(conn.targetBlockId) || 0;
        inDegree.set(conn.targetBlockId, degree + 1);
      }
    }

    // Find nodes with no incoming edges
    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    // Process queue
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);

      const neighbors = graph.adjacencyList.get(nodeId) || [];
      for (const neighborId of neighbors) {
        const degree = (inDegree.get(neighborId) || 0) - 1;
        inDegree.set(neighborId, degree);
        if (degree === 0) {
          queue.push(neighborId);
        }
      }
    }

    // Check if all nodes were processed
    if (result.length !== graph.nodes.size) {
      // This shouldn't happen if cycle detection worked, but handle it anyway
      return [];
    }

    return result;
  }
}
