'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, Tag, FileText, Table, Image as ImageIcon, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

const ELEMENT_TYPE_ICONS = {
  text: FileText,
  table: Table,
  figure: ImageIcon,
};

const ELEMENT_TYPE_COLORS = {
  text: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-700' },
  table: { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-700' },
  figure: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-700' },
};

export function ScanItemsPanel({
  results = [],
  activeFileId,
  selectedResultId,
  onResultSelect,
  showAllHighlights = true,
  onToggleShowAll,
  autoZoom = false,
  onToggleAutoZoom,
  className = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Filter results for active file
  const fileResults = results.filter(r => r.fileId === activeFileId || !r.fileId);
  
  // Apply filters
  const filteredResults = fileResults.filter(result => {
    const matchesSearch = searchQuery === '' || 
      result.drawingName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.matchedElement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || result.elementType?.toLowerCase() === filterType;
    
    return matchesSearch && matchesType;
  });

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
    onResultSelect?.(result, { zoomToFit: autoZoom });
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">
            スキャン結果 ({filteredResults.length})
          </h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded transition-colors ${showSettings ? 'bg-primary/10 text-primary' : 'text-foreground-light hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            title="設定"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
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
          </div>
        )}

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground-light" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="要素を検索..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-1">
          {['all', 'text', 'table', 'figure'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                filterType === type
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-foreground-light hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {type === 'all' ? '全て' : type === 'text' ? 'テキスト' : type === 'table' ? '表' : '図'}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-foreground-light">
            <Search className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">スキャン結果がありません</p>
          </div>
        ) : (
          filteredResults.map((result) => {
            const isSelected = result.id === selectedResultId;
            const isExpanded = expandedItems.has(result.id);
            const typeConfig = ELEMENT_TYPE_COLORS[result.elementType?.toLowerCase()] || ELEMENT_TYPE_COLORS.text;
            const TypeIcon = ELEMENT_TYPE_ICONS[result.elementType?.toLowerCase()] || FileText;

            return (
              <div
                key={result.id}
                onClick={() => handleItemClick(result)}
                className={`
                  rounded-lg border transition-all duration-150 cursor-pointer
                  ${isSelected 
                    ? `ring-2 ring-primary ${typeConfig.border} ${typeConfig.bg}` 
                    : `border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800`
                  }
                `}
              >
                {/* Item Header */}
                <div className="p-2.5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <TypeIcon className={`w-4 h-4 flex-shrink-0 ${typeConfig.text}`} />
                      <span className="text-xs font-medium text-foreground truncate">
                        {result.matchedElement || result.drawingName}
                      </span>
                    </div>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${typeConfig.bg} ${typeConfig.text}`}>
                      {result.elementType}
                    </span>
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

                  {/* Snippet */}
                  <p className={`text-[11px] text-foreground-light ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {result.snippet || result.drawingName}
                  </p>

                  {/* Tags */}
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {result.tags.slice(0, isExpanded ? undefined : 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] bg-gray-100 dark:bg-gray-700 text-foreground-light rounded"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                      {!isExpanded && result.tags.length > 3 && (
                        <span className="text-[9px] text-foreground-light">+{result.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Expand/Collapse */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExpand(result.id); }}
                    className="flex items-center gap-1 mt-1.5 text-[10px] text-primary hover:text-primary-dark"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        閉じる
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        詳細を表示
                      </>
                    )}
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-2.5 pb-2.5 border-t border-gray-100 dark:border-gray-700 pt-2 space-y-2">
                    <div>
                      <span className="text-[10px] font-medium text-foreground-light block mb-0.5">ファイル名:</span>
                      <p className="text-[11px] text-foreground">{result.drawingName}</p>
                    </div>
                    {result.page && (
                      <div>
                        <span className="text-[10px] font-medium text-foreground-light block mb-0.5">ページ:</span>
                        <p className="text-[11px] text-foreground">Page {result.page}</p>
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onResultSelect?.(result, { zoomToFit: true }); }}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-medium text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      エリアにズーム
                    </button>
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
