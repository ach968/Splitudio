
import { cookies, headers } from 'next/headers';
import { Storage } from "@google-cloud/storage";
import { Midi } from "@tonejs/midi";
import { redirect } from 'next/navigation';
import PlayWrapper from '@/components/midi-display/playwrapper';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { Project } from '@/types/firestore';

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

  const projectOwnerUid: string = projectid;


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
    return redirect("/projects");
  }

  async function getMidi() {
    return fetch("https://us-central1-splitudio-19e91.cloudfunctions.net/mp3_to_midi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        project_id: "bababooey",
        mp3_file_link: "https://storage.cloud.google.com/splitudio-19e91.firebasestorage.app/projects/bababooey/no_vocals.mp3"
      })
    }).catch((err)=>{
      throw new Error(err);
    }).then((res)=>res.json()).then((response)=> {
      return response.gcs_path
    })
  }

  var midiUrl = await getMidi();
  console.log(midiUrl)

  var data = await Midi.fromUrl(midiUrl);

  // bring out the complex stuff we need
  const duration = data.tracks[0].duration;

  // get rid of complex objects so next can pass ts
  data = JSON.parse(JSON.stringify(data));

  return <PlayWrapper midiData={data} duration={duration} />
}
