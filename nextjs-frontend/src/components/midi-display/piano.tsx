"use client"
import { useEffect, useRef, useState } from "react";
import { PolySynth, Synth, SynthOptions } from "tone";

function isBlackKey(midi: number): boolean {
    const mod = midi % 12;
    // Black keys are C#, D#, F#, G#, A#
    return [1, 3, 6, 8, 10].includes(mod);
}

interface PianoProps {
    notes: Set<string>;
    isFullPiano: boolean;
    sampler: PolySynth<Synth<SynthOptions>> | null;
    playAlong: boolean;
    playAlongBuffer: Map<string, boolean>
}

export default function Piano({notes, isFullPiano, sampler, playAlong, playAlongBuffer} : PianoProps) {
    // init constants
    const MIN_MIDI = isFullPiano ? 21 : 36;
    const MAX_MIDI = isFullPiano ? 108 : 96;
    const KEY_COUNT = MAX_MIDI - MIN_MIDI + 1;

    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0 });
    

    // Encoded:
    // ${note.name}-${note.time}-${note.duration}-${note.midi}
    var activeMidis: Set<number> = new Set()
    var upcomingMidis: Set<number> = new Set();
    var playingMidis: Set<number> = new Set();
    
    // Always calculate activeMidis
    activeMidis = new Set(
        Array.from(notes).map(encodedNote => Number(encodedNote.split("-")[3]))
    );
    // UpcomingMidis is the notes that are within the window for the user to play
    // playingMidis are the notes that the user is actually playing
    if(playAlong == true && playAlongBuffer) {
        upcomingMidis = new Set(
            Array.from(playAlongBuffer.keys()).map(encodedNote => Number(encodedNote.split("-")[3]))
        )
        playingMidis = new Set(
            Array.from(playAlongBuffer.keys()).filter((key)=>playAlongBuffer.get(key) === true).map(encodedNote => Number(encodedNote.split("-")[3]))
        );
    }
        

    const KEY_WIDTH = dimensions.width / KEY_COUNT;

    const getKeyColor = (midi: number) => {
        const baseColor = isBlackKey(midi) ? "#000" : "#fff";

        if (playAlong == false && activeMidis.has(midi)) {
            // Apply a semi-transparent overlay
            return `linear-gradient(to bottom, #DD7DDFAA, #E1CD86AA, #BBCB92AA, #71C2EFAA, #3BFFFFAA, #DD7DDFAA), ${baseColor}`;
        }
        else { // playAlong == true
            var ret

            if(upcomingMidis.has(midi)) {
                ret = `linear-gradient(to bottom, #3b82f6, transparent), ${baseColor}`;
            }
            if(upcomingMidis.has(midi) && playingMidis.has(midi)) {
                ret = `linear-gradient(to bottom, #22c55e, transparent), ${baseColor}`;
            }
            if(activeMidis.has(midi) && !playingMidis.has(midi)) {
                ret = `linear-gradient(to bottom, #dc2626, transparent), ${baseColor}`;
            }
            
            if(ret) return ret
        }
        
        return baseColor;
    }

    const getShadow = (midi: number) => {
        if(playAlong == false) {
            if(activeMidis.has(midi)) {
                return '0 -5px 10px #F87BFF33, 0 -10px 15px #FB92CF44, 0 -15px 20px #FFDD9B55, 0 -20px 25px #C2F0B166, 0 -25px 30px #2FD8FE77'
            }
            else {
                return ''
            }
        }
        else { // playAlong == true
            if(activeMidis.has(midi) && playingMidis.has(midi)) {
                return '0 -5px 10px #F87BFF33, 0 -10px 15px #FB92CF44, 0 -15px 20px #FFDD9B55, 0 -20px 25px #C2F0B166, 0 -25px 30px #2FD8FE77'
            }
            return '';
        }

        
    }

    useEffect(() => {
        if (!containerRef.current) return;

        // Watch for container resizes
        const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            setDimensions({
                width: entry.contentRect.width,
            });
        }
        });
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    return  <div 
    ref={containerRef}
    className="relative bg-black"
    style={{ width: "100%", height: "100%" }}>
        {Array.from({ length: KEY_COUNT }, (_, idx) => {
        const midi = MIN_MIDI + idx;
        return (
          <div
            key={midi}
            className="absolute h-full border-black border rounded-sm hover:cursor-pointer select-none"
            onPointerDown={()=>{
                sampler?.triggerAttack(midi, undefined, 5)
            }}
            onPointerUp={()=>{
                sampler?.triggerRelease(midi)
            }}
            style={{
              left: idx * KEY_WIDTH,
              width: KEY_WIDTH,
              background: getKeyColor(midi),
              boxShadow: getShadow(midi)
            }}
          />
        );
      })}
    </div>    
}