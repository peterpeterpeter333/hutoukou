import { SITE, absoluteUrl } from "./site";

const FROM = process.env.EMAIL_FROM || "とびら <onboarding@resend.dev>";

/**
 * メール送信（Resend）。RESEND_API_KEY 未設定時は開発用にコンソール出力のみ。
 * Resend 以外を使う場合はこの関数だけ差し替えればOK。
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email:dev] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text ?? opts.html}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.text ? { text: opts.text } : {}),
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`メール送信に失敗しました (${res.status}): ${body}`);
  }
}

function layout(title: string, bodyHtml: string): string {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#2b2a28">
    <div style="font-size:20px;font-weight:bold;color:#257a5a">🌱 ${SITE.name}</div>
    <h1 style="font-size:18px;margin-top:16px">${title}</h1>
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #ece7dd;margin:24px 0" />
    <p style="font-size:12px;color:#6f6b64">このメールに心当たりがない場合は破棄してください。${SITE.name}（${SITE.nameEn}）</p>
  </div>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#2f9e75;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold;margin:12px 0">${label}</a>`;
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const url = absoluteUrl(`/verify?token=${token}`);
  await sendEmail({
    to,
    subject: `【${SITE.name}】メールアドレスの確認`,
    html: layout(
      "メールアドレスを確認してください",
      `<p>下のボタンを押すと確認が完了します（リンクの有効期限は24時間です）。</p>${button(url, "メールを確認する")}<p style="font-size:12px;color:#6f6b64">ボタンが押せない場合は次のURLを開いてください：<br>${url}</p>`
    ),
    text: `メールアドレスを確認してください：${url}`,
  });
}

export async function sendResetEmail(to: string, token: string): Promise<void> {
  const url = absoluteUrl(`/reset?token=${token}`);
  await sendEmail({
    to,
    subject: `【${SITE.name}】パスワードの再設定`,
    html: layout(
      "パスワードを再設定します",
      `<p>下のボタンから新しいパスワードを設定できます（リンクの有効期限は1時間です）。</p>${button(url, "パスワードを再設定する")}<p style="font-size:12px;color:#6f6b64">このリクエストに心当たりがない場合は、このメールを破棄してください。パスワードは変更されません。<br>${url}</p>`
    ),
    text: `パスワードを再設定します：${url}`,
  });
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

/**
 * お問い合わせを運営宛に送る。送信先は CONTACT_EMAIL（無ければ ADMIN_EMAILS の先頭）。
 * どちらも未設定・RESEND_API_KEY 未設定ならコンソール出力のみ（開発用）。
 */
export async function sendContactEmail(opts: {
  category: string;
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const dest =
    process.env.CONTACT_EMAIL?.trim() ||
    process.env.ADMIN_EMAILS?.split(",")[0].trim() ||
    "";
  const body = `<p><strong>種別：</strong>${esc(opts.category)}</p>
    <p><strong>お名前：</strong>${esc(opts.name || "（未記入）")}</p>
    <p><strong>返信先メール：</strong>${esc(opts.email || "（未記入）")}</p>
    <hr style="border:none;border-top:1px solid #ece7dd;margin:16px 0" />
    <p>${esc(opts.message)}</p>`;
  const text = `種別：${opts.category}\nお名前：${opts.name}\n返信先：${opts.email}\n\n${opts.message}`;

  if (!dest) {
    console.log(`[contact:dev] 送信先未設定のためログ出力のみ\n${text}`);
    return;
  }
  await sendEmail({
    to: dest,
    subject: `【${SITE.name}】お問い合わせ（${opts.category}）`,
    html: layout("お問い合わせが届きました", body),
    text,
  });
}
