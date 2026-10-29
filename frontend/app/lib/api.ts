import { API_BASE } from './config';
import type {
  ApiError,
  ApiResponse,
  Tokens,
  User,
  RegisterPayload,
  MemorialPageListItem,
  MemorialPageDetail,
  CreatePagePayload,
  UpdatePagePayload,
  MediaFile,
  QrCode,
} from './types';

const BASE = API_BASE;

/** Window event fired when the session can no longer be refreshed. */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

// ─── Token storage (client-side only) ─────────────────────────────────────────

const storage = {
  get access()  { return typeof window !== 'undefined' ? localStorage.getItem('access')  : null; },
  get refresh() { return typeof window !== 'undefined' ? localStorage.getItem('refresh') : null; },
  set(tokens: Tokens) {
    localStorage.setItem('access',  tokens.access);
    localStorage.setItem('refresh', tokens.refresh);
  },
  clear() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  },
};

// ─── Response parsing ─────────────────────────────────────────────────────────

const fail = (error: string, code: string): ApiError => ({ success: false, error, code });

function isEnvelope(value: unknown): value is { success: boolean } {
  return typeof value === 'object' && value !== null && 'success' in value;
}

async function parse<T>(res: Response): Promise<ApiResponse<T>> {
  if (res.status === 204) return { success: true, data: null as T };

  let body: unknown = null;
  try {
    const text = await res.text();
    body = text ? JSON.parse(text) : null;
  } catch {
    return fail('Unexpected server response', 'SERVER_ERROR');
  }

  if (isEnvelope(body)) return body as ApiResponse<T>;
  if (res.ok) return { success: true, data: body as T };

  const detail = (body as { detail?: unknown } | null)?.detail;
  const code = res.status === 429 ? 'RATE_LIMITED' : res.status >= 500 ? 'SERVER_ERROR' : 'REQUEST_FAILED';
  return fail(typeof detail === 'string' ? detail : 'Request failed', code);
}

async function safeFetch(url: string, init: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, init);
  } catch {
    return null;
  }
}

const NETWORK_ERROR = fail('Network error — check your connection', 'NETWORK_ERROR');

// ─── Token refresh (single-flight, handles rotating refresh tokens) ───────────

let refreshing: Promise<boolean> | null = null;

function refreshTokens(): Promise<boolean> {
  if (refreshing) return refreshing;
  const current = storage.refresh;
  if (!current) return Promise.resolve(false);

  refreshing = (async () => {
    const res = await safeFetch(`${BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: current }),
    });
    if (res?.ok) {
      try {
        const data = await res.json() as { access?: string; refresh?: string };
        if (data.access) {
          // ROTATE_REFRESH_TOKENS: store the new refresh, fall back to the old one
          storage.set({ access: data.access, refresh: data.refresh ?? current });
          return true;
        }
      } catch { /* fall through */ }
    }
    // Only a definitive auth rejection should end the session, not a network blip
    if (res && res.status !== 401 && res.status !== 400 && res.status !== 403) return false;
    if (res) {
      storage.clear();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return false;
  })().finally(() => { refreshing = null; });

  return refreshing;
}

// ─── Core fetch with auto token-refresh ───────────────────────────────────────

async function request<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<ApiResponse<T>> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined) headers.set('Content-Type', 'application/json');
  if (storage.access) headers.set('Authorization', `Bearer ${storage.access}`);

  const res = await safeFetch(`${BASE}${path}`, { ...init, headers });
  if (!res) return NETWORK_ERROR;

  if (res.status === 401 && retry && storage.refresh) {
    if (await refreshTokens()) return request<T>(path, init, false);
  }

  return parse<T>(res);
}

// ─── Multipart upload (no Content-Type — browser sets boundary) ───────────────

async function upload<T>(path: string, form: FormData, retry = true): Promise<ApiResponse<T>> {
  const headers = new Headers();
  if (storage.access) headers.set('Authorization', `Bearer ${storage.access}`);

  const res = await safeFetch(`${BASE}${path}`, { method: 'POST', headers, body: form });
  if (!res) return NETWORK_ERROR;

  if (res.status === 401 && retry && storage.refresh) {
    if (await refreshTokens()) return upload<T>(path, form, false);
  }
  return parse<T>(res);
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  register: (payload: RegisterPayload) =>
    request<User>('/auth/register/', { method: 'POST', body: JSON.stringify(payload) }),

  login: async (email: string, password: string): Promise<ApiResponse<Tokens>> => {
    // simplejwt returns raw { access, refresh } — no envelope
    const res = await safeFetch(`${BASE}/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res) return NETWORK_ERROR;

    let data: { access?: string; refresh?: string; detail?: string } = {};
    try { data = await res.json(); } catch { /* non-JSON body */ }

    if (res.ok && data.access && data.refresh) {
      const tokens: Tokens = { access: data.access, refresh: data.refresh };
      storage.set(tokens);
      return { success: true, data: tokens };
    }
    if (res.status === 401) {
      return fail(data.detail ?? 'Invalid email or password', 'AUTH_FAILED');
    }
    if (res.status === 429) return fail('Too many attempts, try again later', 'RATE_LIMITED');
    return fail('Something went wrong, please try again', 'SERVER_ERROR');
  },

  me: () => request<User>('/auth/me/'),

  deleteAccount: (password: string) =>
    request<null>('/auth/me/delete/', { method: 'POST', body: JSON.stringify({ password }) }),

  logout: () => storage.clear(),
};

// ─── Memorial pages ────────────────────────────────────────────────────────────

export const pages = {
  list: () =>
    request<MemorialPageListItem[]>('/pages/'),

  moderationList: () =>
    request<MemorialPageListItem[]>('/pages/moderation/'),

  get: (slug: string) =>
    request<MemorialPageDetail>(`/pages/${slug}/`),

  create: (payload: CreatePagePayload) =>
    request<MemorialPageDetail>('/pages/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (slug: string, payload: UpdatePagePayload) =>
    request<MemorialPageDetail>(`/pages/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (slug: string) =>
    request<null>(`/pages/${slug}/`, { method: 'DELETE' }),

  submit: (slug: string) =>
    request<{ state: string }>(`/pages/${slug}/submit/`, { method: 'POST' }),

  approve: (slug: string) =>
    request<{ state: string }>(`/pages/${slug}/approve/`, { method: 'POST' }),

  reject: (slug: string, note?: string) =>
    request<{ state: string; moderation_note: string }>(`/pages/${slug}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),
};

// ─── Media ─────────────────────────────────────────────────────────────────────

export const media = {
  list: (pageSlug: string) =>
    request<MediaFile[]>(`/pages/${pageSlug}/media/`),

  upload: (pageSlug: string, form: FormData) =>
    upload<MediaFile>(`/pages/${pageSlug}/media/`, form),

  delete: (pageSlug: string, id: string) =>
    request<null>(`/pages/${pageSlug}/media/${id}/`, { method: 'DELETE' }),
};

// ─── QR ────────────────────────────────────────────────────────────────────────

export const qr = {
  generate: (pageSlug: string) =>
    request<QrCode>(`/pages/${pageSlug}/qr/generate/`, { method: 'POST' }),
};
