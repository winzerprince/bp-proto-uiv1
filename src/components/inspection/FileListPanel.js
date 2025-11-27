'use client';

import { useState, useMemo } from 'react';
import { Search, FileImage, File, ChevronRight, FolderOpen, Image as ImageIcon } from 'lucide-react';

export function FileListPanel({ 
  files = [], 
  selectedFileId, 
  onFileSelect, 
  openedFileIds = [],
  onFileOpen,
  className = '' 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set(['real', 'drawings']));

  // Group files by type (real images vs drawings)
  const groupedFiles = useMemo(() => {
    const filtered = files.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return {
      real: filtered.filter(f => f.type === 'real' || f.name.includes('実画像') || f.name.includes('photo')),
      drawings: filtered.filter(f => f.type === 'drawing' || f.name.includes('図面') || !f.name.includes('実画像') && !f.name.includes('photo')),
    };
  }, [files, searchQuery]);

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folder)) {
        newSet.delete(folder);
      } else {
        newSet.add(folder);
      }
      return newSet;
    });
  };

  const handleFileClick = (file) => {
    onFileSelect?.(file.id);
  };

  const handleFileDoubleClick = (file) => {
    onFileOpen?.(file.id);
  };

  const getFileIcon = (file) => {
    if (file.name.endsWith('.pdf')) {
      return <File className="w-4 h-4 text-red-500" />;
    }
    return <FileImage className="w-4 h-4 text-blue-500" />;
  };

  const renderFileList = (fileList, type) => {
    if (fileList.length === 0) return null;

    const isExpanded = expandedFolders.has(type);
    const folderLabel = type === 'real' ? '実画像' : '図面';
    const folderIcon = type === 'real' ? (
      <ImageIcon className="w-4 h-4 text-blue-500" />
    ) : (
      <FolderOpen className="w-4 h-4 text-purple-500" />
    );

    return (
      <div className="mb-2">
        {/* Folder Header */}
        <button
          onClick={() => toggleFolder(type)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-foreground hover:bg-accent rounded transition-colors"
        >
          <ChevronRight 
            className={`w-4 h-4 text-foreground-light transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
          />
          {folderIcon}
          <span>{folderLabel}</span>
          <span className="ml-auto text-xs text-foreground-lighter bg-muted px-1.5 py-0.5 rounded">
            {fileList.length}
          </span>
        </button>

        {/* File List */}
        {isExpanded && (
          <div className="ml-4 mt-1 space-y-0.5">
            {fileList.map((file) => {
              const isSelected = file.id === selectedFileId;
              const isOpened = openedFileIds.includes(file.id);
              
              return (
                <button
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  onDoubleClick={() => handleFileDoubleClick(file)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-all ${
                    isSelected 
                      ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                      : isOpened
                      ? 'bg-accent/50 text-foreground hover:bg-accent'
                      : 'text-foreground-light hover:bg-accent hover:text-foreground'
                  }`}
                  title={`${file.name}\nダブルクリックでタブに開く`}
                >
                  {getFileIcon(file)}
                  <span className="truncate flex-1 text-left">{file.name}</span>
                  {isOpened && (
                    <span className="text-xs text-green-600 dark:text-green-400">●</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-card border-r border-border ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">ファイル一覧</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-lighter" />
          <input
            type="text"
            placeholder="ファイルを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {files.length === 0 ? (
          <div className="text-center text-foreground-lighter text-sm py-8">
            ファイルがありません
          </div>
        ) : (
          <>
            {renderFileList(groupedFiles.real, 'real')}
            {renderFileList(groupedFiles.drawings, 'drawings')}
          </>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-border bg-muted/50">
        <div className="text-xs text-foreground-lighter">
          <span className="font-medium text-foreground">{files.length}</span> ファイル
          {openedFileIds.length > 0 && (
            <span className="ml-2">
              （<span className="text-green-600 dark:text-green-400">{openedFileIds.length}</span> 開いています）
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileListPanel;
