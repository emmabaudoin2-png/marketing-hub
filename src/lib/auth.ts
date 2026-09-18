import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE = "site_auth";
const PAYLOAD = "authenticated";

function sign(secret: string): string {
  return createHmac("sha256", secret).update(PAYLOAD).digest("hex");
}

export function createAuthToken(): string {
  return sign(process.env.SITE_PASSWORD ?? "");
}

export function isValidAuthToken(token: string | undefined): boolean {
  const secret = process.env.SITE_PASSWORD;
  if (!secret || !token) return false;

  const expected = Buffer.from(sign(secret));
  const actual = Buffer.from(token);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function isCorrectPassword(password: string): boolean {
  const secret = process.env.SITE_PASSWORD;
  if (!secret || !password) return false;

  const expected = Buffer.from(secret);
  const actual = Buffer.from(password);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
