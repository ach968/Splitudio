import Editor from "@/components/editor";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { Project, Track } from "@/types/firestore";

export default async function Page({ params }: any) {
  const { projectId } = await params;

  const snap = await adminDb.doc(`projects/${projectId}`).get();
  if (!snap.exists) redirect("/projects");

  const d = snap.data() as any;

  const project: Project = {
    pid: projectId,
    uid: d.uid,
    pName: d.pName,
    model: d.model,
    fileName: d.fileName,
    isPublic: d.isPublic,
    originalMp3: d.originalMp3,
    trackIds: d.trackIds,
    createdAt: d.createdAt?.toDate?.() ?? null,
    updatedAt: d.updatedAt?.toDate?.() ?? null,
  };

  if (project.uid == undefined || project.uid == "" || project.uid == null)
    redirect("/projects");

  // Get the project's owner
  const projectOwnerUid: string = project.uid;

  // Get the logged in user's cookies
  const token = (await cookies()).get("session")?.value;
  if (!token) {
    return redirect("/login");
  }

  let decoded: { uid: string };
  try {
    decoded = await adminAuth.verifySessionCookie(token);
  } catch (e) {
    return redirect("/login");
  }

  // Compare the UIDs
  if (project.isPublic == false && decoded.uid !== projectOwnerUid) {
    return redirect("/projects");
  }

  // Check if we need to split stems
  if (!project.trackIds) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    console.log("baseUrl", baseUrl);
    await fetch(`${baseUrl}/api/register_project`, {
      method: "POST",
      body: JSON.stringify({
        pid: project.pid,
      }),
    }).then((res) => {
      if (!res.ok) {
        console.log("Error registering project", res);
        redirect("/projects");
      }
    });

    const newSnap = await adminDb.doc(`projects/${projectId}`).get();
    if (!newSnap.exists) redirect("/projects");

    const updatedProject = newSnap.data() as Project;
    updatedProject.pid = projectId;

    updatedProject.updatedAt = undefined;
    updatedProject.createdAt = undefined;

    const trackDocs = await Promise.all(
      updatedProject.trackIds!.map(async (trackId: string) => {
        const trackSnap = await adminDb.doc(`tracks/${trackId}`).get();
        return { ...(trackSnap.data() as Track) };
      })
    );

    return <Editor project={updatedProject} tracks={trackDocs} />;
  }

  const trackDocs = await Promise.all(
    project.trackIds.map(async (trackId: string) => {
      const trackSnap = await adminDb.doc(`tracks/${trackId}`).get();
      return { ...(trackSnap.data() as Track) };
    })
  );

  project.updatedAt = undefined;
  project.createdAt = undefined;
  return <Editor project={project} tracks={trackDocs} />;
}
