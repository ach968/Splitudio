import Editor from "@/components/editor";
import { redirect } from "next/navigation";
import { adminDb } from '@/lib/firebase/admin';
import { Project } from "@/types/firestore";


export default async function Page({ params } : any) {

  const { projectId } = await params;

  const snap = await adminDb.doc(`projects/${projectId}`).get();
  if (!snap.exists) redirect('/projects');

  const d = snap.data() as any;

  const project: Project = {
    pid: projectId,
    uid: d.uid ?? null,
    pName: d.pName,
    fileName: d.fileName,
    isPublic: d.isPublic,
    originalMp3: d.originalMp3,
    tracks: d.tracks ?? [],

    createdAt: d.createdAt?.toDate?.() ?? null,
    updatedAt: d.updatedAt?.toDate?.() ?? null,
  };

  return <Editor project={project} />;
}

