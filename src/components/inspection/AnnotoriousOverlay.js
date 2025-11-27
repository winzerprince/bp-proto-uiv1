'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Square, Pentagon, MousePointer, Move, Trash2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

// Colors for different judgment types
const JUDGMENT_COLORS = {
  OK: { fill: 'rgba(34, 197, 94, 0.2)', stroke: '#22c55e', strokeWidth: 2 },
  NG: { fill: 'rgba(239, 68, 68, 0.2)', stroke: '#ef4444', strokeWidth: 2 },
  WARNING: { fill: 'rgba(245, 158, 11, 0.2)', stroke: '#f59e0b', strokeWidth: 2 },
  DEFAULT: { fill: 'rgba(59, 130, 246, 0.2)', stroke: '#3b82f6', strokeWidth: 2 },
  // Element type colors for scan results
  text: { fill: 'rgba(59, 130, 246, 0.2)', stroke: '#3b82f6', strokeWidth: 2 },
  table: { fill: 'rgba(147, 51, 234, 0.2)', stroke: '#9333ea', strokeWidth: 2 },
  figure: { fill: 'rgba(245, 158, 11, 0.2)', stroke: '#f59e0b', strokeWidth: 2 },
  // Selection box for scan mode (purple)
  SELECTION: { fill: 'rgba(147, 51, 234, 0.15)', stroke: '#9333ea', strokeWidth: 3 },
};

// Drawing tools
const TOOLS = {
  SELECT: 'select',
  PAN: 'pan',
  RECTANGLE: 'rectangle',
  POLYGON: 'polygon'
};

