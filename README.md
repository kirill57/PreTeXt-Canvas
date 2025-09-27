# PreTeXt Canvas

A WYSIWYG and XML editor for PreTeXt (.ptx) educational documents. PreTeXt Canvas provides an intuitive dual-pane interface for creating and editing PreTeXt documents with both visual and source code editing capabilities.

## Features

- **Dual-Pane Interface**: Switch between Visual, Source, and Split views
- **Element Palette**: Drag-and-drop interface for adding PreTeXt elements
- **Document Outline**: Navigate through document structure easily
- **Properties Panel**: Edit element attributes and properties
- **Schema Validation**: Real-time XML validation
- **MathJax Integration**: Live mathematical expression rendering
- **File Operations**: Load and save .ptx files
- **Responsive Design**: Works on desktop and tablet devices

## Getting Started

1. Open `index.html` in a modern web browser
2. Start with the default document or create a new one
3. Use the element palette to add new PreTeXt elements
4. Switch between visual and source editing modes
5. Save your work as a .ptx file

## Usage

### Interface Overview

- **Header**: Contains file operations (New, Open, Save) and view controls
- **Left Sidebar**: Element palette and document outline
- **Main Editor**: Visual and/or source code editor
- **Right Sidebar**: Element properties and validation status
- **Status Bar**: Document status and cursor position

### Keyboard Shortcuts

- `Ctrl+N` (or `Cmd+N`): New document
- `Ctrl+O` (or `Cmd+O`): Open file
- `Ctrl+S` (or `Cmd+S`): Save file
- `Ctrl+1` (or `Cmd+1`): Visual view
- `Ctrl+2` (or `Cmd+2`): Source view
- `Ctrl+3` (or `Cmd+3`): Split view

### Supported PreTeXt Elements

#### Structure
- Book, Article, Chapter, Section, Subsection

#### Content
- Paragraphs, Ordered Lists, Unordered Lists, Definition Lists

#### Mathematics
- Inline Math (`<m>`), Display Math (`<me>`), Multi-line Display (`<md>`)
- Theorems, Definitions, Proofs

#### Media
- Figures, Images, Videos

## Files

- `index.html` - Main application interface
- `styles.css` - Application styling
- `script.js` - Core application logic
- `sample.ptx` - Sample PreTeXt document for testing

## Browser Compatibility

PreTeXt Canvas works in all modern browsers that support:
- ES6 JavaScript features
- CSS Grid and Flexbox
- DOM Parser API
- File API

## Development

This project uses vanilla HTML, CSS, and JavaScript with no build process required. Simply edit the files and refresh the browser to see changes.

## License

MIT License (see LICENSE file)
