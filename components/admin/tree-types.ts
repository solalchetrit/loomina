/** Les cases des arbres de parcours, et les acteurs (qui agit). */

import type { AdminIconName } from "./icons";

export type Actor = "client" | "offreur" | "site" | "stripe" | "twilio" | "voix" | "ia" | "base" | "sms" | "loomina";

export interface TreeNode {
  /** Qui agit. */
  who: Actor;
  /** L'action, en une ligne courte : c'est le texte de la case. */
  label: string;
  /** Une précision, montrée au clic. */
  detail?: string;
  /** Ce que l'action produit, montré au clic. */
  effects?: string[];
  /** Où c'est dans le code. */
  code?: string;
  /** Les cases suivantes : l'une sous l'autre, ou côte à côte si `branch`. */
  children?: TreeNode[];
  /** Les enfants sont des suites possibles (un choix, un cas) : côte à côte. */
  branch?: boolean;
}

export const ACTORS: Record<Actor, { label: string; soft: string; text: string; icon: AdminIconName }> = {
  client: { label: "Client", soft: "#e8effc", text: "#1f4a8a", icon: "user" },
  offreur: { label: "Offreur", soft: "#f1e9fc", text: "#5a2f8a", icon: "gift" },
  site: { label: "Site", soft: "#efeee9", text: "#3b3b37", icon: "globe" },
  stripe: { label: "Stripe", soft: "#ecebff", text: "#3f37c9", icon: "card" },
  twilio: { label: "Twilio", soft: "#fde9eb", text: "#a3263a", icon: "phone" },
  voix: { label: "Serveur vocal", soft: "#fcebd2", text: "#6f4005", icon: "server" },
  ia: { label: "IA", soft: "#e2f4f1", text: "#11594f", icon: "spark" },
  base: { label: "Base", soft: "#e3f0e5", text: "#2f5b3a", icon: "database" },
  sms: { label: "SMS", soft: "#fde9eb", text: "#a3263a", icon: "message" },
  loomina: { label: "Équipe Loomina", soft: "#f2f1ec", text: "#161616", icon: "star" },
};
