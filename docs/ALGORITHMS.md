# Algorithm Documentation

This document explains the key algorithms implemented in the Advanced React Drawing Application.

## Table of Contents

1. [Freehand Drawing](#freehand-drawing)
2. [Flood Fill Algorithm](#flood-fill-algorithm)
3. [Shape Drawing Algorithms](#shape-drawing-algorithms)
4. [History Management](#history-management)
5. [Performance Optimizations](#performance-optimizations)

## Freehand Drawing

### Overview

Freehand drawing is implemented using the Canvas API's path-based rendering system with continuous line segments.

### Algorithm

```typescript
1. On mouse down:
   - Begin a new path
   - Move to starting coordinates
   - Set isDrawing flag to true

2. On mouse move (while drawing):
   - Draw line to current coordinates
   - Stroke the path

3. On mouse up:
   - Close the path
   - Save to history
   - Set isDrawing flag to false
```

### Complexity

- **Time Complexity:** O(1) per point
- **Space Complexity:** O(n) where n is the number of points in history

### Code Implementation

```typescript
const draw = ({ nativeEvent }) => {
  if (!isDrawing) return;
  const { offsetX, offsetY } = nativeEvent;
  ctxRef.current.lineTo(offsetX, offsetY);
  ctxRef.current.stroke();
};
```

## Flood Fill Algorithm

### Overview

The flood fill algorithm (also known as seed fill) fills connected areas of similar color, similar to the paint bucket tool in image editing software.

### Algorithm: Stack-based Implementation

```
function floodFill(x, y, targetColor, fillColor):
    if targetColor == fillColor:
        return
    
    stack = [(x, y)]
    visited = set()
    
    while stack is not empty:
        currentX, currentY = stack.pop()
        
        if (currentX, currentY) in visited:
            continue
            
        if out of bounds:
            continue
            
        if getColor(currentX, currentY) != targetColor:
            continue
        
        setColor(currentX, currentY, fillColor)
        visited.add((currentX, currentY))
        
        // Add neighboring pixels
        stack.push((currentX + 1, currentY))
        stack.push((currentX - 1, currentY))
        stack.push((currentX, currentY + 1))
        stack.push((currentX, currentY - 1))
```

### Why Stack-based?

We use a stack-based approach instead of recursion to:
- Avoid stack overflow for large fill areas
- Better memory management
- Improved performance

### Complexity

- **Time Complexity:** O(w × h) where w = width, h = height (worst case: entire canvas)
- **Space Complexity:** O(w × h) for visited set (worst case)

### Optimizations

1. **Visited Set:** Track processed pixels to avoid infinite loops
2. **Color Matching:** Early exit if target and fill colors are identical
3. **Bounds Checking:** Skip out-of-bounds coordinates immediately

### Code Implementation

```typescript
const floodFill = (startX: number, startY: number) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const targetColor = getPixelColor(pixels, startX, startY);
  const fillColor = hexToRgb(color);

  const stack: Point[] = [{ x: startX, y: startY }];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const { x, y } = stack.pop()!;
    const key = `${x},${y}`;
    
    if (visited.has(key) || 
        x < 0 || x >= canvas.width || 
        y < 0 || y >= canvas.height) continue;

    const currentColor = getPixelColor(pixels, x, y);
    if (!colorsMatch(currentColor, targetColor)) continue;

    setPixelColor(pixels, x, y, fillColor);
    visited.add(key);

    // Add neighbors
    stack.push({ x: x + 1, y });
    stack.push({ x: x - 1, y });
    stack.push({ x, y: y + 1 });
    stack.push({ x, y: y - 1 });
  }

  ctx.putImageData(imageData, 0, 0);
};
```

## Shape Drawing Algorithms

### Line Drawing

Implements direct line rendering using Canvas API's `lineTo()` method.

```typescript
ctx.beginPath();
ctx.moveTo(startX, startY);
ctx.lineTo(endX, endY);
ctx.stroke();
```

### Rectangle Drawing

```typescript
const width = endX - startX;
const height = endY - startY;
ctx.rect(startX, startY, width, height);
ctx.stroke();
```

### Circle Drawing

Uses the distance formula to calculate radius:

```typescript
const radius = Math.sqrt(
  Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
);
ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
ctx.stroke();
```

**Formula:** r = √((x₂ - x₁)² + (y₂ - y₁)²)

### Shape Preview System

Shapes are previewed in real-time while drawing:

1. Store canvas state before preview
2. Draw preview shape on top
3. On mouse move, restore state and redraw preview
4. On mouse up, finalize shape and save to history

## History Management

### Data Structure

```typescript
interface DrawingState {
  imageData: ImageData;
  timestamp: number;
}

history: DrawingState[] = [];
historyStep: number = -1;
```

### Undo/Redo Algorithm

```
Undo:
  if historyStep > 0:
    historyStep -= 1
    restore history[historyStep]

Redo:
  if historyStep < history.length - 1:
    historyStep += 1
    restore history[historyStep]

Save to History:
  // Remove any "future" states
  history = history[0..historyStep+1]
  history.push(currentState)
  historyStep += 1
  
  // Limit history size
  if history.length > MAX_STEPS:
    history.shift()
  else:
    historyStep += 1
```

### Memory Management

- Maximum 50 history steps to prevent memory bloat
- Each step stores full ImageData (4 bytes per pixel)
- Memory usage: width × height × 4 bytes × 50 steps
- Example: 1200×700 canvas = ~168 MB for full history

### Complexity

- **Undo/Redo:** O(w × h) - must copy entire canvas
- **Save:** O(1) - push to array (amortized)
- **Space:** O(w × h × n) where n = history size

## Performance Optimizations

### 1. Canvas Context Options

```typescript
context.getContext('2d', { willReadFrequently: true })
```

Optimizes for frequent `getImageData()` calls.

### 2. Debouncing

For resize and input events:

```typescript
const debouncedResize = debounce(() => {
  resizeCanvas();
}, 250);
```

### 3. RequestAnimationFrame

For smooth drawing (optional enhancement):

```typescript
let animationId: number;
const draw = () => {
  // Drawing logic
  animationId = requestAnimationFrame(draw);
};
```

### 4. Path Optimization

Begin and close paths properly:

```typescript
ctx.beginPath();  // Start new path
// ... drawing operations
ctx.closePath();  // Close path when done
```

### 5. Touch Event Optimization

```typescript
onTouchMove={(e) => {
  e.preventDefault();  // Prevent scrolling
  draw(e);
}}
```

## Color Conversion Algorithms

### Hex to RGB

```typescript
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 255
  } : { r: 0, g: 0, b: 0, a: 255 };
}
```

### RGB to Hex

```typescript
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}
```

## Coordinate Transformation

### Mouse/Touch to Canvas Coordinates

```typescript
function getCanvasCoordinates(event: MouseEvent | TouchEvent): Point {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  return { x, y };
}
```

Accounts for:
- Canvas position on page
- CSS transformations
- Scroll offset (via `getBoundingClientRect()`)

## Future Algorithm Enhancements

### 1. Bezier Curve Smoothing

Smooth freehand lines using Catmull-Rom splines:

```
For points p0, p1, p2, p3:
  Curve from p1 to p2 controlled by p0 and p3
```

### 2. Brush Dynamics

Pressure-sensitive drawing (with Pointer Events):

```typescript
lineWidth = baseWidth * event.pressure;
```

### 3. Scanline Fill

More efficient flood fill for large areas:

```
For each row:
  Find left and right boundaries
  Fill entire scanline at once
  Check rows above and below
```

### 4. Anti-aliasing

Custom anti-aliasing for smoother edges:

```
For edge pixels:
  Calculate coverage percentage
  Blend with background color
```

## References

- [Canvas API Specification](https://html.spec.whatwg.org/multipage/canvas.html)
- [Flood Fill Algorithm - Wikipedia](https://en.wikipedia.org/wiki/Flood_fill)
- [Bresenham's Line Algorithm](https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm)
- [Computer Graphics: Principles and Practice](https://www.amazon.com/Computer-Graphics-Principles-Practice-3rd/dp/0321399528)

---

*Last Updated: December 2025*