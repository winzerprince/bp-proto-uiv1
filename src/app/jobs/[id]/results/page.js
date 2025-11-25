'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { Card, Button, Select, Input, Textarea, LoadingSpinner, Modal } from '@/components/ui';
import { 
  getJobById, 
  getInspectionResults, 
  getBOMResults, 
  getSearchResults 
} from '@/lib/mock-data';

export default function JobResultsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [confidenceFilter, setConfidenceFilter] = useState(0);
  const [judgmentFilter, setJudgmentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkThreshold, setBulkThreshold] = useState(90);
  
  // Inspection-specific states
  const [activeTab, setActiveTab] = useState('real'); // 'real', 'blueprint', 'split'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [commentsVisible, setCommentsVisible] = useState(true);
  const [commentsSticky, setCommentsSticky] = useState(false);
  
  // SEARCH-specific states
  const [elementTypeFilters, setElementTypeFilters] = useState(new Set(['text', 'table', 'figure']));
  const [tagFilters, setTagFilters] = useState(new Set());
  
  const canvasRef = useRef(null);
  const jobId = params?.id;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (jobId) {
      const jobData = getJobById(jobId);
      if (jobData) {
        setJob(jobData);
        
        let resultsData = [];
        if (jobData.taskType === 'INSPECTION') {
          resultsData = getInspectionResults(jobId);
        } else if (jobData.taskType === 'BOM') {
          resultsData = getBOMResults(jobId);
        } else if (jobData.taskType === 'SEARCH') {
          resultsData = getSearchResults(jobId);
        }
        
        setResults(resultsData);
        setFilteredResults(resultsData);
        if (resultsData.length > 0 && jobData.taskType === 'INSPECTION') {
          setSelectedResult(resultsData[0]);
        }
      }
    }
  }, [jobId]);

  useEffect(() => {
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
        filtered = filtered.filter(r => 
          r.aiComment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.userComment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.type?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    } else if (job?.taskType === 'BOM') {
      if (searchQuery) {
        filtered = filtered.filter(r =>
          r.partName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.partNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.specification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category?.toLowerCase().includes(searchQuery.toLowerCase())
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
        filtered = filtered.filter(r =>
          r.drawingName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.matchedElement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.elementType?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }

    setFilteredResults(filtered);
  }, [results, confidenceFilter, judgmentFilter, typeFilter, actionFilter, searchQuery, job, elementTypeFilters, tagFilters]);

  // Canvas interaction handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) { // Left click
      setIsPanning(true);
      setPanStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  }, [panPosition]);

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      setPanPosition({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
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

  const handleUpdateUserAction = (resultId, action) => {
    setResults(results.map(r => 
      r.id === resultId ? { ...r, userAction: action } : r
    ));
  };

  const handleUpdateUserComment = (resultId, comment) => {
    setResults(results.map(r => 
      r.id === resultId ? { ...r, userComment: comment } : r
    ));
  };

  const handleBulkConfirm = () => {
    const toConfirm = filteredResults.filter(r => 
      r.confidence * 100 >= bulkThreshold && r.userAction === 'pending'
    );
    setShowBulkModal(false);
    
    setResults(results.map(r => 
      toConfirm.find(tc => tc.id === r.id) 
        ? { ...r, userAction: 'confirmed' } 
        : r
    ));
  };

  const bulkConfirmCount = filteredResults.filter(r => 
    r.confidence * 100 >= bulkThreshold && r.userAction === 'pending'
  ).length;

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
    const currentIndex = filteredResults.findIndex(r => r.id === selectedResult?.id);
    const hasNext = currentIndex < filteredResults.length - 1;
    const hasPrev = currentIndex > 0;
    const getJudgmentIcon = (judgment) => {
      switch (judgment) {
        case 'OK': return CheckCircle;
        case 'NG': return AlertCircle;
        case 'WARNING': return AlertTriangle;
        default: return AlertCircle;
      }
    };

    return (
      <div className="h-screen flex flex-col bg-[#F9FAFB]">
        {/* Fixed Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {job.name} - 検図結果
                </h1>
                <p className="text-sm text-gray-600">
                  {filteredResults.length}件の検出結果
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/jobs/${job.id}`}>
                <Button variant="ghost" className="gap-2">
                  <Info className="w-4 h-4" />
                  メタデータを表示
                </Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => setShowBulkModal(true)}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                一括確認
              </Button>
              <Button variant="primary" className="gap-2">
                <Download className="w-4 h-4" />
                エクスポート
              </Button>
            </div>
          </div>
        </header>

        {/* Resizable Split Pane Content */}
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="horizontal">
            {/* Left: Canvas with Tabs */}
            <Panel defaultSize={60} minSize={30}>
              <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200">
                {/* Tabs */}
                <div className="flex items-center gap-1 px-4 pt-4 pb-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('real')}
                    className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
                      activeTab === 'real'
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-t border-x border-gray-300'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    実画像
                  </button>
                  <button
                    onClick={() => setActiveTab('blueprint')}
                    className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
                      activeTab === 'blueprint'
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-t border-x border-gray-300'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    図面
                  </button>
                  <button
                    onClick={() => setActiveTab('split')}
                    className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
                      activeTab === 'split'
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-t border-x border-gray-300'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    比較表示
                  </button>
                  <div className="flex-1" />
                  <div className="text-gray-900 dark:text-white text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">
                    ズーム: {Math.round(zoomLevel * 100)}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    スクロール: ズーム | 左ドラッグ: パン
                  </div>
                </div>

                {/* Canvas */}
                <div 
                  ref={canvasRef}
                  className="flex-1 overflow-hidden relative cursor-move bg-gray-50 dark:bg-gray-900"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: `translate(${panPosition.x}px, ${panPosition.y}px)`
                    }}
                  >
                    {activeTab === 'split' ? (
                      <div className="flex gap-4">
                        {/* Real Image */}
                        <div className="relative">
                          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 text-xs rounded z-10">
                            実画像
                          </div>
                          {selectedResult && job.files[0]?.preview ? (
                            <div className="relative" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}>
                              <Image
                                src={job.files[0].preview}
                                alt="Real"
                                width={400}
                                height={300}
                                className="rounded shadow-lg border-2 border-blue-500"
                                unoptimized
                              />
                              {selectedResult.boundingBox && (
                                <div
                                  className="absolute border-4 border-yellow-400 bg-yellow-400/20 animate-pulse"
                                  style={{
                                    left: selectedResult.boundingBox.x / 2,
                                    top: selectedResult.boundingBox.y / 2,
                                    width: selectedResult.boundingBox.width / 2,
                                    height: selectedResult.boundingBox.height / 2,
                                  }}
                                />
                              )}
                            </div>
                          ) : (
                            <div className="w-[400px] h-[300px] bg-gray-800 rounded flex items-center justify-center">
                              <Eye className="w-12 h-12 text-gray-600" />
                            </div>
                          )}
                        </div>
                        {/* Blueprint */}
                        <div className="relative">
                          <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 text-xs rounded z-10">
                            図面
                          </div>
                          {selectedResult && job.files[0]?.preview ? (
                            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}>
                              <Image
                                src={job.files[0].preview}
                                alt="Blueprint"
                                width={400}
                                height={300}
                                className="rounded shadow-lg border-2 border-purple-500"
                                unoptimized
                              />
                              {selectedResult.boundingBox && (
                                <div
                                  className="absolute border-4 border-red-500 bg-red-500/20 animate-pulse"
                                  style={{
                                    left: selectedResult.boundingBox.x / 2,
                                    top: selectedResult.boundingBox.y / 2,
                                    width: selectedResult.boundingBox.width / 2,
                                    height: selectedResult.boundingBox.height / 2,
                                  }}
                                >
                                  <div className="absolute -top-6 left-0 bg-red-500 text-white px-2 py-0.5 text-xs rounded shadow-lg">
                                    {selectedResult.type}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-[400px] h-[300px] bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                              <Eye className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        {selectedResult && job.files[0]?.preview ? (
                          <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}>
                            <Image
                              src={job.files[0].preview}
                              alt={activeTab === 'real' ? 'Real Image' : 'Blueprint'}
                              width={800}
                              height={600}
                              className="rounded shadow-lg"
                              unoptimized
                            />
                            {activeTab === 'blueprint' && selectedResult.boundingBox && (
                              <div
                                className="absolute border-4 border-red-500 bg-red-500/20"
                                style={{
                                  left: selectedResult.boundingBox.x,
                                  top: selectedResult.boundingBox.y,
                                  width: selectedResult.boundingBox.width,
                                  height: selectedResult.boundingBox.height,
                                }}
                              >
                                <div className="absolute -top-8 left-0 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
                                  {selectedResult.type}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 dark:text-gray-400">
                            <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>結果を選択すると画像が表示されます</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Controls */}
                {selectedResult && (
                  <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => hasPrev && setSelectedResult(filteredResults[currentIndex - 1])}
                      disabled={!hasPrev}
                      className="gap-2 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      前へ
                    </Button>
                    <span className="text-gray-900 dark:text-white text-sm font-medium">
                      {currentIndex + 1} / {filteredResults.length}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => hasNext && setSelectedResult(filteredResults[currentIndex + 1])}
                      disabled={!hasNext}
                      className="gap-2 disabled:opacity-50"
                    >
                      次へ
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Panel>

            {/* Resize Handle */}
            <PanelResizeHandle className="w-2 bg-gray-300 hover:bg-blue-500 transition-colors cursor-col-resize flex items-center justify-center group">
              <div className="w-1 h-8 bg-gray-400 rounded group-hover:bg-blue-600" />
            </PanelResizeHandle>

            {/* Right: Results List */}
            <Panel defaultSize={40} minSize={25}>
              <div className="h-full flex flex-col bg-white overflow-hidden">
                {/* Filters */}
                <div className="border-b border-gray-200 p-4 space-y-3 shrink-0">
                  <Input
                    placeholder="検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={judgmentFilter}
                      onChange={(e) => setJudgmentFilter(e.target.value)}
                      className="text-sm"
                    >
                      <option value="all">すべての判定</option>
                      <option value="OK">OK</option>
                      <option value="NG">NG</option>
                      <option value="WARNING">警告</option>
                    </Select>
                    <Select
                      value={actionFilter}
                      onChange={(e) => setActionFilter(e.target.value)}
                      className="text-sm"
                    >
                      <option value="all">すべてのアクション</option>
                      <option value="pending">未確認</option>
                      <option value="confirmed">確認済み</option>
                      <option value="needs_fix">要修正</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      信頼度: {confidenceFilter}% 以上
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={confidenceFilter}
                      onChange={(e) => setConfidenceFilter(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredResults.map((result) => {
                    const JudgmentIcon = getJudgmentIcon(result.aiJudgment);
                    const isSelected = result.id === selectedResult?.id;
                    const isExpanded = expandedCards.has(result.id);

                    return (
                      <div
                        key={result.id}
                        className={`border-b border-gray-200 ${
                          isSelected ? 'bg-blue-50 border-l-4 border-l-[#004080]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div
                          onClick={() => {
                            setSelectedResult(result);
                            toggleCardExpansion(result.id);
                          }}
                          className="p-4 cursor-pointer"
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <JudgmentIcon className={`w-5 h-5 shrink-0 mt-0.5 ${
                              result.aiJudgment === 'OK' ? 'text-green-600' :
                              result.aiJudgment === 'NG' ? 'text-red-600' : 'text-amber-600'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {result.type}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-0.5 rounded border ${
                                    result.aiJudgment === 'OK' ? 'text-green-600 bg-green-50 border-green-200' :
                                    result.aiJudgment === 'NG' ? 'text-red-600 bg-red-50 border-red-200' :
                                    'text-amber-600 bg-amber-50 border-amber-200'
                                  }`}>
                                    {result.aiJudgment}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleCardExpansion(result.id);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                {result.aiComment}
                              </p>
                              
                              {/* Expanded Details */}
                              {isExpanded && (
                                <div className="mt-3 p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg space-y-3 text-xs border border-blue-100 dark:border-gray-600">
                                  <div className="pb-2 border-b border-blue-200 dark:border-gray-600">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                      <Info className="w-3 h-3" />
                                      AI詳細分析
                                    </span>
                                    <p className="text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                                      座標: X:{result.boundingBox?.x || 0}, Y:{result.boundingBox?.y || 0}<br />
                                      サイズ: {result.boundingBox?.width || 0}×{result.boundingBox?.height || 0}px<br />
                                      検出ファイル: {result.evidenceFile} (Page {result.evidencePage})<br />
                                      処理時間: 2.3秒<br />
                                      モデル: GPT-4 Vision + Custom Blueprint Analyzer
                                    </p>
                                  </div>
                                  <div className="pb-2 border-b border-blue-200 dark:border-gray-600">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      AI推論
                                    </span>
                                    <p className="text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                                      {result.aiJudgment === 'NG' 
                                        ? `実画像と図面を比較した結果、${result.type}において不一致が検出されました。画像解析により、実際の施工内容が設計図面の仕様と異なることが確認されています。信頼度${Math.round(result.confidence * 100)}%で不適合と判定しています。`
                                        : result.aiJudgment === 'WARNING'
                                        ? `${result.type}において潜在的な問題が検出されました。完全な不一致ではありませんが、詳細な確認が必要な状態です。測定誤差や角度の違いにより、判定が難しい箇所となっています。`
                                        : `${result.type}において実画像と図面の整合性が確認されました。視覚的な解析と寸法チェックの両方で問題は検出されませんでした。施工は設計通りに実施されていると判断されます。`}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      AI推奨事項
                                    </span>
                                    <p className="text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                                      {result.aiJudgment === 'NG' 
                                        ? `【緊急対応必要】構造設計者と施工図作成者に即座に連絡してください。不一致の原因を特定し、是正措置を検討する必要があります。現場確認を実施し、再施工の要否を判断してください。関係者会議の開催を推奨します。`
                                        : result.aiJudgment === 'WARNING'
                                        ? `【要確認】現場で実測を行い、実際の寸法や配置を確認してください。写真の撮影角度を変えて再撮影することで、より正確な判定が可能になる場合があります。必要に応じて設計者に問い合わせてください。`
                                        : `【対応不要】問題は検出されていません。確認済みとしてマークし、次の検査項目に進んでください。記録として保管し、完了報告書に含めることができます。`}
                                    </p>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    信頼度: {Math.round(result.confidence * 100)}%
                                  </span>
                                  <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#004080]"
                                      style={{ width: `${result.confidence * 100}%` }}
                                    />
                                  </div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  result.userAction === 'confirmed' ? 'bg-green-100 text-green-700' :
                                  result.userAction === 'needs_fix' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {result.userAction === 'confirmed' ? '確認済み' :
                                   result.userAction === 'needs_fix' ? '要修正' : '未確認'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Comments Section */}
                {selectedResult && (
                  <div className={`border-t border-gray-200 bg-gray-50 transition-all duration-300 ${
                    commentsSticky ? 'sticky bottom-0' : ''
                  } ${commentsVisible ? 'p-4' : 'p-2'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                        <h3 className="text-sm font-semibold text-gray-900">
                          コメント & アクション
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCommentsSticky(!commentsSticky)}
                          className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                            commentsSticky ? 'bg-blue-100 text-blue-600' : 'text-gray-500'
                          }`}
                          title={commentsSticky ? '固定解除' : '下部に固定'}
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCommentsVisible(!commentsVisible)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-500"
                          title={commentsVisible ? '折りたたむ' : '展開する'}
                        >
                          {commentsVisible ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {commentsVisible && (
                      <>
                        <Select
                          value={selectedResult.userAction}
                          onChange={(e) => handleUpdateUserAction(selectedResult.id, e.target.value)}
                          className="mb-3 text-sm"
                        >
                          <option value="pending">未確認</option>
                          <option value="confirmed">確認済み</option>
                          <option value="needs_fix">要修正</option>
                        </Select>
                        <Textarea
                          placeholder="コメントを入力..."
                          value={selectedResult.userComment}
                          onChange={(e) => handleUpdateUserComment(selectedResult.id, e.target.value)}
                          rows={3}
                          className="text-sm"
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
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
            <p className="text-sm text-gray-600">
              信頼度の高い項目を一括で確認済みにします
            </p>
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
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
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
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

  const renderSearchResults = () => (
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.name} - 検索結果</h1>
              <p className="text-gray-600">{job.results?.searchQuery}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/jobs/${job.id}`}>
                <Button variant="ghost" className="gap-2">
                  <Info className="w-4 h-4" />
                  メタデータを表示
                </Button>
              </Link>
              <Input
                placeholder="図面名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </div>

        {/* Search Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-6 bg-purple-50 border-purple-200">
            <p className="text-sm text-purple-600 mb-1">総画像数</p>
            <p className="text-3xl font-bold text-gray-900">{job.results?.totalImages || 0}</p>
          </Card>
          <Card className="p-6 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-600 mb-1">抽出要素数</p>
            <p className="text-3xl font-bold text-gray-900">{job.results?.totalElements || 0}</p>
          </Card>
          <Card className="p-6 bg-green-50 border-green-200">
            <p className="text-sm text-green-600 mb-1">マッチ数</p>
            <p className="text-3xl font-bold text-gray-900">{filteredResults.length}</p>
          </Card>
        </div>

        {/* Results Grid */}
        <Card className="p-6">
          {/* Filter Section */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="space-y-4">
              {/* Element Type Filters */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  要素タイプで絞り込み
                </label>
                <div className="flex flex-wrap gap-2">
                  {['text', 'table', 'figure'].map(type => (
                    <button
                      key={type}
                      onClick={() => toggleElementType(type)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        elementTypeFilters.has(type)
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'text' ? '📝 テキスト' : type === 'table' ? '📋 表' : '🖼️ 図'}
                    </button>
                  ))}
                </div>
              </div>
              {/* Tag Filters */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  タグで絞り込み
                </label>
                <div className="flex flex-wrap gap-2">
                  {['bom', 'title_block', 'dimension', 'section_view', 'tolerance', 'welding_symbol'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTagFilter(tag)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        tagFilters.has(tag)
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            マッチした図面 ({filteredResults.length}件)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
              >
                {result.preview && (
                  <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden mb-3">
                    <Image
                      src={result.preview}
                      alt={result.drawingName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 flex-1">{result.drawingName}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 ml-2 shrink-0">
                    {result.elementType}
                  </span>
                </div>
                <p className="text-xs text-gray-700 mb-2 font-medium">{result.matchedElement}</p>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{result.snippet}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Page {result.page}</span>
                  <span className="text-xs text-gray-500">
                    信頼度: {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">該当する図面が見つかりません</p>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );

  // Render appropriate view based on job type
  if (job.taskType === 'INSPECTION') {
    return renderInspectionResults();
  } else if (job.taskType === 'BOM') {
    return renderBOMResults();
  } else if (job.taskType === 'SEARCH') {
    return renderSearchResults();
  }

  return null;
}
