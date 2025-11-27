'use client';

import { useState, useCallback } from 'react';
import { Search, ChevronDown, ChevronUp, Edit2, Trash2, Plus, Check, X, AlertTriangle, CheckCircle, HelpCircle, MapPin, Settings, Eye, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react';

const JUDGMENT_CONFIG = {
  OK: { 
    icon: CheckCircle, 
    color: 'text-green-600 dark:text-green-400', 
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-700'
  },
  NG: { 
    icon: X, 
    color: 'text-red-600 dark:text-red-400', 
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-700'
  },
  WARNING: { 
    icon: AlertTriangle, 
    color: 'text-amber-600 dark:text-amber-400', 
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    borderColor: 'border-amber-200 dark:border-amber-700'
  }
};

const ACTION_CONFIG = {
  'unconfirmed': { label: '未確認', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-700' },
  'pending': { label: '未確認', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-700' },
  'confirmed': { label: '確認済み', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  'needs_fix': { label: '要修正', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' }
};

export function InspectionCardsPanel({
  results = [],
  activeFileId,
  onResultSelect,
  selectedResultId,
  onEdit,
  onDelete,
  onAdd,
  onUpdateAction,
  showAllHighlights = true,
  onToggleShowAll,
  autoZoom = true, // Changed default to true
  onToggleAutoZoom,
  confidenceFilter = 0, // Accept from parent for synced filtering
  onConfidenceFilterChange,
  className = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCardId, setExpandedCardId] = useState(null); // Only one card can be expanded
  const [filterJudgment, setFilterJudgment] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  // Use parent's confidence filter if provided, otherwise use local state
  const confidenceThreshold = confidenceFilter;

  // Filter results for active file
  const fileResults = results.filter(r => r.fileId === activeFileId);
  
  // Apply filters
  const filteredResults = fileResults.filter(result => {
    const matchesSearch = searchQuery === '' || 
      result.findingType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.aiComment?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesJudgment = filterJudgment === 'all' || result.aiJudgment === filterJudgment;
    const matchesAction = filterAction === 'all' || result.userAction === filterAction;
    const matchesConfidence = (result.confidence || 0) * 100 >= confidenceThreshold;
    
    return matchesSearch && matchesJudgment && matchesAction && matchesConfidence;
  });

  // Click card to expand/collapse (toggle behavior) and auto-zoom if enabled
  const handleCardClick = useCallback((result) => {
    // Toggle expand state
    if (expandedCardId === result.id) {
      setExpandedCardId(null);
    } else {
      setExpandedCardId(result.id);
    }
    // Select the result with auto-zoom if enabled
    onResultSelect?.(result, { zoomToFit: autoZoom });
  }, [expandedCardId, onResultSelect, autoZoom]);

  const handleZoomToArea = useCallback((e, result) => {
    e.stopPropagation();
    onResultSelect?.(result, { zoomToFit: true });
  }, [onResultSelect]);

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">
            検査結果 ({filteredResults.length}/{fileResults.length})
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded transition-colors ${showSettings ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              title="設定"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onAdd}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded transition-colors"
              title="新規検査項目を追加"
            >
              <Plus className="w-3.5 h-3.5" />
              追加
            </button>
          </div>
        </div>

        {/* Confidence Slider - Always Visible */}
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-medium text-foreground-light">信頼度フィルター</label>
            <span className="text-[10px] font-medium text-primary">{confidenceThreshold === 0 ? '全て表示' : `${confidenceThreshold}%以上`}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={confidenceThreshold}
            onChange={(e) => onConfidenceFilterChange?.(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
            <button
              onClick={() => onToggleAutoZoom?.()}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-foreground-light">カード選択時に自動ズーム</span>
              {autoZoom ? (
                <ToggleRight className="w-5 h-5 text-primary" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <button
              onClick={() => onToggleShowAll?.()}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-foreground-light">全エリアをハイライト</span>
              {showAllHighlights ? (
                <ToggleRight className="w-5 h-5 text-primary" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {/* Dropdown Filters */}
            <div className="flex gap-2 px-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <select
                value={filterJudgment}
                onChange={(e) => setFilterJudgment(e.target.value)}
                className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">全判定</option>
                <option value="OK">OK</option>
                <option value="NG">NG</option>
                <option value="WARNING">警告</option>
              </select>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">全状態</option>
                <option value="unconfirmed">未確認</option>
                <option value="confirmed">確認済み</option>
                <option value="needs_fix">要修正</option>
              </select>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground-light" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="検査項目を検索..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-foreground-light">
            <HelpCircle className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">検査結果がありません</p>
            {confidenceThreshold > 0 && (
              <p className="text-[10px] mt-1 text-gray-400">信頼度フィルターを下げてみてください</p>
            )}
          </div>
        ) : (
          filteredResults.map((result) => {
            const isSelected = result.id === selectedResultId;
            const isExpanded = expandedCardId === result.id;
            const judgmentConfig = JUDGMENT_CONFIG[result.aiJudgment] || JUDGMENT_CONFIG.WARNING;
            const actionConfig = ACTION_CONFIG[result.userAction] || ACTION_CONFIG.unconfirmed;
            const JudgmentIcon = judgmentConfig.icon;

            return (
              <div
                key={result.id}
                onClick={() => handleCardClick(result)}
                className={`
                  rounded-lg border transition-all duration-150 cursor-pointer
                  ${isSelected 
                    ? `ring-2 ring-primary ${judgmentConfig.borderColor} ${judgmentConfig.bgColor}` 
                    : `border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800`
                  }
                `}
              >
                {/* Card Header */}
                <div className="p-2.5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <JudgmentIcon className={`w-4 h-4 flex-shrink-0 ${judgmentConfig.color}`} />
                      <span className="text-xs font-medium text-foreground truncate">
                        {result.findingType}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${actionConfig.bgColor} ${actionConfig.color}`}>
                        {actionConfig.label}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] text-foreground-light">信頼度:</span>
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          result.confidence >= 0.9 ? 'bg-green-500' :
                          result.confidence >= 0.7 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(result.confidence || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-foreground-light">
                      {((result.confidence || 0) * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* AI Comment Preview - only show full when expanded */}
                  <p className={`text-[11px] text-foreground-light ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {result.aiComment}
                  </p>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-2.5 pb-2.5 border-t border-gray-100 dark:border-gray-700 pt-2 space-y-2">
                    {/* AI Inference */}
                    {result.aiInference && (
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-[11px]">
                        <span className="font-medium text-blue-700 dark:text-blue-400 block mb-0.5">AI推論:</span>
                        <p className="text-blue-900 dark:text-blue-200">{result.aiInference}</p>
                      </div>
                    )}
                    
                    {/* User Comment */}
                    {result.userComment && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-[10px] font-medium text-foreground-light block mb-0.5">コメント:</span>
                        <p className="text-[11px] text-foreground">{result.userComment}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1.5">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onUpdateAction?.(result.id, 'confirmed'); }}
                          className={`px-2 py-1 text-[10px] rounded transition-colors flex items-center gap-1 ${
                            result.userAction === 'confirmed'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-foreground-light hover:bg-green-100 dark:hover:bg-green-900/30'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          確認
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onUpdateAction?.(result.id, 'needs_fix'); }}
                          className={`px-2 py-1 text-[10px] rounded transition-colors flex items-center gap-1 ${
                            result.userAction === 'needs_fix'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-foreground-light hover:bg-red-100 dark:hover:bg-red-900/30'
                          }`}
                        >
                          <X className="w-3 h-3" />
                          要修正
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => handleZoomToArea(e, result)}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                          title="エリアにズーム"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit?.(result); }}
                          className="p-1.5 text-foreground-light hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          title="編集"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete?.(result); }}
                          className="p-1.5 text-foreground-light hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default InspectionCardsPanel;
