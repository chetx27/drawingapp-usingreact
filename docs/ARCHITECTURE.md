# System Architecture

## Overview

The Advanced React Drawing Application follows a modular, component-based architecture designed for scalability, maintainability, and performance.

## Architecture Diagram

```
┌───────────────────────────────────────────┐
│            User Interface Layer              │
│                                             │
│  ┌───────────────────────────────────┐  │
│  │         DrawingCanvas            │  │
│  │  (Main Component)                │  │
│  └───────────────────────────────────┘  │
│         │                │               │
│    ┌────┴────────────┴─────────────┐  │
│    │         │                │       │  │
│  Toolbar  Canvas Element    Controls   │
└───────────────────────────────────────────┘
            │
┌───────────┴──────────────────────────────┐
│         Application Logic Layer          │
│                                           │
│  ┌─────────────────────────────────┐  │
│  │        Custom Hooks            │  │
│  │                                 │  │
│  │  - useCanvas()                │  │
│  │  - useHistory()               │  │
│  │  - useTools()                 │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────────┘
            │
┌───────────┴──────────────────────────────┐
│         Utility & Helper Layer           │
│                                           │
│  ┌─────────────────────────────────┐  │
│  │      Algorithms              │  │
│  │  - Flood Fill                │  │
│  │  - Shape Drawing             │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │      Exporters               │  │
│  │  - PNG Export                │  │
│  │  - SVG Export                │  │
│  │  - JSON Export               │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────────┘
            │
┌───────────┴──────────────────────────────┐
│         Browser APIs Layer              │
│                                           │
│  Canvas 2D API | DOM Events | Storage   │
└───────────────────────────────────────────┘
```

## Core Components

### DrawingCanvas Component

**Responsibility:** Main orchestrator for the drawing application

**Key Features:**
- Manages canvas rendering
- Handles user interactions
- Coordinates tools and state
- Manages history stack

**Props Interface:**
```typescript
interface DrawingCanvasProps {
  width?: number;        // Canvas width (default: 1200)
  height?: number;       // Canvas height (default: 700)
  onSave?: (dataUrl: string) => void;  // Callback on save
}
```

### State Management

**Local State (useState):**
- `isDrawing`: boolean - Current drawing state
- `tool`: Tool - Active tool selection
- `color`: string - Current brush color
- `lineWidth`: number - Brush size
- `history`: DrawingState[] - Undo/redo stack
- `historyStep`: number - Current position in history
- `startPoint`: Point | null - Shape drawing start point

**Refs (useRef):**
- `canvasRef`: Canvas element reference
- `ctxRef`: 2D rendering context reference
- `tempCanvasRef`: Temporary canvas for previews

## Data Flow

### User Interaction Flow

```
User Action
    ↓
Event Handler
    ↓
State Update
    ↓
Canvas Rendering
    ↓
History Save
```

### Drawing Flow Example

```typescript
1. User clicks mouse down
   → startDrawing() called
   → setIsDrawing(true)
   → Canvas context begins path

2. User moves mouse
   → draw() called (if isDrawing)
   → Line drawn to current position
   → Canvas updated in real-time

3. User releases mouse
   → finishDrawing() called
   → setIsDrawing(false)
   → Canvas state saved to history
```

## Design Patterns

### 1. Composite Pattern

The application uses composition to build complex UI from simple components:

```
DrawingCanvas
  ├── Toolbar
  │   ├── ToolButtons
  │   ├── ColorPicker
  │   └── SizeSlider
  ├── Canvas
  └── Controls
      ├── UndoButton
      ├── RedoButton
      └── ExportButtons
```

### 2. Strategy Pattern

Different drawing tools implement the same interface:

```typescript
interface DrawingTool {
  start(point: Point): void;
  draw(point: Point): void;
  finish(): void;
}
```

### 3. Command Pattern

Undo/redo functionality uses command pattern:

```typescript
interface Command {
  execute(): void;
  undo(): void;
}
```

### 4. Observer Pattern

React's state management implements observer pattern:

```typescript
// State change notifies all subscribers
useEffect(() => {
  // Observe color changes
  updateContextColor(color);
}, [color]);
```

## Performance Considerations

### Rendering Optimization

1. **Canvas Context Caching**
   ```typescript
   const ctxRef = useRef<CanvasRenderingContext2D>(null);
   ```
   Avoids repeated context retrieval

2. **Conditional Rendering**
   ```typescript
   if (!isDrawing) return;
   ```
   Skip processing when not needed

3. **History Size Limit**
   ```typescript
   if (history.length > 50) history.shift();
   ```
   Prevents memory bloat

### Memory Management

**ImageData Storage:**
- Each history entry: width × height × 4 bytes
- Example (1200×700): ~3.4 MB per state
- Max 50 states: ~170 MB total

**Optimization Strategy:**
- Limit history size
- Clear old entries automatically
- Use compression for export (future)

## Event Handling

### Mouse Events

```typescript
onMouseDown  → startDrawing()
onMouseMove  → draw()
onMouseUp    → finishDrawing()
onMouseOut   → finishDrawing()
```

### Touch Events

```typescript
onTouchStart → startDrawing()
onTouchMove  → draw()
onTouchEnd   → finishDrawing()
```

### Keyboard Events

```typescript
Ctrl+Z       → undo()
Ctrl+Y       → redo()
Ctrl+S       → exportToPNG()
B, E, R, etc → setTool()
```

## Error Handling

### Canvas Context Validation

```typescript
const ctx = canvasRef.current?.getContext('2d');
if (!ctx) {
  console.error('Canvas context not available');
  return;
}
```

### Graceful Degradation

```typescript
try {
  // Attempt operation
  canvas.toDataURL('image/png');
} catch (error) {
  console.error('Export failed:', error);
  // Fallback behavior
}
```

## Testing Architecture

### Unit Tests
- Component rendering
- Event handlers
- Utility functions
- Algorithms

### Integration Tests
- Tool switching
- Drawing operations
- Undo/redo workflow
- Export functionality

### E2E Tests
- Complete user workflows
- Cross-browser compatibility
- Performance benchmarks

## Security Considerations

1. **Input Validation**
   - Validate color hex codes
   - Check coordinate bounds
   - Sanitize user input

2. **Canvas Tainting**
   - Respect CORS policies
   - Handle tainted canvas errors

3. **XSS Prevention**
   - No innerHTML usage
   - Sanitize any dynamic content

## Scalability

### Horizontal Scaling
- Component modularity
- Easy to add new tools
- Plugin architecture (future)

### Performance Scaling
- Efficient algorithms
- Memory management
- Lazy loading (future)

## Browser Compatibility

**Supported Browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

**Required APIs:**
- Canvas 2D Context
- ES6+ JavaScript
- DOM Events Level 3
- File API (for export)

## Future Enhancements

1. **Layer System**
   - Multiple canvas layers
   - Layer blending modes
   - Layer opacity

2. **Collaborative Features**
   - WebRTC integration
   - Real-time sync
   - User cursors

3. **Advanced Tools**
   - Selection tools
   - Transform operations
   - Filters and effects

4. **State Persistence**
   - localStorage integration
   - Cloud storage sync
   - Auto-save

---

*Architecture designed for extensibility and maintainability*