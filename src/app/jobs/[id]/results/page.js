'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  ZoomIn,
  ZoomOut,
  Download,
  Filter,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  FileText,
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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkThreshold, setBulkThreshold] = useState(90);

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
        
        // Load appropriate results based on job type
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

    // Confidence filter
    if (confidenceFilter > 0) {
      filtered = filtered.filter(r => r.confidence * 100 >= confidenceFilter);
    }

    // Job-type specific filters
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
      if (searchQuery) {
        filtered = filtered.filter(r =>
          r.drawingName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.matchedElement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.elementType?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }

    setFilteredResults(filtered);
  }, [results, confidenceFilter, judgmentFilter, typeFilter, actionFilter, searchQuery, job]);

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
    const uniqueTypes = [...new Set(results.map(r => r.type))];
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
                href={`/jobs/${job.id}`}
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

        {/* Split Pane Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Blueprint Viewer */}
          <div className="w-3/5 border-r border-gray-200 bg-gray-900 relative flex flex-col">
            {/* Viewer Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setZoomLevel(Math.min(zoomLevel + 0.25, 3))}
                className="bg-white"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setZoomLevel(Math.max(zoomLevel - 0.25, 0.5))}
                className="bg-white"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Blueprint Image */}
            <div className="flex-1 flex items-center justify-center overflow-auto p-8">
              {selectedResult && job.files[0]?.preview ? (
                <div 
                  className="relative"
                  style={{ 
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center',
                    transition: 'transform 0.2s',
                  }}
                >
                  <div className="relative">
                    <Image
                      src={job.files[0].preview}
                      alt="Blueprint"
                      width={800}
                      height={600}
                      className="bg-white rounded shadow-lg"
                      unoptimized
                    />
                    {/* Bounding Box Overlay */}
                    {selectedResult.boundingBox && (
                      <div
                        className="absolute border-4 border-red-500 bg-red-500/10"
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
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>結果を選択すると図面が表示されます</p>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            {selectedResult && (
              <div className="bg-gray-800 border-t border-gray-700 px-6 py-3 flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => hasPrev && setSelectedResult(filteredResults[currentIndex - 1])}
                  disabled={!hasPrev}
                  className="gap-2 bg-gray-700 text-white border-gray-600 hover:bg-gray-600 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  前へ
                </Button>
                <span className="text-white text-sm">
                  {currentIndex + 1} / {filteredResults.length}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => hasNext && setSelectedResult(filteredResults[currentIndex + 1])}
                  disabled={!hasNext}
                  className="gap-2 bg-gray-700 text-white border-gray-600 hover:bg-gray-600 disabled:opacity-50"
                >
                  次へ
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Right: Results Table and Details */}
          <div className="w-2/5 flex flex-col bg-white overflow-hidden">
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

                return (
                  <div
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-l-[#004080]' : 'hover:bg-gray-50'
                    }`}
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
                          <span className={`text-xs px-2 py-0.5 rounded border ${
                            result.aiJudgment === 'OK' ? 'text-green-600 bg-green-50 border-green-200' :
                            result.aiJudgment === 'NG' ? 'text-red-600 bg-red-50 border-red-200' :
                            'text-amber-600 bg-amber-50 border-amber-200'
                          }`}>
                            {result.aiJudgment}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {result.aiComment}
                        </p>
                        <div className="flex items-center justify-between">
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
                );
              })}
            </div>

            {/* Details Panel */}
            {selectedResult && (
              <div className="border-t border-gray-200 p-4 shrink-0 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  アクション
                </h3>
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
              </div>
            )}
          </div>
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
            href={`/jobs/${job.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            ジョブ詳細に戻る
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.name} - BOM結果</h1>
              <p className="text-gray-600">{filteredResults.length}件の部品</p>
            </div>
            <div className="flex items-center gap-2">
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
            href={`/jobs/${job.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            ジョブ詳細に戻る
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.name} - 検索結果</h1>
              <p className="text-gray-600">{job.results?.searchQuery}</p>
            </div>
            <Input
              placeholder="図面名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">マッチした図面</h2>
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

  // Helper functions for inspection
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
