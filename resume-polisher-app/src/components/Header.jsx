import React from 'react';
import { useStore } from '../store/useStore';

function Header() {
  const { currentPage, isAPIInitialized } = useStore();

  const getPageTitle = () => {
    if (!isAPIInitialized) return 'Setup';
    switch (currentPage) {
      case 'extract':
        return 'Extract Job Requirements';
      case 'configure':
        return 'Configure Settings';
      case 'generate':
        return 'Generate Tailored Resume';
      case 'review':
        return 'Review & Export';
      default:
        return 'Resume Polisher';
    }
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {getPageTitle()}
          </h1>
          {isAPIInitialized && (
            <p className="text-sm text-gray-400 mt-1">
              AI-Powered Resume Tailoring System
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">
              {isAPIInitialized ? 'API Connected' : 'API Not Configured'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
