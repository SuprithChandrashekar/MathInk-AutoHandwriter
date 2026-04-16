# MathInk Notes

MathInk Notes is a browser-based project that converts Markdown (including equation-heavy content) into human-like handwritten notes with realistic handwriting effects and export-ready pages.

It is designed for math, physics, engineering, and any workflow where you want clean digital input with handwritten-style output.

## What this project does

- Converts Markdown into formatted handwritten-style pages
- Supports inline (`$...$`) and block (`$$...$$`) LaTeX math
- Provides a visual equation editor (MathQuill) with symbol palette
- Applies handwriting realism effects (wobble, ink variation, pressure, bleed)
- Auto-paginates content into paper-sized pages
- Exports to multi-page PDF
- Supports uploaded diagrams/images and custom paper backgrounds

## Core features

### 1) Markdown + Math pipeline

The parsing flow is:

1. Extract LaTeX math into placeholders
2. Parse Markdown with `marked`
3. Restore placeholders into math DOM nodes
4. Replace embedded image IDs with actual image data

This keeps math content stable while still allowing normal Markdown processing.

### 2) Handwriting-style rendering

The renderer applies:

- Font family, size, ink color, spacing controls
- Realism transforms on characters (baseline wobble, tiny size variance, opacity variation)
- Ink bleed and pen-pressure style effects
- Additional scanner noise/paper texture during PDF generation

### 3) Equation editor

Built with MathQuill:

- Inline and block equation insertion modes
- Live LaTeX preview
- Palette categories (Greek, Operators, Relations, Structures)
- One-click insertion into the Markdown textarea

### 4) Pagination and notebook paper simulation

- Paper sizes: A4 and Letter
- Paper styles: ruled, grid, dotted, blank, custom background image
- Auto page break behavior for headings like Problem/Question/Exercise
- Content-aware splitting for long blocks

### 5) Export options

- Browser print flow
- PDF export via `html2canvas` + `jsPDF`
- Multi-page output with page dimensions matching selected paper size

## Tech stack

- HTML/CSS/Vanilla JavaScript (modular script files)
- [marked](https://www.npmjs.com/package/marked) for Markdown parsing
- [MathJax](https://www.mathjax.org/) for LaTeX rendering
- [MathQuill](http://mathquill.com/) for equation editing
- [html2canvas](https://html2canvas.hertzen.com/) + [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
- [Playwright](https://playwright.dev/) used by repository test scripts

## Project structure

```text
mathink-notes/
├── index.html
├── css/
│   ├── main.css
│   ├── paper.css
│   ├── equation-editor.css
│   └── dark-mode.css
├── js/
│   ├── app.js
│   ├── markdown-parser.js
│   ├── renderer.js
│   ├── pagination.js
│   ├── preview.js
│   ├── equation-editor.js
│   ├── pdf-export.js
│   ├── paper-manager.js
│   ├── image-upload.js
│   ├── dark-mode.js
│   ├── realism.js
│   └── utils.js
└── test-*.js
```

## Getting started

### Prerequisites

- Node.js 20+ (recommended)
- npm

### Install

```bash
npm install
```

### Run locally

Serve the project root with any static file server. Example:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

## How to use

1. Type/paste Markdown into the left panel
2. Add equations using:
   - direct Markdown math (`$...$`, `$$...$$`), or
   - the **∑ Math** equation editor
3. Choose handwriting font, size, ink color, spacing
4. Select page style and size
5. Optionally upload diagrams (`IMG`) and background paper (`BG`)
6. Export with **PDF** or **Print**

## Testing

This repository includes standalone test scripts (`test-*.js`) rather than npm script aliases.

Run all:

```bash
for f in test-*.js; do node "$f"; done
```

Notes:

- Simple parser/pagination scripts run directly with Node.
- Playwright-based scripts require browser binaries:

```bash
npx playwright install
```

## Known limitations

- No backend/storage layer (browser-only session state)
- No bundled build pipeline (served as static assets)
- Some test scripts depend on local server availability (`localhost:8000`)
- PDF fidelity depends on browser rendering and canvas capture behavior

## Rename summary

This project has been renamed in documentation and package metadata from an auto-resume generator concept to **MathInk Notes**, focused on converting equation-heavy Markdown into human-like handwritten notes.
