import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Storage } from "@google-cloud/storage";

// Initialize GCS
const storage = new Storage({
  projectId: "splitudio-19e91",
  credentials: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"),
});
const bucketName = process.env.STORAGE_BUCKET!;

// Recursive delete helper
async function removeFolderRecursively(folderPath: string) {
  const [files] = await storage.bucket(bucketName).getFiles({ prefix: folderPath });
  await Promise.all(files.map((file) => file.delete()));
}

export async function POST(req: NextRequest) {
  const { pid } = await req.json();
  const token = req.cookies.get("session")?.value;

  if (!pid || !token) {
    return NextResponse.json({ error: "Missing project ID or session" }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(token);
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch project and validate ownership
  const projectRef = adminDb.doc(`projects/${pid}`);
  const projectSnap = await projectRef.get();

  if (!projectSnap.exists) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = projectSnap.data();
  if(project == undefined) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
  if (project.uid !== decoded.uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // 1. Delete all tracks
    if (project.trackIds && Array.isArray(project.trackIds)) {
      const batch = adminDb.batch();
      for (const trackId of project.trackIds) {
        const trackRef = adminDb.doc(`tracks/${trackId}`);
        batch.delete(trackRef);
      }
      await batch.commit();
    }

    // 2. Delete all files in Storage
    await removeFolderRecursively(`projects/${pid}/`);

    // 3. Delete "files" subcollection
    const filesSnap = await adminDb.collection(`projects/${pid}/files`).get();
    const batch = adminDb.batch();
    filesSnap.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    // 4. Delete the project document
    await projectRef.delete();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting project:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
