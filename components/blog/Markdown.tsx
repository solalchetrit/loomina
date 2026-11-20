import type { ReactNode } from "react";
import Link from "next/link";
import { anchor, type Block } from "@/lib/blog";

/** Gras, italique et liens dans une ligne de texte. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={m.index} className="font-bold text-[var(--ink)]">{m[1]}</strong>);
    else if (m[2]) out.push(<em key={m.index}>{m[2]}</em>);
    else if (m[4].startsWith("/")) out.push(<Link key={m.index} href={m[4]} className="link">{m[3]}</Link>);
    else out.push(<a key={m.index} href={m[4]} className="link" rel="noopener">{m[3]}</a>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Le corps d'un article : gros texte, lignes courtes, lisible à tout âge. */
export default function Markdown({ blocks }: { blocks: Block[] }) {
  return (
    <div className="text-[18px] leading-[1.75] text-[var(--ink-2)]">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return <h2 key={i} id={anchor(b.text)} className="t-title mt-14 scroll-mt-28 text-[var(--ink)] first:mt-0">{b.text}</h2>;
          case "h3":
            return <h3 key={i} className="t-heading mt-9 text-[var(--ink)]">{b.text}</h3>;
          case "ul":
            return (
              <ul key={i} className="mt-5 list-disc space-y-2.5 pl-6 marker:text-[var(--amber)]">
                {b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="mt-5 list-decimal space-y-2.5 pl-6 marker:font-bold marker:text-[var(--ink)]">
                {b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={i} className="card mt-7 p-6 text-[var(--ink)]">
                {inline(b.text)}
              </blockquote>
            );
          default:
            return <p key={i} className="mt-5">{inline(b.text)}</p>;
        }
      })}
    </div>
  );
}
