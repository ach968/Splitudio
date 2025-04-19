import Editor from "@/components/editor";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { Project } from "@/types/firestore";


export default async function Page({ params } : any) {

  const { projectId } = await params;

  const snap = await adminDb.doc(`projects/${projectId}`).get();
  if (!snap.exists) redirect('/projects');

  const d = snap.data() as any;

  const project: Project = {
    pid: projectId,
    uid: d.uid,
    pName: d.pName,
    fileName: d.fileName,
    isPublic: d.isPublic,
    originalMp3: d.originalMp3,
    tracks: d.tracks ?? [],
    createdAt: d.createdAt?.toDate?.() ?? null,
    updatedAt: d.updatedAt?.toDate?.() ?? null,
  };

  if(project.uid == undefined || project.uid == "" || project.uid == null) redirect("/projects")
  
  // Get the project's owner
  const projectOwnerUid: string = project.uid;
  
  // Get the logged in user's cookies
  const token = ((await cookies()).get("session")?.value);
  if (!token) {
    return redirect("/login");
  }

  let decoded: { uid: string };
  try {
    decoded = await adminAuth.verifySessionCookie(token);
  } catch (e) {
    return redirect("/login");
  }

  console.log(decoded.uid)
  console.log(projectOwnerUid)
  // Compare the UIDs
  if (project.isPublic == false && decoded.uid !== projectOwnerUid) {
    return redirect("/projects");
  }

  return <Editor project={project} />;
}

