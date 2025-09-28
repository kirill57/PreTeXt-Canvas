// PreTeXt Canvas - Main JavaScript File

const PALETTE_SNIPPET_TEMPLATES = {
    book: `<book xml:id="{{xmlid:book}}">\n    <title>Book Title</title>\n    <chapter xml:id="{{xmlid:ch}}">\n        <title>Chapter Title</title>\n        <p>Chapter content...</p>\n    </chapter>\n</book>`,
    article: `<article xml:id="{{xmlid:article}}">\n    <title>Article Title</title>\n    <p>Article content...</p>\n</article>`,
    chapter: `<chapter xml:id="{{xmlid:ch}}">\n    <title>Chapter Title</title>\n    <p>Chapter content...</p>\n</chapter>`,
    section: `<section xml:id="{{xmlid:sec}}">\n    <title>Section Title</title>\n    <p>Section content...</p>\n</section>`,
    subsection: `<subsection xml:id="{{xmlid:subsec}}">\n    <title>Subsection Title</title>\n    <p>Subsection content...</p>\n</subsection>`,
    paragraph: '<p>New paragraph text...</p>',
    orderedList: `<ol>\n    <li><p>First item</p></li>\n    <li><p>Second item</p></li>\n</ol>`,
    unorderedList: `<ul>\n    <li><p>First item</p></li>\n    <li><p>Second item</p></li>\n</ul>`,
    definition: `<definition xml:id="{{xmlid:def}}">\n    <title>Definition Title</title>\n    <statement>\n        <p>Definition statement...</p>\n    </statement>\n</definition>`,
    theorem: `<theorem xml:id="{{xmlid:thm}}">\n    <title>Theorem Title</title>\n    <statement>\n        <p>Theorem statement...</p>\n    </statement>\n</theorem>`,
    theoremWithProof: `<theorem xml:id="{{xmlid:thm}}">\n    <title>Theorem Title</title>\n    <statement>\n        <p>Theorem statement...</p>\n    </statement>\n    <proof>\n        <p>Proof goes here...</p>\n    </proof>\n</theorem>`,
    mathExpression: '<me>x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}</me>',
    mathDisplay: `<md>\n    <mrow>f(x) &amp;= x^2 + 2x + 1</mrow>\n    <mrow>&amp;= (x + 1)^2</mrow>\n</md>`,
    figure: `<figure xml:id="{{xmlid:fig}}">\n    <caption>Figure Caption</caption>\n    <image source="path/to/image.png" width="50%"/>\n</figure>`,
    image: '<image source="path/to/image.png" width="50%"/>',
    video: '<video xml:id="{{xmlid:vid}}" youtube="VIDEO_ID"/>',
    example: `<example xml:id="{{xmlid:ex}}">\n    <title>Example Title</title>\n    <statement>\n        <p>Example prompt...</p>\n    </statement>\n</example>`,
    exampleWithSolution: `<example xml:id="{{xmlid:ex}}">\n    <title>Example Title</title>\n    <statement>\n        <p>Example prompt...</p>\n    </statement>\n    <solution xml:id="{{xmlid:sol}}">\n        <p>Solution steps...</p>\n    </solution>\n</example>`,
    exercise: `<exercise xml:id="{{xmlid:exercise}}">\n    <title>Exercise Title</title>\n    <statement>\n        <p>Exercise prompt...</p>\n    </statement>\n</exercise>`,
    exerciseWithSupport: `<exercise xml:id="{{xmlid:exercise}}">\n    <title>Exercise Title</title>\n    <statement>\n        <p>Exercise prompt...</p>\n    </statement>\n    <hint>\n        <p>Hint text...</p>\n    </hint>\n    <solution xml:id="{{xmlid:sol}}">\n        <p>Solution steps...</p>\n    </solution>\n    <answer>\n        <p>Final answer...</p>\n    </answer>\n</exercise>`,
    sideBySideFigure: `<figure xml:id="{{xmlid:fig}}">\n    <caption>Side-by-side comparison caption.</caption>\n    <sidebyside widths="50% 50%">\n        <image source="path/to/first-image.png" width="100%"/>\n        <image source="path/to/second-image.png" width="100%"/>\n    </sidebyside>\n</figure>`
};

const PRETEXT_ELEMENT_DEFINITIONS = [
    {
        type: 'sectioning',
        label: 'Sectioning',
        description: 'Structural divisions that organize the document hierarchy.',
        tags: ['book', 'article', 'part', 'chapter', 'section', 'subsection', 'subsubsection', 'appendix'],
        buildGroups(app, tagName, element) {
            return [
                {
                    id: 'identity',
                    title: 'Identification',
                    description: 'Set attributes that support cross references and navigation.',
                    attributes: [
                        {
                            name: 'xml:id',
                            label: 'XML ID',
                            defaultValue: app.generateDefaultXmlId(tagName, element),
                            placeholder: `${tagName}-identifier`,
                            description: 'Provide a stable, descriptive identifier (e.g., sec-introduction).',
                            removeWhenEmpty: true,
                            required: true
                        },
                        {
                            name: 'lang',
                            label: 'Language Override',
                            placeholder: 'en',
                            description: 'Override the inherited language if this section is authored in another language.',
                            removeWhenEmpty: true
                        }
                    ]
                },
                {
                    id: 'structure-help',
                    title: 'Authoring Tips',
                    helpText: 'Remember to include a <title> and at least one paragraph or subordinate section.'
                }
            ];
        }
    },
    {
        type: 'exercise',
        label: 'Exercise',
        description: 'Assessment and example material with optional hints, solutions, and answers.',
        tags: ['exercise', 'example', 'problem', 'project', 'activity', 'exploration', 'task'],
        buildGroups(app, tagName, element) {
            return [
                {
                    id: 'identity',
                    title: 'Identification',
                    description: 'Ensure every exercise can be referenced and catalogued.',
                    attributes: [
                        {
                            name: 'xml:id',
                            label: 'XML ID',
                            defaultValue: app.generateDefaultXmlId(tagName, element),
                            placeholder: `${tagName}-identifier`,
                            description: 'Use consistent IDs so hints, solutions, and references stay in sync.',
                            removeWhenEmpty: true,
                            required: true
                        },
                        {
                            name: 'marker',
                            label: 'Custom Marker',
                            placeholder: 'A, *, (i), …',
                            description: 'Optional manual marker for print layout. Leave blank to allow automatic numbering.',
                            removeWhenEmpty: true
                        }
                    ]
                },
                {
                    id: 'exercise-help',
                    title: 'Authoring Tips',
                    helpText: 'Include <statement>, <hint>, <solution>, or <answer> children as appropriate so students receive the right support.'
                }
            ];
        }
    },
    {
        type: 'figure',
        label: 'Figure',
        description: 'Media wrappers that provide captions for images, videos, and other visualizations.',
        tags: ['figure'],
        buildGroups(app, tagName, element) {
            return [
                {
                    id: 'identity',
                    title: 'Identification',
                    description: 'Figures need stable IDs and captions for accessibility.',
                    attributes: [
                        {
                            name: 'xml:id',
                            label: 'XML ID',
                            defaultValue: app.generateDefaultXmlId(tagName, element),
                            placeholder: 'fig-identifier',
                            description: 'Use descriptive IDs (e.g., fig-keplers-laws) to improve cross references.',
                            removeWhenEmpty: true,
                            required: true
                        },
                        {
                            name: 'width',
                            label: 'Width',
                            placeholder: '60%',
                            defaultValue: '60%',
                            description: 'Specify relative width for consistent layouts (e.g., 60% or 320px).',
                            removeWhenEmpty: true
                        }
                    ]
                },
                {
                    id: 'figure-help',
                    title: 'Authoring Tips',
                    helpText: 'Wrap media in <image> or <video> children and include a <caption> so the figure is accessible to all readers.'
                }
            ];
        }
    },
    {
        type: 'media',
        label: 'Media',
        description: 'Standalone media elements embedded directly in the narrative.',
        tags: ['image', 'img', 'video', 'audio'],
        buildGroups(app, tagName, element) {
            return [
                {
                    id: 'source',
                    title: 'Media Source',
                    description: 'Provide source information so the resource loads correctly.',
                    attributes: [
                        {
                            name: tagName === 'image' ? 'source' : 'src',
                            label: 'Source',
                            placeholder: 'path/to/resource',
                            description: 'Use project-relative paths where possible to keep media portable.',
                            removeWhenEmpty: false
                        },
                        {
                            name: 'width',
                            label: 'Width',
                            placeholder: '50%',
                            description: 'Optional width constraint (e.g., 50% or 320px).',
                            removeWhenEmpty: true
                        }
                    ]
                },
                {
                    id: 'media-help',
                    title: 'Authoring Tips',
                    helpText: 'Pair media with surrounding prose and captions so that readers understand its context.'
                }
            ];
        }
    }
];

