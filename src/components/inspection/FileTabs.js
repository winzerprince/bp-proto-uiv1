'use client';

import { X, FileImage, File } from 'lucide-react';

export function FileTabs({ 
  files = [],
  openedFileIds = [],
  activeFileId,
  onTabSelect,
  onTabClose,
  className = ''
}) {
  // Get opened files in order
  const openedFiles = openedFileIds
    .map(id => files.find(f => f.id === id))
    .filter(Boolean);

  if (openedFiles.length === 0) {
    return null;
  }

  const getFileIcon = (file) => {
    if (file.name?.endsWith('.pdf')) {
      return <File className="w-3.5 h-3.5 text-red-400" />;
    }
    return <FileImage className="w-3.5 h-3.5 text-blue-400" />;
  };

  const handleTabClick = (e, fileId) => {
    e.stopPropagation();
    onTabSelect?.(fileId);
  };

  const handleTabClose = (e, fileId) => {
    e.stopPropagation();
    onTabClose?.(fileId);
  };

  return (
    <div className={`flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto ${className}`}>
      {openedFiles.map((file, index) => {
        const isActive = file.id === activeFileId;
        
        return (
          <div
            key={file.id}
            onClick={(e) => handleTabClick(e, file.id)}
            className={`
              group flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[200px] cursor-pointer
              border-r border-gray-200 dark:border-gray-700
              transition-all duration-150
              ${isActive 
                ? 'bg-white dark:bg-gray-900 text-foreground border-t-2 border-t-primary -mb-px' 
                : 'bg-gray-50 dark:bg-gray-800 text-foreground-light hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            {getFileIcon(file)}
            <span className="text-xs font-medium truncate flex-1">
              {file.name}
            </span>
            <button
              onClick={(e) => handleTabClose(e, file.id)}
              className={`
                p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              `}
              title="タブを閉じる"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
      
      {/* Empty space filler */}
      <div className="flex-1 border-b border-gray-200 dark:border-gray-700 h-full" />
    </div>
  );
}

export default FileTabs;
