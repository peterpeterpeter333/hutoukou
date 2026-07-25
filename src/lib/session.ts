import { cookies } from "next/headers";
import { prisma } from "./db";
import type { User } from "@prisma/client";

const COOKIE = "tobira_uid";
const ONE_YEAR = 60 * 60 * 24 * 365;

// ペンネーム自動生成（当事者が気軽に使えるよう匿名前提）
const NAME_PARTS_A = ["そっと", "ぽかぽか", "こもれび", "なぎ", "あお", "ゆき", "ほし", "みどり", "しずく", "つき"];
const NAME_PARTS_B = ["さん", "びより", "の人", "ノート", "ぐも", "ねこ", "ことり"];

function randomName(): string {
  const a = NAME_PARTS_A[Math.floor(Math.random() * NAME_PARTS_A.length)];
  const b = NAME_PARTS_B[Math.floor(Math.random() * NAME_PARTS_B.length)];
  return `${a}${b}`;
}

function randomHandle(): string {
  return `tobira-${Math.random().toString(36).slice(2, 8)}`;
}

/** 描画中（RSC）でも呼べる読み取り専用。ログイン相当の現在ユーザーを返す。 */
export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

/**
 * Server Action / Route Handler 内でのみ使用。
 * 現在ユーザーを取得し、無ければ匿名ユーザーを作成して cookie をセットする。
 * displayName / role が渡されれば更新する。
 */
export async function ensureUser(opts?: {
  displayName?: string;
  role?: string;
}): Promise<User> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;

  let user = id ? await prisma.user.findUnique({ where: { id } }) : null;

  const displayName = opts?.displayName?.trim();
  const role = opts?.role?.trim();

  if (!user) {
    user = await prisma.user.create({
      data: {
        handle: randomHandle(),
        displayName: displayName || randomName(),
        role: role || "member",
      },
    });
    jar.set(COOKIE, user.id, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: ONE_YEAR,
      path: "/",
    });
  } else if ((displayName && displayName !== user.displayName) || (role && role !== user.role)) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(displayName ? { displayName } : {}),
        ...(role ? { role } : {}),
      },
    });
  }

  return user;
}

export const roleLabel = (role: string): string =>
  ({ member: "当事者", parent: "保護者", supporter: "支援者" }[role] ?? "メンバー");
