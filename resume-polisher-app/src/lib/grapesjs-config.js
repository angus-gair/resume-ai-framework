import grapesjs from 'grapesjs';

// Memoize blocks to prevent recreation on every init
let cachedBlocks = null;
const getResumeBlocks = () => {
  if (cachedBlocks) return cachedBlocks;

  cachedBlocks = [
    {
      id: 'resume-header',
      label: 'Header',
      category: 'Resume Sections',
      content: `
        <div class="resume-section resume-header" data-gjs-name="Header">
          <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">JOHN DOE</h1>
          <p style="font-size: 18px; color: #4a5568; margin-bottom: 16px;">Senior Data Analyst</p>
          <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
            <span>📧 email@example.com</span>
            <span>📱 (123) 456-7890</span>
            <span>📍 City, State</span>
            <span>🔗 linkedin.com/in/username</span>
          </div>
        </div>
      `,
      attributes: { class: 'fa fa-user' },
    },
    {
      id: 'professional-summary',
      label: 'Professional Summary',
      category: 'Resume Sections',
      content: `
        <div class="resume-section professional-summary" data-gjs-name="Professional Summary">
          <h2 style="font-size: 20px; font-weight: bold; color: #2d3748; margin-bottom: 12px; border-bottom: 2px solid #0ea5e9; padding-bottom: 4px;">PROFESSIONAL SUMMARY</h2>
          <p style="line-height: 1.6; color: #4a5568;">
            Experienced professional with expertise in data analysis, project management, and strategic planning.
            Proven track record of delivering results and driving business growth.
          </p>
        </div>
      `,
      attributes: { class: 'fa fa-file-text-o' },
    },
    {
      id: 'experience-section',
      label: 'Experience',
      category: 'Resume Sections',
      content: `
        <div class="resume-section experience-section" data-gjs-name="Experience">
          <h2 style="font-size: 20px; font-weight: bold; color: #2d3748; margin-bottom: 12px; border-bottom: 2px solid #0ea5e9; padding-bottom: 4px;">PROFESSIONAL EXPERIENCE</h2>
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <div>
                <h3 style="font-size: 16px; font-weight: 600;">Company Name</h3>
                <p style="font-style: italic; color: #4a5568;">Job Title</p>
              </div>
              <div style="text-align: right; color: #6b7280;">
                <p>Month Year – Present</p>
                <p>Location</p>
              </div>
            </div>
            <ul style="list-style-type: disc; margin-left: 20px; color: #4a5568; line-height: 1.6;">
              <li>Achievement or responsibility description</li>
              <li>Quantifiable result or impact</li>
              <li>Key project or initiative</li>
            </ul>
          </div>
        </div>
      `,
      attributes: { class: 'fa fa-briefcase' },
    },
    {
      id: 'skills-section',
      label: 'Skills',
      category: 'Resume Sections',
      content: `
        <div class="resume-section skills-section" data-gjs-name="Skills">
          <h2 style="font-size: 20px; font-weight: bold; color: #2d3748; margin-bottom: 12px; border-bottom: 2px solid #0ea5e9; padding-bottom: 4px;">TECHNICAL EXPERTISE</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #374151;">Category 1</h3>
              <ul style="list-style-type: disc; margin-left: 20px; color: #4a5568; line-height: 1.6;">
                <li>Skill 1</li>
                <li>Skill 2</li>
                <li>Skill 3</li>
              </ul>
            </div>
            <div>
              <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #374151;">Category 2</h3>
              <ul style="list-style-type: disc; margin-left: 20px; color: #4a5568; line-height: 1.6;">
                <li>Skill 1</li>
                <li>Skill 2</li>
                <li>Skill 3</li>
              </ul>
            </div>
          </div>
        </div>
      `,
      attributes: { class: 'fa fa-cogs' },
    },
    {
      id: 'education-section',
      label: 'Education',
      category: 'Resume Sections',
      content: `
        <div class="resume-section education-section" data-gjs-name="Education">
          <h2 style="font-size: 20px; font-weight: bold; color: #2d3748; margin-bottom: 12px; border-bottom: 2px solid #0ea5e9; padding-bottom: 4px;">EDUCATION</h2>
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <h3 style="font-size: 16px; font-weight: 600;">DEGREE NAME</h3>
              <span style="color: #6b7280;">Year</span>
            </div>
            <p style="color: #4a5568;">University Name</p>
            <p style="color: #6b7280; font-size: 14px;">Major • GPA (if relevant)</p>
          </div>
        </div>
      `,
      attributes: { class: 'fa fa-graduation-cap' },
    },
  ];

  return cachedBlocks;
};

