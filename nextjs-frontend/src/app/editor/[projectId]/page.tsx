import Editor from "@/components/editor";
import { getProject } from "@/lib/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminDb } from '@/lib/firebase/admin';
import { Project } from "@/types/firestore";


export default async function Page({params}:{params:{projectId:string}}) {

  const snap = await adminDb.doc(`projects/${params.projectId}`).get();
  if (!snap.exists) redirect('/projects');

  const d = snap.data() as any;                     // raw Firestore data

  const project: Project = {
    pid: params.projectId,
    uid: d.uid ?? null,
    pName: d.pName,
    isPublic: d.isPublic,
    collaboratorIds: d.collaboratorIds ?? [],
    originalMp3: d.originalMp3,
    tracks: d.tracks ?? [],

    createdAt: d.createdAt?.toDate?.() ?? null,
    updatedAt: d.updatedAt?.toDate?.() ?? null,
  };

  return <Editor project={project} />;
}

