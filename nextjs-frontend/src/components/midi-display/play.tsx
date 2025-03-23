"use client";

import PianoRoll from "@/components/midi-display/piano-roll";
import { useEffect, useRef, useState } from "react";
import { Midi } from '@tonejs/midi'
import EditorNav from "../editor-nav";
import { Slider } from "../ui/slider";
import Footer from "../footer";
import { Button } from "../ui/button";

interface Note {
    midi: number; // e.g., 60 for middle C
    time: number; // in seconds, when the note starts
    duration: number; // in seconds, how long the note lasts
    name: string; // e.g. "C4"
    pitch: string; // e.g. "C" 
    octave: number; // e.g. 4
}

export default function Play({ midiData } : {midiData : Midi}) {

    const [currentTime, setCurrentTime] = useState(0);
    const [isFullPiano, setIsFullPiano] = useState(true) // minMidi 21 : 36, maxMidi 108 : 96
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const pianoRollContainerRef = useRef<HTMLDivElement>(null);
    
    // Calculate what notes are visible in the time window
    const notes = noteWindow(midiData, currentTime, 5);

    // Define piano size
    useEffect(()=>{
        const noteOctaves = midiData.tracks[0].notes.map(note => note.octave);
        const minOctave = Math.min(...noteOctaves);
        const maxOctave = Math.max(...noteOctaves);
        const octaveRange = maxOctave - minOctave + 1;

        setIsFullPiano(octaveRange > 5)
    }, [midiData])
    
    useEffect(()=>{
        const container = pianoRollContainerRef.current;
        if (!container) return;
        container.addEventListener("wheel", handleScrollEvent, { passive: false });
        return ()=>{
            window.removeEventListener("wheel", handleScrollEvent);
        }
    },[pianoRollContainerRef.current])

    const handleScrollEvent = (e: WheelEvent) => {
        e.preventDefault();
        console.log("SCROLL")
        const multiplier = 0.01;
        setCurrentTime((prev) => {
            let newTime = prev + e.deltaY * multiplier;
            if (newTime < 0) newTime = 0;
            if (newTime > midiData.duration) newTime = midiData.duration;
            return newTime;
        });
    }

    const play = () => {
        if (intervalRef.current !== null) { // already playing
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        else {
            intervalRef.current = setInterval(() => {
                requestAnimationFrame(() => {
                    setCurrentTime(prev => prev + 0.01);
                });
            }, 10);
        }
        
    }
    const pause = () => {
        console.log("PAUSE")
        if (intervalRef.current !== null) {
            
        }
    };

    return <section>
        <div className="flex flex-col w-full h-screen bg-black text-white p-6">
            <EditorNav />

            <div className="pt-20">
                <label htmlFor="timeSlider" className="block mb-2">
                Current Time: {currentTime.toFixed(2)}s
                </label>
                <Button
                onClick={play}
                >Play</Button>
                <Slider
                min={0}
                max={midiData.duration}
                step={0.01}
                value={[currentTime]}
                onValueChange={(e:any) => setCurrentTime(parseFloat(e[0]))}
                className="w-full mb-2"
                ></Slider>
            </div>

            <div 
            className="w-full h-full overflow-y-auto"
            ref={pianoRollContainerRef}
            >
                <PianoRoll
                notes={notes} 
                windowStart={currentTime} 
                windowDuration={3} 
                isFullPiano={isFullPiano}
                />
            </div>
        </div>
        <Footer />
    </section>
}

function noteWindow(midiData: Midi, windowStart:number , windowDuration = 3): Note[] {
    const windowEnd = windowStart + windowDuration;
  
    // For each track, filter out the notes that start in our time window.
    const notes: Note[] = midiData.tracks.flatMap(track =>
      track.notes.filter(note => 
          // Check if [note.time,note.time+note.duration] overlaps with [windowStart,windowEnd]
          (note.time + note.duration > windowStart) && (note.time < windowEnd)
      )
    );
  
    return notes
}
