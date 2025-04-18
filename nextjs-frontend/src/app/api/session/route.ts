import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  // 1) pull the ID token from the JSON body
  const { idToken } = await req.json();

  // 2) mint a session cookie (valid for 1 days)
  const expiresIn = 60 * 60 * 24 * 1 * 1000;
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

  return res;
}


export async function GET() {
  const res = NextResponse.json({ status: "signed out" });

  // Clear the session cookie:
  res.cookies.set("session", "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return res;
}