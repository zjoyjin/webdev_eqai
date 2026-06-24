'use client';

import type { MvpAttempt, MvpScale } from '@/lib/mvpScales';

export type StaticScaleResponse = {
  item_code: string;
  dimension_code: string;
  score: number;
};

export type StaticScaleAttempt = MvpAttempt & {
  responses: StaticScaleResponse[];
};

const STORAGE_KEY = 'eqai.static.scaleAttempts.v1';

export function readStaticAttempts(): StaticScaleAttempt[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isStaticAttempt) : [];
  } catch {
    return [];
  }
}

export function readStaticAttempt(attemptId: string | null | undefined) {
  if (!attemptId) return null;
  return readStaticAttempts().find((attempt) => attempt.id === attemptId) ?? null;
}

export function ensureStaticAttempt(scale: MvpScale, attemptId?: string | null) {
  const attempts = readStaticAttempts();
  const existing = attemptId ? attempts.find((attempt) => attempt.id === attemptId) : null;

  if (existing && existing.scale_code === scale.scale_code) {
    return existing;
  }

  const attempt: StaticScaleAttempt = {
    id: createAttemptId(),
    user_id: 'local-static-user',
    scale_code: scale.scale_code,
    status: 'started',
    total_score: null,
    notes: null,
    started_at: new Date().toISOString(),
    completed_at: null,
    assessment_scales: {
      title_cn: scale.title_cn,
      title_en: scale.title_en,
      module_name_cn: scale.module_name_cn,
      module_name_en: scale.module_name_en,
    },
    responses: [],
  };

  writeStaticAttempts([attempt, ...attempts]);
  return attempt;
}

export function completeStaticAttempt(
  scale: MvpScale,
  attemptId: string,
  responses: StaticScaleResponse[]
) {
  const attempts = readStaticAttempts();
  const existingIndex = attempts.findIndex((attempt) => attempt.id === attemptId);
  const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
  const now = new Date().toISOString();
  const base =
    existingIndex >= 0
      ? attempts[existingIndex]
      : ensureStaticAttempt(scale, attemptId);

  const completed: StaticScaleAttempt = {
    ...base,
    scale_code: scale.scale_code,
    status: 'completed',
    total_score: totalScore,
    completed_at: now,
    assessment_scales: {
      title_cn: scale.title_cn,
      title_en: scale.title_en,
      module_name_cn: scale.module_name_cn,
      module_name_en: scale.module_name_en,
    },
    responses,
  };

  const nextAttempts = existingIndex >= 0
    ? attempts.map((attempt) => (attempt.id === attemptId ? completed : attempt))
    : [completed, ...attempts];

  writeStaticAttempts(nextAttempts);
  return completed;
}

export function clearStaticAttempts() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function writeStaticAttempts(attempts: StaticScaleAttempt[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
}

function createAttemptId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isStaticAttempt(value: unknown): value is StaticScaleAttempt {
  if (!value || typeof value !== 'object') return false;
  const attempt = value as Partial<StaticScaleAttempt>;
  return (
    typeof attempt.id === 'string' &&
    typeof attempt.scale_code === 'string' &&
    (attempt.status === 'started' || attempt.status === 'completed') &&
    Array.isArray(attempt.responses)
  );
}
