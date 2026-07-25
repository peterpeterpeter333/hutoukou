import Link from "next/link";
import { roleLabel } from "@/lib/session";

const AVATAR_COLORS = [
  "#2f9e75", "#f08a6e", "#5b8def", "#e0a800", "#9b6bd6", "#e56b9e", "#3bb0a8",
];

function hashIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function Avatar({
  name,
  handle,
  size = 36,
}: {
  name: string;
  handle: string;
  size?: number;
}) {
  const color = AVATAR_COLORS[hashIndex(handle, AVATAR_COLORS.length)];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}
      aria-hidden
    >
      {name.slice(0, 1)}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    member: "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]",
    parent: "bg-[var(--color-accent-soft)] text-[#c15b3f]",
    supporter: "bg-[#eef2ff] text-[#4457c4]",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${styles[role] ?? styles.member}`}>
      {roleLabel(role)}
    </span>
  );
}

export function Tag({ name, slug }: { name: string; slug: string }) {
  return (
    <Link href={`/tags/${slug}`} className="chip hover:brightness-95">
      #{name}
    </Link>
  );
}

export function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-round text-2xl font-bold text-[var(--color-brand)]">{value}</div>
      <div className="text-xs text-[var(--muted)]">{label}</div>
    </div>
  );
}
