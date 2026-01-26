# Polli AI Client - Feature Update

## 1. Advanced Code Rendering

We have integrated `react-syntax-highlighter` to provide a premium coding experience.

* **Syntax Highlighting**: Automatically detects languages (e.g., Python, TypeScript, JSON) and aggressively highlights syntax using a VS Code Dark theme.
* **One-Click Copy**: Every code block now includes a dedicated "Copy" button in its header.
* **Cleaner UI**: Code blocks are distinct from regular text, with proper padding and background colors.

## 2. Enhanced Chat Formatting

The chat interface now supports complex Markdown structures gracefully.

* **Tables**: Responsive tables with zebra-striping and borders for clear data presentation.
* **Typography**: Hierarchical headings (H1-H3), styled blockquotes for citations, and clear list structures.
* **CSS**: A complete overhaul of `globals.css` to properly style `.markdown-content`.

## 3. Message Copy Functionality

Improved usability allows users to extract content easily.

* **Hover Menu**: A "Copy" action bar appears when hovering over any message bubble.
* **Dual Modes**:
  * **Markdown**: Copies the raw source (useful for developers or reposting).
  * **Text**: Copies the rendered plain text (useful for reading or docs).

## 4. Visual Branding

* **Pollinations Logo**: Integrated into the sidebar footer.
* **Attribution**: Footer links properly credited to Pollinations.ai.
* **Badges**: Official "Built with Pollinations" badge in README.

The application is now fully optimized for both casual users and developers requiring structured outputs.
