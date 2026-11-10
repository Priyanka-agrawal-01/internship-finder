// The backend's address: the local server while developing, VITE_API_URL once deployed.
const isLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
export const BACKEND_URL = isLocal ? 'http://localhost:5000' : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the backend and returns its JSON. Throws an ApiError carrying the server's
 * own message (or a plain one when the server can't be reached) and the HTTP status.
 */
export async function api(path, { method = 'GET', body, token, signal } = {}) {
  let res;
  try {
    res = await fetch(BACKEND_URL + path, {
      method,
      signal,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Could not reach InternPulse. Check your connection and try again.', 0);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new ApiError(json.message || `Something went wrong (${res.status}). Please try again.`, res.status);
  }
  return json;
}
