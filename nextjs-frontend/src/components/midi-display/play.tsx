"use client";

import PianoRoll from "@/components/midi-display/piano-roll";
import { useEffect, useRef, useState } from "react";
import { Midi } from '@tonejs/midi'
import EditorNav from "../editor-nav";
import { Slider } from "../ui/slider";
import Footer from "../footer";
import { Button } from "../ui/button";
// import { Tone } from "tone";
import * as Tone from "tone";
import { PolySynth, Synth, SynthOptions } from "tone";

interface Note {
    midi: number; // e.g., 60 for middle C
    time: number; // in seconds, when the note starts
    duration: number; // in seconds, how long the note lasts
    name: string; // e.g. "C4"
    pitch: string; // e.g. "C" 
    octave: number; // e.g. 4
    velocity: number
}


export default function Play({ midiData } : {midiData : Midi}) {

    const [currentTime, setCurrentTime] = useState(0);
    const [isFullPiano, setIsFullPiano] = useState(true) // minMidi 21 : 36, maxMidi 108 : 96

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

        const multiplier = 0.01;
        setCurrentTime((prev) => {
            let newTime = prev + e.deltaY * multiplier;
            if (newTime < 0) newTime = 0;
            if (newTime > midiData.duration) newTime = midiData.duration;
            return newTime;
        });

        setBuffer(new Set());
    }

    const sampler = useRef<PolySynth<Synth<SynthOptions>>>(null);
    // Hashed string: note.midi-note.time
    const [buffer, setBuffer] = useState(new Set<string>()); // stores the recently used notes so we don't play them again

    useEffect(() => {
        sampler.current = new Tone.PolySynth(Tone.Synth).toDestination()
    }, []);

    useEffect(()=>{

        console.log(buffer);

        // Add notes so buffer so we don't play it again
        notes.forEach((note: Note)=>{
            const TOLERANCE = 0.05;
            if(!buffer.has(`${note.name}-${note.time}-${note.duration}`) && Math.abs(note.time - currentTime) < TOLERANCE) {
                sampler.current?.triggerAttackRelease(note.name, note.duration, undefined, note.velocity);
                setBuffer((buff)=>new Set(buff).add(`${note.name}-${note.time}-${note.duration}`))
            }
        })

        // Delete notes after they have left the window
        setBuffer((prev) => {
            const newBuffer = new Set(prev);
            newBuffer.forEach((encodedNote: string) => {
                const parts = encodedNote.split("-");
                // parts[1] should be note.time
                // parts[2] should be note.duration
                const noteTime = parseFloat(parts[1]);
                const noteDuration = parseFloat(parts[2]);
                const bufferOffset = 0.5; // window offset in seconds
                if (noteTime + noteDuration + bufferOffset < currentTime) {
                    newBuffer.delete(encodedNote);
                }
            });
            return newBuffer;
        });
        
    }, [currentTime])

    // For react
    const [isPlaying, setIsPlaying] = useState(false);

    // High resolution clock using requestAnimationFrame
    // Updates based on delta time from previous frame, so playback is not affected by cpu speed
    const isPlayingRef = useRef(false);
    const requestRef = useRef<number | null>(null);
    const previousTimeRef = useRef<number | null>(null);

    const animate = (time: number) => {
        if (previousTimeRef.current != null && isPlayingRef.current) {
            const delta = (time - previousTimeRef.current) / 1000; // convert to seconds
            setCurrentTime((prev) => prev + delta);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    const play = () => {
        setBuffer(new Set());
        setIsPlaying(true);

        if (!isPlayingRef.current) {
            isPlayingRef.current = true;

            previousTimeRef.current = null;
            requestRef.current = requestAnimationFrame(animate);
        }
    }

    const pause = () => {
        setIsPlaying(false)
        if (isPlayingRef.current && requestRef.current) {
            
            isPlayingRef.current = false;
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }
    };

    return <section>
        <div className="flex flex-col w-full h-screen bg-black text-white p-6">
            <EditorNav />

            <div className="pt-20">
                <label htmlFor="timeSlider" className="block mb-2">
                Current Time: {currentTime.toFixed(2)}s
                </label>
                {
                    isPlaying ?
                    <Button onClick={pause}>Pause</Button> :
                    <Button onClick={play}>Play</Button>
                }
                
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
