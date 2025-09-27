// PreTeXt Canvas - Main JavaScript File

class PreTeXtCanvas {
    constructor() {
        this.currentView = 'visual';
        this.currentDocument = null;
        this.selectedElement = null;
        this.isDocumentModified = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
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
        visualContent.addEventListener('click', (e) => this.selectElement(e.target));
        visualContent.addEventListener('keyup', () => this.updateCursorPosition());

        // Source editor events
        const sourceContent = document.getElementById('source-content');
        sourceContent.addEventListener('input', () => this.onSourceEdit());
        sourceContent.addEventListener('scroll', () => this.syncScroll());
        sourceContent.addEventListener('keyup', () => this.updateCursorPosition());

        // Outline navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('outline-item')) {
                this.navigateToElement(e.target.dataset.elementId);
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
        // Basic XML to HTML conversion for visual display
        let html = xml;
        
        // Convert basic structure elements
        html = html.replace(/<title>(.*?)<\/title>/g, '<h2>$1</h2>');
        html = html.replace(/<p>(.*?)<\/p>/g, '<p>$1</p>');
        html = html.replace(/<me>(.*?)<\/me>/g, '<div class="math-expression">\\($1\\)</div>');
        html = html.replace(/<md>(.*?)<\/md>/gs, '<div class="math-display">\\[$1\\]</div>');
        
        // Convert lists
        html = html.replace(/<ol>/g, '<ol>');
        html = html.replace(/<\/ol>/g, '</ol>');
        html = html.replace(/<ul>/g, '<ul>');
        html = html.replace(/<\/ul>/g, '</ul>');
        html = html.replace(/<li><p>(.*?)<\/p><\/li>/g, '<li>$1</li>');
        
        return html;
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
        if (this.currentView === 'split') {
            const visualContent = document.getElementById('visual-content');
            const sourceContent = document.getElementById('source-content');
            
            // Convert HTML back to XML (simplified)
            let xml = visualContent.innerHTML;
            xml = this.htmlToXml(xml);
            sourceContent.value = xml;
        }
    }

    syncToVisual() {
        if (this.currentView === 'split') {
            const sourceContent = document.getElementById('source-content');
            const visualContent = document.getElementById('visual-content');
            
            try {
                const xml = sourceContent.value;
                const html = this.xmlToHtml(xml);
                visualContent.innerHTML = html;
                this.renderMath();
            } catch (e) {
                console.warn('Could not sync to visual editor:', e);
            }
        }
    }

    htmlToXml(html) {
        // Basic HTML to XML conversion
        let xml = html;
        
        // Convert basic structure
        xml = xml.replace(/<h2>(.*?)<\/h2>/g, '<title>$1</title>');
        xml = xml.replace(/<div class="math-expression">\\(\\((.*?)\\)\\)<\/div>/g, '<me>$1</me>');
        xml = xml.replace(/<div class="math-display">\\(\\[(.*?)\\]\\)<\/div>/gs, '<md>$1</md>');
        
        return xml;
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
            'book': '📚',
            'article': '📄',
            'chapter': '📂',
            'section': '📑',
            'subsection': '📋',
            'subsubsection': '📝',
            'error': '⚠️'
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
            validationContent.innerHTML = `
                <div class="validation-status error">
                    <span class="status-icon">✗</span>
                    <span>XML Error</span>
                </div>
                <ul class="validation-errors">
                    <li class="validation-error">${e.message}</li>
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
        const sourceContent = document.getElementById('source-content');
        if (document.activeElement === sourceContent) {
            const lines = sourceContent.value.substr(0, sourceContent.selectionStart).split('\n');
            const line = lines.length;
            const column = lines[lines.length - 1].length + 1;
            document.getElementById('cursor-position').textContent = `Line ${line}, Column ${column}`;
        }
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