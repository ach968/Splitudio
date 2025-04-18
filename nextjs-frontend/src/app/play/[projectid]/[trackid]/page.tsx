
import { headers } from 'next/headers';
import { Storage } from "@google-cloud/storage";
import { Midi } from "@tonejs/midi";
import { redirect } from 'next/navigation';
import PlayWrapper from '@/components/midi-display/playwrapper';

export default async function Page({params} : any) {
  // cursed ahhh way to get params on server side
  console.log(params)

  const { projectid, trackid } = await params;

  console.log(projectid)
  console.log(trackid)
  if(projectid == undefined || projectid == "") {
    redirect('/projects');
  }

  if(trackid == undefined || trackid == "") {
    redirect('/projects');
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
      console.log(err);
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
