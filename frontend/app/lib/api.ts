import type {
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

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';

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

// ─── Core fetch with auto token-refresh ───────────────────────────────────────

async function request<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<ApiResponse<T>> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (storage.access) headers.set('Authorization', `Bearer ${storage.access}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  // 401 → try silent refresh once (simplejwt returns raw { access })
  if (res.status === 401 && retry && storage.refresh) {
    const refreshed = await fetch(`${BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: storage.refresh }),
    });
    if (refreshed.ok) {
      const data = await refreshed.json() as { access: string };
      storage.set({ access: data.access, refresh: storage.refresh! });
      return request<T>(path, init, false);
    }
    storage.clear();
  }

  return res.json() as Promise<ApiResponse<T>>;
}

// ─── Multipart upload (no Content-Type — browser sets boundary) ───────────────

async function upload<T>(path: string, form: FormData): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {};
  if (storage.access) headers['Authorization'] = `Bearer ${storage.access}`;

  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: form,
  });
  return res.json() as Promise<ApiResponse<T>>;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  register: (payload: RegisterPayload) =>
    request<User>('/auth/register/', { method: 'POST', body: JSON.stringify(payload) }),

  login: async (email: string, password: string): Promise<ApiResponse<Tokens>> => {
    // simplejwt returns raw { access, refresh } — no envelope
    const res = await fetch(`${BASE}/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.access) {
      const tokens: Tokens = { access: data.access, refresh: data.refresh };
      storage.set(tokens);
      return { success: true, data: tokens };
    }
    return { success: false, error: data.detail ?? 'Invalid credentials', code: 'AUTH_FAILED' };
  },

  me: () => request<User>('/auth/me/'),

  logout: () => storage.clear(),

  refreshToken: storage.refresh
    ? () => request<{ access: string }>('/auth/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh: storage.refresh }),
      })
    : null,
};

// ─── Memorial pages ────────────────────────────────────────────────────────────

export const pages = {
  list: () =>
    request<MemorialPageListItem[]>('/pages/'),

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
