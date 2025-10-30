import React, { useEffect, useRef, useState } from 'react';
import { initGrapesJS } from '../lib/grapesjs-config';
import 'grapesjs/dist/css/grapes.min.css';
import '../styles/editor.css';

function ResumeEditor({ initialHtml, onHtmlChange }) {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    if (!editorRef.current) {
      // Initialize GrapesJS
      const editorInstance = initGrapesJS('gjs-editor');
      editorRef.current = editorInstance;
      setEditor(editorInstance);

      // Set initial HTML if provided
      if (initialHtml) {
        editorInstance.setComponents(initialHtml);
      }

      // Listen for changes
      editorInstance.on('update', () => {
        const html = editorInstance.getHtml();
        const css = editorInstance.getCss();
        const fullHtml = `
<!DOCTYPE html>
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
        if (onHtmlChange) {
          onHtmlChange(fullHtml);
        }
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  // Update content when initialHtml changes
  useEffect(() => {
    if (editor && initialHtml) {
      editor.setComponents(initialHtml);
    }
  }, [initialHtml, editor]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Editor panels */}
      <div className="border-b bg-slate-800 p-2 flex items-center gap-2">
        <div className="panel__basic-actions flex gap-2"></div>
        <div className="ml-auto text-xs text-slate-400">
          Click elements to edit • Drag blocks from left panel
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Blocks */}
        <div className="w-64 border-r bg-slate-900 overflow-y-auto">
          <div className="p-3 border-b bg-slate-800">
            <h3 className="font-semibold text-sm text-slate-200">BLOCKS</h3>
          </div>
          <div id="blocks" className="p-2"></div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-slate-50">
          <div id="gjs-editor" className="h-full"></div>
        </div>

        {/* Right sidebar - Layers & Styles */}
        <div className="w-80 border-l bg-slate-900 overflow-y-auto">
          {/* Layers */}
          <div className="border-b border-slate-700">
            <div className="p-3 bg-slate-800 border-b border-slate-700">
              <h3 className="font-semibold text-sm text-slate-200">LAYERS</h3>
            </div>
            <div id="layers-container" className="p-2"></div>
          </div>

          {/* Styles */}
          <div className="border-b border-slate-700">
            <div className="p-3 bg-slate-800 border-b border-slate-700">
              <h3 className="font-semibold text-sm text-slate-200">STYLES</h3>
            </div>
            <div id="styles-container" className="p-2"></div>
          </div>

          {/* Traits */}
          <div>
            <div className="p-3 bg-slate-800 border-b border-slate-700">
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
