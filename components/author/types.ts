/** Ce que renvoie /api/user/overview. */
export interface Prefs {
  title: string | null;
  politeness: "tu" | "vous";
  firstNamePhonetic: string | null;
  writingStyle: string | null;
  sensitiveTopics: string[];
}

export interface ProjectOverview {
  phase: 1 | 2 | 3 | 4;
  phaseLabel: string;
  progress: number;
  completed: boolean;
  nextTopic: string | null;
  chapters: number;
  words: number;
  timeline: { year: number | null; event: string }[];
  family: { name: string; relation: string; deceased?: boolean }[];
  themes: string[];
  openQuestions: string[];
  calls: { date: string; minutes: number | null; summary: string | null }[];
}

export interface Overview {
  firstName: string | null;
  /** Livre d'exemple du mode démo local (lib/loomina/demo.ts). */
  demo?: boolean;
  prefs: Prefs;
  project: ProjectOverview | null;
}

export const formatDate = (iso: string, withYear = true) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", ...(withYear ? { year: "numeric" } : {}) });
