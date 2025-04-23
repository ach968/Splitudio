import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { v4 as uuidv4 } from "uuid";
import { FieldValue } from "firebase-admin/firestore";
import { Project, Track } from "@/types/firestore";

// Clones all projects from a source user into a target user's account
// Returns an array of newly created project IDs
async function clone_projects(
  sourceUserId: string,
  targetUserId: string
): Promise<string[]> {
  console.log(
    `Cloning projects from user ${sourceUserId} into new user ${targetUserId}`
  );

  // 1. Fetch all projects belonging to the source user
  const sourceProjectsSnap = await adminDb
    .collection("projects")
    .where("uid", "==", sourceUserId)
    .get();

  const newProjectIds: string[] = [];

  // 2. Iterate and clone each project
  for (const projDoc of sourceProjectsSnap.docs) {
    const projectData = projDoc.data() as Project;

    console.log(projectData);

    const newPid = uuidv4();

    // Clone tracks
    const clonedTrackIds: string[] = [];
    if (projectData.trackIds && projectData.trackIds.length > 0) {
      for (const oldTid of projectData.trackIds) {
        const oldTrackSnap = await adminDb.doc(`tracks/${oldTid}`).get();
        if (!oldTrackSnap.exists) continue;
        const oldTrack = oldTrackSnap.data() as Track;
        const newTid = uuidv4();
        await adminDb.doc(`tracks/${newTid}`).set({
          ...oldTrack,
          trackId: newTid,
        });
        clonedTrackIds.push(newTid);
      }
    }

    // Prepare the new project
    const newProject: Project = {
      pid: newPid,
      uid: targetUserId,
      pName: projectData.pName,
      model: projectData.model,
      fileName: projectData.fileName,
      originalMp3: projectData.originalMp3,
      isPublic: false,
      trackIds: clonedTrackIds,
    };

    // 3. Save new project with server timestamps
    await adminDb.doc(`projects/${newPid}`).set({
      ...newProject,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    newProjectIds.push(newPid);
  }

  return newProjectIds;
}

// API route entrypoint
export async function POST(req: NextRequest) {
  try {
    const { sourceUserId, targetUserId } =
      (await req.json()) as {
        sourceUserId?: string;
        targetUserId?: string;
      };

    if (!sourceUserId || !targetUserId) {
      return NextResponse.json(
        { error: "Missing `sourceUserId` or `targetUserId` in request body" },
        { status: 400 }
      );
    }

    const newPids = await clone_projects(
      sourceUserId,
      targetUserId
    );


    return NextResponse.json({ success: true, newPids });
  } catch (err: any) {
    console.error("Error in deposit_projects:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}