const PALETTE_CONFIGURATION = [
    {
        id: 'structure',
        label: 'Structure',
        icon: '📚',
        tooltip: 'Scaffold your document with top-level structural elements.',
        defaultExpanded: true,
        elements: [
            {
                id: 'book',
                label: 'Book',
                icon: '📚',
                tooltip: 'Insert a <book> root element.',
                template: PALETTE_SNIPPET_TEMPLATES.book
            },
            {
                id: 'article',
                label: 'Article',
                icon: '📄',
                tooltip: 'Insert an <article> container.',
                template: PALETTE_SNIPPET_TEMPLATES.article
            },
            {
                id: 'chapter',
                label: 'Chapter',
                icon: '📂',
                tooltip: 'Insert a <chapter> section.',
                template: PALETTE_SNIPPET_TEMPLATES.chapter
            },
            {
                id: 'section',
                label: 'Section',
                icon: '📑',
                tooltip: 'Insert a <section> block.',
                template: PALETTE_SNIPPET_TEMPLATES.section
            },
            {
                id: 'subsection',
                label: 'Subsection',
                icon: '📋',
                tooltip: 'Insert a <subsection> block.',
                template: PALETTE_SNIPPET_TEMPLATES.subsection
            }
        ]
    },
    {
        id: 'content',
        label: 'Content',
        icon: '✏️',
        tooltip: 'Author textual narrative and common list structures.',
        sections: [
            {
                id: 'textual',
                label: 'Text Blocks',
                elements: [
                    {
                        id: 'p',
                        label: 'Paragraph',
                        icon: '¶',
                        tooltip: 'Insert a <p> paragraph.',
                        template: PALETTE_SNIPPET_TEMPLATES.paragraph
                    }
                ]
            },
            {
                id: 'lists',
                label: 'Lists',
                elements: [
                    {
                        id: 'ol',
                        label: 'Ordered List',
                        icon: '🔢',
                        tooltip: 'Insert an <ol> ordered list.',
                        template: PALETTE_SNIPPET_TEMPLATES.orderedList
                    },
                    {
                        id: 'ul',
                        label: 'Unordered List',
                        icon: '•',
                        tooltip: 'Insert a <ul> unordered list.',
                        template: PALETTE_SNIPPET_TEMPLATES.unorderedList
                    },
                    {
                        id: 'dl',
                        label: 'Definition List',
                        icon: '📝',
                        tooltip: 'Insert a <dl> definition list.',
                        template: '<dl>\n    <li>\n        <title>Term</title>\n        <p>Definition</p>\n    </li>\n</dl>'
                    }
                ]
            }
        ]
    },
    {
        id: 'math-science',
        label: 'Math & Science',
        icon: '🧮',
        tooltip: 'Mathematical statements and STEM annotations.',
        sections: [
            {
                id: 'math-inline',
                label: 'Mathematics',
                elements: [
                    {
                        id: 'me',
                        label: 'Math Expression',
                        icon: '∑',
                        tooltip: 'Inline <me> math element.',
                        template: PALETTE_SNIPPET_TEMPLATES.mathExpression
                    },
                    {
                        id: 'md',
                        label: 'Math Display',
                        icon: '∫',
                        tooltip: 'Block <md> math element.',
                        template: PALETTE_SNIPPET_TEMPLATES.mathDisplay
                    }
                ]
            },
            {
                id: 'math-blocks',
                label: 'Block Environments',
                elements: [
                    {
                        id: 'theorem',
                        label: 'Theorem',
                        icon: '📐',
                        tooltip: 'Insert a <theorem> statement.',
                        template: PALETTE_SNIPPET_TEMPLATES.theorem
                    },
                    {
                        id: 'definition',
                        label: 'Definition',
                        icon: '📖',
                        tooltip: 'Insert a <definition> block.',
                        template: PALETTE_SNIPPET_TEMPLATES.definition
                    }
                ]
            },
            {
                id: 'math-composite',
                label: 'Composite Snippets',
                elements: [
                    {
                        id: 'theorem-proof',
                        label: 'Theorem + Proof',
                        icon: '🧠',
                        tooltip: 'Insert a theorem scaffolded with a proof section.',
                        template: PALETTE_SNIPPET_TEMPLATES.theoremWithProof
                    }
                ]
            }
        ]
    },
    {
        id: 'learning',
        label: 'Exercises & Examples',
        icon: '🎓',
        tooltip: 'Practice material, worked examples, and supporting scaffolding.',
        sections: [
            {
                id: 'learning-basic',
                label: 'Single Blocks',
                elements: [
                    {
                        id: 'example',
                        label: 'Example',
                        icon: '💡',
                        tooltip: 'Insert an <example> block.',
                        template: PALETTE_SNIPPET_TEMPLATES.example
                    },
                    {
                        id: 'exercise',
                        label: 'Exercise',
                        icon: '📝',
                        tooltip: 'Insert an <exercise> block.',
                        template: PALETTE_SNIPPET_TEMPLATES.exercise
                    }
                ]
            },
            {
                id: 'learning-composite',
                label: 'Composite Snippets',
                elements: [
                    {
                        id: 'example-solution',
                        label: 'Example + Solution',
                        icon: '💡',
                        tooltip: 'Insert an example paired with a worked solution.',
                        template: PALETTE_SNIPPET_TEMPLATES.exampleWithSolution
                    },
                    {
                        id: 'exercise-support',
                        label: 'Exercise + Hint/Solution',
                        icon: '🧠',
                        tooltip: 'Insert an exercise scaffolded with hint, solution, and answer.',
                        template: PALETTE_SNIPPET_TEMPLATES.exerciseWithSupport
                    }
                ]
            }
        ]
    },
    {
        id: 'media',
        label: 'Media',
        icon: '🖼️',
        tooltip: 'Enhance your content with rich media.',
        sections: [
            {
                id: 'media-standard',
                label: 'Standard Media',
                elements: [
                    {
                        id: 'figure',
                        label: 'Figure',
                        icon: '🖼️',
                        tooltip: 'Insert a <figure> wrapper.',
                        template: PALETTE_SNIPPET_TEMPLATES.figure
                    },
                    {
                        id: 'image',
                        label: 'Image',
                        icon: '📷',
                        tooltip: 'Insert a standalone <image>.',
                        template: PALETTE_SNIPPET_TEMPLATES.image
                    },
                    {
                        id: 'video',
                        label: 'Video',
                        icon: '🎥',
                        tooltip: 'Insert a <video> placeholder.',
                        template: PALETTE_SNIPPET_TEMPLATES.video
                    }
                ]
            },
            {
                id: 'media-composite',
                label: 'Composite Layouts',
                elements: [
                    {
                        id: 'sidebyside-figure',
                        label: 'Side-by-Side Figure',
                        icon: '🖼️',
                        tooltip: 'Insert a figure with a two-column side-by-side layout.',
                        template: PALETTE_SNIPPET_TEMPLATES.sideBySideFigure
                    }
                ]
            }
        ]
    }
];

const DEFAULT_TEMPLATE_LABEL = 'Blank PreTeXt Document';
const DEFAULT_TEMPLATE_SKELETON = `<?xml version="1.0" encoding="UTF-8"?>
<pretext xmlns:xi="http://www.w3.org/2001/XInclude" xml:lang="en-US">
    <docinfo>
        <macros>
        \\newcommand{\\R}{\\mathbb R}
        </macros>
    </docinfo>

    <book xml:id="new-book">
        <title>New PreTeXt Project</title>

        <chapter xml:id="ch-introduction">
            <title>Introduction</title>

            <section xml:id="sec-getting-started">
                <title>Getting Started</title>

                <p>
                    Start writing your content here.
                </p>

            </section>
        </chapter>
    </book>
</pretext>`;

const OUTLINE_INCLUDED_TAGS = new Set([
    'pretext',
    'book',
    'article',
    'frontmatter',
    'backmatter',
    'part',
    'chapter',
    'section',
    'subsection',
    'subsubsection',
    'appendix',
    'appendices',
    'preface',
    'introduction',
    'conclusion',
    'glossary',
    'index',
    'exercises',
    'exercise',
    'example',
    'problem',
    'project',
    'activity',
    'exploration',
    'task'
]);

class PreTeXtCanvas {
    constructor() {
        this.currentView = 'visual';
        this.currentDocument = null;
        this.selectedElement = null;
        this.isDocumentModified = false;
        this.sidebarMinWidth = 180;
        this.sidebarMaxWidth = 520;
        this.sidebarDefaults = { left: 280, right: 280 };
        this.sidebarState = {
            left: { width: this.sidebarDefaults.left, collapsed: false },
            right: { width: this.sidebarDefaults.right, collapsed: false }
        };
        this.activeResizer = null;
        this.layoutControlsInitialized = false;
        this.undoStack = [];
        this.redoStack = [];
        this.lastSnapshot = null;
        this.isApplyingHistory = false;
        this.historyDebounceTimer = null;
        this.historyDebounceDelay = 400;
        this.sourceLocationCache = null;
        this.isSyncingSelection = false;
        this.paletteConfig = PALETTE_CONFIGURATION;
        this.paletteStateStorageKey = 'pretext-canvas-palette-state';
        this.paletteExpansionState = {};
        this.paletteElementLookup = this.buildPaletteLookup(this.paletteConfig);

        this.templateStorageKey = 'pretext-canvas-last-template';
        this.templates = this.loadTemplates();
        this.lastUsedTemplateId = this.loadPersistedTemplateId();
        this.templateModalInitialized = false;
        this.isTemplateModalOpen = false;
        this.templateModal = null;
        this.templateOptionList = null;
        this.templatePreviewTitle = null;
        this.templatePreviewDescription = null;
        this.templatePreviewCode = null;
        this.templateApplyButton = null;
        this.templateCancelButton = null;
        this.templateCards = [];
        this.generatedXmlIdCache = new Set();
        this.activeTemplateId = null;
        this.previousFocusedElement = null;
        this.handleTemplateModalKeydown = (event) => {
            if (!this.isTemplateModalOpen) {
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                this.closeTemplateModal();
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.navigateTemplateSelection(1);
                return;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                this.navigateTemplateSelection(-1);
            }
        };

        this.init();
    }

    init() {
        this.renderPalette();
        this.setupEventListeners();
        this.setupLayoutControls();
        this.setupDragAndDrop();
        this.setupTemplateChooser();
        this.generateOutline();
        this.updateStatus('Ready');

        // Initialize MathJax if available
        if (window.MathJax && window.MathJax.typesetPromise) {
            this.renderMath();
        }

        this.recordHistorySnapshot(true);
    }

    buildPaletteLookup(config) {
        const lookup = {};
        const registerElement = (element) => {
            if (element && element.id) {
                lookup[element.id] = element;
            }
        };

        config.forEach((category) => {
            if (Array.isArray(category.elements)) {
                category.elements.forEach(registerElement);
            }

            if (Array.isArray(category.sections)) {
                category.sections.forEach((section) => {
                    if (Array.isArray(section.elements)) {
                        section.elements.forEach(registerElement);
                    }
                });
            }
        });

        return lookup;
    }

    loadTemplates() {
        if (Array.isArray(window.PreTeXtTemplates) && window.PreTeXtTemplates.length > 0) {
            return window.PreTeXtTemplates.map((template) => ({
                id: template.id,
                label: template.label || DEFAULT_TEMPLATE_LABEL,
                description: template.description || '',
                preview: template.preview || '',
                skeleton: template.skeleton || DEFAULT_TEMPLATE_SKELETON
            }));
        }

        return [{
            id: 'default',
            label: DEFAULT_TEMPLATE_LABEL,
            description: 'A minimal PreTeXt book with a starter chapter and section.',
            preview: '<book xml:id="new-book">…</book>',
            skeleton: DEFAULT_TEMPLATE_SKELETON
        }];
    }

    loadPersistedTemplateId() {
        try {
            return window.localStorage.getItem(this.templateStorageKey);
        } catch (error) {
            console.warn('Unable to access stored template preference:', error);
            return null;
        }
    }

    persistLastTemplateId(templateId) {
        this.lastUsedTemplateId = templateId;
        try {
            window.localStorage.setItem(this.templateStorageKey, templateId);
        } catch (error) {
            console.warn('Unable to persist template preference:', error);
        }
    }

    getTemplateById(templateId) {
        if (!templateId || !Array.isArray(this.templates)) {
            return null;
        }
        return this.templates.find((template) => template.id === templateId) || null;
    }

    getInitialTemplateId() {
        if (this.lastUsedTemplateId && this.getTemplateById(this.lastUsedTemplateId)) {
            return this.lastUsedTemplateId;
        }

        if (Array.isArray(this.templates) && this.templates.length > 0) {
            return this.templates[0].id;
        }

        return null;
    }

    isPaletteSectionExpanded(category, index) {
        if (Object.prototype.hasOwnProperty.call(this.paletteExpansionState, category.id)) {
            return Boolean(this.paletteExpansionState[category.id]);
        }

        if (typeof category.defaultExpanded === 'boolean') {
            return category.defaultExpanded;
        }

        return index === 0;
    }

    renderPalette() {
        const paletteContainer = document.getElementById('palette-container');
        if (!paletteContainer) {
            return;
        }

        this.paletteElementLookup = this.buildPaletteLookup(this.paletteConfig);
        this.paletteExpansionState = { ...this.loadPaletteState() };

        paletteContainer.innerHTML = '';

        this.paletteConfig.forEach((category, index) => {
            const group = document.createElement('div');
            group.classList.add('element-group');
            group.dataset.categoryId = category.id;

            const header = document.createElement('h4');
            const toggleButton = document.createElement('button');
            const contentId = `palette-section-${category.id}`;
            const expanded = this.isPaletteSectionExpanded(category, index);

            toggleButton.type = 'button';
            toggleButton.classList.add('palette-toggle');
            toggleButton.setAttribute('aria-expanded', String(expanded));
            toggleButton.setAttribute('aria-controls', contentId);
            toggleButton.title = category.tooltip || '';
            toggleButton.innerHTML = `
                <span class="palette-icon" aria-hidden="true">${category.icon || ''}</span>
                <span class="palette-title">${category.label}</span>
            `;

            header.appendChild(toggleButton);
            group.appendChild(header);

            const content = document.createElement('div');
            content.id = contentId;
            content.classList.add('palette-content');

            if (!Array.isArray(category.sections) || category.sections.length === 0) {
                content.classList.add('elements');
            }

            if (!expanded) {
                content.hidden = true;
                content.setAttribute('aria-hidden', 'true');
            }

            if (Array.isArray(category.sections) && category.sections.length > 0) {
                category.sections.forEach((section) => {
                    const subsectionWrapper = document.createElement('div');
                    subsectionWrapper.classList.add('palette-subsection');

                    if (section.label) {
                        const subsectionHeader = document.createElement('h5');
                        subsectionHeader.textContent = section.label;
                        subsectionWrapper.appendChild(subsectionHeader);
                    }

                    const subsectionElements = document.createElement('div');
                    subsectionElements.classList.add('elements');

                    if (Array.isArray(section.elements)) {
                        section.elements.forEach((element) => {
                            subsectionElements.appendChild(this.createPaletteElementButton(element));
                        });
                    }

                    subsectionWrapper.appendChild(subsectionElements);
                    content.appendChild(subsectionWrapper);
                });
            } else if (Array.isArray(category.elements)) {
                category.elements.forEach((element) => {
                    content.appendChild(this.createPaletteElementButton(element));
                });
            }

            group.appendChild(content);
            toggleButton.addEventListener('click', () => {
                this.togglePaletteSection(category.id, content, toggleButton);
            });
            paletteContainer.appendChild(group);
        });

        this.bindPaletteInteractions(paletteContainer);
    }

