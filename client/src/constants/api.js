/**
 * Client-side API endpoint constants.
 * Built from the VITE_API_BASE_URL environment variable — never hardcode URLs.
 *
 * Usage:
 *   import { API_ENDPOINTS } from '@/constants';
 *   apiClient.get(API_ENDPOINTS.PROJECTS.LIST);
 */
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (
    typeof window !== 'undefined' &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    return 'https://nexora-ai-93tu.onrender.com/api/v1';
  }
  return 'http://localhost:5000/api/v1';
};

const BASE = getApiBaseUrl();

export const API_ENDPOINTS = Object.freeze({
  // ── Health ────────────────────────────────────────────────────────────────
  HEALTH: `${BASE}/health`,

  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH: {
    REGISTER: `${BASE}/auth/register`,
    LOGIN: `${BASE}/auth/login`,
    LOGOUT: `${BASE}/auth/logout`,
    REFRESH: `${BASE}/auth/refresh`,
    ME: `${BASE}/auth/me`,
    FORGOT_PASSWORD: `${BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE}/auth/reset-password`,
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  USERS: {
    BASE: `${BASE}/users`,
    BY_ID: (id) => `${BASE}/users/${id}`,
    AVATAR: (id) => `${BASE}/users/${id}/avatar`,
  },

  // ── Workspaces ────────────────────────────────────────────────────────────
  WORKSPACES: {
    BASE: `${BASE}/workspaces`,
    BY_ID: (id) => `${BASE}/workspaces/${id}`,
    MEMBERS: (id) => `${BASE}/workspaces/${id}/members`,
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  PROJECTS: {
    LIST: `${BASE}/projects`,
    BY_ID: (id) => `${BASE}/projects/${id}`,
    MEMBERS: (id) => `${BASE}/projects/${id}/members`,
    ARCHIVE: (id) => `${BASE}/projects/${id}/archive`,
  },

  // ── Tasks ─────────────────────────────────────────────────────────────────
  TASKS: {
    LIST: `${BASE}/tasks`,
    BY_PROJECT: (projectId) => `${BASE}/projects/${projectId}/tasks`,
    BY_ID: (id) => `${BASE}/tasks/${id}`,
    COMMENTS: (id) => `${BASE}/tasks/${id}/comments`,
    ATTACHMENTS: (id) => `${BASE}/tasks/${id}/attachments`,
  },

  // ── Sprints ───────────────────────────────────────────────────────────────
  SPRINTS: {
    BY_PROJECT: (projectId) => `${BASE}/projects/${projectId}/sprints`,
    BY_ID: (id) => `${BASE}/sprints/${id}`,
    START: (id) => `${BASE}/sprints/${id}/start`,
    COMPLETE: (id) => `${BASE}/sprints/${id}/complete`,
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  NOTIFICATIONS: {
    LIST: `${BASE}/notifications`,
    MARK_READ: (id) => `${BASE}/notifications/${id}/read`,
    MARK_ALL_READ: `${BASE}/notifications/read-all`,
  },
});
