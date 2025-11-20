'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  Filter, 
  Check, 
  AlertTriangle, 
  X, 
  FileDown 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { Card, Button, Select, StatusBadge, Modal, Input, Textarea, LoadingSpinner } from '@/components/ui';
import { getJobById, getInspectionResultsByJobId } from '@/lib/mock-data';

export default function JobResultsPageV2() {
  const router = useRouter();
  const params = useParams();
  const { user, loading, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [confidenceFilter, setConfidenceFilter] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const [judgmentFilter, setJudgmentFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.9);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportOptions, setExportOptions] = useState({
    includeImages: false,
    confirmedOnly: false,
  });
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const jobId = params?.id;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (jobId && user) {
      const jobData = getJobById(jobId);
      if (jobData && jobData.taskType === 'INSPECTION' && jobData.status === 'completed') {
        setJob(jobData);
        const resultsData = getInspectionResultsByJobId(jobId);
        setResults(resultsData);
        setFilteredResults(resultsData);
        if (resultsData.length > 0) {
          setSelectedResult(resultsData[0]);
        }
      } else {
        router.push(`/jobs/${jobId}`);
      }
    }
  }, [jobId, user, router]);

  useEffect(() => {
    let filtered = results;

    // Confidence filter
    filtered = filtered.filter(r => r.aiConfidence >= confidenceFilter);

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    // Judgment filter
    if (judgmentFilter !== 'all') {
      filtered = filtered.filter(r => r.aiJudgment === judgmentFilter);
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(r => r.userAction === actionFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.aiComment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.userComment?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredResults(filtered);
  }, [results, confidenceFilter, typeFilter, judgmentFilter, actionFilter, searchQuery]);

  const handleResultClick = (result) => {
    setSelectedResult(result);
    setCurrentPage(result.page);
  };

  const handleActionChange = (resultId, newAction) => {
    setResults(results.map(r => 
      r.id === resultId ? { ...r, userAction: newAction } : r
    ));
  };

  const handleCommentChange = (resultId, newComment) => {
    setResults(results.map(r => 
      r.id === resultId ? { ...r, userComment: newComment } : r
    ));
  };

  const handleBulkConfirm = () => {
    const itemsToConfirm = filteredResults.filter(r => 
      r.aiConfidence >= confidenceThreshold && 
      r.userAction === '未確認'
    );

    const updatedResults = results.map(result => {
      if (itemsToConfirm.find(item => item.id === result.id)) {
        return { ...result, userAction: '確認済み' };
      }
      return result;
    });

    setResults(updatedResults);
    setBulkConfirmOpen(false);
  };

  const handleExport = async () => {
    setExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    // Prepare data to export
    const dataToExport = exportOptions.confirmedOnly
      ? filteredResults.filter(r => r.userAction === '確認済み')
      : filteredResults;

    // Simulate export generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate CSV/Excel content
    const headers = [
      '指摘ID',
      '指摘タイプ',
      'AI判定',
      '信頼度',
      'AIコメント',
      'ユーザーアクション',
      'ユーザーコメント',
      'ページ',
    ];

    const csvContent = [
      headers.join(','),
      ...dataToExport.map(r => [
        r.id,
        r.type,
        r.aiJudgment,
        (r.aiConfidence * 100).toFixed(1) + '%',
        `"${r.aiComment}"`,
        r.userAction,
        `"${r.userComment || ''}"`,
        r.page,
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inspection-results-${job?.id}-${new Date().toISOString().split('T')[0]}.${exportFormat === 'excel' ? 'csv' : 'csv'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    clearInterval(progressInterval);
    setExportProgress(100);
    
    setTimeout(() => {
      setExporting(false);
      setExportModalOpen(false);
      setExportProgress(0);
    }, 1000);
  };

  const getJudgmentColor = (judgment) => {
    switch (judgment) {
      case 'OK': return 'text-green-700 bg-green-50';
      case 'NG': return 'text-red-700 bg-red-50';
      case 'WARNING': return 'text-yellow-700 bg-yellow-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  if (loading || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const uniqueTypes = [...new Set(results.map(r => r.type))];
  const stats = {
    total: results.length,
    ok: results.filter(r => r.aiJudgment === 'OK').length,
    ng: results.filter(r => r.aiJudgment === 'NG').length,
    warning: results.filter(r => r.aiJudgment === 'WARNING').length,
    confirmed: results.filter(r => r.userAction === '確認済み').length,
    needsFix: results.filter(r => r.userAction === '要修正').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/jobs/${jobId}`}>
              <Button variant="secondary" className="gap-2">
                <ChevronLeft className="w-5 h-5" />
                ジョブ詳細に戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                検図結果レビュー
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                ジョブID: {job.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              className="gap-2"
              onClick={() => setExportModalOpen(true)}
            >
              <Download className="w-5 h-5" />
              エクスポート
            </Button>
            <Button 
              variant="primary" 
              className="gap-2"
              onClick={() => setBulkConfirmOpen(true)}
            >
              <Check className="w-5 h-5" />
              一括確認
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">合計</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">OK</div>
            <div className="text-2xl font-bold text-green-600">{stats.ok}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">NG</div>
            <div className="text-2xl font-bold text-red-600">{stats.ng}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">警告</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">確認済み</div>
            <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">要修正</div>
            <div className="text-2xl font-bold text-orange-600">{stats.needsFix}</div>
          </Card>
        </div>

        {/* Split Pane Layout */}
        <div className="grid grid-cols-3 gap-6" style={{ minHeight: '600px' }}>
          {/* Left: Blueprint Viewer */}
          <Card className="col-span-2 p-0 overflow-hidden">
            {/* Viewer Toolbar */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  ページ {currentPage}
                </span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 w-16 text-center">
                    {zoomLevel}%
                  </span>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Blueprint Canvas */}
            <div className="relative bg-gray-100 overflow-auto" style={{ height: '550px' }}>
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                {/* Mock blueprint background */}
                <div className="relative w-[800px] h-[600px] bg-white shadow-lg">
                  {/* Grid lines for blueprint look */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* Bounding boxes for findings */}
                  {filteredResults
                    .filter(r => r.page === currentPage)
                    .map((result, idx) => {
                      const isSelected = selectedResult?.id === result.id;
                      const position = {
                        left: `${20 + (idx * 15) % 60}%`,
                        top: `${30 + (idx * 20) % 40}%`,
                        width: '120px',
                        height: '80px',
                      };

                      return (
                        <div
                          key={result.id}
                          className={`absolute border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-[#004080] bg-blue-100 bg-opacity-30 z-10' 
                              : result.aiJudgment === 'NG'
                              ? 'border-red-500 bg-red-100 bg-opacity-20'
                              : result.aiJudgment === 'WARNING'
                              ? 'border-yellow-500 bg-yellow-100 bg-opacity-20'
                              : 'border-green-500 bg-green-100 bg-opacity-20'
                          }`}
                          style={position}
                          onClick={() => handleResultClick(result)}
                        >
                          <div className={`absolute -top-6 left-0 text-xs font-medium px-2 py-1 rounded ${getJudgmentColor(result.aiJudgment)}`}>
                            {result.id}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </Card>

          {/* Right: Results List */}
          <div className="space-y-4">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">フィルター</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    信頼度: {(confidenceFilter * 100).toFixed(0)}%以上
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={confidenceFilter * 100}
                    onChange={(e) => setConfidenceFilter(parseFloat(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>

                <Select
                  label="指摘タイプ"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  size="sm"
                >
                  <option value="all">すべて</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>

                <Select
                  label="AI判定"
                  value={judgmentFilter}
                  onChange={(e) => setJudgmentFilter(e.target.value)}
                  size="sm"
                >
                  <option value="all">すべて</option>
                  <option value="OK">OK</option>
                  <option value="NG">NG</option>
                  <option value="WARNING">WARNING</option>
                </Select>

                <Select
                  label="ユーザーアクション"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  size="sm"
                >
                  <option value="all">すべて</option>
                  <option value="未確認">未確認</option>
                  <option value="確認済み">確認済み</option>
                  <option value="要修正">要修正</option>
                </Select>

                <Input
                  placeholder="コメントを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="sm"
                />
              </div>

              <div className="mt-4 text-sm text-gray-600">
                {filteredResults.length}件 / {results.length}件
              </div>
            </Card>

            {/* Results List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredResults.map((result) => (
                <Card
                  key={result.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedResult?.id === result.id
                      ? 'ring-2 ring-[#004080] bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500">
                        {result.id}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getJudgmentColor(result.aiJudgment)}`}>
                        {result.aiJudgment}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ページ {result.page}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {result.type}
                  </div>

                  <div className="text-xs text-gray-600 mb-2">
                    {result.aiComment}
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">信頼度</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            result.aiConfidence >= 0.9 
                              ? 'bg-green-500' 
                              : result.aiConfidence >= 0.7 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${result.aiConfidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {(result.aiConfidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <Select
                    value={result.userAction}
                    onChange={(e) => handleActionChange(result.id, e.target.value)}
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="未確認">未確認</option>
                    <option value="確認済み">確認済み</option>
                    <option value="要修正">要修正</option>
                  </Select>

                  {result.userAction !== '未確認' && (
                    <Textarea
                      placeholder="コメントを追加..."
                      value={result.userComment || ''}
                      onChange={(e) => handleCommentChange(result.id, e.target.value)}
                      rows={2}
                      className="mt-2 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Confirm Modal */}
      <Modal
        isOpen={bulkConfirmOpen}
        onClose={() => setBulkConfirmOpen(false)}
        title="一括確認"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              信頼度しきい値: {(confidenceThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="50"
              max="100"
              value={confidenceThreshold * 100}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value) / 100)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              この信頼度以上の「未確認」項目をすべて確認済みにします
            </p>
          </div>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-gray-900">
              <span className="font-semibold">
                {filteredResults.filter(r => r.aiConfidence >= confidenceThreshold && r.userAction === '未確認').length}件
              </span>
              の項目が確認済みになります
            </p>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setBulkConfirmOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkConfirm}
              className="gap-2"
            >
              <Check className="w-5 h-5" />
              一括確認を実行
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => !exporting && setExportModalOpen(false)}
        title="結果をエクスポート"
      >
        {exporting ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <FileDown className="w-16 h-16 text-[#004080] mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                エクスポート中...
              </p>
              <div className="max-w-xs mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-[#004080] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {exportProgress}%
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                フォーマット
              </label>
              <div className="flex gap-3">
                <button
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                    exportFormat === 'excel'
                      ? 'border-[#004080] bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setExportFormat('excel')}
                >
                  <div className="text-sm font-medium">Excel</div>
                  <div className="text-xs text-gray-600">.xlsx</div>
                </button>
                <button
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                    exportFormat === 'csv'
                      ? 'border-[#004080] bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setExportFormat('csv')}
                >
                  <div className="text-sm font-medium">CSV</div>
                  <div className="text-xs text-gray-600">.csv</div>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                オプション
              </label>
              
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="includeImages"
                  checked={exportOptions.includeImages}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeImages: e.target.checked })}
                  className="mt-1"
                  disabled
                />
                <div className="flex-1">
                  <label htmlFor="includeImages" className="text-sm text-gray-900 cursor-pointer block">
                    画像を含める
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                      今後実装予定
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    エビデンス画像をエクスポートファイルに含めます
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="confirmedOnly"
                  checked={exportOptions.confirmedOnly}
                  onChange={(e) => setExportOptions({ ...exportOptions, confirmedOnly: e.target.checked })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="confirmedOnly" className="text-sm text-gray-900 cursor-pointer block">
                    確認済み項目のみ
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    ユーザーアクションが「確認済み」の項目だけをエクスポートします
                  </p>
                </div>
              </div>
            </div>

            <Card className="p-4 bg-gray-50 border-gray-200">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">
                  {exportOptions.confirmedOnly 
                    ? filteredResults.filter(r => r.userAction === '確認済み').length
                    : filteredResults.length}件
                </span>
                の項目がエクスポートされます
              </p>
            </Card>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setExportModalOpen(false)}
              >
                キャンセル
                </Button>
              <Button
                variant="primary"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="w-5 h-5" />
                エクスポート
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}
