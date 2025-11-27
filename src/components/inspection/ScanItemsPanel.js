'use client';

import { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Tag, 
  FileText, 
  Table, 
  Image as ImageIcon, 
  Settings, 
  ToggleLeft, 
  ToggleRight,
  CheckCircle,
  Clock,
  Edit3,
  Info,
  Layers
} from 'lucide-react';

const ELEMENT_TYPE_ICONS = {
  text: FileText,
  table: Table,
  figure: ImageIcon,
};

const ELEMENT_TYPE_LABELS = {
  text: 'テキスト',
  table: '表・リスト',
  figure: '図・画像',
};

const ELEMENT_TYPE_COLORS = {
  text: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-700', ring: 'ring-blue-500' },
  table: { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-700', ring: 'ring-purple-500' },
  figure: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-700', ring: 'ring-amber-500' },
};

const TAG_CATEGORY_COLORS = {
  BOM: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  title_block: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  plan_view: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  section_view: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  detail_view: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  rebar_detail: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  connection_detail: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  dimension: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  legend: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  wiring_diagram: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  circuit_schedule: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
  floor_plan: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  panel_detail: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  brace_detail: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

const ACTION_STATUS = {
  pending: { label: '未確認', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', icon: Clock },
  confirmed: { label: '確認済み', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30', icon: CheckCircle },
  needs_edit: { label: '要修正', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', icon: Edit3 },
  unconfirmed: { label: '未確認', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', icon: Clock },
};

// Default action status for fallback
const DEFAULT_ACTION_STATUS = { label: '未確認', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/30', icon: Clock };

export function ScanItemsPanel({
  results = [],
  activeFileId,
  selectedResultId,
  onResultSelect,
  onEdit,
  onDelete,
  onUpdateAction,
  showAllHighlights = true,
  onToggleShowAll,
  autoZoom = true,
  onToggleAutoZoom,
  className = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [sortBy, setSortBy] = useState('confidence');

  // Filter results for active file
  const fileResults = results.filter(r => r.fileId === activeFileId || !r.fileId);
  
  // Get statistics
  const stats = useMemo(() => {
    const byType = { text: 0, table: 0, figure: 0 };
    const byAction = { pending: 0, confirmed: 0, needs_edit: 0 };
    
    fileResults.forEach(r => {
      const type = r.elementType?.toLowerCase();
      if (byType[type] !== undefined) byType[type]++;
      const action = r.userAction || 'pending';
      if (byAction[action] !== undefined) byAction[action]++;
    });
    
    return { byType, byAction };
  }, [fileResults]);
  
  // Apply filters and sorting
  const filteredResults = useMemo(() => {
    let filtered = fileResults.filter(result => {
      const matchesSearch = searchQuery === '' || 
        result.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.tagName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.aiComment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.elementType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.tagCategory?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || result.elementType?.toLowerCase() === filterType;
      const matchesAction = filterAction === 'all' || (result.userAction || 'pending') === filterAction;
      
      return matchesSearch && matchesType && matchesAction;
    });
    
    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return (b.confidence || 0) - (a.confidence || 0);
        case 'type':
          return (a.elementType || '').localeCompare(b.elementType || '');
        case 'page':
          return (a.page || 0) - (b.page || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [fileResults, searchQuery, filterType, filterAction, sortBy]);

  const toggleExpand = (resultId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) {
        newSet.delete(resultId);
      } else {
        newSet.add(resultId);
      }
      return newSet;
    });
  };

  const handleItemClick = (result) => {
    // Toggle expand when clicking the card
    toggleExpand(result.id);
    // Also select the item and zoom if enabled
    onResultSelect?.(result, { zoomToFit: autoZoom });
  };

  const handleActionChange = (resultId, action) => {
    onUpdateAction?.(resultId, action);
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Header with Statistics */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              スキャン範囲内の要素
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded transition-colors ${showSettings ? 'bg-primary/10 text-primary' : 'text-foreground-light hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="設定"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-2 mb-2">
            <div className="flex-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded text-center">
              <div className="text-lg font-bold text-foreground">{filteredResults.length}</div>
              <div className="text-[9px] text-foreground-light">検出要素</div>
            </div>
            <div className="flex-1 px-2 py-1.5 bg-green-50 dark:bg-green-900/20 rounded text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.byAction.confirmed}</div>
              <div className="text-[9px] text-green-600 dark:text-green-400">確認済み</div>
            </div>
            <div className="flex-1 px-2 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded text-center">
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.byAction.pending}</div>
              <div className="text-[9px] text-amber-600 dark:text-amber-400">未確認</div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-sm space-y-2">
              <button
                onClick={onToggleAutoZoom}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-foreground-light">自動ズーム</span>
                {autoZoom ? (
                  <ToggleRight className="w-5 h-5 text-primary" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <button
                onClick={onToggleShowAll}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-foreground-light">全エリア表示</span>
                {showAllHighlights ? (
                  <ToggleRight className="w-5 h-5 text-primary" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <div className="pt-1 border-t border-gray-200 dark:border-gray-600">
                <label className="block text-[10px] text-foreground-light mb-1">並び順</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                >
                  <option value="confidence">信頼度順</option>
                  <option value="type">タイプ順</option>
                  <option value="page">ページ順</option>
                </select>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="要素名・コメントで検索..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-1 mb-2">
            {['all', 'text', 'table', 'figure'].map(type => {
              const count = type === 'all' ? fileResults.length : stats.byType[type] || 0;
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded transition-colors flex flex-col items-center ${
                    filterType === type
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-foreground-light hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{type === 'all' ? '全て' : ELEMENT_TYPE_LABELS[type]}</span>
                  <span className={`text-[9px] ${filterType === type ? 'text-white/70' : 'text-foreground-lighter'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Filter */}
          <div className="flex gap-1">
            {['all', 'pending', 'confirmed'].map(action => (
              <button
                key={action}
                onClick={() => setFilterAction(action)}
                className={`flex-1 px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                  filterAction === action
                    ? action === 'confirmed' 
                      ? 'bg-green-500 text-white'
                      : action === 'pending'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-foreground-light hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {action === 'all' ? '全ステータス' : action === 'pending' ? '未確認' : '確認済み'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-foreground-light">
            <Search className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs text-center">
              {fileResults.length === 0 
                ? 'このファイルにスキャン結果がありません'
                : '検索条件に一致する結果がありません'}
            </p>
          </div>
        ) : (
          filteredResults.map((result) => {
            const isSelected = result.id === selectedResultId;
            const isExpanded = expandedItems.has(result.id);
            const typeConfig = ELEMENT_TYPE_COLORS[result.elementType?.toLowerCase()] || ELEMENT_TYPE_COLORS.text;
            const TypeIcon = ELEMENT_TYPE_ICONS[result.elementType?.toLowerCase()] || FileText;
            const actionStatus = ACTION_STATUS[result.userAction] || ACTION_STATUS['pending'] || DEFAULT_ACTION_STATUS;
            const ActionIcon = actionStatus?.icon || Clock;
            const tagCategoryColor = TAG_CATEGORY_COLORS[result.tagCategory] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';

            return (
              <div
                key={result.id}
                onClick={() => handleItemClick(result)}
                className={`
                  rounded-sm border transition-all duration-150 cursor-pointer
                  ${isSelected 
                    ? `ring-2 ${typeConfig.ring} ${typeConfig.border} ${typeConfig.bg}` 
                    : `border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800`
                  }
                `}
              >
                {/* Item Header */}
                <div className="p-2.5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className={`p-1 rounded ${typeConfig.bg}`}>
                        <TypeIcon className={`w-3.5 h-3.5 ${typeConfig.text}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-foreground block truncate">
                          {result.tagName}
                        </span>
                        <span className="text-[10px] text-foreground-light">
                          Page {result.page || 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <ActionIcon className={`w-3.5 h-3.5 ${actionStatus.color}`} />
                    </div>
                  </div>

                  {/* Tag Category Badge */}
                  {result.tagCategory && (
                    <div className="mb-1.5">
                      <span className={`inline-block px-1.5 py-0.5 text-[9px] font-medium rounded ${tagCategoryColor}`}>
                        {result.tagCategory.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}

                  {/* Confidence Bar */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] text-foreground-light w-10">信頼度</span>
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          result.confidence >= 0.9 ? 'bg-green-500' :
                          result.confidence >= 0.7 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(result.confidence || 0) * 100}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-medium w-8 text-right ${
                      result.confidence >= 0.9 ? 'text-green-600 dark:text-green-400' :
                      result.confidence >= 0.7 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {((result.confidence || 0) * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* AI Comment */}
                  <p className={`text-[11px] text-foreground-light leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {result.aiComment}
                  </p>

                  {/* Expand/Collapse Indicator */}
                  <div className="flex items-center justify-center mt-2">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-foreground-light" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-foreground-light" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-2.5 pb-2.5 border-t border-gray-100 dark:border-gray-700 pt-2">
                    {/* File Info */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-1.5">
                        <span className="text-[9px] font-medium text-foreground-light block">ファイル名</span>
                        <p className="text-[10px] text-foreground truncate">{result.fileName}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-1.5">
                        <span className="text-[9px] font-medium text-foreground-light block">要素タイプ</span>
                        <p className="text-[10px] text-foreground">{ELEMENT_TYPE_LABELS[result.elementType?.toLowerCase()] || result.elementType}</p>
                      </div>
                    </div>

                    {/* Detailed Info */}
                    {result.detailedInfo && (
                      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center gap-1 mb-1.5">
                          <Info className="w-3 h-3 text-blue-500" />
                          <span className="text-[10px] font-medium text-blue-700 dark:text-blue-300">詳細情報</span>
                        </div>
                        <div className="space-y-1">
                          {Object.entries(result.detailedInfo).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="text-[9px] text-blue-600 dark:text-blue-400 w-20 flex-shrink-0">
                                {key}:
                              </span>
                              <span className="text-[9px] text-blue-800 dark:text-blue-200">
                                {Array.isArray(value) ? value.join(', ') : 
                                 typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* User Comment */}
                    {result.userComment && (
                      <div className="mb-3">
                        <span className="text-[9px] font-medium text-foreground-light block mb-0.5">ユーザーコメント</span>
                        <p className="text-[10px] text-foreground bg-yellow-50 dark:bg-yellow-900/20 p-1.5 rounded">
                          {result.userComment}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleActionChange(result.id, result.userAction === 'confirmed' ? 'pending' : 'confirmed');
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-medium rounded transition-colors ${
                          result.userAction === 'confirmed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-green-50 hover:text-green-600'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {result.userAction === 'confirmed' ? '確認済み' : '確認する'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onResultSelect?.(result, { zoomToFit: true }); }}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        ズーム
                      </button>
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

export default ScanItemsPanel;
