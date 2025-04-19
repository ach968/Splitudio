
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
  
  const projectSnap = await adminDb.doc(`projects/${projectid}`).get();
  if (!projectSnap.exists) redirect('/projects');

  const p = projectSnap.data() as any;

  const project: Project = {
    pid: projectid,
    uid: p.uid,
    pName: p.pName,
    fileName: p.fileName,
    isPublic: p.isPublic,
    originalMp3: p.originalMp3,
    trackIds: p.tracks ?? [],
    createdAt: p.createdAt?.toDate?.() ?? null,
    updatedAt: p.updatedAt?.toDate?.() ?? null,
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

  

  // ID check passed, we are good to download / start conversion

  // Get related track based on trackid
  const trackRef = adminDb.doc(`tracks/${trackid}`);
  const trackSnap = await trackRef.get();
  if (!trackSnap.exists) redirect("/projects");

  const track = trackSnap.data();
  if(track == undefined) redirect("/projects")
  
  // Check if the midipath is set. If it isn't, we need to call firebase function
  // to convert the stem to midi.
  let midiPath = track.midiPath;

  if (!midiPath) {
    const cloudFunctionResponse = await fetch(
      "https://us-central1-splitudio-19e91.cloudfunctions.net/mp3_to_midi",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectid,
          mp3_file_path: track.stemPath, // use the track's stemPath
        }),
      }
    );

    if (!cloudFunctionResponse.ok) redirect("/projects");

    const result = await cloudFunctionResponse.json();
    midiPath = result.gcs_path;

    await trackRef.update({ midiPath: midiPath });
  }

  const storage = new Storage({
    projectId: 'splitudio-19e91',
    credentials: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}')
  });
  const bucketName = process.env.STORAGE_BUCKET!;

  const [buffer] = await storage.bucket(bucketName).file(midiPath).download();

  const midi = new Midi(buffer);
  // const path = getPath("bababooey", "https://storage.cloud.google.com/splitudio-19e91.firebasestorage.app/projects/bababooey/no_vocals.mp3");
  // const midi = await getMidiData("projects/bababooey/no_vocals_basic_pitch.mid");

  // bring out the complex stuff we need
  const duration = midi.tracks[0].duration;

  // get rid of complex objects so next can pass ts
  const data = JSON.parse(JSON.stringify(midi));

  return <PlayWrapper midiData={data} duration={duration} />
}
