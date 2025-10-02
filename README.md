# React Drawing App

This is a simple drawing app built with React. You can draw on the canvas, change the brush color and size, and clear the canvas.

## Features

- Draw freehand on the canvas with your mouse
- Change brush color using a color picker
- Adjust brush size with a slider
- Clear the canvas with a button

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) and npm installed

### 2. Setup

1. **Create a React app (if you haven't already):**
   ```bash
   npx create-react-app drawing-app
   cd drawing-app
   ```

2. **Add the DrawingCanvas component:**
   - Copy the code from your `drawingapp` file into a new file named `DrawingCanvas.js` inside the `src` folder.

3. **Edit `src/App.js` to use the component:**
   ```jsx
   import React from 'react';
   import DrawingCanvas from './DrawingCanvas';

   function App() {
     return (
       <div>
         <h1>Drawing App</h1>
         <DrawingCanvas />
       </div>
     );
   }

   export default App;
   ```

### 3. Run the App

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the drawing app.

## License

This project is for educational purposes.
