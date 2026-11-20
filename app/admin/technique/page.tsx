import { redirect } from "next/navigation";

/** « Technique » ouvre sa première page, La carte (onglets La carte, Structure, Les IA en haut de chacune). */
export default function AdminTech() {
  redirect("/admin/parcours");
}
