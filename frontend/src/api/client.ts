/**
 * Central API client — all backend calls go through here.
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('synapse_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  // Auto-logout on invalid / expired token
  if (res.status === 401) {
    localStorage.removeItem('synapse_token');
    localStorage.removeItem('synapse_user');
    localStorage.removeItem('synapse_plan_id');
    window.location.href = '/auth';
    throw new Error('Session expired — please sign in again.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Health ────────────────────────────────────────────────────────────────────
export const checkHealth = () =>
  request<{ status: string; timestamp: string }>('/health');

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthPayload { email: string; password: string; }
export interface AuthResponse { token: string; user: { id: string; email: string }; message: string; }

export const register = (p: AuthPayload) =>
  request<AuthResponse>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(p) });

export const login = (p: AuthPayload) =>
  request<AuthResponse>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(p) });

export const getMe = () =>
  request<{ user: { id: string; email: string } }>('/api/v1/auth/me');

// ── Study Plans ───────────────────────────────────────────────────────────────
export interface GeneratePlanPayload {
  syllabusText: string;
  title: string;
  targetDate: string;
  hoursPerDay: number;
}

export interface PlanSummary {
  _id: string;
  title: string;
  start_date: string;
  target_date: string;
  daily_hour_commitment: number;
  createdAt: string;
}

export const generatePlan = (payload: GeneratePlanPayload) =>
  request<{ message: string; planId: string }>('/api/v1/plans/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getPlansForUser = () =>
  request<{ plans: PlanSummary[] }>('/api/v1/plans/user');

export const getRoadmap = (planId: string) =>
  request<{ planId: string; topics: RoadmapTopic[]; tasks: RoadmapTask[] }>(`/api/v1/plans/${planId}/roadmap`);

export interface RoadmapTopic {
  id: string;
  title: string;
  mastery_score: number;
  estimated_minutes: number;
  dependencies: string[];
}
export interface RoadmapTask {
  id: string;
  topic_id: string;
  scheduled_at: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
}

export const recalculateSchedule = (planId: string) =>
  request<{ message: string }>(`/api/v1/plans/${planId}/recalculate`, { method: 'POST' });

// ── Knowledge Graph ───────────────────────────────────────────────────────────
export interface GraphNode {
  _id: string;
  title: string;
  dependencies: string[];
}

export const getKnowledgeGraph = (planId: string) =>
  request<{ graphData: GraphNode[] }>(`/api/v1/graph/${planId}`);

// ── Performance Logs ──────────────────────────────────────────────────────────
export interface LogPerformancePayload {
  topic_id: string;
  quiz_score: number;
  retention_rate?: number;
}
export interface PerformanceSummary {
  plan_id: string;
  topic_count: number;
  avg_mastery: number;
  avg_quiz_score: number;
  avg_retention: number;
  subjects: SubjectMetric[];
}
export interface SubjectMetric {
  id: string;
  title: string;
  mastery_score: number;
  estimated_minutes: number;
  avg_quiz_score: number | null;
  avg_retention: number | null;
  log_count: number;
}

export const logPerformance = (payload: LogPerformancePayload) =>
  request<{ message: string; logId: string }>('/api/v1/performance', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getPerformanceSummary = (planId: string) =>
  request<{ summary: PerformanceSummary }>(`/api/v1/performance/summary/${planId}`);
