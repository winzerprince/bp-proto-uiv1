import { jobStatuses } from '@/lib/mock-data';

export function StatusBadge({ status, showProgress = false, progress = 0 }) {
  const statusConfig = jobStatuses[status];
  if (!statusConfig) return null;

  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
          colorClasses[statusConfig.color] || colorClasses.gray
        }`}
      >
        {statusConfig.label}
      </span>
      {showProgress && status === 'processing' && (
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-linear-to-r from-amber-400 via-amber-500 to-amber-400 transition-all duration-500 relative overflow-hidden shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}

export function TaskTypeBadge({ taskType }) {
  const colors = {
    INSPECTION: 'bg-green-50 text-green-700 border-green-200',
    BOM: 'bg-blue-50 text-blue-700 border-blue-200',
    SEARCH: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const labels = {
    INSPECTION: '検図',
    BOM: 'BOM',
    SEARCH: '検索',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
        colors[taskType] || colors.INSPECTION
      }`}
    >
      {labels[taskType] || taskType}
    </span>
  );
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 relative overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-linear-to-br from-[#004080] via-[#0055AA] to-[#004080] text-white hover:shadow-[0_0_20px_rgba(0,64,128,0.4),0_4px_12px_rgba(0,0,0,0.2)] focus:ring-[#004080] before:absolute before:inset-0 before:bg-linear-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300',
    secondary: 'bg-linear-to-br from-gray-50 to-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-[0_0_15px_rgba(100,100,100,0.2),0_4px_8px_rgba(0,0,0,0.1)] focus:ring-gray-500 backdrop-blur-sm',
    success: 'bg-linear-to-br from-[#10B981] via-[#059669] to-[#10B981] text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.4),0_4px_12px_rgba(0,0,0,0.2)] focus:ring-[#10B981] before:absolute before:inset-0 before:bg-linear-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300',
    danger: 'bg-linear-to-br from-[#EF4444] via-[#DC2626] to-[#EF4444] text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4),0_4px_12px_rgba(0,0,0,0.2)] focus:ring-[#EF4444] before:absolute before:inset-0 before:bg-linear-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300',
    ghost: 'text-gray-700 hover:bg-gray-100/80 hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] focus:ring-gray-500 backdrop-blur-sm',
    metallic: 'bg-linear-to-br from-gray-200 via-gray-100 to-gray-300 text-gray-800 border border-gray-300 hover:shadow-[0_0_15px_rgba(200,200,200,0.6),0_4px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-gray-400 focus:ring-gray-400',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function Card({ children, className = '', hover = false, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-sm',
    glass: 'bg-white/70 backdrop-blur-md border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
    neumorphic: 'bg-gray-50 border-0 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)]',
    elevated: 'bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.1)]',
  };
  
  return (
    <div
      className={`rounded-lg transition-all duration-300 ${variants[variant]} ${hover ? 'hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] hover:border-gray-300 hover:-translate-y-1' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Input({ label, error, className = '', required, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent hover:border-gray-400 bg-white/80 backdrop-blur-sm focus:shadow-[0_0_15px_rgba(0,64,128,0.2)] ${
          error ? 'border-red-500 focus:ring-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 animate-fade-in">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', required, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent hover:border-gray-400 bg-white/80 backdrop-blur-sm focus:shadow-[0_0_15px_rgba(0,64,128,0.2)] ${
          error ? 'border-red-500 focus:ring-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600 animate-fade-in">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', required, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent hover:border-gray-400 resize-y bg-white/80 backdrop-blur-sm focus:shadow-[0_0_15px_rgba(0,64,128,0.2)] ${
          error ? 'border-red-500 focus:ring-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 animate-fade-in">{error}</p>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_20px_80px_rgba(0,0,0,0.3)] border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-[#004080] rounded-full animate-spin`} 
         style={{
           filter: 'drop-shadow(0 0 8px rgba(0, 64, 128, 0.4))',
           animation: 'spin 1s linear infinite, glow-pulse 2s ease-in-out infinite'
         }} 
    />
  );
}
