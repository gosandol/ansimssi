// In Production (Vercel), we want to use the Serverless Functions on the SAME domain.
// So we force API_BASE_URL to be empty (relative path), allowing /api/... to hit vercel.json rewrites.
// We ignore VITE_API_BASE_URL in Prod to avoid the "Render Backend" trap.

export const API_BASE_URL = import.meta.env.PROD
    ? ''
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');
