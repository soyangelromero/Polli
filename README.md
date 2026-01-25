<div align="center">
  <h1 align="center">Polli AI Client</h1>
  <p align="center">
    <strong>Professional Multi-Model Interface Exclusively for Pollinations.ai</strong>
  </p>
  <p align="center">
    <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsoyangelromero%2FPolli"><img src="https://vercel.com/button" alt="Deploy with Vercel"></a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Built%20with-Pollinations-8a2be2?style=for-the-badge&logo=data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20viewBox%3D%220%200%20124%20124%22%3E%3Ccircle%20cx%3D%2262%22%20cy%3D%2262%22%20r%3D%2262%22%20fill%3D%22%23ffffff%22/%3E%3C/svg%3E&logoColor=white&labelColor=6a0dad" alt="Built with Pollinations" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vercel-Compatible-000000?style=for-the-badge&logo=vercel" alt="Vercel" />
  </p>
</div>

<br/>

A premium, privacy-focused interface **exclusively designed for the Pollinations.ai API**. Access **Claude Opus 4.5**, **DeepSeek V3.2**, and **GPT-5.2** for structural document analysis and technical reasoning without the subscription costs.

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
   git clone https://github.com/soyangelromero/Polli.git
   cd Polli
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
