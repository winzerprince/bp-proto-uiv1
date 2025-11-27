'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { 
  ArrowLeft, 
  Download,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  MessageSquare,
  GripVertical,
  Tag,
  ZoomIn,
  ZoomOut,
  PanelLeft,
  Maximize2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { Card, Button, Select, Input, Textarea, LoadingSpinner, Modal } from '@/components/ui';
import { ImageViewer } from '@/components/ImageViewer';
import { 
  FileListPanel, 
  FileTabs, 
  InspectionCardsPanel, 
  PolygonOverlay,
  ScanItemsPanel,
  AnnotoriousOverlay
} from '@/components/inspection';
import { 
  getJobById, 
  getInspectionResults, 
  getBOMResults, 
  getScanResults 
} from '@/lib/mock-data';

export default function JobResultsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading, isAuthenticated } = useAuth();
  const [internalResults, setInternalResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [confidenceFilter, setConfidenceFilter] = useState(0);
  const [judgmentFilter, setJudgmentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkThreshold, setBulkThreshold] = useState(90);
  
  // Multi-file management states
  const [activeFileId, setActiveFileId] = useState(null);
  const [openedFileIds, setOpenedFileIds] = useState([]);
  const [showFileList, setShowFileList] = useState(true);
  
  // Inspection-specific states
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [expandedCards, setExpandedCards] = useState(new Set());
  // isEditMode will be set based on job type in useEffect
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAllHighlights, setShowAllHighlights] = useState(true); // Default to showing all highlights
  const [autoZoom, setAutoZoom] = useState(true); // Default to auto-zoom enabled
  
  // Drawing mode for creating new inspection areas
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [drawRect, setDrawRect] = useState(null);
  
  // Image dimensions for polygon rendering
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });
  
  // SEARCH-specific states
  const [elementTypeFilters, setElementTypeFilters] = useState(new Set(['text', 'table', 'figure']));
  const [tagFilters, setTagFilters] = useState(new Set());
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  
  // SCAN-specific states - selection box for scan area
  const [scanSelectionBox, setScanSelectionBox] = useState(null);
  
  const canvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const jobId = params?.id;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Track container dimensions for responsive canvas sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        setContainerDimensions({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Memoize job and results data to avoid cascading renders
  const job = useMemo(() => jobId ? getJobById(jobId) : null, [jobId]);
  
  const results = useMemo(() => {
    if (!jobId || !job) return [];
    
    if (job.taskType === 'INSPECTION') {
      return getInspectionResults(jobId);
    } else if (job.taskType === 'BOM') {
      return getBOMResults(jobId);
    } else if (job.taskType === 'SCAN') {
      return getScanResults(jobId);
    }
    return [];
  }, [jobId, job]);
  
  // Initialize selected result only once when results change
  // Use a ref to track if initial selection has been made
  const hasInitializedRef = useRef(false);
  
  useEffect(() => {
    if (results.length > 0 && job?.taskType === 'INSPECTION' && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // eslint-disable-next-line react-compiler/react-compiler
      setSelectedResult(results[0]);
    }
  }, [results, job?.taskType]);

  // Set default edit mode for SCAN jobs (scan tasks should default to edit mode)
  const hasInitializedEditModeRef = useRef(false);
  
  useEffect(() => {
    if (job?.taskType && !hasInitializedEditModeRef.current) {
      hasInitializedEditModeRef.current = true;
      if (job.taskType === 'SCAN') {
        // SCAN jobs default to edit mode for drawing scan regions
        // eslint-disable-next-line react-compiler/react-compiler
        setIsEditMode(true);
      }
    }
  }, [job?.taskType]);

  // Initialize selection box for SCAN jobs when image dimensions are known
  const hasInitializedSelectionBoxRef = useRef(false);
  
  useEffect(() => {
    if (job?.taskType === 'SCAN' && imageDimensions.width > 0 && !hasInitializedSelectionBoxRef.current) {
      hasInitializedSelectionBoxRef.current = true;
      // Create a selection box covering most of the image (with 5% margin)
      const margin = 0.05;
      // eslint-disable-next-line react-compiler/react-compiler
      setScanSelectionBox({
        x: imageDimensions.width * margin,
        y: imageDimensions.height * margin,
        width: imageDimensions.width * (1 - 2 * margin),
        height: imageDimensions.height * (1 - 2 * margin)
      });
    }
  }, [job?.taskType, imageDimensions]);

  // Initialize files from job when loaded
  const hasInitializedFilesRef = useRef(false);
  
  useEffect(() => {
    if (job?.files && job.files.length > 0 && !hasInitializedFilesRef.current) {
      hasInitializedFilesRef.current = true;
      const firstFileId = job.files[0].id;
      // eslint-disable-next-line react-compiler/react-compiler
      setActiveFileId(firstFileId);
      setOpenedFileIds([firstFileId]);
    }
  }, [job]);

  // Get results count by file for file list panel
  const resultsCountByFile = useMemo(() => {
    const counts = {};
    results.forEach(r => {
      const fileId = r.fileId || job?.files?.[0]?.id;
      counts[fileId] = (counts[fileId] || 0) + 1;
    });
    return counts;
  }, [results, job]);

  // Combine original results with internal (user-created/modified) results
  const combinedResults = useMemo(() => {
    // Internal results take precedence for matching IDs
    const internalIds = new Set(internalResults.map(r => r.id));
    const originalFiltered = results.filter(r => !internalIds.has(r.id));
    return [...originalFiltered, ...internalResults];
  }, [results, internalResults]);

  // Get results filtered by active file
  const fileFilteredResults = useMemo(() => {
    if (!activeFileId) return combinedResults;
    return combinedResults.filter(r => r.fileId === activeFileId || (!r.fileId && job?.files?.[0]?.id === activeFileId));
  }, [combinedResults, activeFileId, job]);

  // For SCAN jobs: Filter results by selection box (items whose center is inside the box)
  const scanFilteredResults = useMemo(() => {
    if (job?.taskType !== 'SCAN' || !scanSelectionBox) return fileFilteredResults;
    
    return fileFilteredResults.filter(result => {
      if (!result.polygon || result.polygon.length < 3) return false;
      
      // Calculate center of the result's polygon
      const points = result.polygon.map(p => Array.isArray(p) ? p : [p.x, p.y]);
      const centerX = points.reduce((sum, p) => sum + p[0], 0) / points.length;
      const centerY = points.reduce((sum, p) => sum + p[1], 0) / points.length;
      
      // Check if center is inside selection box
      return (
        centerX >= scanSelectionBox.x &&
        centerX <= scanSelectionBox.x + scanSelectionBox.width &&
        centerY >= scanSelectionBox.y &&
        centerY <= scanSelectionBox.y + scanSelectionBox.height
      );
    });
  }, [job?.taskType, fileFilteredResults, scanSelectionBox]);

  // Polygon data for overlay
  const polygonData = useMemo(() => {
    return fileFilteredResults
      .filter(r => r.polygon && r.polygon.length >= 3)
      .map(r => ({
        id: r.id,
        polygon: r.polygon,
        judgment: r.aiJudgment,
        type: r.type || r.findingType
      }));
  }, [fileFilteredResults]);

  // Handle file selection from file list
  const handleFileSelect = useCallback((fileId) => {
    setActiveFileId(fileId);
    if (!openedFileIds.includes(fileId)) {
      setOpenedFileIds(prev => [...prev, fileId]);
    }
  }, [openedFileIds]);

  // Handle tab close
  const handleTabClose = useCallback((fileId) => {
    const newOpenedIds = openedFileIds.filter(id => id !== fileId);
    setOpenedFileIds(newOpenedIds);
    if (activeFileId === fileId && newOpenedIds.length > 0) {
      setActiveFileId(newOpenedIds[newOpenedIds.length - 1]);
    } else if (newOpenedIds.length === 0) {
      setActiveFileId(null);
    }
  }, [openedFileIds, activeFileId]);

  // Handle result selection with optional zoom
  const handleResultSelect = useCallback((result, options = {}) => {
    setSelectedResult(result);
    
    // Auto-zoom to fit the polygon in view
    const shouldZoom = options.zoomToFit || (autoZoom && options.zoomToFit !== false);
    
    if (shouldZoom && result.polygon && result.polygon.length > 0) {
      // Calculate bounding box of polygon
      const xs = result.polygon.map(p => Array.isArray(p) ? p[0] : p.x);
      const ys = result.polygon.map(p => Array.isArray(p) ? p[1] : p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      
      // Get container dimensions from ref
      const container = canvasRef.current;
      const containerWidth = container?.clientWidth || 800;
      const containerHeight = container?.clientHeight || 600;
      
      // Calculate polygon dimensions
      const polygonWidth = maxX - minX;
      const polygonHeight = maxY - minY;
      
      // Add padding around the polygon (20% of polygon size, min 30px)
      const paddingX = Math.max(polygonWidth * 0.2, 30);
      const paddingY = Math.max(polygonHeight * 0.2, 30);
      
      // Calculate zoom level to fit polygon with padding in view
      // Use the smaller of X and Y zoom to ensure both fit
      const zoomX = containerWidth / (polygonWidth + paddingX * 2);
      const zoomY = containerHeight / (polygonHeight + paddingY * 2);
      const newZoom = Math.min(zoomX, zoomY);
      
      // Clamp zoom level to reasonable bounds
      const clampedZoom = Math.max(0.5, Math.min(newZoom, 4));
      
      // Calculate pan position to center the polygon
      // The polygon center in image coordinates
      const polygonCenterX = (minX + maxX) / 2;
      const polygonCenterY = (minY + maxY) / 2;
      
      // Image center
      const imageCenterX = imageDimensions.width / 2;
      const imageCenterY = imageDimensions.height / 2;
      
      // Offset from image center to polygon center
      const offsetFromCenterX = polygonCenterX - imageCenterX;
      const offsetFromCenterY = polygonCenterY - imageCenterY;
      
      // Pan position to center polygon (accounting for zoom)
      const newPanX = -offsetFromCenterX * clampedZoom;
      const newPanY = -offsetFromCenterY * clampedZoom;
      
      setZoomLevel(clampedZoom);
      setPanPosition({ x: newPanX, y: newPanY });
    }
  }, [imageDimensions, autoZoom]);

  // Handle polygon drag for editing (for scan jobs - vertex editing)
  const handlePolygonDrag = useCallback((polygonId, cornerIndex, newCoords) => {
    if (!isEditMode) return;
    // Update the polygon in internal results
    setInternalResults(prev => prev.map(r => {
      if (r.id === polygonId && r.polygon) {
        const newPolygon = [...r.polygon];
        newPolygon[cornerIndex] = [newCoords.x, newCoords.y];
        return { ...r, polygon: newPolygon };
      }
      return r;
    }));
  }, [isEditMode]);

  // Handle rectangle resize for editing (for inspection jobs - edge resizing)
  const handleRectangleResize = useCallback((polygonId, edge, newCoords) => {
    if (!isEditMode) return;
    // Update the polygon by moving the edge
    setInternalResults(prev => prev.map(r => {
      if (r.id === polygonId && r.polygon && r.polygon.length === 4) {
        // Assume polygon is a rectangle: [topLeft, topRight, bottomRight, bottomLeft]
        const polygon = r.polygon.map(p => Array.isArray(p) ? [...p] : [p.x, p.y]);
        
        switch (edge) {
          case 'top':
            polygon[0][1] = newCoords.y;
            polygon[1][1] = newCoords.y;
            break;
          case 'bottom':
            polygon[2][1] = newCoords.y;
            polygon[3][1] = newCoords.y;
            break;
          case 'left':
            polygon[0][0] = newCoords.x;
            polygon[3][0] = newCoords.x;
            break;
          case 'right':
            polygon[1][0] = newCoords.x;
            polygon[2][0] = newCoords.x;
            break;
        }
        
        return { ...r, polygon };
      }
      return r;
    }));
  }, [isEditMode]);

  // Handle add new inspection item
  const handleAddInspectionItem = useCallback(() => {
    // Create a new inspection item with default values
    const newItem = {
      id: `insp-new-${Date.now()}`,
      fileId: activeFileId,
      type: '新規検査項目',
      findingType: '新規検査項目',
      aiJudgment: 'WARNING',
      confidence: 0.5,
      aiComment: '新規追加された検査項目です。詳細を編集してください。',
      userAction: 'unconfirmed',
      userComment: '',
      polygon: [[100, 100], [200, 100], [200, 200], [100, 200]],
      boundingBox: { x: 100, y: 100, width: 100, height: 100 }
    };
    setInternalResults(prev => [...prev, newItem]);
    setSelectedResult(newItem);
  }, [activeFileId]);

  // Handle creating annotation from canvas (drawing)
  const handleAnnotationCreate = useCallback((annotationData) => {
    // Calculate bounding box from polygon
    const points = annotationData.polygon.map(p => Array.isArray(p) ? p : [p.x, p.y]);
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const boundingBox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    
    // Determine item type based on job type
    const isScan = job?.taskType === 'SCAN';
    const elementTypes = ['text', 'table', 'figure'];
    const randomType = elementTypes[Math.floor(Math.random() * elementTypes.length)];
    
    const newItem = isScan ? {
      id: `scan-drawn-${Date.now()}`,
      jobId: jobId,
      fileId: activeFileId,
      fileName: job?.files?.find(f => f.id === activeFileId)?.name || 'unknown',
      page: 1,
      elementType: randomType,
      tagName: '新規スキャン要素',
      tagCategory: 'detail_view',
      confidence: 0.5,
      aiComment: 'AI分析中... 図面要素を解析しています。',
      userAction: 'pending',
      userComment: '',
      polygon: annotationData.polygon,
      boundingBox
    } : {
      id: `insp-drawn-${Date.now()}`,
      fileId: activeFileId,
      type: annotationData.type === 'polygon' ? 'ポリゴン検査' : '矩形検査',
      findingType: annotationData.type === 'polygon' ? 'ポリゴン検査' : '矩形検査',
      aiJudgment: 'WARNING',
      confidence: 0.75,
      aiComment: 'AI分析中...',
      userAction: 'unconfirmed',
      userComment: '',
      polygon: annotationData.polygon,
      boundingBox
    };
    
    setInternalResults(prev => [...prev, newItem]);
    setSelectedResult(newItem);
    
    // Simulate AI analysis after a short delay
    setTimeout(() => {
      setInternalResults(prev => prev.map(r => {
        if (r.id === newItem.id) {
          const randomConfidence = 0.7 + Math.random() * 0.25;
          
          if (isScan) {
            // Scan result AI analysis
            const tagNames = ['部品リスト', '寸法情報', '注釈テキスト', '機器配置', '配管詳細', '接続部詳細'];
            const tagCategories = ['BOM', 'dimension', 'detail_view', 'floor_plan', 'section_view'];
            return {
              ...r,
              confidence: randomConfidence,
              tagName: tagNames[Math.floor(Math.random() * tagNames.length)],
              tagCategory: tagCategories[Math.floor(Math.random() * tagCategories.length)],
              aiComment: randomConfidence > 0.85 
                ? '高精度で図面要素を検出しました。確認をお願いします。'
                : randomConfidence > 0.7
                ? '図面要素を検出しました。詳細を確認してください。'
                : '要素を検出しましたが、信頼度が低いため手動確認が必要です。',
              detailedInfo: {
                detectedAt: new Date().toISOString(),
                area: `${Math.round(boundingBox.width * boundingBox.height)} px²`,
                aspectRatio: (boundingBox.width / boundingBox.height).toFixed(2)
              }
            };
          } else {
            // Inspection result AI analysis
            const judgments = ['OK', 'NG', 'WARNING'];
            const randomJudgment = judgments[Math.floor(Math.random() * judgments.length)];
            return {
              ...r,
              aiJudgment: randomJudgment,
              confidence: randomConfidence,
              aiComment: randomJudgment === 'OK' 
                ? '指定エリアは問題ありません。図面と一致しています。'
                : randomJudgment === 'NG'
                ? '指定エリアで不整合が検出されました。確認が必要です。'
                : '指定エリアで軽微な問題が検出されました。'
            };
          }
        }
        return r;
      }));
    }, 1500);
  }, [activeFileId, job, jobId]);

  // Handle delete annotation from canvas
  const handleAnnotationDelete = useCallback((annotationId) => {
    const result = [...results, ...internalResults].find(r => r.id === annotationId);
    if (result && window.confirm(`「${result.findingType || result.tagName || result.type || '選択項目'}」を削除してもよろしいですか？`)) {
      setInternalResults(prev => prev.filter(r => r.id !== annotationId));
      if (selectedResult?.id === annotationId) {
        setSelectedResult(null);
      }
    }
  }, [results, internalResults, selectedResult]);

  // Handle delete inspection item
  const handleDeleteInspectionItem = useCallback((result) => {
    if (window.confirm(`「${result.findingType || result.type}」を削除してもよろしいですか？`)) {
      setInternalResults(prev => prev.filter(r => r.id !== result.id));
      if (selectedResult?.id === result.id) {
        setSelectedResult(null);
      }
    }
  }, [selectedResult]);

  // Handle edit inspection item
  const handleEditInspectionItem = useCallback((result) => {
    // For now, just select and enable edit mode
    setSelectedResult(result);
    setIsEditMode(true);
  }, []);

  // Memoize filtered results to avoid unnecessary recalculations and cascading renders
  const filteredResults = useMemo(() => {
    let filtered = [...results];

    if (confidenceFilter > 0) {
      filtered = filtered.filter(r => r.confidence * 100 >= confidenceFilter);
    }

    if (job?.taskType === 'INSPECTION') {
      if (judgmentFilter !== 'all') {
        filtered = filtered.filter(r => r.aiJudgment === judgmentFilter);
      }
      if (typeFilter !== 'all') {
        filtered = filtered.filter(r => r.type === typeFilter);
      }
      if (actionFilter !== 'all') {
        filtered = filtered.filter(r => r.userAction === actionFilter);
      }
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(r => 
          r.aiComment?.toLowerCase().includes(lowerQuery) ||
          r.userComment?.toLowerCase().includes(lowerQuery) ||
          r.type?.toLowerCase().includes(lowerQuery)
        );
      }
    } else if (job?.taskType === 'BOM') {
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(r =>
          r.partName?.toLowerCase().includes(lowerQuery) ||
          r.partNumber?.toLowerCase().includes(lowerQuery) ||
          r.specification?.toLowerCase().includes(lowerQuery) ||
          r.category?.toLowerCase().includes(lowerQuery)
        );
      }
    } else if (job?.taskType === 'SEARCH') {
      // Element type filtering
      if (elementTypeFilters.size > 0 && elementTypeFilters.size < 3) {
        filtered = filtered.filter(r => elementTypeFilters.has(r.elementType?.toLowerCase()));
      }
      // Tag filtering
      if (tagFilters.size > 0) {
        filtered = filtered.filter(r => 
          r.tags?.some(tag => tagFilters.has(tag.toLowerCase()))
        );
      }
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(r =>
          r.drawingName?.toLowerCase().includes(lowerQuery) ||
          r.matchedElement?.toLowerCase().includes(lowerQuery) ||
          r.elementType?.toLowerCase().includes(lowerQuery)
        );
      }
    }

    return filtered;
  }, [results, confidenceFilter, judgmentFilter, typeFilter, actionFilter, searchQuery, job?.taskType, elementTypeFilters, tagFilters]);

  // Canvas interaction handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  // Get image coordinates from mouse event
  const getImageCoords = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate position relative to image center with zoom and pan applied
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Reverse the transform to get image coordinates
    const imageX = (mouseX - centerX - panPosition.x) / zoomLevel + imageDimensions.width / 2;
    const imageY = (mouseY - centerY - panPosition.y) / zoomLevel + imageDimensions.height / 2;
    
    return { x: imageX, y: imageY };
  }, [panPosition, zoomLevel, imageDimensions]);

  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) { // Left click
      // If in edit mode, start drawing
      if (isEditMode) {
        const coords = getImageCoords(e);
        if (coords) {
          setIsDrawing(true);
          setDrawStart(coords);
          setDrawRect({ startX: coords.x, startY: coords.y, endX: coords.x, endY: coords.y });
        }
      } else {
        // Normal panning mode
        setIsPanning(true);
        setPanStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
      }
    }
  }, [panPosition, isEditMode, getImageCoords]);

  const handleMouseMove = useCallback((e) => {
    if (isDrawing && drawStart) {
      const coords = getImageCoords(e);
      if (coords) {
        setDrawRect(prev => prev ? { ...prev, endX: coords.x, endY: coords.y } : null);
      }
    } else if (isPanning) {
      setPanPosition({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [isPanning, panStart, isDrawing, drawStart, getImageCoords]);

  const handleMouseUp = useCallback(() => {
    // If we were drawing, create a new inspection item
    if (isDrawing && drawRect) {
      const minX = Math.min(drawRect.startX, drawRect.endX);
      const maxX = Math.max(drawRect.startX, drawRect.endX);
      const minY = Math.min(drawRect.startY, drawRect.endY);
      const maxY = Math.max(drawRect.startY, drawRect.endY);
      
      // Only create if the drawn area is large enough
      if (Math.abs(maxX - minX) > 20 && Math.abs(maxY - minY) > 20) {
        // Create a new inspection item with the drawn rectangle as polygon
        const newItem = {
          id: `insp-drawn-${Date.now()}`,
          fileId: activeFileId,
          type: '新規検査項目',
          findingType: '新規検査項目',
          aiJudgment: 'WARNING',
          confidence: 0.5,
          aiComment: 'AI分析中...',
          aiInference: 'ユーザーが指定したエリアを分析しています。',
          userAction: 'unconfirmed',
          userComment: '',
          polygon: [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]],
          boundingBox: { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
        };
        
        // Simulate AI processing with a delay
        setTimeout(() => {
          setInternalResults(prev => prev.map(r => {
            if (r.id === newItem.id) {
              // Simulate AI analysis result
              const judgments = ['OK', 'NG', 'WARNING'];
              const randomJudgment = judgments[Math.floor(Math.random() * judgments.length)];
              const randomConfidence = 0.65 + Math.random() * 0.3;
              return {
                ...r,
                aiJudgment: randomJudgment,
                confidence: randomConfidence,
                aiComment: randomJudgment === 'OK' 
                  ? '指定エリアは問題ありません。図面と一致しています。'
                  : randomJudgment === 'NG'
                  ? '指定エリアで不整合が検出されました。確認が必要です。'
                  : '指定エリアで軽微な問題が検出されました。',
                aiInference: 'AI分析が完了しました。'
              };
            }
            return r;
          }));
        }, 1500);
        
        setInternalResults(prev => [...prev, newItem]);
        setSelectedResult(newItem);
      }
      
      setDrawRect(null);
      setDrawStart(null);
      setIsDrawing(false);
    }
    setIsPanning(false);
  }, [isDrawing, drawRect, activeFileId]);
  
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(3, prev + 0.1));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(0.5, prev - 0.1));
  }, []);
  
  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);
  
  const toggleElementType = useCallback((type) => {
    setElementTypeFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);
  
  const toggleTagFilter = useCallback((tag) => {
    setTagFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleUpdateUserAction = useCallback((resultId, action) => {
    setInternalResults(prevResults => prevResults.map(r => 
      r.id === resultId ? { ...r, userAction: action } : r
    ));
  }, []);

  const handleUpdateUserComment = useCallback((resultId, comment) => {
    setInternalResults(prevResults => prevResults.map(r => 
      r.id === resultId ? { ...r, userComment: comment } : r
    ));
  }, []);

  const handleBulkConfirm = useCallback(() => {
    const toConfirm = filteredResults.filter(r => 
      r.confidence * 100 >= bulkThreshold && r.userAction === 'pending'
    );
    setShowBulkModal(false);
    
    setInternalResults(prevResults => prevResults.map(r => 
      toConfirm.find(tc => tc.id === r.id) 
        ? { ...r, userAction: 'confirmed' } 
        : r
    ));
  }, [filteredResults, bulkThreshold]);

  const bulkConfirmCount = useMemo(() => 
    filteredResults.filter(r => 
      r.confidence * 100 >= bulkThreshold && r.userAction === 'pending'
    ).length,
    [filteredResults, bulkThreshold]
  );

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            結果が見つかりません
          </h2>
          <Link href="/jobs">
            <Button variant="primary">ジョブ一覧に戻る</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Render functions for different job types
  const renderInspectionResults = () => {
    // Get active file info
    const activeFile = job.files?.find(f => f.id === activeFileId) || job.files?.[0];
    
    return (
      <div className="h-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900">
        {/* Fixed Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  {job.name} - BP Check結果
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {fileFilteredResults.length}件の検出結果 {activeFile && `(${activeFile.name})`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFileList(!showFileList)}
                className={`p-2 rounded transition-colors ${showFileList ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
                title={showFileList ? 'ファイル一覧を非表示' : 'ファイル一覧を表示'}
              >
                <PanelLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  isEditMode 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {isEditMode ? '編集モード' : '表示モード'}
              </button>
              <Link href={`/jobs/${job.id}`}>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Info className="w-4 h-4" />
                  詳細
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowBulkModal(true)}
                className="gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                一括確認
              </Button>
              <Button variant="primary" size="sm" className="gap-1.5">
                <Download className="w-4 h-4" />
                エクスポート
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content - 3 Panel Layout */}
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="horizontal">
            {/* Left Panel: File List */}
            {showFileList && (
              <>
                <Panel defaultSize={15} minSize={12} maxSize={25}>
                  <FileListPanel
                    files={job.files || []}
                    activeFileId={activeFileId}
                    onFileSelect={handleFileSelect}
                    resultsCountByFile={resultsCountByFile}
                  />
                </Panel>
                <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-primary transition-colors cursor-col-resize" />
              </>
            )}

            {/* Center Panel: Canvas with File Tabs */}
            <Panel defaultSize={showFileList ? 55 : 65} minSize={40}>
              <div className="h-full flex flex-col bg-white dark:bg-gray-900">
                {/* File Tabs */}
                <FileTabs
                  files={job.files || []}
                  openedFileIds={openedFileIds}
                  activeFileId={activeFileId}
                  onTabSelect={handleFileSelect}
                  onTabClose={handleTabClose}
                />

                {/* Zoom Controls - Instructions */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isEditMode ? 'ドラッグ: 検査エリアを編集 | スクロール: ズーム' : 'スクロール: ズーム | ドラッグ: パン | クリック: 選択'}
                  </span>
                  <div className="flex-1" />
                  {selectedResult && (
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                      選択中: {selectedResult.findingType || selectedResult.type}
                    </span>
                  )}
                </div>

                {/* Canvas Area with Annotorious */}
                <div 
                  ref={canvasRef}
                  className="flex-1 overflow-hidden relative bg-gray-100 dark:bg-gray-950"
                >
                  {activeFile?.preview ? (
                    <AnnotoriousOverlay
                      annotations={fileFilteredResults.map(r => ({
                        id: r.id,
                        polygon: r.polygon,
                        boundingBox: r.boundingBox,
                        judgment: r.aiJudgment,
                        type: r.findingType || r.type,
                        ...r
                      }))}
                      imageUrl={activeFile.preview}
                      selectedAnnotationId={selectedResult?.id}
                      onAnnotationSelect={(id) => {
                        const result = fileFilteredResults.find(r => r.id === id);
                        if (result) handleResultSelect(result, { zoomToFit: autoZoom });
                      }}
                      onAnnotationUpdate={(id, updates) => {
                        setInternalResults(prev => {
                          const exists = prev.find(r => r.id === id);
                          if (exists) {
                            return prev.map(r => r.id === id ? { ...r, ...updates } : r);
                          }
                          // If updating an original result, add to internal results
                          const original = results.find(r => r.id === id);
                          if (original) {
                            return [...prev, { ...original, ...updates }];
                          }
                          return prev;
                        });
                      }}
                      onAnnotationCreate={handleAnnotationCreate}
                      onAnnotationDelete={handleAnnotationDelete}
                      isEditable={isEditMode}
                      showAllAnnotations={showAllHighlights}
                      onImageLoad={(dims) => setImageDimensions(dims)}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>ファイルを選択してください</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-primary transition-colors cursor-col-resize" />

            {/* Right Panel: Inspection Cards */}
            <Panel defaultSize={30} minSize={20} maxSize={40}>
              <InspectionCardsPanel
                results={fileFilteredResults.map(r => ({
                  ...r,
                  fileId: r.fileId || activeFileId,
                  findingType: r.findingType || r.type
                }))}
                activeFileId={activeFileId}
                selectedResultId={selectedResult?.id}
                onResultSelect={handleResultSelect}
                onEdit={handleEditInspectionItem}
                onDelete={handleDeleteInspectionItem}
                onAdd={handleAddInspectionItem}
                onUpdateAction={handleUpdateUserAction}
                onUpdateResult={(id, updates) => {
                  // Update the result with new text/judgment values
                  setInternalResults(prev => {
                    const exists = prev.find(r => r.id === id);
                    if (exists) {
                      return prev.map(r => r.id === id ? { ...r, ...updates } : r);
                    }
                    // If updating an original result, add to internal results
                    const original = results.find(r => r.id === id);
                    if (original) {
                      return [...prev, { ...original, ...updates }];
                    }
                    return prev;
                  });
                }}
                showAllHighlights={showAllHighlights}
                onToggleShowAll={() => setShowAllHighlights(prev => !prev)}
                autoZoom={autoZoom}
                onToggleAutoZoom={() => setAutoZoom(prev => !prev)}
                confidenceFilter={confidenceFilter}
                onConfidenceFilterChange={setConfidenceFilter}
                isEditMode={isEditMode}
                onEditModeChange={setIsEditMode}
              />
            </Panel>
          </PanelGroup>
        </div>

        {/* Bulk Confirm Modal */}
        <Modal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          title="一括確認"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
                キャンセル
              </Button>
              <Button variant="primary" onClick={handleBulkConfirm}>
                {bulkConfirmCount}件を確認
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              信頼度の高い項目を一括で確認済みにします
            </p>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 block">
                信頼度のしきい値: {bulkThreshold}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={bulkThreshold}
                onChange={(e) => setBulkThreshold(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>{bulkConfirmCount}件</strong>の未確認項目が一括確認されます
              </p>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  const renderBOMResults = () => (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.name} - BOM結果</h1>
              <p className="text-gray-600">{filteredResults.length}件の部品</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/jobs/${job.id}`}>
                <Button variant="ghost" className="gap-2">
                  <Info className="w-4 h-4" />
                  メタデータを表示
                </Button>
              </Link>
              <Input
                placeholder="部品名・番号で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button variant="primary" className="gap-2">
                <Download className="w-4 h-4" />
                Excelエクスポート
              </Button>
            </div>
          </div>
        </div>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">No.</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">部品番号</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">部品名</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">仕様</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">数量</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">単位</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">カテゴリ</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">信頼度</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result, index) => (
                  <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-900 font-mono">
                        {result.partNumber}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{result.partName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{result.specification}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                      {result.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{result.unit}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                        {result.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#004080] transition-all"
                            style={{ width: `${result.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {(result.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">該当する部品が見つかりません</p>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );

  const renderScanResults = () => {
    // Get active file info
    const activeFile = job.files?.find(f => f.id === activeFileId) || job.files?.[0];
    
    // Use scanFilteredResults (filtered by selection box) for the items list
    const displayResults = scanFilteredResults;
    
    return (
      <div className="h-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900">
        {/* Fixed Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/jobs?type=SCAN"
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  {job.name} - BP Scan結果
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  選択範囲内: {displayResults.length}件 / 全{fileFilteredResults.length}件 {activeFile && `(${activeFile.name})`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFileList(!showFileList)}
                className={`p-2 rounded transition-colors ${showFileList ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
                title={showFileList ? 'ファイル一覧を非表示' : 'ファイル一覧を表示'}
              >
                <PanelLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1.5 text-xs font-medium rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                スキャンモード
              </div>
              <Link href={`/jobs/${job.id}`}>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Info className="w-4 h-4" />
                  詳細
                </Button>
              </Link>
              <Button variant="primary" size="sm" className="gap-1.5">
                <Download className="w-4 h-4" />
                エクスポート
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content - 3 Panel Layout */}
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="horizontal">
            {/* Left Panel: File List */}
            {showFileList && (
              <>
                <Panel defaultSize={15} minSize={12} maxSize={25}>
                  <FileListPanel
                    files={job.files || []}
                    activeFileId={activeFileId}
                    onFileSelect={handleFileSelect}
                    resultsCountByFile={resultsCountByFile}
                  />
                </Panel>
                <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-primary transition-colors cursor-col-resize" />
              </>
            )}

            {/* Center Panel: Canvas with File Tabs */}
            <Panel defaultSize={showFileList ? 55 : 65} minSize={40}>
              <div className="h-full flex flex-col bg-white dark:bg-gray-900">
                {/* File Tabs */}
                <FileTabs
                  files={job.files || []}
                  openedFileIds={openedFileIds}
                  activeFileId={activeFileId}
                  onTabSelect={handleFileSelect}
                  onTabClose={handleTabClose}
                />

                {/* Scan Controls */}
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-purple-500" />
                    <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                      紫色の枠をドラッグしてスキャン範囲を調整
                    </span>
                  </div>
                  <div className="flex-1" />
                  <button
                    onClick={() => {
                      // Reset selection box to full image
                      if (imageDimensions.width > 0) {
                        const margin = 0.05;
                        setScanSelectionBox({
                          x: imageDimensions.width * margin,
                          y: imageDimensions.height * margin,
                          width: imageDimensions.width * (1 - 2 * margin),
                          height: imageDimensions.height * (1 - 2 * margin)
                        });
                      }
                    }}
                    className="px-2 py-1 text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors"
                  >
                    範囲をリセット
                  </button>
                </div>

                {/* Canvas Area with Scan Mode */}
                <div 
                  ref={drawCanvasRef}
                  className="flex-1 overflow-hidden relative bg-gray-100 dark:bg-gray-950"
                >
                  {activeFile?.preview ? (
                    <AnnotoriousOverlay
                      annotations={[]} // No individual annotations in scan mode
                      imageUrl={activeFile.preview}
                      selectedAnnotationId={null}
                      onAnnotationSelect={() => {}}
                      onAnnotationUpdate={() => {}}
                      isEditable={true} // Always editable in scan mode for resizing
                      showAllAnnotations={false}
                      onImageLoad={(dims) => setImageDimensions(dims)}
                      className="w-full h-full"
                      // Scan mode specific props
                      scanMode={true}
                      selectionBox={scanSelectionBox}
                      onSelectionBoxChange={setScanSelectionBox}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>ファイルを選択してください</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-primary transition-colors cursor-col-resize" />

            {/* Right Panel: Scan Items */}
            <Panel defaultSize={30} minSize={20} maxSize={40}>
              <ScanItemsPanel
                results={displayResults.map(r => ({
                  ...r,
                  fileId: r.fileId || activeFileId
                }))}
                activeFileId={activeFileId}
                selectedResultId={selectedResult?.id}
                onResultSelect={handleResultSelect}
                onUpdateAction={(id, action) => {
                  setInternalResults(prev => {
                    const exists = prev.find(r => r.id === id);
                    if (exists) {
                      return prev.map(r => r.id === id ? { ...r, userAction: action } : r);
                    }
                    // If updating an original result, add to internal results
                    const original = results.find(r => r.id === id);
                    if (original) {
                      return [...prev, { ...original, userAction: action }];
                    }
                    return prev;
                  });
                }}
                showAllHighlights={showAllHighlights}
                onToggleShowAll={() => setShowAllHighlights(prev => !prev)}
                autoZoom={autoZoom}
                onToggleAutoZoom={() => setAutoZoom(prev => !prev)}
              />
            </Panel>
          </PanelGroup>
        </div>

        {/* Detail Modal for scan results */}
        {selectedSearchResult && (
          <Modal
            isOpen={!!selectedSearchResult}
            onClose={() => setSelectedSearchResult(null)}
            title="要素詳細"
          >
            <div className="space-y-4">
              {selectedSearchResult.preview && (
                <div className="relative h-60 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={selectedSearchResult.preview}
                    alt={selectedSearchResult.matchedElement}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{selectedSearchResult.matchedElement}</h3>
                <p className="text-sm text-gray-600">{selectedSearchResult.snippet}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setSelectedSearchResult(null)}>
                  閉じる
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  };

  // Render appropriate view based on job type
  if (job.taskType === 'INSPECTION') {
    return renderInspectionResults();
  } else if (job.taskType === 'BOM') {
    return renderBOMResults();
  } else if (job.taskType === 'SCAN') {
    return renderScanResults();
  }

  return null;
}
