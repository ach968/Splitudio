
import { cookies, headers } from 'next/headers';
import { Storage } from "@google-cloud/storage";
import { Midi } from "@tonejs/midi";
import { redirect } from 'next/navigation';
import PlayWrapper from '@/components/midi-display/playwrapper';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { CloudFile, Project } from '@/types/firestore';
import { fetchCloudFiles } from '@/lib/utils';
import { collection, doc, getDocs } from 'firebase/firestore';


export default async function Page({params} : any) {

  const { projectid, trackid } = await params;

  if(projectid == undefined || projectid == "" || projectid == null) {
    redirect('/projects');
  }

  if(trackid == undefined || trackid == ""  || projectid == null) {
    redirect('/projects');
  }
  
  const snap = await adminDb.doc(`projects/${projectid}`).get();
  if (!snap.exists) redirect('/projects');

  const d = snap.data() as any;

  const project: Project = {
    pid: projectid,
    uid: d.uid,
    pName: d.pName,
    fileName: d.fileName,
    isPublic: d.isPublic,
    originalMp3: d.originalMp3,
    tracks: d.tracks ?? [],
    createdAt: d.createdAt?.toDate?.() ?? null,
    updatedAt: d.updatedAt?.toDate?.() ?? null,
  };

  if(!project.uid) redirect("/projects")
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

  // Compare the UIDs
  if (project.isPublic == false && decoded.uid !== projectOwnerUid) {
    console.log(decoded.uid)
    console.log(projectOwnerUid)
    return redirect("/projects");
  }

  // ID check passed, We are good to download
  const storage = new Storage({
    projectId: 'splitudio-19e91',
    credentials: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}')
  });
  const bucketName = process.env.STORAGE_BUCKET!;

  async function getMidiData(filePath: string): Promise<Midi> {
    const [buffer] = await storage.bucket(bucketName).file(filePath).download();
    const midi = new Midi(buffer);
    return midi;
  }

  // async function getPath(project_id: string, mp3_file_link: string) {
  //   return fetch("https://us-central1-splitudio-19e91.cloudfunctions.net/mp3_to_midi", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({
  //       project_id: project_id,
  //       mp3_file_link: mp3_file_link
  //     })
  //   }).catch((err)=>{
  //     redirect("/projects")
  //   }).then((res)=>res.json()).then((response)=> {
  //     return response.gcs_path
  //   })
  // }

  // const path = getPath("bababooey", "https://storage.cloud.google.com/splitudio-19e91.firebasestorage.app/projects/bababooey/no_vocals.mp3");
  const midi = await getMidiData("projects/bababooey/no_vocals_basic_pitch.mid");

  // bring out the complex stuff we need
  const duration = midi.tracks[0].duration;

  // get rid of complex objects so next can pass ts
  const data = JSON.parse(JSON.stringify(midi));

  return <PlayWrapper midiData={data} duration={duration} />
}
