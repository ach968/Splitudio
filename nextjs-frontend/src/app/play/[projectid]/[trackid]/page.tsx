
import { headers } from 'next/headers';
import { Midi } from "@tonejs/midi";
import { redirect } from 'next/navigation';
import PlayWrapper from '@/components/midi-display/playwrapper';

export default async function Page() {
  // cursed ahhh way to get params on server side
  const headersList = await headers();
  const path = headersList.get('referer') || "";
  const parts = path.split("/");
  
  const projectid = parts.pop() || parts.pop();
  const trackurl = parts.pop(); 
  
  if(projectid == undefined || projectid == "") {
    redirect('/projects');
  }

  if(trackurl == undefined || trackurl == "") {
    redirect('/projects');
  }

  async function getMidi() {
    var ret = await fetch("https://us-central1-splitudio-19e91.cloudfunctions.net/mp3_to_midi", {
      method: "POST",
      body: JSON.stringify({
        project_id: projectid,
        mp3_file_link: trackurl
      })
    }).then((res)=>res.json()).then((response)=> {
      return response.gcs_path
    })

    return ret
  }

  var midiUrl = await getMidi();
  var data = await Midi.fromUrl(midiUrl);

  // bring out the complex stuff we need
  const duration = data.tracks[0].duration;

  // get rid of complex objects so next can pass ts
  data = JSON.parse(JSON.stringify(data));

  return <PlayWrapper midiData={data} duration={duration} />
}
