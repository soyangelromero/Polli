# AI Client with Polli

A professional, multi-model AI interface designed for structural document analysis and technical reasoning. This client serves as a secure frontend for the Pollinations API, providing specialized tools for complex high-fidelity interpretation.

## Technical Specifications

- **Framework**: Next.js 16 (App Router)
- **UI Architecture**: React 19, Tailwind CSS, Framer Motion
- **Inference Layer**: Pollinations API (OpenAI-compatible)
- **Document Processing**: PDF text extraction and vision-based analysis

## Key Functionalities

- **Model Orchestration**: Integrated support for Claude Opus 4.5, DeepSeek V3.2, and GPT-5.2.
- **Internationalization (i18n)**: Default English interface with on-the-fly Spanish toggle.
- **Structural Analysis**: Specialized system prompts (Skills) for technical and formal document interpretation.
- **Security & Privacy**: Client-side API key management via X-API-Key headers; persistent local storage with no server-side credential persistence.
- **Searchable History**: Indexed local chat history for rapid document and radicado retrieval.

## Prerequisites

- **Node.js**: Version 18.17.0 or higher (Node 20+ recommended).
- **npm**: Standard installation.
- **Pollinations Account**: Valid API Key from [pollinations.ai](https://pollinations.ai).

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd ai-client-polli
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Initialize the development environment:

   ```bash
   npm run dev
   ```

4. Access the application:
   The server will be available at [http://localhost:3000](http://localhost:3000).

## System Architecture

- `app/`: Contains the core application router and API endpoints (`/api/chat`, `/api/balance`).
- `skills/`: Markdown-based system prompt modules for behavior specialization.
- `components/`: Modular UI elements and layout primitives.
- `lib/`: Shared utility functions and configuration constants.

## Privacy and Data Handling

This application does not store user credentials on the server. All API keys and chat histories are handled locally in the browser environment. Sensitive files and local logs are excluded from source control via `.gitignore`.
