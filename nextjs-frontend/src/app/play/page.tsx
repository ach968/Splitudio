import Play from "@/components/midi-display/play";
import { Midi } from "@tonejs/midi";

export default async function Page() {
  async function getMidi() {
    // Simulate a delay (e.g. network request)
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // simulate waiting for backend
  const wait = await getMidi();

  var data = await Midi.fromUrl("https://bitmidi.com/uploads/79829.mid");

  // bring out the complex stuff we need
  const duration = data.tracks[0].duration;

  // get rid of complex objects so next can pass ts
  data = JSON.parse(JSON.stringify(data));

  return <Play midiData={data} duration={duration} />;
}
