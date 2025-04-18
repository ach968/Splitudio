import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  // 1) pull the ID token from the JSON body
  const { idToken } = await req.json();

  // 2) mint a session cookie (e.g. valid for 5 days)
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn,
  });

  const res = NextResponse.json({ status: "success" });
  // 3) serialize it as an HTTP‑only cookie
  res.cookies.set("session", sessionCookie, {
    maxAge: expiresIn / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  // 4) return a JSON response and set the cookie
  return res;
}