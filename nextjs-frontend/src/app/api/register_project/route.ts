import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { v4 as uuidv4 } from "uuid";
import { Track } from "@/types/firestore";
import { FieldValue } from "firebase-admin/firestore";

// This function triggers the Cloud Function and returns an array of paths
async function runStemSplitter(projectId: string, gcsPath: string, model: string): Promise<string[]> {
  const response = await fetch("https://us-central1-splitudio-19e91.cloudfunctions.net/demucs_stem_splitting", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      project_id: projectId, 
      gcs_path: gcsPath,
      model: model
     })
  });

  if (!response.ok) {
    throw new Error("Failed to split stems");
  }

  const data = await response.json();
  return data.files as string[];
}

export async function POST(req: NextRequest) {

  console.log("REGISTERING PROJECT")

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
    if(projectData == undefined){
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Trigger Firebase Function to get stem paths
    const stemPaths = await runStemSplitter(pid, `projects/${pid}/${projectData.fileName}`, projectData.model) 
    console.log("INNER FIERBASE FUNCTION RETURNS")
    
    // 3. For each stem, create a Track document
    const trackIds: string[] = [];

    for (const stemPath of stemPaths) {
      const trackId = uuidv4();
      const trackRef = adminDb.doc(`tracks/${trackId}`);

      // Extract instrument name
      const parts = stemPath.split("/");
      const fileName = parts[parts.length - 1];
      const instrument = fileName.replace(/\.[^/.]+$/, "");

      const trackRecord: Track = {
        instrument: instrument,
        trackId: trackId,
        stemPath: stemPath,
      };

      await trackRef.set(trackRecord)
      trackIds.push(trackId);
    }

    
    // 4. Update the project with trackIds
    await projectRef.update({
      trackIds: trackIds,
      originalMp3: projectData ? `projects/${pid}/${projectData.fileName}` : "",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, trackIds });
  } catch (err: any) {
    console.log(err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
