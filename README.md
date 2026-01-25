# AI Client with Polli 🚀🌍

Advanced Multi-Model AI Client designed for high-precision document analysis and versatile reasoning. Powered by the **Pollinations API**.

## ✨ Features

- **Multi-Model Support**: Switch instantly between **Claude Opus 4.5**, **DeepSeek V3.2**, and **ChatGPT 5.2**.
- **Global Ready (i18n)**: Full support for **English** and **Spanish**.
- **High-Precision Analysis**: Specialized "Skills" for structural and technical interpretation of PDFs and images.
- **Privacy First**: No hardcoded API keys. Users provide their own Pollinations key, stored securely in their local browser.
- **Smart History**: Persistent chat history with a built-in search engine.
- **Beautiful UI**: Modern, responsive design with dark mode and smooth animations.

## 🛠️ Prerequisites & Installation

### Prerequisites

- **Node.js**: 18.17.0 or later (Node 20+ recommended).
- **npm**: Standard with Node.js.
- **Pollinations API Key**: Required for chat functionality.

### Installation

1. **Clone the repository**:

   ```bash
   git clone <your-repository-url>
   cd AI-Client-with-Polli
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Configuration

On the first run, the app will ask for your **Pollinations API Key**. You can get one at [pollinations.ai](https://pollinations.ai). ensure you have the required models enabled in your account.

## 📁 Project Structure

- `app/`: Application logic and API routes.
- `skills/`: System prompts for specialized AI behavior.
- `components/`: Reusable UI components.
- `public/`: Static assets and icons.

---
Developed for professional document analysis and global accessibility.
