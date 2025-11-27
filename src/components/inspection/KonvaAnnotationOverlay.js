'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for Next.js compatibility (Konva uses canvas which needs browser)
const Stage = dynamic(() => import('react-konva').then(mod => mod.Stage), { ssr: false });
const Layer = dynamic(() => import('react-konva').then(mod => mod.Layer), { ssr: false });
const Rect = dynamic(() => import('react-konva').then(mod => mod.Rect), { ssr: false });
const Line = dynamic(() => import('react-konva').then(mod => mod.Line), { ssr: false });
const Group = dynamic(() => import('react-konva').then(mod => mod.Group), { ssr: false });
const Circle = dynamic(() => import('react-konva').then(mod => mod.Circle), { ssr: false });
const Text = dynamic(() => import('react-konva').then(mod => mod.Text), { ssr: false });
const KonvaImage = dynamic(() => import('react-konva').then(mod => mod.Image), { ssr: false });
const Transformer = dynamic(() => import('react-konva').then(mod => mod.Transformer), { ssr: false });

const JUDGMENT_COLORS = {
  OK: { fill: 'rgba(34, 197, 94, 0.15)', stroke: '#22c55e' },
  NG: { fill: 'rgba(239, 68, 68, 0.15)', stroke: '#ef4444' },
  WARNING: { fill: 'rgba(245, 158, 11, 0.15)', stroke: '#f59e0b' },
  DEFAULT: { fill: 'rgba(59, 130, 246, 0.15)', stroke: '#3b82f6' }
};