export function AnnotoriousOverlay({
  annotations = [],
  imageUrl,
  selectedAnnotationId,
  onAnnotationSelect,
  onAnnotationUpdate,
  onAnnotationCreate,
  onAnnotationDelete,
  isEditable = false,
  showAllAnnotations = true,
  onImageLoad,
  className = '',
  // Scan mode props - only one resizable selection box
  scanMode = false,
  selectionBox = null,
  onSelectionBoxChange = null,
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const imgRef = useRef(null);
  const imageLoadedRef = useRef(false);
  const lastImageUrlRef = useRef(null);
  const lastSelectedIdRef = useRef(null);
  const onImageLoadRef = useRef(onImageLoad);
  
  // Keep onImageLoad ref updated
  useEffect(() => {
    onImageLoadRef.current = onImageLoad;
  }, [onImageLoad]);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  
  // Interaction states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Editing states
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [tempRect, setTempRect] = useState(null);
  
  // Vertex dragging for editing existing annotations
  const [draggingVertex, setDraggingVertex] = useState(null); // { annotationId, vertexIndex }
  const [draggingAnnotation, setDraggingAnnotation] = useState(null); // For moving whole annotation

  // Track container size with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });

    resizeObserver.observe(container);
    
    // Initial size
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setContainerSize({ width: rect.width, height: rect.height });
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Load image - only when imageUrl actually changes
  useEffect(() => {
    if (!imageUrl) return;
    
    // Only reload if URL actually changed
    if (imageUrl === lastImageUrlRef.current && imageLoadedRef.current) return;
    
    lastImageUrlRef.current = imageUrl;
    imageLoadedRef.current = false;
    setIsLoaded(false);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Set high priority for image loading
    img.fetchPriority = 'high';
    img.loading = 'eager';
    
    img.onload = () => {
      if (imageLoadedRef.current) return;
      imageLoadedRef.current = true;
      
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      setImageDimensions(dims);
      setIsLoaded(true);
      
      // Calculate initial scale to fit image in container
      const container = containerRef.current;
      const cWidth = container?.clientWidth || 800;
      const cHeight = container?.clientHeight || 600;
      const scaleX = cWidth / dims.width;
      const scaleY = cHeight / dims.height;
      const newScale = Math.min(scaleX, scaleY, 1) * 0.9;
      setScale(newScale);
      setPosition({ x: 0, y: 0 });
      
      if (onImageLoadRef.current) {
        setTimeout(() => onImageLoadRef.current(dims), 0);
      }
    };
    img.onerror = () => {
      console.error('Failed to load image:', imageUrl);
      imageLoadedRef.current = false;
      setIsLoaded(false);
    };
    
    // Start loading immediately
    img.src = imageUrl;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  // Convert screen coordinates to image coordinates
  const screenToImage = useCallback((screenX, screenY) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    
    const rect = container.getBoundingClientRect();
    const containerCenterX = rect.width / 2;
    const containerCenterY = rect.height / 2;
    
    // Mouse position relative to container
    const relX = screenX - rect.left;
    const relY = screenY - rect.top;
    
    // Account for pan and zoom to get image coordinates
    // The image is centered, then panned, then scaled
    const imageX = (relX - containerCenterX - position.x) / scale + imageDimensions.width / 2;
    const imageY = (relY - containerCenterY - position.y) / scale + imageDimensions.height / 2;
    
    return { x: imageX, y: imageY };
  }, [position, scale, imageDimensions]);

  // Zoom to annotation - FIXED to properly center on the box
  const zoomToAnnotation = useCallback((annotation) => {
    if (!annotation?.polygon || annotation.polygon.length < 3) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight;
    
    // Get bounding box of polygon
    const points = annotation.polygon.map(p => Array.isArray(p) ? p : [p.x, p.y]);
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const boxWidth = maxX - minX;
    const boxHeight = maxY - minY;
    const boxCenterX = (minX + maxX) / 2;
    const boxCenterY = (minY + maxY) / 2;
    
    // Calculate zoom to fit the box with generous padding
    const padding = 100;
    const targetWidth = Math.max(boxWidth + padding * 2, 200);
    const targetHeight = Math.max(boxHeight + padding * 2, 200);
    
    const scaleX = cWidth / targetWidth;
    const scaleY = cHeight / targetHeight;
    const newScale = Math.min(scaleX, scaleY, 4); // Max zoom 4x
    
    // Calculate pan position to center the box
    // The image center is at (imageDimensions.width/2, imageDimensions.height/2)
    // We want the box center to be at the container center
    // Pan formula: containerCenter = imagePoint * scale + pan + (containerSize/2 - imageCenter*scale)
    // Simplified: pan = containerCenter - boxCenter * scale - containerCenter + imageCenter * scale
    // pan = (imageCenter - boxCenter) * scale
    
    const imageCenterX = imageDimensions.width / 2;
    const imageCenterY = imageDimensions.height / 2;
    
    const newX = (imageCenterX - boxCenterX) * newScale;
    const newY = (imageCenterY - boxCenterY) * newScale;
    
    setScale(newScale);
    setPosition({ x: newX, y: newY });
  }, [imageDimensions]);

  // Handle selected annotation change - zoom only when selection actually changes
  useEffect(() => {
    if (!selectedAnnotationId || !isLoaded) return;
    if (selectedAnnotationId === lastSelectedIdRef.current) return;
    
    lastSelectedIdRef.current = selectedAnnotationId;
    
    const annotation = annotations.find(a => a.id === selectedAnnotationId);
    if (annotation) {
      requestAnimationFrame(() => {
        zoomToAnnotation(annotation);
      });
    }
  }, [selectedAnnotationId, isLoaded, annotations, zoomToAnnotation]);

  // Handle wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(5, prev * delta)));
  }, []);

  // Mouse handlers
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    
    const imageCoords = screenToImage(e.clientX, e.clientY);
    
    if (activeTool === TOOLS.PAN || (!isEditable && activeTool === TOOLS.SELECT)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    } else if (isEditable && activeTool === TOOLS.RECTANGLE) {
      setIsDrawing(true);
      setTempRect({ startX: imageCoords.x, startY: imageCoords.y, endX: imageCoords.x, endY: imageCoords.y });
    } else if (isEditable && activeTool === TOOLS.POLYGON) {
      setDrawingPoints(prev => [...prev, [imageCoords.x, imageCoords.y]]);
    }
  }, [activeTool, isEditable, position, screenToImage]);

  const handleMouseMove = useCallback((e) => {
    const imageCoords = screenToImage(e.clientX, e.clientY);
    
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isDrawing && tempRect) {
      setTempRect(prev => prev ? { ...prev, endX: imageCoords.x, endY: imageCoords.y } : null);
    } else if (draggingVertex) {
      // Handle selection box resizing in scan mode
      if (scanMode && draggingVertex.annotationId === 'selection-box' && selectionBox && onSelectionBoxChange) {
        const { vertexIndex } = draggingVertex;
        let newBox = { ...selectionBox };
        
        // Corner handles (0-3): 0=NW, 1=NE, 2=SE, 3=SW
        // Edge handles (4-7): 4=N, 5=E, 6=S, 7=W
        switch (vertexIndex) {
          case 0: // NW corner
            newBox = { x: imageCoords.x, y: imageCoords.y, width: selectionBox.x + selectionBox.width - imageCoords.x, height: selectionBox.y + selectionBox.height - imageCoords.y };
            break;
          case 1: // NE corner
            newBox = { x: selectionBox.x, y: imageCoords.y, width: imageCoords.x - selectionBox.x, height: selectionBox.y + selectionBox.height - imageCoords.y };
            break;
          case 2: // SE corner
            newBox = { x: selectionBox.x, y: selectionBox.y, width: imageCoords.x - selectionBox.x, height: imageCoords.y - selectionBox.y };
            break;
          case 3: // SW corner
            newBox = { x: imageCoords.x, y: selectionBox.y, width: selectionBox.x + selectionBox.width - imageCoords.x, height: imageCoords.y - selectionBox.y };
            break;
          case 4: // N edge
            newBox = { x: selectionBox.x, y: imageCoords.y, width: selectionBox.width, height: selectionBox.y + selectionBox.height - imageCoords.y };
            break;
          case 5: // E edge
            newBox = { x: selectionBox.x, y: selectionBox.y, width: imageCoords.x - selectionBox.x, height: selectionBox.height };
            break;
          case 6: // S edge
            newBox = { x: selectionBox.x, y: selectionBox.y, width: selectionBox.width, height: imageCoords.y - selectionBox.y };
            break;
          case 7: // W edge
            newBox = { x: imageCoords.x, y: selectionBox.y, width: selectionBox.x + selectionBox.width - imageCoords.x, height: selectionBox.height };
            break;
        }
        
        // Ensure minimum size
        if (newBox.width >= 50 && newBox.height >= 50) {
          onSelectionBoxChange(newBox);
        }
      } else {
        // Regular annotation vertex dragging
        const annotation = annotations.find(a => a.id === draggingVertex.annotationId);
        if (annotation && onAnnotationUpdate) {
          const newPolygon = [...annotation.polygon];
          newPolygon[draggingVertex.vertexIndex] = [imageCoords.x, imageCoords.y];
          onAnnotationUpdate(draggingVertex.annotationId, { polygon: newPolygon });
        }
      }
    } else if (draggingAnnotation) {
      // Move whole annotation
      const annotation = annotations.find(a => a.id === draggingAnnotation.id);
      if (annotation && onAnnotationUpdate) {
        const dx = imageCoords.x - draggingAnnotation.startX;
        const dy = imageCoords.y - draggingAnnotation.startY;
        const newPolygon = draggingAnnotation.originalPolygon.map(p => {
          const [x, y] = Array.isArray(p) ? p : [p.x, p.y];
          return [x + dx, y + dy];
        });
        onAnnotationUpdate(draggingAnnotation.id, { polygon: newPolygon });
      }
    }
  }, [isDragging, dragStart, isDrawing, tempRect, screenToImage, draggingVertex, draggingAnnotation, annotations, onAnnotationUpdate, scanMode, selectionBox, onSelectionBoxChange]);

  const handleMouseUp = useCallback((e) => {
    if (isDrawing && tempRect && onAnnotationCreate) {
      const minX = Math.min(tempRect.startX, tempRect.endX);
      const maxX = Math.max(tempRect.startX, tempRect.endX);
      const minY = Math.min(tempRect.startY, tempRect.endY);
      const maxY = Math.max(tempRect.startY, tempRect.endY);
      
      // Only create if the rectangle is large enough
      if (maxX - minX > 20 && maxY - minY > 20) {
        onAnnotationCreate({
          polygon: [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]],
          type: 'rectangle'
        });
      }
      setTempRect(null);
      setIsDrawing(false);
    }
    
    setIsDragging(false);
    setDraggingVertex(null);
    setDraggingAnnotation(null);
  }, [isDrawing, tempRect, onAnnotationCreate]);

  // Double-click to complete polygon
  const handleDoubleClick = useCallback(() => {
    if (activeTool === TOOLS.POLYGON && drawingPoints.length >= 3 && onAnnotationCreate) {
      onAnnotationCreate({
        polygon: drawingPoints,
        type: 'polygon'
      });
      setDrawingPoints([]);
    }
  }, [activeTool, drawingPoints, onAnnotationCreate]);

  // Handle vertex drag start
  const handleVertexMouseDown = useCallback((e, annotationId, vertexIndex) => {
    if (!isEditable) return;
    e.stopPropagation();
    setDraggingVertex({ annotationId, vertexIndex });
  }, [isEditable]);

  // Handle annotation drag start (for moving whole annotation)
  const handleAnnotationDragStart = useCallback((e, annotation) => {
    if (!isEditable || activeTool !== TOOLS.SELECT) return;
    e.stopPropagation();
    const imageCoords = screenToImage(e.clientX, e.clientY);
    setDraggingAnnotation({
      id: annotation.id,
      startX: imageCoords.x,
      startY: imageCoords.y,
      originalPolygon: annotation.polygon.map(p => Array.isArray(p) ? [...p] : [p.x, p.y])
    });
  }, [isEditable, activeTool, screenToImage]);

  // Reset zoom
  const resetZoom = useCallback(() => {
    const container = containerRef.current;
    if (imageDimensions.width > 0 && container) {
      const cWidth = container.clientWidth;
      const cHeight = container.clientHeight;
      const scaleX = cWidth / imageDimensions.width;
      const scaleY = cHeight / imageDimensions.height;
      const newScale = Math.min(scaleX, scaleY, 1) * 0.9;
      setScale(newScale);
      setPosition({ x: 0, y: 0 });
    }
  }, [imageDimensions]);

  // Cancel current drawing
  const cancelDrawing = useCallback(() => {
    setDrawingPoints([]);
    setTempRect(null);
    setIsDrawing(false);
  }, []);

  // Delete selected annotation
  const deleteSelected = useCallback(() => {
    if (selectedAnnotationId && onAnnotationDelete) {
      onAnnotationDelete(selectedAnnotationId);
    }
  }, [selectedAnnotationId, onAnnotationDelete]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isEditable) return;
    
    const handleKeyDown = (e) => {
      // Don't trigger if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool(TOOLS.SELECT);
          break;
        case 'h':
          setActiveTool(TOOLS.PAN);
          break;
        case 'r':
          setActiveTool(TOOLS.RECTANGLE);
          break;
        case 'p':
          setActiveTool(TOOLS.POLYGON);
          break;
        case 'escape':
          cancelDrawing();
          break;
        case 'delete':
        case 'backspace':
          if (selectedAnnotationId && onAnnotationDelete) {
            e.preventDefault();
            onAnnotationDelete(selectedAnnotationId);
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditable, selectedAnnotationId, onAnnotationDelete, cancelDrawing]);

  // Get visible annotations
  const visibleAnnotations = useMemo(() => {
    return showAllAnnotations 
      ? annotations 
      : annotations.filter(a => a.id === selectedAnnotationId);
  }, [showAllAnnotations, annotations, selectedAnnotationId]);

  // Render annotation polygon with edit handles
  const renderAnnotation = useCallback((annotation) => {
    if (!annotation.polygon || annotation.polygon.length < 3) return null;
    
    const points = annotation.polygon.map(p => {
      const [x, y] = Array.isArray(p) ? p : [p.x, p.y];
      return [x, y];
    });
    
    const pointsStr = points.map(([x, y]) => `${x},${y}`).join(' ');
    const isSelected = annotation.id === selectedAnnotationId;
    // Use element type color for scan results (when judgment is missing or 'OK' with elementType)
    const elementType = annotation.elementType?.toLowerCase();
    const colors = annotation.judgment && annotation.judgment !== 'OK' 
      ? (JUDGMENT_COLORS[annotation.judgment] || JUDGMENT_COLORS.DEFAULT)
      : (elementType && JUDGMENT_COLORS[elementType]) 
        ? JUDGMENT_COLORS[elementType]
        : (JUDGMENT_COLORS[annotation.judgment] || JUDGMENT_COLORS.DEFAULT);
    
    return (
      <g key={annotation.id}>
        {/* Main polygon */}
        <polygon
          points={pointsStr}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={isSelected ? 3 : 2}
          strokeDasharray={isSelected ? '5,3' : 'none'}
          style={{ cursor: isEditable && activeTool === TOOLS.SELECT ? 'move' : 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onAnnotationSelect?.(annotation.id);
          }}
          onMouseDown={(e) => handleAnnotationDragStart(e, annotation)}
        />
        
        {/* Label */}
        {isSelected && points[0] && (
          <text
            x={points[0][0]}
            y={points[0][1] - 8}
            fill={colors.stroke}
            fontSize="14"
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            {annotation.judgment || annotation.type || annotation.elementType || ''}
          </text>
        )}
        
        {/* Edit handles - only show when editable and selected */}
        {isEditable && isSelected && points.map(([x, y], idx) => (
          <circle
            key={`handle-${idx}`}
            cx={x}
            cy={y}
            r={8 / scale} // Scale-independent handle size
            fill="white"
            stroke={colors.stroke}
            strokeWidth={2 / scale}
            style={{ cursor: 'nwse-resize' }}
            onMouseDown={(e) => handleVertexMouseDown(e, annotation.id, idx)}
          />
        ))}
      </g>
    );
  }, [selectedAnnotationId, isEditable, activeTool, scale, onAnnotationSelect, handleAnnotationDragStart, handleVertexMouseDown]);

  // Render temporary drawing shapes
  const renderTempShapes = () => {
    const shapes = [];
    
    // Temp rectangle while drawing
    if (tempRect) {
      const minX = Math.min(tempRect.startX, tempRect.endX);
      const maxX = Math.max(tempRect.startX, tempRect.endX);
      const minY = Math.min(tempRect.startY, tempRect.endY);
      const maxY = Math.max(tempRect.startY, tempRect.endY);
      
      shapes.push(
        <rect
          key="temp-rect"
          x={minX}
          y={minY}
          width={maxX - minX}
          height={maxY - minY}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5,5"
        />
      );
    }
    
    // Temp polygon points while drawing
    if (drawingPoints.length > 0) {
      const pointsStr = drawingPoints.map(([x, y]) => `${x},${y}`).join(' ');
      shapes.push(
        <polyline
          key="temp-polygon"
          points={pointsStr}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5,5"
        />
      );
      
      // Draw vertices
      drawingPoints.forEach(([x, y], idx) => {
        shapes.push(
          <circle
            key={`temp-vertex-${idx}`}
            cx={x}
            cy={y}
            r={6 / scale}
            fill="#3b82f6"
            stroke="white"
            strokeWidth={2 / scale}
          />
        );
      });
    }
    
    return shapes;
  };

  if (!imageUrl) {
    return (
      <div 
        ref={containerRef}
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-900 w-full h-full ${className}`}
      >
        <p className="text-gray-500">画像を選択してください</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-100 dark:bg-gray-950 w-full h-full ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* Transform container */}
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 
                  activeTool === TOOLS.PAN ? 'grab' : 
                  activeTool === TOOLS.RECTANGLE || activeTool === TOOLS.POLYGON ? 'crosshair' : 
                  'default',
          transition: isDragging || draggingVertex || draggingAnnotation ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {/* Loading indicator */}
        {!isLoaded && imageUrl && (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500 dark:text-gray-400">画像を読み込み中...</span>
          </div>
        )}
        {isLoaded && (
          <div style={{ position: 'relative' }}>
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Blueprint"
              style={{ maxWidth: 'none', display: 'block' }}
              crossOrigin="anonymous"
              draggable={false}
              fetchpriority="high"
            />
            {/* SVG overlay for annotations */}
            <svg
              ref={svgRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: imageDimensions.width,
                height: imageDimensions.height,
                pointerEvents: 'auto'
              }}
              viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
            >
              {/* Scan Mode Selection Box - One resizable purple box */}
              {scanMode && selectionBox && (
                <g>
                  <rect
                    x={selectionBox.x}
                    y={selectionBox.y}
                    width={selectionBox.width}
                    height={selectionBox.height}
                    fill={JUDGMENT_COLORS.SELECTION.fill}
                    stroke={JUDGMENT_COLORS.SELECTION.stroke}
                    strokeWidth={JUDGMENT_COLORS.SELECTION.strokeWidth}
                    strokeDasharray="8,4"
                    style={{ cursor: 'move' }}
                  />
                  {/* Resize handles for selection box */}
                  {isEditable && (
                    <>
                      {/* Corner handles */}
                      <circle cx={selectionBox.x} cy={selectionBox.y} r={8 / scale} fill="white" stroke="#9333ea" strokeWidth={2 / scale} style={{ cursor: 'nw-resize' }} 
                        onMouseDown={(e) => { e.stopPropagation(); setDraggingVertex({ annotationId: 'selection-box', vertexIndex: 0 }); }} />
                      <circle cx={selectionBox.x + selectionBox.width} cy={selectionBox.y} r={8 / scale} fill="white" stroke="#9333ea" strokeWidth={2 / scale} style={{ cursor: 'ne-resize' }}
                        onMouseDown={(e) => { e.stopPropagation(); setDraggingVertex({ annotationId: 'selection-box', vertexIndex: 1 }); }} />
                      <circle cx={selectionBox.x + selectionBox.width} cy={selectionBox.y + selectionBox.height} r={8 / scale} fill="white" stroke="#9333ea" strokeWidth={2 / scale} style={{ cursor: 'se-resize' }}
                        onMouseDown={(e) => { e.stopPropagation(); setDraggingVertex({ annotationId: 'selection-box', vertexIndex: 2 }); }} />
                      <circle cx={selectionBox.x} cy={selectionBox.y + selectionBox.height} r={8 / scale} fill="white" stroke="#9333ea" strokeWidth={2 / scale} style={{ cursor: 'sw-resize' }}
                        onMouseDown={(e) => { e.stopPropagation(); setDraggingVertex({ annotationId: 'selection-box', vertexIndex: 3 }); }} />
                      {/* Edge midpoint handles */}
                      <circle cx={selectionBox.x + selectionBox.width / 2} cy={selectionBox.y} r={6 / scale} fill="white" stroke="#9333ea" strokeWidth={2 / scale} style={{ cursor: 'n-resize' }}
                        onMouseDown={(e) => { e.stopPropagation(); setDraggingVertex({ annotationId: 'selection-box', vertexIndex: 4 }); }} />
                      <circle cx={selectionBox.x + selectionBox.width} cy={selectionBox.y + selectionBox.height / 2} r={6 / scale} fill="white" stroke="#9333ea" strokeWidth={2 / scale} style={{ cursor: 'e-resize' }}
                        onMouseDown={(e) => { e.stopPropagation(); setDraggingVertex({ annotationId: 'selection-box', vertexIndex: 5 }); }} />
                      <circle cx={selectionBox.x + selectionBox.width / 2} cy={selectionBox.y + selectionBox.height} r={6 / scale} fill="white" stroke="#9333ea" strokeWidth={2 / scale} style={{ cursor: 's-resize' }}
                        onMouseDown={(e) => { e.stopPropagation(); setDraggingVertex({ annotationId: 'selection-box', vertexIndex: 6 }); }} />
                      <circle cx={selectionBox.x} cy={selectionBox.y + selectionBox.height / 2} r={6 / scale} fill="white" stroke="#9333ea" strokeWidth={2 / scale} style={{ cursor: 'w-resize' }}
                        onMouseDown={(e) => { e.stopPropagation(); setDraggingVertex({ annotationId: 'selection-box', vertexIndex: 7 }); }} />
                    </>
                  )}
                  {/* Label for selection box */}
                  <text
                    x={selectionBox.x + 10}
                    y={selectionBox.y - 10}
                    fill="#9333ea"
                    fontSize="14"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                  >
                    スキャン範囲
                  </text>
                </g>
              )}
              {/* Regular annotations - hide in scan mode since we only show selection box */}
              {!scanMode && visibleAnnotations.map(renderAnnotation)}
              {!scanMode && renderTempShapes()}
            </svg>
          </div>
        )}
      </div>

      {/* Editing Toolbar - only show when editable and NOT in scan mode */}
      {isEditable && !scanMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-sm shadow-lg p-1.5 z-20 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTool(TOOLS.SELECT)}
            className={`p-2 rounded transition-colors ${activeTool === TOOLS.SELECT ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            title="選択ツール (V)"
          >
            <MousePointer className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTool(TOOLS.PAN)}
            className={`p-2 rounded transition-colors ${activeTool === TOOLS.PAN ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            title="パンツール (H)"
          >
            <Move className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          
          <button
            onClick={() => setActiveTool(TOOLS.RECTANGLE)}
            className={`p-2 rounded transition-colors ${activeTool === TOOLS.RECTANGLE ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            title="矩形ツール (R)"
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTool(TOOLS.POLYGON)}
            className={`p-2 rounded transition-colors ${activeTool === TOOLS.POLYGON ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            title="ポリゴンツール (P) - ダブルクリックで完成"
          >
            <Pentagon className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          
          <button
            onClick={deleteSelected}
            disabled={!selectedAnnotationId}
            className={`p-2 rounded transition-colors ${selectedAnnotationId ? 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
            title="削除 (Delete)"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          {(drawingPoints.length > 0 || tempRect) && (
            <button
              onClick={cancelDrawing}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              title="キャンセル (Esc)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex gap-1.5 bg-white dark:bg-gray-800 rounded-sm shadow-lg p-1.5 z-10 border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setScale(s => Math.min(s * 1.25, 5))}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="ズームイン"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 min-w-[50px] text-center flex items-center justify-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(s => Math.max(s / 1.25, 0.1))}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="ズームアウト"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-0.5 self-center" />
        <button
          onClick={resetZoom}
          className="px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="リセット"
        >
          リセット
        </button>
        {selectedAnnotationId && (
          <button
            onClick={() => {
              const annotation = annotations.find(a => a.id === selectedAnnotationId);
              if (annotation) {
                lastSelectedIdRef.current = null; // Force re-zoom
                zoomToAnnotation(annotation);
              }
            }}
            className="px-2 py-1 text-xs rounded bg-primary text-white hover:bg-primary/90"
            title="選択にフィット"
          >
            フィット
          </button>
        )}
      </div>

      {/* Instructions overlay for polygon drawing */}
      {isEditable && activeTool === TOOLS.POLYGON && drawingPoints.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded-sm z-20">
          クリックで頂点を追加 • ダブルクリックで完成 • {drawingPoints.length}点
        </div>
      )}

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-gray-100/80 dark:bg-gray-900/80">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

export default AnnotoriousOverlay;
