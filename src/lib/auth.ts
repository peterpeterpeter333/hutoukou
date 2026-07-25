import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import type { User } from "@prisma/client";

export const SESSION_COOKIE = "tobira_session";
const SESSION_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** ランダムトークンでセッションを作成し、httpOnly cookie をセットする（Server Action内で使用） */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { id: token, userId, expiresAt } });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

/** 現在のセッションを破棄しログアウトする（Server Action内で使用） */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { id: token } });
    jar.delete(SESSION_COOKIE);
  }
}

/** セッションcookieから本登録ユーザーを取得（描画中でも呼べる読み取り専用）。匿名は含まない。 */
export async function getAuthUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;
  return session.user;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(email: string): boolean {
  return emailRe.test(email);
}

// よく使われる/推測されやすいパスワード（総当たりで最初に試される）
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "passw0rd", "12345678", "123456789",
  "1234567890", "qwerty123", "qwertyuiop", "11111111", "00000000", "abc12345",
  "iloveyou", "welcome1", "admin123", "letmein1", "tobira123", "aaaaaaaa",
]);

/** パスワード強度を検証。問題なければ null、あればエラーメッセージを返す。 */
export function validatePassword(password: string, email?: string): string | null {
  if (password.length < 8) return "パスワードは8文字以上にしてください。";
  if (password.length > 200) return "パスワードが長すぎます。";
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "推測されやすいパスワードです。別のものにしてください。";
  }
  if (email && password.toLowerCase() === email.toLowerCase()) {
    return "メールアドレスと同じパスワードは使えません。";
  }
  if (/^(.)\1+$/.test(password)) return "同じ文字の繰り返しは使えません。";
  // 数字だけ・英字だけは弱いので、両方を含めるよう促す
  if (/^\d+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
    return "英字と数字を組み合わせると安全です。";
  }
  return null;
}
