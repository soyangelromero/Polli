# Vercel Free Tier Compatibility Update

## Authentication (Mandatory User Key)

The application is configured to require each user to provide their own Pollinations API Key.

1. **Backend (`app/api/chat` & `app/api/balance`)**: Strictly checks for `x-api-key` header. Returns `401 Unauthorized` if missing.
2. **Frontend (`app/page.tsx`)**:
    * On first visit, checks `localStorage` for a key.
    * If missing, displays a **System Authentication** modal that cannot be dismissed until a key is entered.
    * Stores the key locally in the browser for future sessions.

## Local Storage (Chat History)

* **Chat History**: Stored in browser `localStorage`.
* **Server**: Stateless proxy to Pollinations. No file system writes.

## Deployment

Simply `git push` or run `vercel deploy` again. The previous errors related to file systems or missing keys should be resolved.

### Troubleshooting

* **Error 504 (Timeout)**: The Free Tier limit is 10s. If a request takes longer, it will fail. This is a platform limitation.
* **API Key Error**: Ensure your users have a valid key from [pollinations.ai](https://pollinations.ai).
