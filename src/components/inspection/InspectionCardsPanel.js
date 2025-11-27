'use client';

import { useState, useCallback } from 'react';
import { Search, ChevronDown, ChevronUp, Edit2, Trash2, Plus, Check, X, AlertTriangle, CheckCircle, HelpCircle, MapPin, Settings, ToggleLeft, ToggleRight, Save } from 'lucide-react';

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
  onUpdateResult, // New prop for updating result data (including polygon)
  showAllHighlights = true,
  onToggleShowAll,
  autoZoom = true,
  onToggleAutoZoom,
  confidenceFilter = 0,
  onConfidenceFilterChange,
  isEditMode = false, // Whether canvas is in edit mode
  onEditModeChange, // Callback to toggle edit mode
  className = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [filterJudgment, setFilterJudgment] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  
  // Inline editing state
  const [editingCardId, setEditingCardId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    findingType: '',
    aiComment: '',
    aiInference: '',
    userComment: '',
    aiJudgment: 'OK'
  });

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

  // Click card to expand/collapse and auto-zoom if enabled
  const handleCardClick = useCallback((result) => {
    // Don't toggle if we're editing
    if (editingCardId === result.id) return;
    
    if (expandedCardId === result.id) {
      setExpandedCardId(null);
    } else {
      setExpandedCardId(result.id);
    }
    onResultSelect?.(result, { zoomToFit: autoZoom });
  }, [expandedCardId, onResultSelect, autoZoom, editingCardId]);

  const handleZoomToArea = useCallback((e, result) => {
    e.stopPropagation();
    onResultSelect?.(result, { zoomToFit: true });
  }, [onResultSelect]);

  // Start editing a card
  const handleStartEdit = useCallback((e, result) => {
    e.stopPropagation();
    setEditingCardId(result.id);
    setExpandedCardId(result.id);
    setEditFormData({
      findingType: result.findingType || '',
      aiComment: result.aiComment || '',
      aiInference: result.aiInference || '',
      userComment: result.userComment || '',
      aiJudgment: result.aiJudgment || 'OK'
    });
    // Select the result and enable edit mode on canvas
    onResultSelect?.(result, { zoomToFit: true });
    onEditModeChange?.(true);
  }, [onResultSelect, onEditModeChange]);

  // Cancel editing
  const handleCancelEdit = useCallback((e) => {
    e.stopPropagation();
    setEditingCardId(null);
    setEditFormData({
      findingType: '',
      aiComment: '',
      aiInference: '',
      userComment: '',
      aiJudgment: 'OK'
    });
    onEditModeChange?.(false);
  }, [onEditModeChange]);

  // Save edited card
  const handleSaveEdit = useCallback((e) => {
    e.stopPropagation();
    if (onUpdateResult && editingCardId) {
      onUpdateResult(editingCardId, editFormData);
    }
    setEditingCardId(null);
    setEditFormData({
      findingType: '',
      aiComment: '',
      aiInference: '',
      userComment: '',
      aiJudgment: 'OK'
    });
    onEditModeChange?.(false);
  }, [editingCardId, editFormData, onUpdateResult, onEditModeChange]);

  // Update form field
  const handleFormChange = useCallback((field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  }, []);

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
              className={`p-1.5 rounded-sm transition-colors ${showSettings ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              title="設定"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onAdd}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-sm transition-colors"
              title="新規検査項目を追加"
            >
              <Plus className="w-3.5 h-3.5" />
              追加
            </button>
          </div>
        </div>

        {/* Confidence Slider - Always Visible */}
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-sm">
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
            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-sm appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-sm space-y-2">
            <button
              onClick={() => onToggleAutoZoom?.()}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">全判定</option>
                <option value="OK">OK</option>
                <option value="NG">NG</option>
                <option value="WARNING">警告</option>
              </select>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
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
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
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
            const isEditing = editingCardId === result.id;
            const judgmentConfig = JUDGMENT_CONFIG[result.aiJudgment] || JUDGMENT_CONFIG.WARNING;
            const actionConfig = ACTION_CONFIG[result.userAction] || ACTION_CONFIG.unconfirmed;
            const JudgmentIcon = judgmentConfig.icon;

            return (
              <div
                key={result.id}
                onClick={() => handleCardClick(result)}
                className={`
                  rounded-sm border transition-all duration-150 cursor-pointer
                  ${isEditing
                    ? 'ring-2 ring-blue-500 border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : isSelected 
                      ? `ring-2 ring-primary ${judgmentConfig.borderColor} ${judgmentConfig.bgColor}` 
                      : `border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800`
                  }
                `}
              >
                {/* Card Header */}
                <div className="p-2.5">
                  {isEditing ? (
                    // Editing mode - show form
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      {/* Editing indicator */}
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-200 dark:border-blue-700">
                        <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-400">編集モード - 選択ボックスを調整できます</span>
                      </div>
                      
                      {/* Finding Type */}
                      <div>
                        <label className="text-[10px] font-medium text-foreground-light block mb-1">検査項目名</label>
                        <input
                          type="text"
                          value={editFormData.findingType}
                          onChange={(e) => handleFormChange('findingType', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* AI Judgment */}
                      <div>
                        <label className="text-[10px] font-medium text-foreground-light block mb-1">AI判定</label>
                        <select
                          value={editFormData.aiJudgment}
                          onChange={(e) => handleFormChange('aiJudgment', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="OK">OK</option>
                          <option value="NG">NG</option>
                          <option value="WARNING">警告</option>
                        </select>
                      </div>
                      
                      {/* AI Comment */}
                      <div>
                        <label className="text-[10px] font-medium text-foreground-light block mb-1">AIコメント</label>
                        <textarea
                          value={editFormData.aiComment}
                          onChange={(e) => handleFormChange('aiComment', e.target.value)}
                          rows={2}
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      
                      {/* AI Inference */}
                      <div>
                        <label className="text-[10px] font-medium text-foreground-light block mb-1">AI推論</label>
                        <textarea
                          value={editFormData.aiInference}
                          onChange={(e) => handleFormChange('aiInference', e.target.value)}
                          rows={2}
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      
                      {/* User Comment */}
                      <div>
                        <label className="text-[10px] font-medium text-foreground-light block mb-1">ユーザーコメント</label>
                        <textarea
                          value={editFormData.userComment}
                          onChange={(e) => handleFormChange('userComment', e.target.value)}
                          rows={2}
                          placeholder="コメントを入力..."
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      
                      {/* Save/Cancel buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm transition-colors"
                        >
                          <X className="w-3 h-3" />
                          キャンセル
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-sm transition-colors"
                        >
                          <Save className="w-3 h-3" />
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Normal view mode
                    <>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <JudgmentIcon className={`w-4 h-4 flex-shrink-0 ${judgmentConfig.color}`} />
                          <span className="text-xs font-medium text-foreground truncate">
                            {result.findingType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`px-1.5 py-0.5 text-[10px] font-medium rounded-sm ${actionConfig.bgColor} ${actionConfig.color}`}>
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
                    </>
                  )}
                </div>

                {/* Expanded Content (only when not editing) */}
                {isExpanded && !isEditing && (
                  <div className="px-2.5 pb-2.5 border-t border-gray-100 dark:border-gray-700 pt-2 space-y-2">
                    {/* AI Inference */}
                    {result.aiInference && (
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-sm text-[11px]">
                        <span className="font-medium text-blue-700 dark:text-blue-400 block mb-0.5">AI推論:</span>
                        <p className="text-blue-900 dark:text-blue-200">{result.aiInference}</p>
                      </div>
                    )}
                    
                    {/* User Comment */}
                    {result.userComment && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-sm">
                        <span className="text-[10px] font-medium text-foreground-light block mb-0.5">コメント:</span>
                        <p className="text-[11px] text-foreground">{result.userComment}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1.5">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onUpdateAction?.(result.id, 'confirmed'); }}
                          className={`px-2 py-1 text-[10px] rounded-sm transition-colors flex items-center gap-1 ${
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
                          className={`px-2 py-1 text-[10px] rounded-sm transition-colors flex items-center gap-1 ${
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
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-sm transition-colors"
                          title="エリアにズーム"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleStartEdit(e, result)}
                          className="p-1.5 text-foreground-light hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-sm transition-colors"
                          title="編集（テキストとエリアを同時に編集）"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete?.(result); }}
                          className="p-1.5 text-foreground-light hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-sm transition-colors"
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
