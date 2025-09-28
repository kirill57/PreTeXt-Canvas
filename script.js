// PreTeXt Canvas - Main JavaScript File

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
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupLayoutControls();
        this.setupDragAndDrop();
        this.generateOutline();
        this.updateStatus('Ready');
        
        // Initialize MathJax if available
        if (window.MathJax && window.MathJax.typesetPromise) {
            this.renderMath();
        }
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

        // Panel switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchPanel(e.target.dataset.panel));
        });

        // Element palette
        document.querySelectorAll('.element-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.insertElement(e.target.dataset.element));
        });

        // Visual editor events
        const visualContent = document.getElementById('visual-content');
        visualContent.addEventListener('input', () => this.onVisualEdit());
        visualContent.addEventListener('click', (e) => {
            this.selectElement(e.target);
            this.updateCursorPosition();
        });
        visualContent.addEventListener('mouseup', () => this.updateCursorPosition());
        visualContent.addEventListener('keyup', () => this.updateCursorPosition());

        // Source editor events
        const sourceContent = document.getElementById('source-content');
        sourceContent.addEventListener('input', () => this.onSourceEdit());
        sourceContent.addEventListener('scroll', () => this.syncScroll());
        sourceContent.addEventListener('click', () => this.updateCursorPosition());
        sourceContent.addEventListener('mouseup', () => this.updateCursorPosition());
        sourceContent.addEventListener('keyup', () => this.updateCursorPosition());

        // Outline navigation
        document.addEventListener('click', (e) => {
            if (!e.target || typeof e.target.closest !== 'function') {
                return;
            }

            const outlineItem = e.target.closest('.outline-item');
            if (outlineItem) {
                this.navigateToElement(outlineItem.dataset.elementId);
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
        const templates = {
            'book': '<book xml:id="book-id">\n    <title>Book Title</title>\n    <chapter xml:id="ch-1">\n        <title>Chapter Title</title>\n        <p>Chapter content...</p>\n    </chapter>\n</book>',
            'article': '<article xml:id="article-id">\n    <title>Article Title</title>\n    <p>Article content...</p>\n</article>',
            'chapter': '<chapter xml:id="ch-new">\n    <title>Chapter Title</title>\n    <p>Chapter content...</p>\n</chapter>',
            'section': '<section xml:id="sec-new">\n    <title>Section Title</title>\n    <p>Section content...</p>\n</section>',
            'subsection': '<subsection xml:id="subsec-new">\n    <title>Subsection Title</title>\n    <p>Subsection content...</p>\n</subsection>',
            'p': '<p>New paragraph text...</p>',
            'ol': '<ol>\n    <li><p>First item</p></li>\n    <li><p>Second item</p></li>\n</ol>',
            'ul': '<ul>\n    <li><p>First item</p></li>\n    <li><p>Second item</p></li>\n</ul>',
            'dl': '<dl>\n    <li>\n        <title>Term</title>\n        <p>Definition</p>\n    </li>\n</dl>',
            'me': '<me>x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}</me>',
            'md': '<md>\n    <mrow>f(x) &amp;= x^2 + 2x + 1</mrow>\n    <mrow>&amp;= (x + 1)^2</mrow>\n</md>',
            'theorem': '<theorem xml:id="thm-new">\n    <title>Theorem Title</title>\n    <statement>\n        <p>Theorem statement...</p>\n    </statement>\n    <proof>\n        <p>Proof...</p>\n    </proof>\n</theorem>',
            'definition': '<definition xml:id="def-new">\n    <title>Definition Title</title>\n    <statement>\n        <p>Definition statement...</p>\n    </statement>\n</definition>',
            'figure': '<figure xml:id="fig-new">\n    <caption>Figure Caption</caption>\n    <image source="path/to/image.png" width="50%"/>\n</figure>',
            'image': '<image source="path/to/image.png" width="50%"/>',
            'video': '<video xml:id="vid-new" youtube="VIDEO_ID"/>'
        };

        if (this.currentView === 'visual' || this.currentView === 'split') {
            this.insertIntoVisualEditor(elementType, templates[elementType]);
        }
        
        if (this.currentView === 'source' || this.currentView === 'split') {
            this.insertIntoSourceEditor(templates[elementType]);
        }

        this.markDocumentModified();
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
    }

    xmlToHtml(xml) {
        // Convert XML-ish markup to HTML for the visual editor using DOM operations
        const container = document.createElement('div');
        container.innerHTML = xml;

        // Convert titles to headings
        container.querySelectorAll('title').forEach((titleEl) => {
            const heading = document.createElement('h2');
            heading.innerHTML = titleEl.innerHTML;
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

    onVisualEdit() {
        this.markDocumentModified();
        this.syncToSource();
        this.generateOutline();
        this.validateDocument();
        this.renderMath();
    }

    onSourceEdit() {
        this.markDocumentModified();
        this.syncToVisual();
        this.generateOutline();
        this.validateDocument();
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
            visualContent.innerHTML = html;
            this.renderMath();
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

    showElementProperties(element) {
        const propertiesContent = document.getElementById('properties-content');
        const tagName = element.tagName.toLowerCase();
        
        let propertiesHtml = `
            <div class="property-group">
                <h4>Element: ${tagName}</h4>
                <div class="property-item">
                    <span class="property-label">Tag:</span>
                    <span class="property-value">${tagName}</span>
                </div>
                <div class="property-item">
                    <span class="property-label">ID:</span>
                    <input type="text" class="property-input" value="${element.id || ''}" 
                           onchange="app.updateElementProperty('id', this.value)">
                </div>
                <div class="property-item">
                    <span class="property-label">Class:</span>
                    <input type="text" class="property-input" value="${element.className || ''}" 
                           onchange="app.updateElementProperty('class', this.value)">
                </div>
            </div>
        `;

        // Add specific properties based on element type
        if (tagName === 'img') {
            propertiesHtml += `
                <div class="property-group">
                    <h4>Image Properties</h4>
                    <div class="property-item">
                        <span class="property-label">Source:</span>
                        <input type="text" class="property-input" value="${element.src || ''}" 
                               onchange="app.updateElementProperty('src', this.value)">
                    </div>
                </div>
            `;
        }

        propertiesContent.innerHTML = propertiesHtml;
    }

    hideElementProperties() {
        const propertiesContent = document.getElementById('properties-content');
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

    updateElementProperty(property, value) {
        if (this.selectedElement) {
            if (property === 'class') {
                this.selectedElement.className = value;
            } else {
                this.selectedElement.setAttribute(property, value);
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
        const outline = [];
        const parser = new DOMParser();
        
        try {
            const doc = parser.parseFromString(xml, 'text/xml');
            const rootElement = doc.documentElement;
            
            if (rootElement.nodeName === 'parsererror') {
                return [{ title: 'Parse Error', type: 'error', id: 'error' }];
            }
            
            this.extractOutlineFromElement(rootElement, outline, 0);
        } catch (e) {
            return [{ title: 'Parse Error', type: 'error', id: 'error' }];
        }
        
        return outline;
    }

    extractOutlineFromElement(element, outline, level) {
        const structuralElements = ['book', 'article', 'chapter', 'section', 'subsection', 'subsubsection'];
        
        if (structuralElements.includes(element.nodeName)) {
            const titleElement = element.querySelector('title');
            const title = titleElement ? titleElement.textContent : element.nodeName;
            const id = element.getAttribute('xml:id') || element.getAttribute('id') || '';
            
            outline.push({
                title: title,
                type: element.nodeName,
                id: id,
                level: level
            });
            
            level++;
        }
        
        // Recursively process child elements
        for (const child of element.children) {
            this.extractOutlineFromElement(child, outline, level);
        }
    }

    renderOutline(outline) {
        return outline.map(item => {
            const indent = 'outline-indent'.repeat(item.level);
            return `
                <div class="outline-item ${indent}" data-element-id="${item.id}">
                    <span class="outline-icon">${this.getOutlineIcon(item.type)}</span>
                    <span class="outline-title">${item.title}</span>
                </div>
            `;
        }).join('');
    }

    getOutlineIcon(type) {
        const icons = {
            book: '📚',
            article: '📰',
            chapter: '📘',
            section: '📗',
            subsection: '📒',
            subsubsection: '📓',
            error: '⚠️',
        };
        return icons[type] || '•';
    }

    navigateToElement(elementId) {
        if (!elementId || elementId === 'error') return;
        
        if (this.currentView === 'visual' || this.currentView === 'split') {
            const element = document.querySelector(`[id="${elementId}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                this.selectElement(element);
            }
        }
        
        if (this.currentView === 'source' || this.currentView === 'split') {
            const sourceContent = document.getElementById('source-content');
            const text = sourceContent.value;
            const searchPattern = new RegExp(`xml:id="${elementId}"`, 'i');
            const match = text.search(searchPattern);
            
            if (match !== -1) {
                sourceContent.focus();
                sourceContent.setSelectionRange(match, match);
                sourceContent.scrollTop = sourceContent.scrollHeight * (match / text.length);
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
        
        const defaultDocument = `<?xml version="1.0" encoding="UTF-8"?>
<pretext xmlns:xi="http://www.w3.org/2001/XInclude" xml:lang="en-US">
    <docinfo>
        <macros>
        \\newcommand{\\R}{\\mathbb R}
        </macros>
    </docinfo>
    
    <book xml:id="new-book">
        <title>New PreTeXt Document</title>
        
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

        document.getElementById('source-content').value = defaultDocument;
        document.getElementById('visual-content').innerHTML = '<div class="pretext-document"><h1>New PreTeXt Document</h1><p>Start writing your content here.</p></div>';
        
        this.isDocumentModified = false;
        this.generateOutline();
        this.validateDocument();
        this.updateStatus('New document created');
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
            
            // Convert to visual representation
            const html = this.xmlToHtml(content);
            document.getElementById('visual-content').innerHTML = html;
            
            this.isDocumentModified = false;
            this.generateOutline();
            this.validateDocument();
            this.renderMath();
            this.updateStatus(`Loaded: ${file.name}`);
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
        
        // Make element buttons draggable
        document.querySelectorAll('.element-btn').forEach(btn => {
            btn.draggable = true;
            btn.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/element-type', e.target.dataset.element);
            });
        });
    }

    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
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
