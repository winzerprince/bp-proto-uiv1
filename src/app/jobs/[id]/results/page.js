'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { Card, Button, Select, Input, Textarea, LoadingSpinner, Modal } from '@/components/ui';
import { getJobById, getInspectionResults } from '@/lib/mock-data';

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
      if (jobData && jobData.taskType === 'INSPECTION') {
        setJob(jobData);
        const resultsData = getInspectionResults(jobId);
        setResults(resultsData);
        setFilteredResults(resultsData);
        if (resultsData.length > 0) {
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
        r.aiComment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.userComment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredResults(filtered);
  }, [results, confidenceFilter, judgmentFilter, typeFilter, actionFilter, searchQuery]);

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

  const uniqueTypes = [...new Set(results.map(r => r.type))];

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

  const getJudgmentColor = (judgment) => {
    switch (judgment) {
      case 'OK':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'NG':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'WARNING':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getJudgmentIcon = (judgment) => {
    switch (judgment) {
      case 'OK':
        return CheckCircle;
      case 'NG':
        return AlertCircle;
      case 'WARNING':
        return AlertTriangle;
      default:
        return AlertCircle;
    }
  };

  const bulkConfirmCount = filteredResults.filter(r => 
    r.confidence * 100 >= bulkThreshold && r.userAction === 'pending'
  ).length;

  const currentIndex = filteredResults.findIndex(r => r.id === selectedResult?.id);
  const hasNext = currentIndex < filteredResults.length - 1;
  const hasPrev = currentIndex > 0;

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

          {/* Blueprint Image (Mock) */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-8">
            <div 
              className="bg-white relative"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center',
                transition: 'transform 0.2s',
              }}
            >
              {/* Mock Blueprint */}
              <div className="w-[800px] h-[600px] bg-linear-to-br from-blue-50 to-gray-50 border-2 border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 mb-2">図面ビューア (モック)</p>
                  <p className="text-sm text-gray-500">
                    {selectedResult?.evidenceFile} - Page {selectedResult?.evidencePage}
                  </p>
                </div>
              </div>

              {/* Bounding Box Overlay */}
              {selectedResult && (
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

          {/* Navigation Controls */}
          {selectedResult && (
            <div className="bg-gray-800 border-t border-gray-700 px-6 py-3 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => hasPrev && setSelectedResult(filteredResults[currentIndex - 1])}
                disabled={!hasPrev}
                className="gap-2 bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
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
                className="gap-2 bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
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
                        <span className={`text-xs px-2 py-0.5 rounded border ${getJudgmentColor(result.aiJudgment)}`}>
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
}