    createPaletteElementButton(element) {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('element-btn');
        button.dataset.element = element.id;
        button.title = element.tooltip || element.label;
        button.innerHTML = `${element.icon ? `${element.icon} ` : ''}${element.label}`;
        return button;
    }

    bindPaletteInteractions(rootElement = document) {
        if (!rootElement) {
            return;
        }

        const buttons = rootElement.querySelectorAll('.element-btn');
        buttons.forEach((button) => {
            if (button.dataset.bound === 'true') {
                return;
            }

            button.dataset.bound = 'true';
            button.draggable = true;

            button.addEventListener('click', (event) => {
                event.preventDefault();
                const elementType = event.currentTarget.dataset.element;
                if (elementType) {
                    this.insertElement(elementType);
                }
            });

            button.addEventListener('dragstart', (event) => {
                this.handlePaletteDragStart(event);
            });
        });
    }

    handlePaletteDragStart(event) {
        if (!event || !event.dataTransfer) {
            return;
        }

        const button = event.target && event.target.closest ? event.target.closest('.element-btn') : null;
        if (!button) {
            return;
        }

        const elementType = button.dataset.element;
        if (elementType) {
            event.dataTransfer.setData('text/element-type', elementType);
            event.dataTransfer.effectAllowed = 'copy';
        }
    }

    togglePaletteSection(categoryId, content, toggleButton) {
        if (!content || !toggleButton) {
            return;
        }

        const expanded = toggleButton.getAttribute('aria-expanded') === 'true';
        const nextExpanded = !expanded;

        toggleButton.setAttribute('aria-expanded', String(nextExpanded));
        if (nextExpanded) {
            content.hidden = false;
            content.removeAttribute('aria-hidden');
        } else {
            content.hidden = true;
            content.setAttribute('aria-hidden', 'true');
        }

        this.paletteExpansionState = {
            ...this.paletteExpansionState,
            [categoryId]: nextExpanded
        };

        this.savePaletteState(this.paletteExpansionState);
    }

    loadPaletteState() {
        try {
            if (typeof window === 'undefined' || !window.localStorage) {
                return {};
            }

            const stored = window.localStorage.getItem(this.paletteStateStorageKey);
            if (!stored) {
                return {};
            }

            const parsed = JSON.parse(stored);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
            console.warn('Unable to load palette expansion state:', error);
            return {};
        }
    }

    savePaletteState(state) {
        try {
            if (typeof window === 'undefined' || !window.localStorage) {
                return;
            }

            window.localStorage.setItem(this.paletteStateStorageKey, JSON.stringify(state));
        } catch (error) {
            console.warn('Unable to persist palette expansion state:', error);
        }
    }

    getTemplateForElement(elementType) {
        const definition = this.paletteElementLookup[elementType];
        return definition ? definition.template : null;
    }

    prepareTemplateForInsertion(elementType, template) {
        if (!template) {
            return template;
        }

        const placeholderPattern = /\{\{xmlid:([a-zA-Z0-9_-]+)\}\}/g;
        return template.replace(placeholderPattern, (_, requestedPrefix) => {
            return this.generateUniqueXmlId(requestedPrefix || elementType || 'element');
        });
    }