export function KonvaAnnotationOverlay({
  annotations = [],
  imageUrl,
  imageWidth,
  imageHeight,
  containerWidth,
  containerHeight,
  selectedAnnotationId,
  onAnnotationSelect,
  onAnnotationUpdate,
  isEditable = false,
  editMode = 'rectangle', // 'rectangle' or 'polygon'
  showAllAnnotations = true,
  onImageLoad,
  className = ''
}) {
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const selectedShapeRef = useRef(null);

  // Only render on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load image
  useEffect(() => {
    if (!imageUrl || typeof window === 'undefined') return;
    
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      onImageLoad?.({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [imageUrl, onImageLoad]);

  // Handle wheel zoom
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const scaleBy = 1.1;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(newScale, 10));

    setScale(clampedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, [scale, position]);

  // Handle drag
  const handleDragEnd = (e) => {
    setPosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  // Zoom to fit annotation
  const zoomToAnnotation = useCallback((annotation) => {
    if (!stageRef.current || !annotation) return;

    let bbox;
    if (annotation.boundingBox) {
      bbox = annotation.boundingBox;
    } else if (annotation.polygon && annotation.polygon.length >= 3) {
      const points = annotation.polygon.map(p => 
        Array.isArray(p) ? p : [p.x, p.y]
      );
      const xs = points.map(([x]) => x);
      const ys = points.map(([, y]) => y);
      bbox = {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys)
      };
    }

    if (!bbox) return;

    const padding = 50;
    const scaleX = (containerWidth - padding * 2) / bbox.width;
    const scaleY = (containerHeight - padding * 2) / bbox.height;
    const newScale = Math.min(scaleX, scaleY, 4);

    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;

    setScale(newScale);
    setPosition({
      x: containerWidth / 2 - centerX * newScale,
      y: containerHeight / 2 - centerY * newScale,
    });
  }, [containerWidth, containerHeight]);

  // Reset zoom
  const resetZoom = useCallback(() => {
    if (!image) return;
    const scaleX = containerWidth / image.width;
    const scaleY = containerHeight / image.height;
    const newScale = Math.min(scaleX, scaleY, 1);
    
    setScale(newScale);
    setPosition({
      x: (containerWidth - image.width * newScale) / 2,
      y: (containerHeight - image.height * newScale) / 2,
    });
  }, [containerWidth, containerHeight, image]);

  // Handle annotation click
  const handleAnnotationClick = (annotation) => {
    onAnnotationSelect?.(annotation.id);
  };

  // Handle rectangle transform
  const handleRectTransformEnd = (annotation, e) => {
    if (!isEditable) return;
    
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale and update size
    node.scaleX(1);
    node.scaleY(1);
    
    const newBbox = {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
    };

    // Convert bbox to polygon
    const newPolygon = [
      [newBbox.x, newBbox.y],
      [newBbox.x + newBbox.width, newBbox.y],
      [newBbox.x + newBbox.width, newBbox.y + newBbox.height],
      [newBbox.x, newBbox.y + newBbox.height],
    ];

    onAnnotationUpdate?.(annotation.id, {
      boundingBox: newBbox,
      polygon: newPolygon,
    });
  };

  // Handle rectangle drag
  const handleRectDragEnd = (annotation, e) => {
    if (!isEditable) return;
    
    const node = e.target;
    const newBbox = {
      x: node.x(),
      y: node.y(),
      width: annotation.boundingBox?.width || 100,
      height: annotation.boundingBox?.height || 100,
    };

    const newPolygon = [
      [newBbox.x, newBbox.y],
      [newBbox.x + newBbox.width, newBbox.y],
      [newBbox.x + newBbox.width, newBbox.y + newBbox.height],
      [newBbox.x, newBbox.y + newBbox.height],
    ];

    onAnnotationUpdate?.(annotation.id, {
      boundingBox: newBbox,
      polygon: newPolygon,
    });
  };

  // Render rectangle annotation
  const renderRectangle = (annotation) => {
    const isSelected = annotation.id === selectedAnnotationId;
    const colors = JUDGMENT_COLORS[annotation.judgment] || JUDGMENT_COLORS.DEFAULT;
    
    let bbox = annotation.boundingBox;
    if (!bbox && annotation.polygon && annotation.polygon.length >= 3) {
      const points = annotation.polygon.map(p => 
        Array.isArray(p) ? p : [p.x, p.y]
      );
      const xs = points.map(([x]) => x);
      const ys = points.map(([, y]) => y);
      bbox = {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys)
      };
    }

    if (!bbox) return null;

    return (
      <Group key={annotation.id}>
        <Rect
          id={annotation.id}
          x={bbox.x}
          y={bbox.y}
          width={bbox.width}
          height={bbox.height}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={isSelected ? 3 : 2}
          dash={isSelected ? [5, 3] : undefined}
          draggable={isEditable && isSelected}
          onClick={() => handleAnnotationClick(annotation)}
          onTap={() => handleAnnotationClick(annotation)}
          onDragEnd={(e) => handleRectDragEnd(annotation, e)}
          onTransformEnd={(e) => handleRectTransformEnd(annotation, e)}
          ref={isSelected ? selectedShapeRef : undefined}
        />
        {isSelected && (
          <Text
            x={bbox.x}
            y={bbox.y - 20}
            text={annotation.judgment || annotation.type || annotation.elementType || ''}
            fill={colors.stroke}
            fontSize={12}
            fontStyle="bold"
          />
        )}
      </Group>
    );
  };

  // Render polygon annotation
  const renderPolygon = (annotation) => {
    const isSelected = annotation.id === selectedAnnotationId;
    const colors = JUDGMENT_COLORS[annotation.judgment] || JUDGMENT_COLORS.DEFAULT;
    
    if (!annotation.polygon || annotation.polygon.length < 3) return null;

    // Convert polygon to flat array for Konva Line
    const points = annotation.polygon.flatMap(p => 
      Array.isArray(p) ? p : [p.x, p.y]
    );

    return (
      <Group key={annotation.id}>
        <Line
          id={annotation.id}
          points={points}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={isSelected ? 3 : 2}
          dash={isSelected ? [5, 3] : undefined}
          closed
          onClick={() => handleAnnotationClick(annotation)}
          onTap={() => handleAnnotationClick(annotation)}
        />
        {/* Vertex handles for polygon editing */}
        {isEditable && isSelected && editMode === 'polygon' && annotation.polygon.map((point, index) => {
          const [x, y] = Array.isArray(point) ? point : [point.x, point.y];
          return (
            <Circle
              key={index}
              x={x}
              y={y}
              radius={6}
              fill={colors.stroke}
              stroke="white"
              strokeWidth={2}
              draggable
              onDragEnd={(e) => {
                const newPolygon = [...annotation.polygon];
                newPolygon[index] = [e.target.x(), e.target.y()];
                onAnnotationUpdate?.(annotation.id, { polygon: newPolygon });
              }}
            />
          );
        })}
      </Group>
    );
  };

  // Effect to update transformer
  useEffect(() => {
    if (!transformerRef.current || !selectedShapeRef.current) return;
    
    if (isEditable && editMode === 'rectangle') {
      transformerRef.current.nodes([selectedShapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedAnnotationId, isEditable, editMode]);

  // Filter annotations to show
  const visibleAnnotations = showAllAnnotations 
    ? annotations 
    : annotations.filter(a => a.id === selectedAnnotationId);

  if (!isClient) {
    return <div className={`flex items-center justify-center ${className}`}>Loading...</div>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Stage
        ref={stageRef}
        width={containerWidth}
        height={containerHeight}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
      >
        <Layer>
          {/* Background Image */}
          {image && (
            <KonvaImage
              image={image}
              width={image.width}
              height={image.height}
            />
          )}
          
          {/* Annotations */}
          {visibleAnnotations.map(annotation => 
            editMode === 'polygon' 
              ? renderPolygon(annotation) 
              : renderRectangle(annotation)
          )}

          {/* Transformer for selected rectangle */}
          {isEditable && editMode === 'rectangle' && selectedAnnotationId && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit minimum size
                if (newBox.width < 10 || newBox.height < 10) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 bg-white dark:bg-gray-800 rounded-sm shadow-lg p-2">
        <button
          onClick={() => setScale(s => Math.min(s * 1.2, 10))}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          +
        </button>
        <span className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 min-w-[50px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(s => Math.max(s / 1.2, 0.1))}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          -
        </button>
        <button
          onClick={resetZoom}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          リセット
        </button>
        {selectedAnnotationId && (
          <button
            onClick={() => {
              const annotation = annotations.find(a => a.id === selectedAnnotationId);
              if (annotation) zoomToAnnotation(annotation);
            }}
            className="px-3 py-1 text-sm bg-primary text-white hover:bg-primary/80 rounded"
          >
            フィット
          </button>
        )}
      </div>
    </div>
  );
}

export default KonvaAnnotationOverlay;
