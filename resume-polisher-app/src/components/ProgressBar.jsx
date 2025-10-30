import React from 'react';

function ProgressBar({ progress, stage, label }) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-300">{label}</span>
          <span className="text-gray-400">{progress}%</span>
        </div>
      )}

      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-primary-500 h-full transition-all duration-300 progress-animated"
          style={{ width: `${progress}%` }}
        />
      </div>

      {stage && (
        <p className="text-xs text-gray-400 mt-2 capitalize">
          {stage.replace(/-/g, ' ')}...
        </p>
      )}
    </div>
  );
}

export default ProgressBar;
