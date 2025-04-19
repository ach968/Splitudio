import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { v4 as uuidv4 } from "uuid";

// Assume this function triggers the Cloud Function and returns an array of paths
async function runStemSplitter(projectId: string): Promise<string[]> {
  const response = await fetch("https://us-central1-splitudio-19e91.cloudfunctions.net/split_stems", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id: projectId })
  });

  if (!response.ok) {
    throw new Error("Failed to split stems");
  }

  const data = await response.json();
  return data.relative_paths as string[];
}

export async function POST(req: NextRequest) {
  const { pid } = await req.json();

  if (!pid) {
    return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
  }

  try {
    // 1. Fetch the project from Firestore
    const projectRef = adminDb.doc(`projects/${pid}`);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = projectSnap.data();

    // 2. Trigger Firebase Function to get stem paths
    const stemPaths = await runStemSplitter(pid); 
    // e.g. ["projects/abc/drums.mp3", "projects/abc/vocals.mp3"]

    // 3. For each stem, create a Track document
    const trackIds: string[] = [];

    for (const stemPath of stemPaths) {
      const trackId = uuidv4();
      const trackRef = adminDb.doc(`tracks/${trackId}`);

      const trackRecord = {
        trackId: trackId,
        stemPath: stemPath,
        midiPath: undefined,
        sheetMusicPath: undefined,
      };

      await trackRef.set(trackRecord);
      trackIds.push(trackId);
    }

    // 4. Update the project with trackIds
    await projectRef.update({
      trackIds: trackIds,
      originalMp3: projectData ? `projects/${pid}/${projectData.fileName}` : "",
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, trackIds });
  } catch (err: any) {
    console.error("Error in /api/register_project:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
