import React from 'react';
import { useStore } from '../store/useStore';

const steps = [
  { id: 'extract', label: 'Extract Requirements', icon: '📋', page: 'extract' },
  { id: 'configure', label: 'Configure', icon: '⚙️', page: 'configure' },
  { id: 'generate', label: 'Generate', icon: '✨', page: 'generate' },
  { id: 'review', label: 'Review & Export', icon: '📄', page: 'review' },
];

function Sidebar() {
  const { currentPage, setCurrentPage, requirements, database, tailoredHtml } = useStore();

  const isStepComplete = (stepId) => {
    switch (stepId) {
      case 'extract':
        return !!requirements;
      case 'configure':
        return !!database;
      case 'generate':
        return !!tailoredHtml;
      case 'review':
        return !!tailoredHtml;
      default:
        return false;
    }
  };

  const isStepAccessible = (stepId) => {
    switch (stepId) {
      case 'extract':
        return true;
      case 'configure':
        return !!requirements;
      case 'generate':
        return !!requirements && !!database;
      case 'review':
        return !!tailoredHtml;
      default:
        return false;
    }
  };

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">🪄 Resume Polisher</h2>
        <p className="text-sm text-gray-400">Workflow Steps</p>
      </div>

      <nav className="space-y-2">
        {steps.map((step, index) => {
          const isActive = currentPage === step.page;
          const isComplete = isStepComplete(step.id);
          const isAccessible = isStepAccessible(step.id);

          return (
            <button
              key={step.id}
              onClick={() => isAccessible && setCurrentPage(step.page)}
              disabled={!isAccessible}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg'
                    : isAccessible
                    ? 'hover:bg-slate-700 text-gray-300'
                    : 'opacity-50 cursor-not-allowed text-gray-500'
                }
              `}
            >
              <span className="text-2xl">{step.icon}</span>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold opacity-60">
                    Step {index + 1}
                  </span>
                  {isComplete && (
                    <span className="text-xs">✓</span>
                  )}
                </div>
                <div className="text-sm font-medium">{step.label}</div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-slate-700">
        <button
          onClick={() => {
            useStore.getState().resetForNewJob();
          }}
          className="w-full px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          🔄 Start New Job
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
