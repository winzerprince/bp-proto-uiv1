'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ZoomIn, ZoomOut, Move, Pencil, Eraser, Square, Circle, Undo, Redo, RotateCcw, Download } from 'lucide-react';

export function ImageViewer({ src, alt = 'Image', onClose }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState('pan'); // 'pan', 'draw', 'erase', 'rect', 'circle'
  const [color, setColor] = useState('#ef4444');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawings, setDrawings] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawStartRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctxRef.current = ctx;
      
      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Redraw all drawings
      redrawCanvas();
    }
  }, [drawings, zoom, pan]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
      };
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const redrawCanvas = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawings.forEach(drawing => {
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.lineWidth / zoom;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (drawing.type === 'path') {
        ctx.beginPath();
        drawing.points.forEach((point, index) => {
          const x = point.x * zoom + pan.x;
          const y = point.y * zoom + pan.y;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      } else if (drawing.type === 'rect') {
        const x = drawing.x * zoom + pan.x;
        const y = drawing.y * zoom + pan.y;
        const w = drawing.width * zoom;
        const h = drawing.height * zoom;
        ctx.strokeRect(x, y, w, h);
      } else if (drawing.type === 'circle') {
        const x = drawing.x * zoom + pan.x;
        const y = drawing.y * zoom + pan.y;
        const r = drawing.radius * zoom;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  }, [drawings, zoom, pan]);

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  };

  const handleMouseDown = (e) => {
    if (tool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (tool === 'draw' || tool === 'erase') {
      setIsDrawing(true);
      const point = getCanvasPoint(e);
      drawStartRef.current = point;
      const newDrawing = {
        type: 'path',
        points: [point],
        color: tool === 'erase' ? '#ffffff' : color,
        lineWidth: tool === 'erase' ? lineWidth * 3 : lineWidth
      };
      setDrawings(prev => [...prev, newDrawing]);
      addToHistory([...drawings, newDrawing]);
    } else if (tool === 'rect' || tool === 'circle') {
      setIsDrawing(true);
      drawStartRef.current = getCanvasPoint(e);
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && tool === 'pan') {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (isDrawing && (tool === 'draw' || tool === 'erase')) {
      const point = getCanvasPoint(e);
      setDrawings(prev => {
        const newDrawings = [...prev];
        const lastDrawing = newDrawings[newDrawings.length - 1];
        lastDrawing.points.push(point);
        return newDrawings;
      });
    }
  };

  const handleMouseUp = (e) => {
    if (tool === 'pan') {
      setIsPanning(false);
    } else if (isDrawing && (tool === 'rect' || tool === 'circle')) {
      const endPoint = getCanvasPoint(e);
      const startPoint = drawStartRef.current;
      
      if (tool === 'rect') {
        const newDrawing = {
          type: 'rect',
          x: Math.min(startPoint.x, endPoint.x),
          y: Math.min(startPoint.y, endPoint.y),
          width: Math.abs(endPoint.x - startPoint.x),
          height: Math.abs(endPoint.y - startPoint.y),
          color,
          lineWidth
        };
        setDrawings(prev => [...prev, newDrawing]);
        addToHistory([...drawings, newDrawing]);
      } else if (tool === 'circle') {
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        const newDrawing = {
          type: 'circle',
          x: startPoint.x,
          y: startPoint.y,
          radius,
          color,
          lineWidth
        };
        setDrawings(prev => [...prev, newDrawing]);
        addToHistory([...drawings, newDrawing]);
      }
    }
    setIsDrawing(false);
  };

  const addToHistory = (newDrawings) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newDrawings);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setDrawings(history[historyIndex - 1] || []);
    } else {
      setDrawings([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setDrawings(history[historyIndex + 1]);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setDrawings([]);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'annotated-image.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const colors = [
    { value: '#ef4444', label: '赤' },
    { value: '#3b82f6', label: '青' },
    { value: '#10b981', label: '緑' },
    { value: '#f59e0b', label: '黄' },
    { value: '#8b5cf6', label: '紫' },
    { value: '#000000', label: '黒' },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-900 border-b border-gray-700 p-3 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('pan')}
            className={`p-2 rounded transition-colors ${
              tool === 'pan' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            title="パン (移動)"
          >
            <Move className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool('draw')}
            className={`p-2 rounded transition-colors ${
              tool === 'draw' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            title="描画"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool('erase')}
            className={`p-2 rounded transition-colors ${
              tool === 'erase' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            title="消しゴム"
          >
            <Eraser className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded transition-colors ${
              tool === 'rect' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            title="四角形"
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded transition-colors ${
              tool === 'circle' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            title="円"
          >
            <Circle className="w-5 h-5" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-700" />

        {/* Color Picker */}
        {(tool === 'draw' || tool === 'rect' || tool === 'circle') && (
          <div className="flex items-center gap-2">
            {colors.map(c => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  color === c.value ? 'border-white scale-110' : 'border-gray-600'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        )}

        {/* Line Width */}
        {tool !== 'pan' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">太さ:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-xs text-gray-300 min-w-[20px]">{lineWidth}</span>
          </div>
        )}

        <div className="h-6 w-px bg-gray-700" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
            className="p-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
            title="ズームアウト"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-300 min-w-[60px] text-center font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(5, prev + 0.2))}
            className="p-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
            title="ズームイン"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-700" />

        {/* History Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="元に戻す"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="やり直す"
          >
            <Redo className="w-5 h-5" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-700" />

        {/* Action Controls */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleReset}
            className="p-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
            title="リセット"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
            title="ダウンロード"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 font-medium"
          >
            閉じる
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-gray-950"
        style={{ cursor: tool === 'pan' ? 'move' : 'crosshair' }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center'
          }}
        >
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={900}
            className="max-w-none"
            unoptimized
          />
        </div>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-auto"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
}
