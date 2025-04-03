"use client"

import { MIDIProvider } from '@react-midi/hooks'
import Play from './play'
import { Midi } from "@tonejs/midi";

export default function PlayWrapper({midiData, duration} : {midiData: Midi, duration: number}) {
  return <MIDIProvider>
      <Play midiData={midiData} duration={duration} />
    </MIDIProvider>
}