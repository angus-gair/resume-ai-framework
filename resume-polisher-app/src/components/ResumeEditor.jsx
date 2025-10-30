import React, { useEffect, useRef, useState, useCallback } from 'react';
import { initGrapesJS } from '../lib/grapesjs-config';
import 'grapesjs/dist/css/grapes.min.css';
import '../styles/editor.css';

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

function ResumeEditor({ initialHtml, onHtmlChange }) {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const updateTimeoutRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Debounced HTML change callback
  const debouncedHtmlChange = useCallback(
    debounce((html, css) => {
      if (!onHtmlChange) return;

      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume</title>
  <style>
${css}
body {
  margin: 0;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
  </style>
</head>
<body>
${html}
</body>
</html>`;
      onHtmlChange(fullHtml);
    }, 300), // 300ms debounce - feels instant but reduces calls
    [onHtmlChange]
  );

  useEffect(() => {
    // Prevent double initialization
    if (isInitializedRef.current || editorRef.current) return;

    let editorInstance = null;

    const initEditor = async () => {
      try {
        setIsLoading(true);

        // Small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 50));

        // Initialize GrapesJS
        editorInstance = initGrapesJS('gjs-editor');
        editorRef.current = editorInstance;
        isInitializedRef.current = true;

        // Set initial HTML if provided
        if (initialHtml) {
          editorInstance.setComponents(initialHtml);
          // Force style refresh
          editorInstance.render();
        }

        // Use more specific events instead of 'update'
        // These events are more granular and performant
        const handleChange = () => {
          if (!editorInstance) return;

          const html = editorInstance.getHtml();
          const css = editorInstance.getCss();
          debouncedHtmlChange(html, css);
        };

        // Listen to specific change events (more performant than 'update')
        editorInstance.on('component:add', handleChange);
        editorInstance.on('component:remove', handleChange);
        editorInstance.on('component:update', handleChange);
        editorInstance.on('style:change', handleChange);
        editorInstance.on('component:move', handleChange);

        setEditor(editorInstance);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize GrapesJS:', error);
        setIsLoading(false);
      }
    };

    initEditor();

    // Cleanup function
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      if (editorRef.current) {
        try {
          // Remove all event listeners
          editorRef.current.off('component:add');
          editorRef.current.off('component:remove');
          editorRef.current.off('component:update');
          editorRef.current.off('style:change');
          editorRef.current.off('component:move');

          // Properly destroy editor
          editorRef.current.destroy();
        } catch (e) {
          console.warn('Error during editor cleanup:', e);
        }
        editorRef.current = null;
      }

      isInitializedRef.current = false;
    };
  }, []); // Empty deps - only initialize once

  // Update content when initialHtml changes (but not on first render)
  useEffect(() => {
    if (!editor || !initialHtml || isLoading) return;

    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      try {
        editor.setComponents(initialHtml);
        editor.render();
      } catch (error) {
        console.error('Error updating editor content:', error);
      }
    });
  }, [initialHtml]); // Only depend on initialHtml, not editor

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              <span className="text-slate-700 font-medium">Loading editor...</span>
            </div>
          </div>
        </div>
      )}

      {/* Editor panels */}
      <div className="border-b bg-slate-800 p-2 flex items-center gap-2 flex-shrink-0">
        <div className="panel__basic-actions flex gap-2"></div>
        <div className="ml-auto text-xs text-slate-400">
          Click elements to edit • Drag blocks from left panel
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left sidebar - Blocks */}
        <div className="w-64 border-r bg-slate-900 overflow-y-auto flex-shrink-0">
          <div className="p-3 border-b bg-slate-800 sticky top-0 z-10">
            <h3 className="font-semibold text-sm text-slate-200">BLOCKS</h3>
          </div>
          <div id="blocks" className="p-2"></div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-slate-50 min-w-0">
          <div id="gjs-editor" className="h-full"></div>
        </div>

        {/* Right sidebar - Layers & Styles */}
        <div className="w-80 border-l bg-slate-900 overflow-y-auto flex-shrink-0">
          {/* Layers */}
          <div className="border-b border-slate-700">
            <div className="p-3 bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
              <h3 className="font-semibold text-sm text-slate-200">LAYERS</h3>
            </div>
            <div id="layers-container" className="p-2 max-h-64 overflow-y-auto"></div>
          </div>

          {/* Styles */}
          <div className="border-b border-slate-700">
            <div className="p-3 bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
              <h3 className="font-semibold text-sm text-slate-200">STYLES</h3>
            </div>
            <div id="styles-container" className="p-2"></div>
          </div>

          {/* Traits */}
          <div>
            <div className="p-3 bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
              <h3 className="font-semibold text-sm text-slate-200">TRAITS</h3>
            </div>
            <div id="trait-container" className="p-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeEditor;
