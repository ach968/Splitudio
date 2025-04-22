import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Project } from "@/types/firestore";
import { Storage } from "@google-cloud/storage";
import { NextRequest, NextResponse } from "next/server";

const storage = new Storage({
  credentials: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!),
  projectId: "splitudio-19e91",
});
const bucketName = process.env.STORAGE_BUCKET!;

// Custom API to stream files from bucket
// Checks user
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  const trackId = url.searchParams.get("trackId");

  const token = req.cookies.get("session")?.value;

  let downloadOriginalMp3;

  // Subprocess for downloading the original mp3 
  if(projectId && trackId) {
    downloadOriginalMp3 = false;
    // We are selecting a track
  }
  else if(projectId && !trackId) {
    downloadOriginalMp3 = true;
    // We are downloading the original mp3
  }
  else {
    return new NextResponse("Missing projectId", { status: 400 });
  }

  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Check access: if private, must be owner
  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(token);
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const projectSnap = await adminDb.doc(`projects/${projectId}`).get();
  if (!projectSnap.exists) {
    return new NextResponse("Project not found", { status: 404 });
  }

  const project = projectSnap.data();
  if(!project) return new NextResponse("Project not found", { status: 404 });
  
  if (!project.isPublic && project.uid !== decoded.uid) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let file;
  if(downloadOriginalMp3 == true) {
    // Get the track document
    const project = projectSnap.data() as Project;

    if (!project?.originalMp3) {
      return new NextResponse("No original mp3 path", { status: 400 });
    }

    // Stream from GCS
    file = storage.bucket(bucketName).file(project.originalMp3);

    const [exists] = await file.exists();
    if (!exists) {
      return new NextResponse("Audio file not found", { status: 404 });
    }
  }
  else {
    // Get the track document
    const trackSnap = await adminDb.doc(`tracks/${trackId}`).get();
    if (!trackSnap.exists) {
      return new NextResponse("Track not found", { status: 404 });
    }

    const track = trackSnap.data();
    if (!track?.stemPath) {
      return new NextResponse("No stem path in track record", { status: 400 });
    }

    // Stream from GCS
    file = storage.bucket(bucketName).file(track.stemPath);
    const [exists] = await file.exists();
    if (!exists) {
      return new NextResponse("Audio file not found", { status: 404 });
    }
  }
  
  const stream = file.createReadStream();

  const contentType = "audio/mpeg";

  const headers = new Headers();
  headers.set("Content-Type", contentType);

  return new NextResponse(stream as any, { headers });
}