// Memoize style sectors - reduced properties for performance
let cachedStyleSectors = null;
const getStyleSectors = () => {
  if (cachedStyleSectors) return cachedStyleSectors;

  cachedStyleSectors = [
    {
      name: 'Typography',
      open: true,
      buildProps: ['font-family', 'font-size', 'font-weight', 'color', 'text-align'],
    },
    {
      name: 'Decorations',
      open: false,
      buildProps: ['background-color', 'border', 'border-radius'],
    },
    {
      name: 'Spacing',
      open: false,
      buildProps: ['margin', 'padding'],
    },
  ];

  return cachedStyleSectors;
};

export const initGrapesJS = (containerId) => {
  const editor = grapesjs.init({
    container: `#${containerId}`,
    height: '100%',
    width: '100%',
    storageManager: false, // Disable localStorage

    // Performance optimizations
    avoidInlineStyle: false, // Allow inline styles for simpler resume editing
    avoidFrameContent: false,
    noticeOnUnload: false,

    // Canvas configuration
    canvas: {
      styles: [],
      scripts: [],
      // Optimize canvas rendering
      customBadgeLabel: false,
    },

    // Device manager - disabled for performance
    deviceManager: {
      devices: []
    },

    // Panel configuration
    panels: {
      defaults: [
        {
          id: 'basic-actions',
          el: '.panel__basic-actions',
          buttons: [
            {
              id: 'visibility',
              active: true,
              className: 'btn-toggle-borders',
              label: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>',
              command: 'sw-visibility',
            },
            {
              id: 'undo',
              className: 'btn-undo',
              label: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>',
              command: 'core:undo',
            },
            {
              id: 'redo',
              className: 'btn-redo',
              label: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h5.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>',
              command: 'core:redo',
            },
            {
              id: 'clear',
              className: 'btn-clear',
              label: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
              command: 'core:canvas-clear',
            },
          ],
        },
      ],
    },

    // Block manager
    blockManager: {
      appendTo: '#blocks',
      blocks: getResumeBlocks(),
    },

    // Layer manager
    layerManager: {
      appendTo: '#layers-container',
      // Performance optimization - don't show all layers by default
      showWrapper: false,
      showHover: true,
      // Collapse closed components for better performance
      highlightHover: true,
    },

    // Selector manager
    selectorManager: {
      appendTo: '#styles-container',
    },

    // Style manager - optimized with fewer properties
    styleManager: {
      appendTo: '#styles-container',
      sectors: getStyleSectors(),
      // Performance optimization
      clearProperties: true,
    },

    // Trait manager
    traitManager: {
      appendTo: '#trait-container',
    },

    // Undo manager configuration for better performance
    undoManager: {
      trackSelection: false, // Don't track selection changes (performance boost)
    },

    // Rich text editor configuration
    rte: {
      // Simpler RTE for better performance
      toolbar: ['bold', 'italic', 'underline', 'link'],
      actionbar: ['bold', 'italic', 'underline', 'link'],
    },
  });

  // Disable automatic canvas refresh on every change (performance boost)
  editor.on('load', () => {
    const um = editor.UndoManager;
    um.setOption('trackSelection', false);
  });

  return editor;
};

export default initGrapesJS;
