import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import db from "./db";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-jwt-secret");

export async function createSession(user) {
  const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" }).setExpirationTime("30d").sign(secret);
  cookies().set("acclaira_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
}

export async function getUser() {
  try {
    const token = cookies().get("acclaira_session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    const user = db.prepare("SELECT id,email,name,role,plan,credits FROM users WHERE id=?").get(payload.id);
    return user || null;
  } catch { return null; }
}

export function clearSession() {
  cookies().set("acclaira_session", "", { maxAge: 0, path: "/" });
}
