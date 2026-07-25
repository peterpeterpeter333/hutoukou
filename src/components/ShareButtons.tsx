import { absoluteUrl } from "@/lib/site";

// X・LINE への共有リンク（JS不要）。
export function ShareButtons({ path, title }: { path: string; title: string }) {
  const url = absoluteUrl(path);
  const text = `${title}｜とびら`;
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const line = `https://social-plugins.line.me/lp/share?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--muted)]">シェア：</span>
      <a
        href={x}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--color-brand)] hover:text-[var(--fg)]"
        aria-label="Xでシェア"
      >
        <span aria-hidden>𝕏</span> ポスト
      </a>
      <a
        href={line}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-full border border-[#06c755]/40 bg-[#06c755]/10 px-3 py-1.5 text-xs font-semibold text-[#06934a] transition hover:bg-[#06c755]/20"
        aria-label="LINEでシェア"
      >
        <span aria-hidden>💬</span> LINE
      </a>
    </div>
  );
}
