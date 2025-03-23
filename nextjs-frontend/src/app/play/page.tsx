"use client"
import Play from '@/components/midi-display/play'
import { Midi } from '@tonejs/midi'
import { useEffect, useState } from 'react';

export default function Page() {
    const [midiData, setMidiData] = useState<Midi | null>(null);
    
    useEffect(()=> {
        async function loadMidi() {
            const data = await Midi.fromUrl("/Am_I_Blue_AB.mid")
            setMidiData(data);
          }

          loadMidi();
    }, [])
    
    if(midiData == null)
        return <>LOADING PAGE</>
    
    return <Play midiData={midiData}/>
}