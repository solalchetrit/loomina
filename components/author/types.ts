import type { Weave } from "@/lib/loomina/weave";

/** Ce que renvoie /api/user/overview. */
export interface Prefs {
  title: string | null;
  politeness: "tu" | "vous";
  firstNamePhonetic: string | null;
  writingStyle: string | null;
  sensitiveTopics: string[];
  /** SMS « Votre chapitre est prêt » (activé par défaut). */
  smsChapter: boolean;
  /** Rendez-vous d'appel réguliers (1 = lundi … 7 = dimanche, heure de Paris). */
  callSchedule: { active: boolean; days: number[]; time: string };
  /** Durée d'appel souhaitée, en minutes (15, 20, 30 ou 45). */
  callMinutes: number;
  /** Livre offert : prénom de la personne qui l'a offert ("" si inconnu), null si le livre n'est pas un cadeau suivi. */
  giverFirstName: string | null;
  /** L'auteur laisse cette personne lire ses récits dans l'espace famille (non par défaut). */
  shareWithGiver: boolean;
}

export interface ProjectOverview {
  phase: 1 | 2 | 3 | 4;
  phaseLabel: string;
  progress: number;
  completed: boolean;
  nextTopic: string | null;
  /** « chaque mardi à 15 h », ou null si pas de rendez-vous. */
  scheduleText?: string | null;
  chapters: number;
  words: number;
  /** La toile du livre : un rang par sujet raconté (absent d'un ancien instantané). */
  weave?: Weave;
  timeline: { year: number | null; event: string }[];
  family: { name: string; relation: string; deceased?: boolean }[];
  themes: string[];
  openQuestions: string[];
  /** `title` : le titre du récit tiré de l'appel, pour s'y retrouver d'un coup d'œil. */
  calls: { date: string; minutes: number | null; title: string | null; summary: string | null }[];
}

export interface Overview {
  firstName: string | null;
  /** Livre d'exemple du mode démo local (lib/loomina/demo.ts). */
  demo?: boolean;
  /** Espace de test (06 12 34 56 78) : un nouvel auteur au premier jour, rien n'est enregistré. */
  essai?: boolean;
  prefs: Prefs;
  project: ProjectOverview | null;
  /**
   * L'accueil du premier passage : ce qu'il reste à demander à l'auteur
   * (rien si un appel a déjà donné la réponse). Absent : pas d'accueil.
   */
  welcome?: { politeness: boolean; topics: boolean } | null;
  /** L'adresse d'envoi du livre, demandée une fois le livre terminé (null : pas encore donnée). */
  shipping?: { name: string; line1: string; line2: string | null; postalCode: string; city: string } | null;
}

export const formatDate = (iso: string, withYear = true) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", ...(withYear ? { year: "numeric" } : {}) });