    getExistingXmlIds() {
        const ids = new Set();

        if (this.generatedXmlIdCache && this.generatedXmlIdCache.size > 0) {
            this.generatedXmlIdCache.forEach((value) => ids.add(value));
        }

        const sourceContent = document.getElementById('source-content');
        if (sourceContent && typeof sourceContent.value === 'string' && sourceContent.value.length > 0) {
            const idPattern = /xml:id="([^"]+)"/g;
            let match;
            while ((match = idPattern.exec(sourceContent.value)) !== null) {
                ids.add(match[1]);
            }
        }

        const visualContent = document.getElementById('visual-content');
        if (visualContent) {
            visualContent.querySelectorAll('[xml\:id]').forEach((element) => {
                const value = element.getAttribute('xml:id');
                if (value) {
                    ids.add(value);
                }
            });

            visualContent.querySelectorAll('[data-ptx-xml-id]').forEach((element) => {
                const value = element.getAttribute('data-ptx-xml-id');
                if (value) {
                    ids.add(value);
                }
            });
        }

        return ids;
    }

    generateUniqueXmlId(prefix) {
        const sanitizedPrefix = (prefix || 'element')
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '') || 'element';
        const existingIds = this.getExistingXmlIds();

        let candidate = sanitizedPrefix;
        let counter = 1;

        while (existingIds.has(candidate)) {
            candidate = `${sanitizedPrefix}-${counter}`;
            counter += 1;
        }

        this.generatedXmlIdCache.add(candidate);
        return candidate;
    }

    resetGeneratedXmlIdCache() {
        this.generatedXmlIdCache.clear();
    }

    setupEventListeners() {
        // View switching
        document.getElementById('visual-view').addEventListener('click', () => this.switchView('visual'));
        document.getElementById('source-view').addEventListener('click', () => this.switchView('source'));
        document.getElementById('split-view').addEventListener('click', () => this.switchView('split'));

        // File operations
        document.getElementById('new-doc').addEventListener('click', () => this.newDocument());
        document.getElementById('open-file').addEventListener('click', () => this.openFile());
        document.getElementById('save-file').addEventListener('click', () => this.saveFile());
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileLoad(e));

        // Edit controls
        document.getElementById('undo-action').addEventListener('click', () => this.undo());
        document.getElementById('redo-action').addEventListener('click', () => this.redo());

        // Panel switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchPanel(e.target.dataset.panel));
        });

        // Visual editor events
        const visualContent = document.getElementById('visual-content');
        visualContent.addEventListener('input', () => this.onVisualEdit());
        visualContent.addEventListener('click', (e) => {
            const resolved = this.findElementWithPath(e.target) || e.target;
            this.selectElement(resolved);
            this.updateCursorPosition();
            this.syncSelectionFromVisual(resolved);
        });
        visualContent.addEventListener('mouseup', () => {
            this.updateCursorPosition();
            this.syncSelectionFromVisual();
        });
        visualContent.addEventListener('keyup', () => {
            this.updateCursorPosition();
            this.syncSelectionFromVisual();
        });

        // Source editor events
        const sourceContent = document.getElementById('source-content');
        sourceContent.addEventListener('input', () => this.onSourceEdit());
        sourceContent.addEventListener('scroll', () => this.syncScroll());
        sourceContent.addEventListener('click', () => {
            this.updateCursorPosition();
            this.syncSourceSelectionToVisual();
        });
        sourceContent.addEventListener('mouseup', () => {
            this.updateCursorPosition();
            this.syncSourceSelectionToVisual();
        });
        sourceContent.addEventListener('keyup', () => {
            this.updateCursorPosition();
            this.syncSourceSelectionToVisual();
        });

        // Outline navigation
        document.addEventListener('click', (e) => {
            if (!e.target || typeof e.target.closest !== 'function') {
                return;
            }

            const toggleButton = e.target.closest('.outline-toggle');
            if (toggleButton) {
                e.preventDefault();
                const node = toggleButton.closest('.outline-node');
                if (node) {
                    const expanded = toggleButton.getAttribute('aria-expanded') === 'true';
                    const nextExpanded = !expanded;
                    toggleButton.setAttribute('aria-expanded', String(nextExpanded));
                    node.setAttribute('aria-expanded', String(nextExpanded));
                    const childList = node.querySelector(':scope > .outline-children');
                    if (childList) {
                        childList.hidden = !nextExpanded;
                    }
                    const caret = toggleButton.querySelector('.outline-caret');
                    if (caret) {
                        caret.textContent = nextExpanded ? '▾' : '▸';
                    }
                    node.classList.toggle('outline-node-collapsed', !nextExpanded);
                }
                return;
            }

            const outlineItem = e.target.closest('.outline-item');
            if (outlineItem) {
                this.navigateToElement(outlineItem.dataset.elementId, outlineItem.dataset.ptxPath);
                return;
            }

            const validationError = e.target.closest('.validation-error');
            if (validationError) {
                const lineNumber = parseInt(validationError.dataset.line, 10);
                const columnNumber = parseInt(validationError.dataset.column, 10);
                this.focusSourcePosition(Number.isNaN(lineNumber) ? null : lineNumber, Number.isNaN(columnNumber) ? null : columnNumber);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window events
        window.addEventListener('beforeunload', (e) => {
            if (this.isDocumentModified) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }


    setupLayoutControls() {
        if (this.layoutControlsInitialized) {
            this.applySidebarWidth('left');
            this.applySidebarWidth('right');
            return;
        }

        this.layoutControlsInitialized = true;

        const root = document.documentElement;
        const leftSidebar = document.getElementById('left-sidebar');
        const rightSidebar = document.getElementById('right-sidebar');
        const leftToggle = document.getElementById('toggle-left-sidebar');
        const rightToggle = document.getElementById('toggle-right-sidebar');
        const computedStyles = getComputedStyle(root);
        const minFromCss = parseInt(computedStyles.getPropertyValue('--sidebar-min-width'), 10);
        const maxFromCss = parseInt(computedStyles.getPropertyValue('--sidebar-max-width'), 10);

        if (!Number.isNaN(minFromCss)) {
            this.sidebarMinWidth = minFromCss;
        }

        if (!Number.isNaN(maxFromCss)) {
            this.sidebarMaxWidth = maxFromCss;
        }


        const initialLeft = parseInt(computedStyles.getPropertyValue('--left-sidebar-width'), 10) || (leftSidebar ? leftSidebar.offsetWidth : this.sidebarDefaults.left);
        const initialRight = parseInt(computedStyles.getPropertyValue('--right-sidebar-width'), 10) || (rightSidebar ? rightSidebar.offsetWidth : this.sidebarDefaults.right);

        this.sidebarDefaults.left = initialLeft || this.sidebarDefaults.left;
        this.sidebarDefaults.right = initialRight || this.sidebarDefaults.right;

        this.sidebarState.left.width = this.sidebarDefaults.left;
        this.sidebarState.right.width = this.sidebarDefaults.right;

        this.applySidebarWidth('left');
        this.applySidebarWidth('right');

        if (leftToggle) {
            leftToggle.addEventListener('click', () => this.toggleSidebar('left'));
        }
        if (rightToggle) {
            rightToggle.addEventListener('click', () => this.toggleSidebar('right'));
        }

        document.querySelectorAll('.sidebar-resizer').forEach((resizer) => {
            const side = resizer.dataset.side;
            if (!side) {
                return;
            }

            resizer.addEventListener('mousedown', (event) => this.onResizerMouseDown(event, side));
            resizer.addEventListener('dblclick', (event) => {
                event.preventDefault();
                this.resetSidebarWidth(side);
            });
        });

        document.addEventListener('mousemove', (event) => this.onResizerMouseMove(event));
        document.addEventListener('mouseup', () => this.onResizerMouseUp());
    }

    applySidebarWidth(side) {
        const state = this.sidebarState[side];
        if (!state) {
            return;
        }

        const variableName = side === 'left' ? '--left-sidebar-width' : '--right-sidebar-width';
        const targetSidebar = side === 'left' ? document.getElementById('left-sidebar') : document.getElementById('right-sidebar');
        const toggle = side === 'left' ? document.getElementById('toggle-left-sidebar') : document.getElementById('toggle-right-sidebar');
        const width = state.collapsed ? 0 : state.width;

        document.documentElement.style.setProperty(variableName, `${Math.max(width, 0)}px`);

        if (targetSidebar) {
            targetSidebar.classList.toggle('collapsed', state.collapsed);
        }

        if (toggle) {
            const collapsed = state.collapsed;
            toggle.setAttribute('aria-expanded', (!collapsed).toString());
            toggle.textContent = collapsed ? (side === 'left' ? 'Show Left' : 'Show Right') : (side === 'left' ? 'Hide Left' : 'Hide Right');
        }
    }

    toggleSidebar(side) {
        const state = this.sidebarState[side];
        if (!state) {
            return;
        }

        state.collapsed = !state.collapsed;

        if (!state.collapsed && state.width < this.sidebarMinWidth) {
            state.width = this.sidebarDefaults[side] || this.sidebarMinWidth;
        }

        this.applySidebarWidth(side);
    }

    resetSidebarWidth(side) {
        const state = this.sidebarState[side];
        if (!state) {
            return;
        }

        state.collapsed = false;
        state.width = this.sidebarDefaults[side] || this.sidebarMinWidth;

        this.applySidebarWidth(side);
    }

    setSidebarWidth(side, width) {
        const state = this.sidebarState[side];
        if (!state) {
            return;
        }

        const clampedWidth = Math.min(Math.max(width, this.sidebarMinWidth), this.sidebarMaxWidth);

        state.width = clampedWidth;
        state.collapsed = false;

        this.applySidebarWidth(side);
    }

    onResizerMouseDown(event, side) {
        event.preventDefault();

        const state = this.sidebarState[side];
        if (!state) {
            return;
        }

        if (state.collapsed) {
            state.collapsed = false;
            this.applySidebarWidth(side);
        }

        const startWidth = state.width || this.sidebarDefaults[side] || this.sidebarMinWidth;

        this.activeResizer = {
            side,
            startX: event.clientX,
            startWidth
        };

        document.body.classList.add('resizing-sidebar');
    }

    onResizerMouseMove(event) {
        if (!this.activeResizer) {
            return;
        }

        event.preventDefault();

        const { side, startX, startWidth } = this.activeResizer;
        const delta = event.clientX - startX;
        const newWidth = side === 'left' ? startWidth + delta : startWidth - delta;

        this.setSidebarWidth(side, newWidth);
    }

    onResizerMouseUp() {
        if (!this.activeResizer) {
            return;
        }

        this.activeResizer = null;
        document.body.classList.remove('resizing-sidebar');
    }
    switchView(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.btn-view').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${view}-view`).classList.add('active');

        // Show/hide editor panes
        const visualPane = document.getElementById('visual-editor');
        const sourcePane = document.getElementById('source-editor');
        const editorContainer = document.querySelector('.editor-container');

        visualPane.classList.remove('active');
        sourcePane.classList.remove('active');
        editorContainer.classList.remove('split-view');

        switch (view) {
            case 'visual':
                visualPane.classList.add('active');
                break;
            case 'source':
                sourcePane.classList.add('active');
                break;
            case 'split':
                visualPane.classList.add('active');
                sourcePane.classList.add('active');
                editorContainer.classList.add('split-view');
                break;
        }

        if (view === 'visual') {
            this.syncToVisual();
        } else if (view === 'source') {
            this.syncToSource();
        } else if (view === 'split') {
            this.syncToSource();
            this.syncToVisual();
        }

        this.updateStatus(`${view.charAt(0).toUpperCase() + view.slice(1)} view active`);
    }

    switchPanel(panelName) {
        // Update tab button states
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-panel="${panelName}"]`).classList.add('active');

        // Show/hide panels
        document.querySelectorAll('.left-sidebar .panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${panelName}-panel`).classList.add('active');
    }

    insertElement(elementType) {
        const rawTemplate = this.getTemplateForElement(elementType);

        if (!rawTemplate) {
            this.updateStatus(`No template defined for element: ${elementType}`);
            return;
        }

        const template = this.prepareTemplateForInsertion(elementType, rawTemplate);

        if (this.currentView === 'visual' || this.currentView === 'split') {
            this.insertIntoVisualEditor(elementType, template);
        }

        if (this.currentView === 'source' || this.currentView === 'split') {
            this.insertIntoSourceEditor(template);
        }

        this.markDocumentModified();
        this.recordHistorySnapshot(true);
        this.generateOutline();
        this.validateDocument();
    }

    insertIntoVisualEditor(elementType, template) {
        const visualContent = document.getElementById('visual-content');
        const selection = window.getSelection();
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.xmlToHtml(template);
            
            range.deleteContents();
            range.insertNode(tempDiv.firstChild);
            
            // Position cursor at the end of inserted content
            range.setStartAfter(tempDiv.firstChild);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        this.renderMath();
    }

    insertIntoSourceEditor(template) {
        const sourceContent = document.getElementById('source-content');
        const start = sourceContent.selectionStart;
        const end = sourceContent.selectionEnd;
        const text = sourceContent.value;

        sourceContent.value = text.substring(0, start) + '\n' + template + '\n' + text.substring(end);
        sourceContent.selectionStart = sourceContent.selectionEnd = start + template.length + 2;
        sourceContent.focus();
        this.invalidateSourceLocationMap();
        this.syncSourceSelectionToVisual();
    }

    xmlToHtml(xml) {
        // Convert XML-ish markup to HTML for the visual editor using DOM operations
        const container = document.createElement('div');
        container.innerHTML = xml;

        this.assignPretextPaths(container);

        // Convert titles to headings
        container.querySelectorAll('title').forEach((titleEl) => {
            const heading = document.createElement('h2');
            heading.innerHTML = titleEl.innerHTML;
            const path = titleEl.getAttribute('data-ptx-path');
            if (path) {
                heading.setAttribute('data-ptx-path', path);
            }
            const xmlId = titleEl.getAttribute('data-ptx-xml-id') || titleEl.getAttribute('xml:id');
            if (xmlId) {
                heading.setAttribute('data-ptx-xml-id', xmlId);
            }
            titleEl.replaceWith(heading);
        });

        // Normalize list items that wrap <p> tags (keep simple for now)
        container.querySelectorAll('li > p').forEach((pEl) => {
            if (pEl.parentElement && pEl.parentElement.tagName.toLowerCase() === 'li') {
                const li = pEl.parentElement;
                // Replace the <p> with its children to avoid nested paragraphs
                while (pEl.firstChild) {
                    li.insertBefore(pEl.firstChild, pEl);
                }
                li.removeChild(pEl);
            }
        });

        // Convert inline math (<me>) to visual containers
        container.querySelectorAll('me').forEach((meEl) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'math-expression';
            const originalContent = meEl.innerHTML;
            wrapper.dataset.pretext = originalContent;
            const path = meEl.getAttribute('data-ptx-path');
            if (path) {
                wrapper.setAttribute('data-ptx-path', path);
            }
            const xmlId = meEl.getAttribute('data-ptx-xml-id') || meEl.getAttribute('xml:id');
            if (xmlId) {
                wrapper.setAttribute('data-ptx-xml-id', xmlId);
            }
            wrapper.append(document.createTextNode('\\('));
            wrapper.append(document.createTextNode(meEl.textContent || ''));
            wrapper.append(document.createTextNode('\\)'));
            meEl.replaceWith(wrapper);
        });

        // Convert display math (<md>) to visual containers
        container.querySelectorAll('md').forEach((mdEl) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'math-display';
            const originalContent = mdEl.innerHTML;
            wrapper.dataset.pretext = originalContent;
            const path = mdEl.getAttribute('data-ptx-path');
            if (path) {
                wrapper.setAttribute('data-ptx-path', path);
            }
            const xmlId = mdEl.getAttribute('data-ptx-xml-id') || mdEl.getAttribute('xml:id');
            if (xmlId) {
                wrapper.setAttribute('data-ptx-xml-id', xmlId);
            }
            const normalizeLine = (text) => (text || '').replace(/\s+/g, ' ').trim();
            const mrows = Array.from(mdEl.querySelectorAll('mrow'));
            let latexBody = '';

            if (mrows.length > 0) {
                const lines = mrows
                    .map((row) => normalizeLine(row.textContent))
                    .filter((line) => line.length > 0);

                if (lines.length > 0) {
                    const joined = lines.join(' \\\n');
                    const requiresAlignment = lines.some((line) => line.includes('&'));
                    latexBody = requiresAlignment
                        ? `\\begin{aligned}\n${joined}\n\\end{aligned}`
                        : joined;
                }
            }

            if (!latexBody) {
                latexBody = normalizeLine(mdEl.textContent);
            }

            wrapper.append(document.createTextNode('\\['));
            if (latexBody) {
                wrapper.append(document.createTextNode(latexBody));
            }
            wrapper.append(document.createTextNode('\\]'));
            mdEl.replaceWith(wrapper);
        });

        return container.innerHTML;
    }

    assignPretextPaths(container) {
        if (!container) {
            return;
        }

        const traverse = (element, parentPath, siblingCounts) => {
            if (!element || element.nodeType !== 1) {
                return;
            }

            const tagName = element.tagName ? element.tagName.toLowerCase() : '';
            if (!tagName) {
                return;
            }

            const counts = siblingCounts;
            const currentCount = (counts.get(tagName) || 0) + 1;
            counts.set(tagName, currentCount);

            const path = parentPath ? `${parentPath}/${tagName}[${currentCount}]` : `${tagName}[${currentCount}]`;
            element.setAttribute('data-ptx-path', path);

            const xmlId = element.getAttribute('xml:id');
            if (xmlId) {
                element.setAttribute('data-ptx-xml-id', xmlId);
            }

            const childCounts = new Map();
            Array.from(element.children).forEach((child) => {
                traverse(child, path, childCounts);
            });
        };

        const rootCounts = new Map();
        Array.from(container.children).forEach((child) => {
            traverse(child, '', rootCounts);
        });
    }

    invalidateSourceLocationMap() {
        this.sourceLocationCache = null;
    }

    getSourceLocationCache() {
        const sourceContent = document.getElementById('source-content');
        if (!sourceContent) {
            return null;
        }

        const text = sourceContent.value;
        if (this.sourceLocationCache && this.sourceLocationCache.text === text) {
            return this.sourceLocationCache;
        }

        this.sourceLocationCache = this.buildSourceLocationCache(text);
        return this.sourceLocationCache;
    }

    buildSourceLocationCache(text) {
        const locations = [];
        const map = new Map();
        const stack = [];
        const rootCounts = new Map();
        const tokenRegex = /<[^>]+>/g;

        const addLocation = (entry) => {
            const location = {
                path: entry.path,
                start: entry.start,
                end: entry.end
            };
            locations.push(location);
            map.set(entry.path, location);
        };

        let match;
        while ((match = tokenRegex.exec(text)) !== null) {
            const token = match[0];

            if (token.startsWith('<?') || token.startsWith('<!')) {
                continue;
            }

            const isClosing = token.startsWith('</');
            const isSelfClosing = /\/>$/.test(token);
            const tagMatch = /^<\/?\s*([^\s/>]+)/.exec(token);
            if (!tagMatch) {
                continue;
            }

            const tagName = tagMatch[1].toLowerCase();

            if (isClosing) {
                for (let i = stack.length - 1; i >= 0; i--) {
                    const entry = stack[i];
                    if (entry.tagName === tagName) {
                        entry.end = match.index + token.length;
                        addLocation(entry);
                        stack.splice(i, 1);
                        break;
                    }
                }
                continue;
            }

            const parent = stack[stack.length - 1];
            const counts = parent ? parent.childCounts : rootCounts;
            const currentCount = (counts.get(tagName) || 0) + 1;
            counts.set(tagName, currentCount);

            const path = parent ? `${parent.path}/${tagName}[${currentCount}]` : `${tagName}[${currentCount}]`;

            const entry = {
                tagName,
                path,
                start: match.index,
                end: match.index + token.length,
                childCounts: new Map()
            };

            if (isSelfClosing) {
                addLocation(entry);
            } else {
                stack.push(entry);
            }
        }

        const textLength = text.length;
        while (stack.length > 0) {
            const entry = stack.pop();
            entry.end = textLength;
            addLocation(entry);
        }

        return { text, locations, map };
    }

    getSourceLocationForPath(path) {
        if (!path) {
            return null;
        }

        const cache = this.getSourceLocationCache();
        if (!cache) {
            return null;
        }

        return cache.map.get(path) || null;
    }

    getSourcePathAtOffset(offset) {
        const cache = this.getSourceLocationCache();
        if (!cache) {
            return null;
        }

        let best = null;
        let forward = null;
        for (const location of cache.locations) {
            if (location.start <= offset && offset <= location.end) {
                if (!best) {
                    best = location;
                    continue;
                }

                const currentRange = location.end - location.start;
                const bestRange = best.end - best.start;
                if (currentRange <= bestRange) {
                    best = location;
                }
            }

            if (location.start > offset) {
                if (!forward || location.start < forward.start) {
                    forward = location;
                }
            }
        }

        if (!best && forward) {
            return forward.path;
        }

        if (!best && offset > 0) {
            return this.getSourcePathAtOffset(offset - 1);
        }

        return best ? best.path : null;
    }

    scrollSourceToIndex(sourceContent, index, endIndex = index) {
        if (!sourceContent) {
            return;
        }

        const value = sourceContent.value;
        const clampedStart = Math.max(0, Math.min(index, value.length));
        const clampedEnd = Math.max(clampedStart, Math.min(endIndex, value.length));
        const before = value.slice(0, clampedStart);
        const beforeLines = before.split(/\r?\n/).length;
        const totalLines = value.length ? value.split(/\r?\n/).length : 1;

        sourceContent.selectionStart = clampedStart;
        sourceContent.selectionEnd = clampedEnd;

        const denominator = Math.max(totalLines - 1, 1);
        const ratio = (beforeLines - 1) / denominator;
        const maxScroll = sourceContent.scrollHeight - sourceContent.clientHeight;
        const clampedRatio = Math.min(Math.max(ratio, 0), 1);
        sourceContent.scrollTop = Math.max(0, clampedRatio * maxScroll);
    }

    escapeForAttributeSelector(value) {
        if (window.CSS && typeof window.CSS.escape === 'function') {
            return window.CSS.escape(value);
        }

        return String(value).replace(/(["\\\[\]\/:])/g, '\\$1');
    }

    findVisualElementByPath(path) {
        if (!path) {
            return null;
        }

        const visualContent = document.getElementById('visual-content');
        if (!visualContent) {
            return null;
        }

        const escaped = this.escapeForAttributeSelector(path);
        return visualContent.querySelector(`[data-ptx-path="${escaped}"]`);
    }

    findElementWithPath(node) {
        if (!node) {
            return null;
        }

        const visualContent = document.getElementById('visual-content');
        let current = node.nodeType === 1 ? node : node.parentElement;

        while (current && current !== visualContent) {
            if (current.dataset && current.dataset.ptxPath) {
                return current;
            }
            current = current.parentElement;
        }

        return null;
    }

    getVisualSelectionElement() {
        const selection = window.getSelection ? window.getSelection() : null;
        const visualContent = document.getElementById('visual-content');

        if (!selection || !visualContent || selection.rangeCount === 0) {
            return this.selectedElement || null;
        }

        const focusNode = selection.focusNode || selection.anchorNode;
        if (!focusNode) {
            return this.selectedElement || null;
        }

        return this.findElementWithPath(focusNode) || this.selectedElement || null;
    }

    findLocationById(element) {
        if (!element) {
            return null;
        }

        const sourceContent = document.getElementById('source-content');
        if (!sourceContent) {
            return null;
        }

        const identifier = element.getAttribute && (
            element.getAttribute('xml:id') ||
            element.getAttribute('data-ptx-xml-id') ||
            element.getAttribute('id')
        );
        if (!identifier) {
            return null;
        }

        const text = sourceContent.value;
        const idIndex = text.indexOf(`xml:id="${identifier}"`);
        if (idIndex === -1) {
            return null;
        }

        const start = text.lastIndexOf('<', idIndex);
        if (start === -1) {
            return null;
        }

        return { path: null, start, end: start };
    }

    syncSelectionFromVisual(element) {
        if (this.isSyncingSelection) {
            return;
        }

        const sourceContent = document.getElementById('source-content');
        if (!sourceContent) {
            return;
        }

        const targetElement = element ? this.findElementWithPath(element) : this.getVisualSelectionElement();
        if (!targetElement) {
            return;
        }

        let current = targetElement;
        let location = null;

        while (current && !location) {
            const path = current.dataset ? current.dataset.ptxPath : null;
            if (path) {
                location = this.getSourceLocationForPath(path);
            }

            if (!location) {
                location = this.findLocationById(current);
            }

            if (!location) {
                current = this.findElementWithPath(current.parentElement);
            }
        }

        if (!location) {
            return;
        }

        const documentLength = sourceContent.value.length;
        const startIndex = Math.max(0, Math.min(location.start ?? 0, documentLength));
        const endIndexCandidate = typeof location.end === 'number' ? location.end : location.start;
        const endIndex = Math.max(startIndex, Math.min(endIndexCandidate ?? startIndex, documentLength));

        this.isSyncingSelection = true;
        try {
            this.scrollSourceToIndex(sourceContent, startIndex, endIndex);
            if (typeof sourceContent.focus === 'function') {
                try {
                    sourceContent.focus({ preventScroll: true });
                } catch (focusError) {
                    sourceContent.focus();
                }
            }
            this.updateCursorPosition();
        } finally {
            this.isSyncingSelection = false;
        }
    }

    syncSourceSelectionToVisual() {
        if (this.isSyncingSelection) {
            return;
        }

        const sourceContent = document.getElementById('source-content');
        const visualContent = document.getElementById('visual-content');
        if (!sourceContent || !visualContent) {
            return;
        }

        const offset = sourceContent.selectionStart;
        const path = this.getSourcePathAtOffset(offset);
        if (!path) {
            return;
        }

        const element = this.findVisualElementByPath(path);
        if (!element) {
            return;
        }

        this.isSyncingSelection = true;
        try {
            this.selectElement(element);
            if (this.currentView !== 'source') {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } finally {
            this.isSyncingSelection = false;
        }
    }

    onVisualEdit() {
        if (this.isApplyingHistory) {
            return;
        }

        this.markDocumentModified();
        this.syncToSource();
        this.generateOutline();
        this.validateDocument();
        this.renderMath();
        this.scheduleHistorySnapshot();
    }

    onSourceEdit() {
        if (this.isApplyingHistory) {
            return;
        }

        this.invalidateSourceLocationMap();
        this.markDocumentModified();
        this.syncToVisual();
        this.generateOutline();
        this.validateDocument();
        this.scheduleHistorySnapshot();
        this.syncSourceSelectionToVisual();
    }

    syncToSource() {
        const visualContent = document.getElementById('visual-content');
        const sourceContent = document.getElementById('source-content');

        if (!visualContent || !sourceContent) {
            return;
        }

        // Convert HTML back to XML (simplified)
        let xml = visualContent.innerHTML;
        xml = this.htmlToXml(xml);
        sourceContent.value = xml;
        this.invalidateSourceLocationMap();
        this.syncSelectionFromVisual(this.selectedElement);
    }

    syncToVisual() {
        const sourceContent = document.getElementById('source-content');
        const visualContent = document.getElementById('visual-content');

        if (!sourceContent || !visualContent) {
            return;
        }

        try {
            const xml = sourceContent.value;
            const html = this.xmlToHtml(xml);
            const previousPath = this.selectedElement && this.selectedElement.dataset
                ? this.selectedElement.dataset.ptxPath
                : null;
            visualContent.innerHTML = html;
            this.renderMath();

            if (previousPath) {
                const restored = this.findVisualElementByPath(previousPath);
                if (restored) {
                    this.selectElement(restored);
                }
            }

            this.syncSourceSelectionToVisual();
        } catch (e) {
            console.warn('Could not sync to visual editor:', e);
        }
    }

    htmlToXml(html) {
        // Convert visual HTML back to PreTeXt XML using DOM operations
        const container = document.createElement('div');
        container.innerHTML = html;

        // Convert headings back to titles
        container.querySelectorAll('h2').forEach((heading) => {
            const titleEl = document.createElement('title');
            titleEl.innerHTML = heading.innerHTML;
            if (heading.dataset && heading.dataset.ptxXmlId) {
                titleEl.setAttribute('xml:id', heading.dataset.ptxXmlId);
            }
            heading.replaceWith(titleEl);
        });

        const stripDelimiters = (value, type) => {
            if (!value) {
                return '';
            }

            const trimmed = value.trim();
            if (type === 'inline') {
                return trimmed.replace(/^\\\(/, '').replace(/\\\)$/, '');
            }

            return trimmed.replace(/^\\\[/, '').replace(/\\\]$/, '');
        };

        // Replace math containers with <me>/<md> elements
        container.querySelectorAll('.math-expression, .math-display').forEach((mathEl) => {
            const isDisplay = mathEl.classList.contains('math-display');
            const storedPretext = mathEl.dataset.pretext;
            const replacement = document.createElement(isDisplay ? 'md' : 'me');

            if (mathEl.dataset && mathEl.dataset.ptxXmlId) {
                replacement.setAttribute('xml:id', mathEl.dataset.ptxXmlId);
            }

            if (storedPretext && storedPretext.trim()) {
                const temp = document.createElement('div');
                temp.innerHTML = storedPretext;
                while (temp.firstChild) {
                    replacement.appendChild(temp.firstChild);
                }
            } else {
                const fallbackText = stripDelimiters(
                    mathEl.textContent || '',
                    isDisplay ? 'display' : 'inline'
                );
                replacement.textContent = fallbackText;
            }

            mathEl.replaceWith(replacement);
        });

        container.querySelectorAll('[data-ptx-path]').forEach((el) => {
            el.removeAttribute('data-ptx-path');
        });

        container.querySelectorAll('[data-ptx-xml-id]').forEach((el) => {
            el.removeAttribute('data-ptx-xml-id');
        });

        return container.innerHTML;
    }

    selectElement(element) {
        // Remove previous selection
        document.querySelectorAll('.element-selected').forEach(el => {
            el.classList.remove('element-selected');
        });

        // Add selection to clicked element
        if (element && element !== document.getElementById('visual-content')) {
            element.classList.add('element-selected');
            this.selectedElement = element;
            this.showElementProperties(element);
        } else {
            this.selectedElement = null;
            this.hideElementProperties();
        }
    }

    getPretextElementDefinition(tagName) {
        return PRETEXT_ELEMENT_DEFINITIONS.find((definition) => definition.tags.includes(tagName)) || null;
    }

    generateDefaultXmlId(tagName, element) {
        const current = element ? element.getAttribute('xml:id') : null;
        if (current) {
            return current;
        }

        const prefixMap = {
            book: 'book',
            article: 'article',
            part: 'part',
            chapter: 'ch',
            section: 'sec',
            subsection: 'subsec',
            subsubsection: 'subsubsec',
            appendix: 'app',
            exercise: 'ex',
            example: 'ex',
            problem: 'prob',
            project: 'proj',
            activity: 'act',
            exploration: 'expl',
            task: 'task',
            figure: 'fig',
            image: 'img',
            img: 'img',
            video: 'vid',
            audio: 'aud'
        };

        const prefix = prefixMap[tagName] || tagName || 'element';
        return `${prefix}-new`;
    }

    sanitizePropertyName(name) {
        return String(name).replace(/[^a-z0-9_-]/gi, '-');
    }

    buildAttributeFieldHtml(group, attribute, element, context = {}) {
        const tagName = context.tagName || element.tagName.toLowerCase();
        const inputId = `property-${group.id}-${this.sanitizePropertyName(attribute.name)}`;
        const rawValue = attribute.name === 'class'
            ? element.className
            : element.getAttribute(attribute.name);
        const defaultValue = typeof attribute.defaultValue === 'function'
            ? attribute.defaultValue(tagName, element)
            : attribute.defaultValue || '';
        const value = rawValue !== null && rawValue !== undefined
            ? rawValue
            : defaultValue;
        const escapedValue = this.escapeHtml(value || '');
        const placeholder = attribute.placeholder ? ` placeholder="${this.escapeHtml(attribute.placeholder)}"` : '';
        const description = attribute.description
            ? `<p class="property-help">${this.escapeHtml(attribute.description)}</p>`
            : '';
        const removeFlag = attribute.removeWhenEmpty ? ' data-remove-when-empty="true"' : '';
        const required = attribute.required ? ' required' : '';

        if (attribute.readonly) {
            return `
                <div class="property-field property-field-readonly">
                    <span class="property-label">${this.escapeHtml(attribute.label)}</span>
                    <span class="property-value">${escapedValue}</span>
                    ${description}
                </div>
            `;
        }

        return `
            <div class="property-field">
                <label class="property-label" for="${inputId}">${this.escapeHtml(attribute.label)}</label>
                <input id="${inputId}" type="text" class="property-input" value="${escapedValue}"${placeholder}${required}
                       data-property="${this.escapeHtml(attribute.name)}"${removeFlag}
                       onchange="app.updateElementProperty('${attribute.name}', this.value, this.dataset)">
                ${description}
            </div>
        `;
    }

    buildPropertyGroupsHtml(element, tagName) {
        const definition = this.getPretextElementDefinition(tagName);
        const groups = [];

        groups.push({
            id: 'overview',
            title: 'Element Overview',
            description: (definition && definition.description) || 'Inspect and adjust common attributes for the selected element.',
            attributes: [
                { name: 'tag', label: 'Tag', readonly: true, defaultValue: tagName },
                { name: 'id', label: 'HTML ID', removeWhenEmpty: true, description: 'Optional ID for styling or scripting in the Canvas.', defaultValue: element.id || '' },
                { name: 'class', label: 'CSS Classes', removeWhenEmpty: true, description: 'Separate multiple classes with spaces to apply additional styling.', defaultValue: element.className || '' }
            ]
        });

        if (definition && typeof definition.buildGroups === 'function') {
            const typeSpecificGroups = definition.buildGroups(this, tagName, element);
            if (Array.isArray(typeSpecificGroups)) {
                groups.push(...typeSpecificGroups);
            }
        }

        return groups;
    }

    showElementProperties(element) {
        const propertiesContent = document.getElementById('properties-content');
        if (!propertiesContent) {
            return;
        }
        const tagName = element.tagName.toLowerCase();
        const definition = this.getPretextElementDefinition(tagName);
        const groups = this.buildPropertyGroupsHtml(element, tagName);
        const typeLabel = definition ? definition.label : 'Generic';

        if (propertiesContent) {
            propertiesContent.setAttribute('aria-busy', 'true');
        }

        let propertiesHtml = `
            <div class="properties-header">
                <div class="properties-header-main">
                    <h4 class="properties-title">${this.escapeHtml(tagName)}</h4>
                    <span class="properties-subtitle">${this.escapeHtml(typeLabel)} element</span>
                </div>
            </div>
        `;

        groups.forEach((group) => {
            const description = group.description
                ? `<p class="property-group-description">${this.escapeHtml(group.description)}</p>`
                : '';
            const helpText = group.helpText
                ? `<div class="property-group-help">${this.escapeHtml(group.helpText)}</div>`
                : '';

            const attributesHtml = Array.isArray(group.attributes)
                ? group.attributes.map((attribute) => this.buildAttributeFieldHtml(group, attribute, element, { tagName })).join('')
                : '';

            propertiesHtml += `
                <section class="property-group" aria-labelledby="group-${group.id}">
                    <div class="property-group-header">
                        <h5 id="group-${group.id}" class="property-group-title">${this.escapeHtml(group.title)}</h5>
                        ${description}
                    </div>
                    <div class="property-group-body">
                        ${attributesHtml}
                        ${helpText}
                    </div>
                </section>
            `;
        });

        propertiesContent.innerHTML = propertiesHtml;
        propertiesContent.scrollTop = 0;
        propertiesContent.setAttribute('aria-busy', 'false');
    }

    hideElementProperties() {
        const propertiesContent = document.getElementById('properties-content');
        if (!propertiesContent) {
            return;
        }
        propertiesContent.setAttribute('aria-busy', 'false');
        propertiesContent.innerHTML = '<p class="no-selection">Select an element to view its properties</p>';
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return String(text).replace(/[&<>"']/g, (char) => map[char]);
    }

    updateElementProperty(property, value, options = {}) {
        if (this.selectedElement) {
            const isDomStringMap = typeof DOMStringMap !== 'undefined' && options instanceof DOMStringMap;
            const dataset = isDomStringMap ? options : { ...options };
            const removeWhenEmpty = dataset.removeWhenEmpty === 'true' || dataset.removeWhenEmpty === true;
            const trimmedValue = typeof value === 'string' ? value.trim() : value;

            if (property === 'class') {
                if (removeWhenEmpty && trimmedValue === '') {
                    this.selectedElement.removeAttribute('class');
                    this.selectedElement.className = '';
                } else {
                    this.selectedElement.className = trimmedValue;
                }
            } else if (property === 'id') {
                if (removeWhenEmpty && trimmedValue === '') {
                    this.selectedElement.removeAttribute('id');
                    this.selectedElement.id = '';
                } else {
                    this.selectedElement.id = trimmedValue;
                }
            } else {
                if (removeWhenEmpty && trimmedValue === '') {
                    this.selectedElement.removeAttribute(property);
                } else {
                    this.selectedElement.setAttribute(property, trimmedValue);
                }

                if (property === 'xml:id') {
                    if (removeWhenEmpty && trimmedValue === '') {
                        this.selectedElement.removeAttribute('data-ptx-xml-id');
                    } else {
                        this.selectedElement.setAttribute('data-ptx-xml-id', trimmedValue);
                    }
                }
            }

            this.markDocumentModified();
        }
    }

    generateOutline() {
        const outlineTree = document.getElementById('outline-tree');
        const sourceContent = document.getElementById('source-content').value;
        
        // Parse XML to generate outline
        const outline = this.parseOutline(sourceContent);
        outlineTree.innerHTML = this.renderOutline(outline);
    }

    parseOutline(xml) {
        const parser = new DOMParser();

        try {
            const doc = parser.parseFromString(xml, 'text/xml');
            const rootElement = doc.documentElement;

            if (!rootElement || rootElement.nodeName === 'parsererror') {
                return [this.buildOutlineErrorNode()];
            }

            const outlineNodes = this.extractOutlineFromElement(rootElement, '', new Map());
            return outlineNodes.length > 0 ? outlineNodes : [];
        } catch (e) {
            return [this.buildOutlineErrorNode()];
        }
    }

    buildOutlineErrorNode() {
        return {
            title: 'Parse Error',
            type: 'error',
            id: 'error',
            path: '',
            children: []
        };
    }

    shouldIncludeElementInOutline(tagName) {
        return OUTLINE_INCLUDED_TAGS.has(tagName);
    }

    extractOutlineFromElement(element, parentPath, siblingCounts) {
        if (!element || element.nodeType !== 1) {
            return [];
        }

        const tagName = (element.localName || element.nodeName || '').toLowerCase();
        if (!tagName) {
            return [];
        }

        const counts = siblingCounts instanceof Map ? siblingCounts : new Map();
        const currentCount = (counts.get(tagName) || 0) + 1;
        counts.set(tagName, currentCount);
        const path = parentPath ? `${parentPath}/${tagName}[${currentCount}]` : `${tagName}[${currentCount}]`;

        const childCounts = new Map();
        const children = [];
        Array.from(element.children).forEach((child) => {
            const childNodes = this.extractOutlineFromElement(child, path, childCounts);
            if (childNodes && childNodes.length > 0) {
                children.push(...childNodes);
            }
        });

        if (!this.shouldIncludeElementInOutline(tagName) && tagName !== 'parsererror') {
            return children;
        }

        const titleElement = Array.from(element.children).find((child) => {
            const name = (child.localName || child.nodeName || '').toLowerCase();
            return name === 'title';
        });
        const rawTitle = titleElement ? titleElement.textContent || '' : '';
        const labelAttribute = element.getAttribute('label');
        const displayTitle = rawTitle.trim() || labelAttribute || tagName;
        const id = element.getAttribute('xml:id') || element.getAttribute('id') || '';

        return [{
            title: displayTitle,
            type: tagName,
            id,
            path,
            children
        }];
    }

    renderOutline(outline) {
        if (!Array.isArray(outline) || outline.length === 0) {
            return '<div class="outline-empty">No outline available</div>';
        }

        const renderNodes = (nodes, depth) => nodes.map((node) => renderNode(node, depth)).join('');

        const renderNode = (node, depth) => {
            if (!node) {
                return '';
            }

            const hasChildren = Array.isArray(node.children) && node.children.length > 0;
            const safeTitle = this.escapeHtml(node.title || node.type || '');
            const toggleLabel = this.escapeHtml(`Toggle ${node.title || node.type || 'item'}`);
            const icon = this.escapeHtml(this.getOutlineIcon(node.type));
            const idAttribute = node.id ? ` data-element-id="${this.escapeHtml(node.id)}"` : ' data-element-id=""';
            const pathAttribute = node.path ? ` data-ptx-path="${this.escapeHtml(node.path)}"` : '';
            const typeAttribute = node.type ? ` data-outline-type="${this.escapeHtml(node.type)}"` : '';
            const depthAttribute = ` data-depth="${depth}"`;

            const toggleMarkup = hasChildren
                ? `<button type="button" class="outline-toggle" aria-expanded="true" aria-label="${toggleLabel}"><span class="outline-caret" aria-hidden="true">▾</span></button>`
                : '<span class="outline-toggle outline-toggle-spacer" aria-hidden="true"></span>';

            const childrenMarkup = hasChildren
                ? `<ul class="outline-children" role="group">${renderNodes(node.children, depth + 1)}</ul>`
                : '';

            const roleAttributes = hasChildren ? ' role="treeitem" aria-expanded="true"' : ' role="treeitem"';

            return `
                <li class="outline-node"${roleAttributes}>
                    <div class="outline-row">
                        ${toggleMarkup}
                        <button type="button" class="outline-item"${idAttribute}${pathAttribute}${typeAttribute}${depthAttribute}>
                            <span class="outline-icon" aria-hidden="true">${icon}</span>
                            <span class="outline-title">${safeTitle}</span>
                        </button>
                    </div>
                    ${childrenMarkup}
                </li>
            `;
        };

        return `<ul class="outline-tree-root" role="tree">${renderNodes(outline, 0)}</ul>`;
    }

    getOutlineIcon(type) {
        const icons = {
            pretext: '🗂️',
            book: '📚',
            article: '📰',
            frontmatter: '📄',
            backmatter: '📄',
            part: '🗃️',
            chapter: '📘',
            section: '📗',
            subsection: '📒',
            subsubsection: '📓',
            appendix: '📎',
            appendices: '📎',
            preface: '📝',
            introduction: '📝',
            conclusion: '📝',
            glossary: '📖',
            index: '🔖',
            exercises: '🗒️',
            exercise: '📝',
            example: '💡',
            problem: '❓',
            project: '🛠️',
            activity: '🎯',
            exploration: '🧭',
            task: '🧩',
            error: '⚠️'
        };
        return icons[type] || '•';
    }

    navigateToElement(elementId, elementPath) {
        if ((!elementId || elementId === 'error') && !elementPath) {
            return;
        }

        let resolvedPath = elementPath || '';

        if (this.currentView === 'visual' || this.currentView === 'split') {
            let element = null;

            if (elementId && elementId !== 'error') {
                const escapedId = this.escapeForAttributeSelector(elementId);
                element = document.querySelector(`[id="${escapedId}"]`) ||
                    document.querySelector(`[data-ptx-xml-id="${escapedId}"]`);
            }

            if (!element && resolvedPath) {
                element = this.findVisualElementByPath(resolvedPath);
            }

            if (element) {
                if (!resolvedPath && element.dataset && element.dataset.ptxPath) {
                    resolvedPath = element.dataset.ptxPath;
                }

                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                this.selectElement(element);
                this.syncSelectionFromVisual(element);
            }
        }

        if (this.currentView === 'source' || this.currentView === 'split') {
            const sourceContent = document.getElementById('source-content');
            if (!sourceContent) {
                return;
            }

            const text = sourceContent.value || '';
            let handled = false;

            if (elementId && elementId !== 'error') {
                const searchPattern = new RegExp(`xml:id="${elementId}"`, 'i');
                const match = text.search(searchPattern);

                if (match !== -1) {
                    this.scrollSourceToIndex(sourceContent, match, match);
                    handled = true;
                }
            }

            if (!handled && resolvedPath) {
                const location = this.getSourceLocationForPath(resolvedPath);
                if (location) {
                    const startIndex = typeof location.start === 'number' ? location.start : 0;
                    const endIndex = typeof location.end === 'number' ? location.end : startIndex;
                    this.scrollSourceToIndex(sourceContent, startIndex, endIndex);
                    handled = true;
                }
            }

            if (handled) {
                sourceContent.focus();
                this.syncSourceSelectionToVisual();
            }
        }
    }

    focusSourcePosition(line, column) {
        const sourceContent = document.getElementById('source-content');
        if (!sourceContent) {
            return;
        }

        const hasLine = typeof line === 'number' && !Number.isNaN(line);
        const hasColumn = typeof column === 'number' && !Number.isNaN(column);
        const targetLine = hasLine ? Math.max(line, 1) : 1;
        const targetColumn = hasColumn ? Math.max(column, 1) : 1;

        const lines = sourceContent.value.split(/\r?\n/);
        let position = 0;

        for (let i = 0; i < targetLine - 1 && i < lines.length; i++) {
            position += lines[i].length + 1;
        }

        if (targetLine - 1 < lines.length) {
            position += Math.min(targetColumn - 1, lines[targetLine - 1].length);
        }

        position = Math.min(position, sourceContent.value.length);

        sourceContent.focus();
        sourceContent.setSelectionRange(position, position);

        const ratio = sourceContent.value.length > 0 ? position / sourceContent.value.length : 0;
        sourceContent.scrollTop = sourceContent.scrollHeight * ratio;

        this.updateCursorPosition();
        this.syncSourceSelectionToVisual();
    }

    validateDocument() {
        const sourceContent = document.getElementById('source-content').value;
        const validationContent = document.getElementById('validation-content');
        
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(sourceContent, 'text/xml');
            
            const parserError = doc.querySelector('parsererror');
            if (parserError) {
                throw new Error(parserError.textContent);
            }
            
            // Basic validation passed
            validationContent.innerHTML = `
                <div class="validation-status valid">
                    <span class="status-icon">✓</span>
                    <span>Document is valid XML</span>
                </div>
            `;
        } catch (e) {
            const rawMessage = e && e.message ? e.message : 'XML parsing error';
            const sanitizedMessage = this.escapeHtml(rawMessage.replace(/\s+/g, ' ').trim());
            const lineMatch = rawMessage.match(/line(?: number)?\s*[:=]?\s*(\d+)/i);
            const columnMatch = rawMessage.match(/column(?: number)?\s*[:=]?\s*(\d+)/i);
            const lineNumber = lineMatch ? parseInt(lineMatch[1], 10) : null;
            const columnNumber = columnMatch ? parseInt(columnMatch[1], 10) : null;
            const hasLine = lineNumber !== null && !Number.isNaN(lineNumber);
            const hasColumn = columnNumber !== null && !Number.isNaN(columnNumber);
            let locationLabel = '';

            if (hasLine) {
                locationLabel = `Line ${lineNumber}`;
                if (hasColumn) {
                    locationLabel += `, Column ${columnNumber}`;
                }
            }

            const locationMarkup = hasLine ? `<span class="validation-location">${locationLabel}</span>` : '';
            const dataLine = hasLine ? lineNumber : '';
            const dataColumn = hasColumn ? columnNumber : '';

            validationContent.innerHTML = `
                <div class="validation-status error">
                    <span class="status-icon">✗</span>
                    <span>XML Error</span>
                </div>
                <ul class="validation-errors">
                    <li class="validation-error" data-line="${dataLine}" data-column="${dataColumn}">
                        <span class="validation-message">${sanitizedMessage}</span>
                        ${locationMarkup}
                    </li>
                </ul>
            `;
        }
    }


    renderMath() {
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise().catch((err) => {
                console.warn('MathJax rendering error:', err);
            });
        }
    }

    newDocument() {
        if (this.isDocumentModified) {
            if (!confirm('You have unsaved changes. Create a new document anyway?')) {
                return;
            }
        }

        if (this.openTemplateModal()) {
            return;
        }

        const fallbackId = this.getInitialTemplateId();
        const fallbackTemplate = this.getTemplateById(fallbackId) || (this.templates[0] || null);

        if (fallbackTemplate) {
            this.persistLastTemplateId(fallbackTemplate.id);
            this.applyTemplateSkeleton(fallbackTemplate.skeleton || DEFAULT_TEMPLATE_SKELETON, fallbackTemplate.label || DEFAULT_TEMPLATE_LABEL);
        } else {
            this.applyTemplateSkeleton(DEFAULT_TEMPLATE_SKELETON, DEFAULT_TEMPLATE_LABEL);
        }
    }

    openFile() {
        document.getElementById('file-input').click();
    }

    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            document.getElementById('source-content').value = content;
            this.invalidateSourceLocationMap();

            // Convert to visual representation
            const html = this.convertXmlToHtmlSafe(content);
            document.getElementById('visual-content').innerHTML = html;

            this.resetGeneratedXmlIdCache();
            this.isDocumentModified = false;
            this.generateOutline();
            this.validateDocument();
            this.renderMath();
            this.syncSourceSelectionToVisual();
            this.updateStatus(`Loaded: ${file.name}`);
            this.recordHistorySnapshot(true);
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    saveFile() {
        const content = document.getElementById('source-content').value;
        const blob = new Blob([content], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.ptx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.isDocumentModified = false;
        this.updateStatus('Document saved');

        if (this.undoStack.length > 0) {
            const topSnapshot = this.undoStack[this.undoStack.length - 1];
            topSnapshot.isDocumentModified = false;
            this.lastSnapshot = topSnapshot;
        }
    }

    setupDragAndDrop() {
        const visualContent = document.getElementById('visual-content');

        // Allow dropping on visual editor
        visualContent.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        visualContent.addEventListener('drop', (e) => {
            e.preventDefault();
            const elementType = e.dataTransfer.getData('text/element-type');
            if (elementType) {
                this.insertElement(elementType);
            }
        });
    }

    setupTemplateChooser() {
        if (this.templateModalInitialized) {
            return;
        }

        this.templateModal = document.getElementById('template-modal');
        this.templateOptionList = document.getElementById('template-option-list');
        this.templatePreviewTitle = document.getElementById('template-preview-title');
        this.templatePreviewDescription = document.getElementById('template-preview-description');
        const previewCodeBlock = document.getElementById('template-preview-code');
        this.templatePreviewCode = previewCodeBlock ? (previewCodeBlock.querySelector('code') || previewCodeBlock) : null;
        this.templateApplyButton = document.getElementById('template-apply');
        this.templateCancelButton = document.getElementById('template-cancel');

        if (!this.templateModal || !this.templateOptionList || !this.templateApplyButton) {
            return;
        }

        if (this.templateCancelButton) {
            this.templateCancelButton.addEventListener('click', () => this.closeTemplateModal());
        }

        const dismissTriggers = this.templateModal.querySelectorAll('[data-template-modal-dismiss]');
        dismissTriggers.forEach((trigger) => {
            trigger.addEventListener('click', () => this.closeTemplateModal());
        });

        this.templateApplyButton.addEventListener('click', () => this.confirmTemplateSelection());

        this.renderTemplateOptions(this.getInitialTemplateId());

        document.addEventListener('keydown', this.handleTemplateModalKeydown);

        this.templateModalInitialized = true;
    }

    renderTemplateOptions(selectedId) {
        if (!this.templateOptionList) {
            return;
        }

        this.templateOptionList.innerHTML = '';
        this.templateCards = [];

        if (!Array.isArray(this.templates)) {
            this.templates = [];
        }

        this.templates.forEach((template) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'template-card';
            card.dataset.templateId = template.id;
            card.setAttribute('role', 'option');
            card.setAttribute('aria-selected', 'false');

            const title = document.createElement('span');
            title.className = 'template-card__title';
            title.textContent = template.label || DEFAULT_TEMPLATE_LABEL;
            card.appendChild(title);

            const description = document.createElement('span');
            description.className = 'template-card__description';
            description.textContent = template.description || '';
            card.appendChild(description);

            card.addEventListener('click', () => {
                this.selectTemplate(template.id, true);
            });

            card.addEventListener('dblclick', () => {
                this.selectTemplate(template.id, false);
                this.confirmTemplateSelection();
            });

            this.templateOptionList.appendChild(card);
            this.templateCards.push(card);
        });

        this.activeTemplateId = null;

        const targetId = selectedId && this.getTemplateById(selectedId)
            ? selectedId
            : (this.templates[0] ? this.templates[0].id : null);

        if (targetId) {
            this.selectTemplate(targetId, false);
        } else {
            if (this.templateApplyButton) {
                this.templateApplyButton.disabled = true;
                this.templateApplyButton.textContent = 'Use template';
            }
            this.updateTemplatePreview(null);
        }
    }

    selectTemplate(templateId, focusCard = false) {
        const template = this.getTemplateById(templateId);

        if (!template) {
            if (this.templateApplyButton) {
                this.templateApplyButton.disabled = true;
                this.templateApplyButton.textContent = 'Use template';
            }
            return;
        }

        this.activeTemplateId = template.id;

        if (Array.isArray(this.templateCards)) {
            this.templateCards.forEach((card) => {
                const isActive = card.dataset.templateId === template.id;
                card.classList.toggle('active', isActive);
                card.setAttribute('aria-selected', isActive ? 'true' : 'false');
                if (isActive && focusCard) {
                    card.focus();
                    this.scrollTemplateIntoView(template.id);
                }
            });
        }

        this.updateTemplatePreview(template);

        if (this.templateApplyButton) {
            this.templateApplyButton.disabled = false;
            this.templateApplyButton.textContent = `Use ${template.label || DEFAULT_TEMPLATE_LABEL}`;
        }
    }

    focusActiveTemplateCard() {
        if (!Array.isArray(this.templateCards)) {
            return;
        }

        const activeCard = this.templateCards.find((card) => card.dataset.templateId === this.activeTemplateId);
        if (activeCard) {
            activeCard.focus();
            this.scrollTemplateIntoView(this.activeTemplateId);
        }
    }

    updateTemplatePreview(template) {
        if (this.templatePreviewTitle) {
            this.templatePreviewTitle.textContent = template ? (template.label || DEFAULT_TEMPLATE_LABEL) : 'Select a template';
        }

        if (this.templatePreviewDescription) {
            this.templatePreviewDescription.textContent = template ? (template.description || '') : 'Template details and a snippet preview will appear here.';
        }

        if (this.templatePreviewCode) {
            const snippet = template ? (template.preview || template.skeleton || '') : '';
            this.templatePreviewCode.textContent = snippet;
        }
    }

    openTemplateModal() {
        if (!Array.isArray(this.templates) || this.templates.length === 0) {
            return false;
        }

        if (!this.templateModalInitialized) {
            this.setupTemplateChooser();
        }

        if (!this.templateModalInitialized || !this.templateModal) {
            return false;
        }

        const initialId = this.getInitialTemplateId();
        this.renderTemplateOptions(initialId);

        this.previousFocusedElement = document.activeElement;
        this.templateModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        this.isTemplateModalOpen = true;

        if (initialId) {
            this.focusActiveTemplateCard();
        } else if (this.templateCancelButton) {
            this.templateCancelButton.focus();
        }

        return true;
    }

    closeTemplateModal() {
        if (!this.templateModalInitialized || !this.isTemplateModalOpen) {
            return;
        }

        this.isTemplateModalOpen = false;

        if (this.templateModal) {
            this.templateModal.setAttribute('aria-hidden', 'true');
        }

        document.body.classList.remove('modal-open');

        if (this.previousFocusedElement && typeof this.previousFocusedElement.focus === 'function') {
            this.previousFocusedElement.focus();
        }

        this.previousFocusedElement = null;
    }

    confirmTemplateSelection() {
        const template = this.getTemplateById(this.activeTemplateId) || (this.templates[0] || null);

        if (!template) {
            return;
        }

        this.closeTemplateModal();
        this.persistLastTemplateId(template.id);
        this.loadTemplateById(template.id);
    }

    navigateTemplateSelection(step) {
        if (!Array.isArray(this.templateCards) || this.templateCards.length === 0) {
            return;
        }

        const currentIndex = this.templateCards.findIndex((card) => card.dataset.templateId === this.activeTemplateId);
        const safeIndex = currentIndex >= 0 ? currentIndex : 0;
        let nextIndex = safeIndex + step;

        if (nextIndex < 0) {
            nextIndex = this.templateCards.length - 1;
        } else if (nextIndex >= this.templateCards.length) {
            nextIndex = 0;
        }

        const nextCard = this.templateCards[nextIndex];
        if (nextCard) {
            this.selectTemplate(nextCard.dataset.templateId, true);
        }
    }

    scrollTemplateIntoView(templateId) {
        if (!Array.isArray(this.templateCards)) {
            return;
        }

        const targetCard = this.templateCards.find((card) => card.dataset.templateId === templateId);
        if (targetCard && typeof targetCard.scrollIntoView === 'function') {
            targetCard.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    }

    loadTemplateById(templateId) {
        const template = this.getTemplateById(templateId);
        if (template) {
            this.applyTemplateSkeleton(template.skeleton || DEFAULT_TEMPLATE_SKELETON, template.label || DEFAULT_TEMPLATE_LABEL);
        } else {
            this.applyTemplateSkeleton(DEFAULT_TEMPLATE_SKELETON, DEFAULT_TEMPLATE_LABEL);
        }
    }

    applyTemplateSkeleton(skeleton, label) {
        const sourceContent = document.getElementById('source-content');
        const visualContent = document.getElementById('visual-content');
        const templateSkeleton = skeleton || DEFAULT_TEMPLATE_SKELETON;

        if (sourceContent) {
            sourceContent.value = templateSkeleton;
            sourceContent.scrollTop = 0;
            sourceContent.selectionStart = 0;
            sourceContent.selectionEnd = 0;
        }

        if (visualContent) {
            const html = this.convertXmlToHtmlSafe(templateSkeleton);
            visualContent.innerHTML = html;
            visualContent.scrollTop = 0;
        }

        this.resetGeneratedXmlIdCache();
        this.invalidateSourceLocationMap();
        this.renderMath();
        this.syncSourceSelectionToVisual();
        this.updateCursorPosition();

        this.isDocumentModified = false;
        this.generateOutline();
        this.validateDocument();

        const snapshot = this.createSnapshot();
        this.resetHistoryWithSnapshot(snapshot);

        const statusLabel = label || DEFAULT_TEMPLATE_LABEL;
        this.updateStatus(`Loaded "${statusLabel}" template`);
    }

    convertXmlToHtmlSafe(xml) {
        try {
            return this.xmlToHtml(xml);
        } catch (error) {
            console.warn('Unable to render template for visual editor:', error);
            return `<pre class="visual-xml-fallback">${this.escapeHtml(xml)}</pre>`;
        }
    }

    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            const key = event.key.toLowerCase();
            switch (key) {
                case 'n':
                    event.preventDefault();
                    this.newDocument();
                    break;
                case 'o':
                    event.preventDefault();
                    this.openFile();
                    break;
                case 's':
                    event.preventDefault();
                    this.saveFile();
                    break;
                case '1':
                    event.preventDefault();
                    this.switchView('visual');
                    break;
                case '2':
                    event.preventDefault();
                    this.switchView('source');
                    break;
                case '3':
                    event.preventDefault();
                    this.switchView('split');
                    break;
                case 'z':
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'y':
                    event.preventDefault();
                    this.redo();
                    break;
            }
        }
    }

    updateCursorPosition() {
        const cursorPositionEl = document.getElementById('cursor-position');
        if (!cursorPositionEl) {
            return;
        }

        const sourceContent = document.getElementById('source-content');
        const visualContent = document.getElementById('visual-content');

        const setPositionText = (line, column) => {
            cursorPositionEl.textContent = `Line ${line}, Column ${column}`;
        };

        if (sourceContent && document.activeElement === sourceContent) {
            const lines = sourceContent.value.substr(0, sourceContent.selectionStart).split('\n');
            const line = lines.length;
            const column = lines[lines.length - 1].length + 1;
            setPositionText(line, column);
            return;
        }

        const selection = window.getSelection ? window.getSelection() : null;
        const isNodeWithin = (node, container) => {
            if (!node || !container) {
                return false;
            }
            return node === container || container.contains(node);
        };

        if (
            visualContent &&
            selection &&
            selection.rangeCount > 0 &&
            isNodeWithin(selection.anchorNode, visualContent) &&
            isNodeWithin(selection.focusNode, visualContent)
        ) {
            const focusNode = selection.focusNode;
            const focusOffset = selection.focusOffset;

            try {
                const range = selection.getRangeAt(0).cloneRange();
                const preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(visualContent);
                preCaretRange.setEnd(focusNode, focusOffset);

                const textUpToCaret = preCaretRange.toString();
                const lines = textUpToCaret.split(/\r?\n/);
                const line = lines.length;
                const column = lines[lines.length - 1].length + 1;
                setPositionText(line, column);
                return;
            } catch (error) {
                // If we can't determine the caret position, fall through to reset display.
            }
        }

        cursorPositionEl.textContent = 'Line –, Column –';
    }

    resetHistoryWithSnapshot(snapshot) {
        if (snapshot) {
            this.undoStack = [snapshot];
            this.lastSnapshot = snapshot;
        } else {
            this.undoStack = [];
            this.lastSnapshot = null;
        }

        this.redoStack = [];
    }

    createSnapshot() {
        const sourceContent = document.getElementById('source-content');
        const visualContent = document.getElementById('visual-content');

        return {
            source: sourceContent ? sourceContent.value : '',
            visual: visualContent ? visualContent.innerHTML : '',
            isDocumentModified: this.isDocumentModified
        };
    }

    snapshotsEqual(a, b) {
        if (!a || !b) {
            return false;
        }
        return a.source === b.source && a.visual === b.visual;
    }

    recordHistorySnapshot(force = false) {
        if (this.isApplyingHistory) {
            return;
        }

        if (this.historyDebounceTimer) {
            clearTimeout(this.historyDebounceTimer);
            this.historyDebounceTimer = null;
        }

        const snapshot = this.createSnapshot();

        if (!this.undoStack.length) {
            this.undoStack.push(snapshot);
            this.lastSnapshot = snapshot;
            this.redoStack = [];
            return;
        }

        if (!force && this.lastSnapshot && this.snapshotsEqual(snapshot, this.lastSnapshot)) {
            return;
        }

        this.undoStack.push(snapshot);
        this.lastSnapshot = snapshot;
        this.redoStack = [];
    }

    scheduleHistorySnapshot() {
        if (this.isApplyingHistory) {
            return;
        }

        if (this.historyDebounceTimer) {
            clearTimeout(this.historyDebounceTimer);
        }

        this.historyDebounceTimer = setTimeout(() => {
            this.recordHistorySnapshot();
            this.historyDebounceTimer = null;
        }, this.historyDebounceDelay);
    }

    applySnapshot(snapshot) {
        if (!snapshot) {
            return;
        }

        const sourceContent = document.getElementById('source-content');
        const visualContent = document.getElementById('visual-content');

        if (this.historyDebounceTimer) {
            clearTimeout(this.historyDebounceTimer);
            this.historyDebounceTimer = null;
        }

        this.isApplyingHistory = true;

        if (sourceContent) {
            sourceContent.value = snapshot.source;
            this.invalidateSourceLocationMap();
        }

        if (visualContent) {
            visualContent.innerHTML = snapshot.visual;
        }

        this.isDocumentModified = snapshot.isDocumentModified;
        this.lastSnapshot = snapshot;

        this.generateOutline();
        this.validateDocument();
        this.renderMath();
        this.syncSourceSelectionToVisual();

        this.isApplyingHistory = false;
    }

    undo() {
        if (this.undoStack.length <= 1) {
            this.updateStatus('Nothing to undo');
            return;
        }

        const currentSnapshot = this.undoStack.pop();
        this.redoStack.push(currentSnapshot);

        const previousSnapshot = this.undoStack[this.undoStack.length - 1];
        this.applySnapshot(previousSnapshot);
        this.updateStatus('Undo');
    }

    redo() {
        if (this.redoStack.length === 0) {
            this.updateStatus('Nothing to redo');
            return;
        }

        const snapshot = this.redoStack.pop();
        this.undoStack.push(snapshot);
        this.applySnapshot(snapshot);
        this.updateStatus('Redo');
    }

    markDocumentModified() {
        if (!this.isDocumentModified) {
            this.isDocumentModified = true;
            this.updateStatus('Document modified');
        }
    }

    updateStatus(message) {
        document.getElementById('document-status').textContent = message;
    }

    syncScroll() {
        // Implement scroll synchronization between visual and source editors in split view
        if (this.currentView === 'split') {
            // This could be enhanced with more sophisticated synchronization
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PreTeXtCanvas();
});
