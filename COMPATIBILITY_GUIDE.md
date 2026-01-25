# Vercel Free Tier Compatibility Update

## Changes Implemented (Option 2: Local Storage)

The application has been updated to run successfully on Vercel's Free Tier by removing dependencies on the server-side file system for storing chats.

### 1. Frontend (`app/page.tsx`)

* **Chat Hitory**: Now loads from and saves to the browser's `localStorage` (key: `polli_chats`).
* **Persistence**: Chats persist across reloads on the same browser/device.
* **API Calls**: Removed calls to `GET /api/chat` (load history) and `DELETE /api/chat` since the server no longer manages history.

### 2. Backend (`app/api/chat/route.ts`)

* **Stateless**: The API now acts purely as a relay to Pollinations.ai.
* **No filesystem writes**: Removed all `fs.writeFileSync`, `fs.mkdirSync`, and `fs.rmSync` calls related to chat history.
* **Skills**: Access to the `skills` folder remains read-only. It handles missing folders gracefully.

### Notes for Vercel Deployment

1. **Environment Variables**: Ensure you add your `POLLINATIONS_API_KEY` (if hardcoded) or allow the user to enter it in the UI (current behavior).
2. **Timeouts**: Vercel Free Tier has a **10-second limit** for serverless function execution.
    * If a model (like Claude Opus) takes longer than 10s to generate a full non-streamed response, the request might fail with a 504 Gateway Timeout.
    * **Mitigation**: If this happens frequently, we may need to implement **Streaming** (sending chunks of text as they arrive) in a future update.

### Verification

* Current chats are stored in your browser.
* The server endpoint `/api/chat` is now lightweight and compatible with serverless environments.
