
import { headers } from 'next/headers';
import { Midi } from "@tonejs/midi";
import { redirect } from 'next/navigation';
import PlayWrapper from '@/components/midi-display/playwrapper';

export default async function Page() {
  // cursed ahhh way to get params on server side
  const headersList = await headers();
  const path = headersList.get('referer') || "";
  const parts = path.split("/");
  
  const trackid = parts.pop() || parts.pop(); 
  
  if(trackid == undefined || trackid == "") {
    redirect('/projects');
  }

  async function getMidi(trackid: string) {
    var ret = await fetch("https://us-central1-splitudio-19e91.cloudfunctions.net/mp3_to_midi", {
      method: "POST",
      body: JSON.stringify({
        project_id: trackid,
        mp3_file_link: trackid
      })
    }).then((res)=>res.json)

    return ret
  }

  var midiUrl = await getMidi(trackid);

  var data = await Midi.fromUrl(midiUrl);

  // bring out the complex stuff we need
  const duration = data.tracks[0].duration;

  // get rid of complex objects so next can pass ts
  data = JSON.parse(JSON.stringify(data));

  return <PlayWrapper midiData={data} duration={duration} />
}
