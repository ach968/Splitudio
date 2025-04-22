// app/api/set_project/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { Project } from "@/types/firestore";

export async function POST(req: NextRequest) {
  // parse body
  const { project } = (await req.json()) as { project?: Project };

  if (!project || !project.pid || !project.uid) {
    return NextResponse.json({ error: "Malformed request body" }, { status: 400 });
  }

  // 1️ Verify user
  const token = req.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Missing session" }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (decoded.uid !== project.uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2 create or update doc
  try {
    const ref = adminDb.doc(`projects/${project.pid}`);
    const snap = await ref.get();

    if (!snap.exists) {
      // create
      await ref.set({
        ...project,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      // update / merge
      await ref.set(
        { ...project, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error storing project:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
