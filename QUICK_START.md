# Quick Start Guide - Key Decisions & Dependencies

## 🎯 Core Technology Choices

| Component               | Choice      | Rationale                                                               |
| ----------------------- | ----------- | ----------------------------------------------------------------------- |
| **CRDT Library**        | Y.js        | Better performance, native Map/Array support, mature WebRTC integration |
| **UI Framework**        | React       | Component-based, large ecosystem, good TypeScript support               |
| **Graph Visualization** | React Flow  | Built for node-based editors, handles connections well                  |
| **Drag & Drop**         | @dnd-kit    | Modern, performant, accessible                                          |
| **State Management**    | Zustand     | Lightweight, works well with Y.js                                       |
| **Persistence**         | y-indexeddb | Offline-first storage                                                   |
| **P2P Sync**            | y-webrtc    | Direct peer connections, no backend needed                              |

---

## 📦 Required Dependencies

### Core CRDT & Sync

```json
{
  "dependencies": {
    "yjs": "^13.6.0",
    "y-indexeddb": "^10.0.0",
    "y-webrtc": "^10.0.0"
  }
}
```

### UI Components

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.0",
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^8.0.0",
    "zustand": "^4.4.0"
  }
}
```

### Utilities

```json
{
  "dependencies": {
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/uuid": "^9.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

---

## 🏗️ Architecture Decision Tree

```
Start: Visual Logic Builder
│
├─ Need Collaboration? → YES
│  │
│  ├─ Need Offline Support? → YES
│  │  │
│  │  └─→ Use CRDT (Y.js)
│  │      │
│  │      ├─ Sync Method?
│  │      │  ├─ P2P (No Backend) → y-webrtc ✅
│  │      │  └─ Centralized → y-websocket
│  │      │
│  │      └─ Persistence?
│  │          └─→ y-indexeddb ✅
│  │
│  └─ Need Real-time? → YES
│     └─→ Y.js handles this automatically
│
├─ Need Graph Validation? → YES
│  │
│  └─→ Custom GraphEngine
│      ├─ Cycle Detection → DFS (O(V+E))
│      ├─ Path Validation → BFS (O(V+E))
│      └─ Execution Order → Topological Sort (O(V+E))
│
└─ Need Visual Editor? → YES
   │
   └─→ React Flow
       ├─ Nodes → Block Components
       ├─ Edges → Connection Lines
       └─ Interactions → Drag & Drop
```

---

## 🔄 Data Flow Summary

```
User Action
    ↓
React Component (UI)
    ↓
Y.js Transaction (CRDT)
    ↓
┌───────────┬───────────┐
│           │           │
IndexedDB   WebRTC      GraphEngine
(Local)     (P2P)       (Validate)
│           │           │
└───────────┴───────────┘
    ↓
UI Update (Feedback)
```

---

## 🎨 Block System Design

### Block Types

```typescript
type BlockType =
  | "trigger" // Entry point (e.g., "On Click")
  | "action" // Side effect (e.g., "Send Email")
  | "condition" // Logic gate (e.g., "If X > Y")
  | "transform" // Data processing (e.g., "Format Date")
  | "variable"; // State storage (e.g., "Set Counter")
```

### Block Structure

```typescript
Block {
  id: string              // UUID
  type: BlockType
  position: {x, y}        // Canvas coordinates
  data: {...}             // Block-specific config
  inputs: Port[]          // Input ports (0-N)
  outputs: Port[]         // Output ports (1-N)
}
```

### Connection Rules

- **Trigger blocks**: Can only have outputs (no inputs)
- **Action blocks**: Must have at least 1 input
- **Condition blocks**: 1 input, 2 outputs (true/false)
- **Cycles**: Detected and prevented by GraphEngine

---

## 🔐 Sync Strategy Summary

### Conflict Resolution (Automatic via CRDT)

| Operation         | Conflict Resolution          |
| ----------------- | ---------------------------- |
| Create Block      | Unique IDs prevent conflicts |
| Update Block      | Last-write-wins per field    |
| Delete Block      | Idempotent deletion          |
| Create Connection | Unique connection IDs        |
| Move Block        | Last-write-wins (or average) |

### Offline → Online Flow

1. **Offline**: Changes stored in IndexedDB
2. **Online**: Y.js syncs with peers via WebRTC
3. **Merge**: CRDT automatically merges changes
4. **Validate**: GraphEngine validates merged state

---

## ⚡ Performance Targets

| Metric                | Target              | How to Achieve          |
| --------------------- | ------------------- | ----------------------- |
| **Cycle Detection**   | <100ms (1000 nodes) | O(V+E) DFS algorithm    |
| **Sync Latency**      | <200ms              | Direct WebRTC P2P       |
| **UI Responsiveness** | 60 FPS              | Virtualized rendering   |
| **Memory Usage**      | <50MB (1000 blocks) | Efficient Y.js encoding |

---

## 🚦 Implementation Phases

### ✅ Phase 1: Foundation (Week 1)

- [ ] Install dependencies
- [ ] Set up Y.js document
- [ ] Implement GraphEngine
- [ ] Write unit tests

### ✅ Phase 2: UI Core (Week 2)

- [ ] React Flow canvas
- [ ] Block components
- [ ] Drag & drop
- [ ] Connection drawing

### ✅ Phase 3: CRDT Integration (Week 3)

- [ ] Wire Y.js to React
- [ ] IndexedDB persistence
- [ ] Test offline mode

### ✅ Phase 4: P2P Sync (Week 4)

- [ ] WebRTC provider
- [ ] Peer discovery
- [ ] Multi-user testing

### ✅ Phase 5: Validation (Week 5)

- [ ] Real-time cycle detection
- [ ] Visual feedback
- [ ] Performance optimization

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] GraphEngine.detectCycles()
- [ ] GraphEngine.validatePaths()
- [ ] GraphEngine.getExecutionOrder()
- [ ] CRDT merge scenarios

### Integration Tests

- [ ] Y.js sync between 2 instances
- [ ] Offline → Online transition
- [ ] Conflict resolution

### E2E Tests

- [ ] 10+ users editing simultaneously
- [ ] Network disconnection
- [ ] Large graph (1000+ blocks)

---

## 🎯 Key Design Principles

1. **Offline-First**: Everything works without network
2. **Eventual Consistency**: CRDTs guarantee convergence
3. **Client-Side Validation**: No server round-trips
4. **O(V+E) Algorithms**: Scalable graph operations
5. **Zero Conflicts**: CRDTs prevent merge conflicts

---

## 🚨 Known Challenges & Solutions

| Challenge         | Solution                                |
| ----------------- | --------------------------------------- |
| **NAT Traversal** | STUN/TURN servers or relay fallback     |
| **Large Graphs**  | Virtualization + incremental validation |
| **Block Types**   | Plugin architecture with registry       |
| **Undo/Redo**     | Y.js built-in undo manager              |

---

## 📚 Next Steps

1. **Review Architecture**: Read `ARCHITECTURE.md`
2. **Review Implementation**: Read `IMPLEMENTATION_PLAN.md`
3. **Install Dependencies**: Run `npm install`
4. **Start Phase 1**: Build foundation layer

---

## 🔗 Key Resources

- [Y.js Docs](https://docs.yjs.dev/)
- [React Flow Docs](https://reactflow.dev/)
- [CRDT Explained](https://crdt.tech/)
- [WebRTC Guide](https://webrtc.org/getting-started/overview)
