'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const JUDGMENT_COLORS = {
  OK: { fill: 'rgba(34, 197, 94, 0.15)', stroke: '#22c55e', strokeWidth: 2 },
  NG: { fill: 'rgba(239, 68, 68, 0.15)', stroke: '#ef4444', strokeWidth: 2 },
  WARNING: { fill: 'rgba(245, 158, 11, 0.15)', stroke: '#f59e0b', strokeWidth: 2 }
};

const SELECTED_STYLE = { strokeWidth: 3, strokeDasharray: '5,3' };

export function PolygonOverlay({
  polygons = [],
  containerWidth,
  containerHeight,
  imageWidth,
  imageHeight,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  selectedPolygonId,
  onPolygonSelect,
  onPolygonDrag,
  onRectangleResize,
  isEditable = false,
  editMode = 'rectangle', // 'rectangle' for side resizing, 'polygon' for vertex editing
  className = ''
}) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null); // { polygonId, type: 'corner'|'edge', index, startX, startY }
  const [hoveredPolygon, setHoveredPolygon] = useState(null);

  // Convert image coordinates to screen coordinates
  const toScreenCoords = useCallback((x, y) => ({
    x: x * scale + offsetX,
    y: y * scale + offsetY
  }), [scale, offsetX, offsetY]);

  // Convert screen coordinates to image coordinates
  const toImageCoords = useCallback((screenX, screenY) => ({
    x: (screenX - offsetX) / scale,
    y: (screenY - offsetY) / scale
  }), [scale, offsetX, offsetY]);

  // Create SVG path from polygon points
  const createPath = useCallback((polygon) => {
    if (!polygon || polygon.length < 3) return '';
    const points = polygon.map(p => {
      const [x, y] = Array.isArray(p) ? p : [p.x, p.y];
      const screen = toScreenCoords(x, y);
      return `${screen.x},${screen.y}`;
    });
    return `M ${points.join(' L ')} Z`;
  }, [toScreenCoords]);

  // Get bounding box from polygon
  const getBoundingBox = useCallback((polygon) => {
    if (!polygon || polygon.length < 3) return null;
    const coords = polygon.map(p => Array.isArray(p) ? p : [p.x, p.y]);
    const xs = coords.map(([x]) => x);
    const ys = coords.map(([, y]) => y);
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  }, []);

  // Handle polygon click
  const handlePolygonClick = (e, polygonData) => {
    e.stopPropagation();
    onPolygonSelect?.(polygonData.id);
  };

  // Handle corner drag start (for polygon mode)
  const handleCornerMouseDown = (e, polygonId, cornerIndex) => {
    if (!isEditable || editMode !== 'polygon') return;
    e.stopPropagation();
    e.preventDefault();
    
    const rect = svgRef.current.getBoundingClientRect();
    setDragging({
      polygonId,
      type: 'corner',
      index: cornerIndex,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top
    });
  };

  // Handle edge drag start (for rectangle mode)
  const handleEdgeMouseDown = (e, polygonId, edgeType) => {
    if (!isEditable || editMode !== 'rectangle') return;
    e.stopPropagation();
    e.preventDefault();
    
    const rect = svgRef.current.getBoundingClientRect();
    setDragging({
      polygonId,
      type: 'edge',
      edge: edgeType, // 'top', 'bottom', 'left', 'right'
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top
    });
  };

  // Handle drag move
  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => {
      const rect = svgRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const imageCoords = toImageCoords(screenX, screenY);
      
      if (dragging.type === 'corner') {
        onPolygonDrag?.(dragging.polygonId, dragging.index, imageCoords);
      } else if (dragging.type === 'edge') {
        onRectangleResize?.(dragging.polygonId, dragging.edge, imageCoords);
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, toImageCoords, onPolygonDrag, onRectangleResize]);

  // Render edge handles for rectangle editing
  const renderEdgeHandles = (polygon, id, colors) => {
    const bbox = getBoundingBox(polygon);
    if (!bbox) return null;
    
    const screenTopLeft = toScreenCoords(bbox.x, bbox.y);
    const screenBottomRight = toScreenCoords(bbox.x + bbox.width, bbox.y + bbox.height);
    
    const handleWidth = 8;
    const handleLength = Math.min(30, bbox.width * scale * 0.3, bbox.height * scale * 0.3);
    
    const edges = [
      { type: 'top', x: (screenTopLeft.x + screenBottomRight.x) / 2 - handleLength / 2, y: screenTopLeft.y - handleWidth / 2, w: handleLength, h: handleWidth, cursor: 'ns-resize' },
      { type: 'bottom', x: (screenTopLeft.x + screenBottomRight.x) / 2 - handleLength / 2, y: screenBottomRight.y - handleWidth / 2, w: handleLength, h: handleWidth, cursor: 'ns-resize' },
      { type: 'left', x: screenTopLeft.x - handleWidth / 2, y: (screenTopLeft.y + screenBottomRight.y) / 2 - handleLength / 2, w: handleWidth, h: handleLength, cursor: 'ew-resize' },
      { type: 'right', x: screenBottomRight.x - handleWidth / 2, y: (screenTopLeft.y + screenBottomRight.y) / 2 - handleLength / 2, w: handleWidth, h: handleLength, cursor: 'ew-resize' }
    ];
    
    return edges.map(edge => {
      const isDraggingThis = dragging?.polygonId === id && dragging?.edge === edge.type;
      return (
        <rect
          key={edge.type}
          x={edge.x}
          y={edge.y}
          width={edge.w}
          height={edge.h}
          rx={2}
          fill={isDraggingThis ? colors.stroke : 'white'}
          stroke={colors.stroke}
          strokeWidth={2}
          className="pointer-events-auto transition-all duration-150"
          style={{ cursor: edge.cursor }}
          onMouseDown={(e) => handleEdgeMouseDown(e, id, edge.type)}
        />
      );
    });
  };

  // Render corner handles for polygon editing
  const renderCornerHandles = (polygon, id, colors) => {
    return polygon.map((point, cornerIndex) => {
      const [x, y] = Array.isArray(point) ? point : [point.x, point.y];
      const screen = toScreenCoords(x, y);
      const isDraggingThis = dragging?.polygonId === id && dragging?.index === cornerIndex;
      
      return (
        <circle
          key={cornerIndex}
          cx={screen.x}
          cy={screen.y}
          r={isDraggingThis ? 8 : 6}
          fill={colors.stroke}
          stroke="white"
          strokeWidth={2}
          className="pointer-events-auto cursor-move transition-all duration-150"
          onMouseDown={(e) => handleCornerMouseDown(e, id, cornerIndex)}
          style={{
            filter: isDraggingThis ? 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' : undefined
          }}
        />
      );
    });
  };

  return (
    <svg
      ref={svgRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      width={containerWidth}
      height={containerHeight}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Glow filter for selected polygons */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {polygons.map((polygonData) => {
        const { id, polygon, judgment } = polygonData;
        if (!polygon || polygon.length < 3) return null;

        const isSelected = id === selectedPolygonId;
        const isHovered = id === hoveredPolygon;
        const colors = JUDGMENT_COLORS[judgment] || JUDGMENT_COLORS.WARNING;
        const path = createPath(polygon);

        return (
          <g key={id}>
            {/* Polygon fill */}
            <path
              d={path}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={isSelected ? SELECTED_STYLE.strokeWidth : colors.strokeWidth}
              strokeDasharray={isSelected ? SELECTED_STYLE.strokeDasharray : undefined}
              filter={isSelected ? 'url(#glow)' : undefined}
              className="pointer-events-auto cursor-pointer transition-all duration-150"
              style={{
                opacity: isHovered || isSelected ? 1 : 0.8
              }}
              onClick={(e) => handlePolygonClick(e, polygonData)}
              onMouseEnter={() => setHoveredPolygon(id)}
              onMouseLeave={() => setHoveredPolygon(null)}
            />

            {/* Editing handles */}
            {isEditable && isSelected && (
              editMode === 'polygon' 
                ? renderCornerHandles(polygon, id, colors)
                : renderEdgeHandles(polygon, id, colors)
            )}

            {/* Label */}
            {(isHovered || isSelected) && polygon.length > 0 && (() => {
              // Find center of polygon
              const coords = polygon.map(p => Array.isArray(p) ? p : [p.x, p.y]);
              const centerX = coords.reduce((sum, [x]) => sum + x, 0) / coords.length;
              const centerY = coords.reduce((sum, [, y]) => sum + y, 0) / coords.length;
              const screen = toScreenCoords(centerX, centerY);
              
              return (
                <g>
                  <rect
                    x={screen.x - 30}
                    y={screen.y - 10}
                    width={60}
                    height={20}
                    rx={4}
                    fill={colors.stroke}
                    opacity={0.9}
                  />
                  <text
                    x={screen.x}
                    y={screen.y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize={11}
                    fontWeight="500"
                  >
                    {judgment}
                  </text>
                </g>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
}

export default PolygonOverlay;
