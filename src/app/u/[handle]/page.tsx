import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUserByHandle } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { saveProfile, resendVerification } from "@/lib/actions";
import { timeAgo } from "@/lib/site";
import { Avatar, RoleBadge } from "@/components/ui";
import { QuestionCard } from "@/components/QuestionCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const u = await getUserByHandle(handle);
  if (!u) return { title: "ユーザーが見つかりません" };
  return { title: `${u.displayName} さん`, robots: { index: false, follow: true } };
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ verify?: string }>;
}) {
  const { handle } = await params;
  const { verify } = await searchParams;
  const u = await getUserByHandle(handle);
  if (!u) notFound();

  const me = await getCurrentUser();
  const isMe = me?.id === u.id;
  const needsVerify = isMe && !!u.email && !u.emailVerified;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {needsVerify && (
        <div className="mb-4 rounded-xl bg-[var(--color-accent-soft)] p-4 text-sm text-[#8a4632]">
          <div className="font-semibold">✉️ メールアドレスの確認が済んでいません</div>
          <p className="mt-1">
            登録メール（{u.email}）宛に確認リンクをお送りしています。届いていない場合は再送できます。
          </p>
          {verify === "sent" && <p className="mt-1 font-medium text-[var(--color-brand-dark)]">確認メールを再送しました。</p>}
          {verify === "limit" && <p className="mt-1 font-medium">再送の回数が多すぎます。しばらくお待ちください。</p>}
          <form action={resendVerification} className="mt-2">
            <button type="submit" className="btn btn-soft !py-1.5 text-sm">確認メールを再送する</button>
          </form>
        </div>
      )}

      {isMe && u.emailVerified && verify !== "sent" && (
        <div className="mb-4 rounded-xl bg-[var(--color-brand-soft)] px-4 py-2 text-sm text-[var(--color-brand-dark)]">
          ✅ メールアドレス確認済み
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <Avatar name={u.displayName} handle={u.handle} size={56} />
          <div>
            <h1 className="font-round text-2xl font-bold">{u.displayName}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-[var(--muted)]">
              <RoleBadge role={u.role} />
              <span>質問 {u._count.questions} ・ 回答 {u._count.answers}</span>
            </div>
          </div>
        </div>

        {isMe && (
          <form action={saveProfile} className="mt-5 border-t pt-4">
            <p className="mb-2 text-sm font-medium">プロフィールを編集</p>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input name="displayName" defaultValue={u.displayName} maxLength={24} className="field" />
              <select name="role" defaultValue={u.role} className="field sm:w-48">
                <option value="member">当事者</option>
                <option value="parent">保護者</option>
                <option value="supporter">支援者</option>
              </select>
            </div>
            <div className="mt-2 flex justify-end">
              <button type="submit" className="btn btn-soft !py-1.5 text-sm">保存</button>
            </div>
          </form>
        )}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-round text-lg font-bold">質問</h2>
        <div className="grid gap-3">
          {u.questions.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">まだ質問がありません。</p>
          ) : (
            u.questions.map((q) => <QuestionCard key={q.id} q={q} />)
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-round text-lg font-bold">回答</h2>
        <div className="grid gap-3">
          {u.answers.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">まだ回答がありません。</p>
          ) : (
            u.answers.map((a) => (
              <Link key={a.id} href={`/questions/${a.question.slug}`} className="card block p-4 hover:shadow-sm">
                <div className="text-xs text-[var(--muted)]">{timeAgo(a.createdAt)}・💚 {a._count.votes}</div>
                <div className="mt-1 text-sm font-medium text-[var(--color-brand-dark)]">
                  Q. {a.question.title}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{a.body}</p>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
