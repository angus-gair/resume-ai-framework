import React from 'react';

function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  fullWidth = false,
  className = '',
}) {
  const baseClasses = 'rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2';

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white disabled:bg-primary-800 disabled:cursor-not-allowed',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white disabled:bg-slate-800 disabled:cursor-not-allowed',
    outline: 'border-2 border-primary-600 text-primary-400 hover:bg-primary-600 hover:text-white disabled:border-slate-700 disabled:text-slate-600 disabled:cursor-not-allowed',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-800 disabled:cursor-not-allowed',
    ghost: 'hover:bg-slate-700 text-gray-300 disabled:text-slate-600 disabled:cursor-not-allowed',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        <>
          {icon && <span className="text-xl">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

export default Button;
