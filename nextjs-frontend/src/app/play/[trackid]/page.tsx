
import { headers } from 'next/headers';
import Play from "@/components/midi-display/play";
import { Midi } from "@tonejs/midi";
import { redirect } from 'next/navigation';


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
    // Simulate a delay (e.g. network request)
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // simulate waiting for backend
  const wait = await getMidi(trackid);
  var data = await Midi.fromUrl("https://bitmidi.com/uploads/112561.mid");

  // bring out the complex stuff we need
  const duration = data.tracks[0].duration;

  // get rid of complex objects so next can pass ts
  data = JSON.parse(JSON.stringify(data));

  return <Play midiData={data} duration={duration} />;
}
