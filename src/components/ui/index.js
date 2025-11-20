'use client';

import { forwardRef } from 'react';

// Button Component - Supabase Style
export const Button = forwardRef(({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '',
  disabled = false,
  loading = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
    outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
  };
  
  const sizes = {
    default: "h-9 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-10 px-8 text-sm",
    icon: "h-9 w-9",
  };
  
  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} rounded-md ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

// Card Component - Supabase Style
export const Card = ({ children, className = '', variant = 'default', hover = false, ...props }) => {
  const variants = {
    default: "bg-surface-100 border border-border",
    elevated: "bg-card border border-border shadow-sm",
    flat: "bg-transparent",
  };
  
  return (
    <div
      className={`rounded-md p-6 transition-all ${variants[variant]} ${hover ? 'hover:shadow-md hover:border-border-strong' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.Title = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-foreground ${className}`} {...props}>
    {children}
  </h3>
);

Card.Description = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-foreground-light mt-1 ${className}`} {...props}>
    {children}
  </p>
);

Card.Content = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`mt-6 flex items-center gap-3 ${className}`} {...props}>
    {children}
  </div>
);

// Input Component - Supabase Style
export const Input = forwardRef(({ 
  label, 
  error, 
  required = false, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`
          flex h-9 w-full rounded-md border border-input
          bg-transparent px-3 py-1 text-sm
          shadow-sm transition-colors
          file:border-0 file:bg-transparent file:text-sm file:font-medium
          placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-destructive focus-visible:ring-destructive' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Select Component - Supabase Style
export const Select = forwardRef(({ 
  label, 
  error, 
  required = false, 
  children, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`
          flex h-9 w-full rounded-md border border-input
          bg-transparent px-3 py-1 text-sm
          shadow-sm transition-colors
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-destructive focus-visible:ring-destructive' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Textarea Component - Supabase Style
export const Textarea = forwardRef(({ 
  label, 
  error, 
  required = false, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          flex min-h-[80px] w-full rounded-md border border-input
          bg-transparent px-3 py-2 text-sm
          shadow-sm transition-colors
          placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-destructive focus-visible:ring-destructive' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Badge Component - Supabase Style
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary text-secondary-foreground border-border",
    success: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    danger: "bg-destructive/10 text-destructive border-destructive/20",
    outline: "border-border text-foreground",
  };
  
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Status Badge - For job statuses
export const StatusBadge = ({ status }) => {
  const statusConfig = {
    created: { variant: 'secondary', label: '作成済み' },
    file_uploading: { variant: 'default', label: 'アップロード中' },
    ready: { variant: 'default', label: '準備完了' },
    processing: { variant: 'warning', label: '処理中' },
    completed: { variant: 'success', label: '完了' },
    failed: { variant: 'danger', label: '失敗' },
  };
  
  const config = statusConfig[status] || statusConfig.created;
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Task Type Badge - For task types
export const TaskTypeBadge = ({ taskType }) => {
  const taskConfig = {
    INSPECTION: { variant: 'default', label: '検図' },
    BOM: { variant: 'success', label: 'BOM生成' },
    SEARCH: { variant: 'warning', label: '図面検索' },
  };
  
  const config = taskConfig[taskType] || taskConfig.INSPECTION;
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Progress Bar - Supabase Style
export const ProgressBar = ({ value = 0, max = 100, variant = 'default', className = '' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variants = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-amber-500",
    danger: "bg-destructive",
  };
  
  return (
    <div className={`w-full bg-secondary rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full transition-all duration-300 ${variants[variant]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Loading Spinner - Supabase Style
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <svg
      className={`animate-spin text-primary ${sizes[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Modal Component - Supabase Style
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-card border border-border rounded-lg shadow-lg ${sizes[size]} w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="text-foreground-light hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
