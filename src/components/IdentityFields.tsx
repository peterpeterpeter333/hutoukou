// 投稿フォームで使う「ニックネーム・立場」入力欄。
// 匿名前提。空欄なら自動でやさしいペンネームが割り当てられる。
export function IdentityFields({
  defaultName = "",
  defaultRole = "member",
}: {
  defaultName?: string;
  defaultRole?: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-[var(--muted)]">
          ニックネーム（任意）
        </span>
        <input
          name="displayName"
          defaultValue={defaultName}
          placeholder="空欄でもOK（自動でつきます）"
          className="field"
          maxLength={24}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-[var(--muted)]">あなたの立場</span>
        <select name="role" defaultValue={defaultRole} className="field">
          <option value="member">当事者（学校に行きづらい本人）</option>
          <option value="parent">保護者</option>
          <option value="supporter">支援者・その他</option>
        </select>
      </label>
    </div>
  );
}
