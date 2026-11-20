import { Segmented } from "./ui";

/** Les trois pages de la rubrique « Technique » : comprendre la machine, pas la piloter. */
export default function TechTabs({ value }: { value: "carte" | "structure" | "ia" }) {
  return (
    <div className="mb-5 overflow-x-auto [scrollbar-width:none]">
      <Segmented
        value={value}
        options={[
          { value: "carte", label: "La carte", href: "/admin/parcours" },
          { value: "structure", label: "Structure", href: "/admin/structure" },
          { value: "ia", label: "Les IA", href: "/admin/ia" },
        ]}
      />
    </div>
  );
}
