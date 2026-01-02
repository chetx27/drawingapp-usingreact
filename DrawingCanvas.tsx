import React, { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Tool types available in the drawing application
 */
type Tool = 'brush' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'fill';

/**
 * Point interface for coordinates
 */
interface Point {
  x: number;
  y: number;
}

/**
 * Drawing state interface for history management
 */
interface DrawingState {
  imageData: ImageData;
  timestamp: number;
}

/**
 * Props for DrawingCanvas component
 */
interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onSave?: (dataUrl: string) => void;
}

/**
 * Advanced Drawing Canvas Component
 * 
 * Features:
 * - Multiple drawing tools (brush, eraser, shapes)
 * - Undo/Redo functionality with history stack
 * - Recent colors history for quick access
 * - Export to PNG/SVG
 * - Touch and mouse support
 * - Keyboard shortcuts
 * - Performance optimized rendering
 */
const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width = 1200,
  height = 700,
  onSave
}) => {
  // Canvas references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  
  // History management
  const [history, setHistory] = useState<DrawingState[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  
  // Shape drawing state
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  /**
   * Initialize canvas and context
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;

    // Create temporary canvas for shape preview
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCanvasRef.current = tempCanvas;

    // Save initial state
    saveToHistory();
  }, []);

  /**
   * Update context properties when color or lineWidth changes
   */
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
      ctxRef.current.fillStyle = color;
      ctxRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  /**
   * Add color to recent colors history
   */
  const addToRecentColors = useCallback((newColor: string) => {
    setRecentColors((prev) => {
      // Don't add if it's already the most recent color
      if (prev[0] === newColor) return prev;
      
      // Remove the color if it exists elsewhere in the array
      const filtered = prev.filter(c => c !== newColor);
      
      // Add to the beginning and keep only last 8 colors
      return [newColor, ...filtered].slice(0, 8);
    });
  }, []);

  /**
   * Handle color change
   */
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    addToRecentColors(newColor);
  };

  /**
   * Keyboard shortcuts handler
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        } else if (e.key === 's') {
          e.preventDefault();
          exportToPNG();
        }
      }
      
      // Tool shortcuts
      switch(e.key.toLowerCase()) {
        case 'b': setTool('brush'); break;
        case 'e': setTool('eraser'); break;
        case 'r': setTool('rectangle'); break;
        case 'c': setTool('circle'); break;
        case 'l': setTool('line'); break;
        case 'f': setTool('fill'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyStep]);

  /**
   * Save current canvas state to history
   */
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push({ imageData, timestamp: Date.now() });
    
    // Limit history to 50 steps for performance
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryStep(historyStep + 1);
    }
    
    setHistory(newHistory);
  }, [history, historyStep]);

  /**
   * Undo last action
   */
  const undo = useCallback(() => {
    if (historyStep > 0) {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;

      const prevStep = historyStep - 1;
      ctx.putImageData(history[prevStep].imageData, 0, 0);
      setHistoryStep(prevStep);
    }
  }, [history, historyStep]);

  /**
   * Redo last undone action
   */
  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;

      const nextStep = historyStep + 1;
      ctx.putImageData(history[nextStep].imageData, 0, 0);
      setHistoryStep(nextStep);
    }
  }, [history, historyStep]);

  /**
   * Get mouse/touch coordinates relative to canvas
   */
  const getCoordinates = (event: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in event) {
      const touch = event.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
  };

  /**
   * Start drawing or shape creation
   */
  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const point = getCoordinates(event);
    const ctx = ctxRef.current;
    if (!ctx) return;

    setIsDrawing(true);
    setStartPoint(point);

    if (tool === 'brush' || tool === 'eraser') {
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }
  };

  /**
   * Draw on canvas based on selected tool
   */
  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    event.preventDefault();
    
    const point = getCoordinates(event);
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    } else if (startPoint) {
      // Preview shapes on temporary canvas
      drawShapePreview(startPoint, point);
    }
  };

  /**
   * Draw shape preview
   */
  const drawShapePreview = (start: Point, end: Point) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const tempCanvas = tempCanvasRef.current;
    if (!canvas || !ctx || !tempCanvas) return;

    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Clear temporary canvas
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Copy current canvas to temp
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(currentState, 0, 0);

    // Draw preview
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    switch(tool) {
      case 'line':
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        break;
      
      case 'rectangle':
        const width = end.x - start.x;
        const height = end.y - start.y;
        ctx.rect(start.x, start.y, width, height);
        break;
      
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        break;
    }

    ctx.stroke();
  };

  /**
   * Flood fill algorithm implementation
   */
  const floodFill = (startX: number, startY: number) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const targetColor = getPixelColor(pixels, startX, startY, canvas.width);
    const fillColor = hexToRgb(color);

    if (colorsMatch(targetColor, fillColor)) return;

    const stack: Point[] = [{ x: startX, y: startY }];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

      const currentColor = getPixelColor(pixels, x, y, canvas.width);
      if (!colorsMatch(currentColor, targetColor)) continue;

      setPixelColor(pixels, x, y, canvas.width, fillColor);
      visited.add(key);

      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }

    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
  };

  /**
   * Helper: Get pixel color
   */
  const getPixelColor = (pixels: Uint8ClampedArray, x: number, y: number, width: number) => {
    const index = (y * width + x) * 4;
    return {
      r: pixels[index],
      g: pixels[index + 1],
      b: pixels[index + 2],
      a: pixels[index + 3]
    };
  };

  /**
   * Helper: Set pixel color
   */
  const setPixelColor = (
    pixels: Uint8ClampedArray, 
    x: number, 
    y: number, 
    width: number, 
    color: { r: number; g: number; b: number; a: number }
  ) => {
    const index = (y * width + x) * 4;
    pixels[index] = color.r;
    pixels[index + 1] = color.g;
    pixels[index + 2] = color.b;
    pixels[index + 3] = color.a;
  };

  /**
   * Helper: Check if colors match
   */
  const colorsMatch = (c1: any, c2: any) => {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
  };

  /**
   * Helper: Convert hex to RGB
   */
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 255
    } : { r: 0, g: 0, b: 0, a: 255 };
  };

  /**
   * Finish drawing
   */
  const finishDrawing = () => {
    if (!isDrawing) return;
    
    const ctx = ctxRef.current;
    if (!ctx) return;

    if (tool === 'brush' || tool === 'eraser') {
      ctx.closePath();
      ctx.globalCompositeOperation = 'source-over';
    }

    setIsDrawing(false);
    setStartPoint(null);
    saveToHistory();
  };

  /**
   * Handle canvas click for fill tool
   */
  const handleCanvasClick = (event: React.MouseEvent) => {
    if (tool === 'fill') {
      const point = getCoordinates(event);
      floodFill(Math.floor(point.x), Math.floor(point.y));
    }
  };

  /**
   * Clear canvas
   */
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  /**
   * Export canvas to PNG
   */
  const exportToPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    if (onSave) onSave(dataUrl);
  };

  /**
   * Export canvas to SVG
   */
  const exportToSVG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
        <image href="${dataUrl}" width="${canvas.width}" height="${canvas.height}"/>
      </svg>
    `;
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Toolbar */}
      <div style={{
        padding: '15px',
        background: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '15px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* Tools */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {(['brush', 'eraser', 'line', 'rectangle', 'circle', 'fill'] as Tool[]).map(t => (
            <button
              key={t}
              onClick={() => setTool(t)}
              style={{
                padding: '8px 16px',
                background: tool === t ? '#2196F3' : 'white',
                color: tool === t ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: tool === t ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Color Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: '500' }}>Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            style={{
              width: '50px',
              height: '35px',
              border: '2px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Recent Colors */}
        {recentColors.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Recent:</span>
            {recentColors.map((recentColor, index) => (
              <button
                key={index}
                onClick={() => setColor(recentColor)}
                title={`Use color ${recentColor}`}
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: recentColor,
                  border: color === recentColor ? '2px solid #2196F3' : '2px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'transform 0.1s',
                  boxShadow: color === recentColor ? '0 0 0 2px rgba(33, 150, 243, 0.2)' : 'none'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        )}

        {/* Brush Size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: '500' }}>Size: {lineWidth}px</label>
          <input
            type="range"
            min="1"
            max="50"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            style={{ width: '120px' }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
          <button
            onClick={undo}
            disabled={historyStep <= 0}
            style={{
              padding: '8px 16px',
              background: historyStep <= 0 ? '#ddd' : 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: historyStep <= 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            style={{
              padding: '8px 16px',
              background: historyStep >= history.length - 1 ? '#ddd' : 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: historyStep >= history.length - 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Redo
          </button>
          <button
            onClick={clearCanvas}
            style={{
              padding: '8px 16px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
          <button
            onClick={exportToPNG}
            style={{
              padding: '8px 16px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export PNG
          </button>
          <button
            onClick={exportToSVG}
            style={{
              padding: '8px 16px',
              background: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export SVG
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          border: '2px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          cursor: tool === 'fill' ? 'crosshair' : 'crosshair',
          touchAction: 'none'
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={finishDrawing}
        onMouseOut={finishDrawing}
        onClick={handleCanvasClick}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={finishDrawing}
      />

      {/* Help Text */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        background: '#e3f2fd',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#1976d2'
      }}>
        <strong>Keyboard Shortcuts:</strong> Ctrl+Z (Undo) | Ctrl+Y (Redo) | Ctrl+S (Save) | B (Brush) | E (Eraser) | R (Rectangle) | C (Circle) | L (Line) | F (Fill)
      </div>
    </div>
  );
};

export default DrawingCanvas;