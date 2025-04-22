"use client";

import PianoRoll from "@/components/midi-display/piano-roll";
import { useEffect, useRef, useState } from "react";
import { Midi } from "@tonejs/midi";
import { Slider } from "../ui/slider";
import Footer from "../footer";
import { Button } from "../ui/button";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as Tone from "tone";
import { PolySynth, Synth, SynthOptions } from "tone";
import Piano from "@/components/midi-display/piano";
import EditorNav from "../editor-nav";
import Knob from "./knob";
import { useMicrophone } from "./use-microphone";
import MicrophoneSVG from "@/assets/microphone";
import HeadphoneSVG from "@/assets/headphone";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import LoopSVG from "@/assets/loop";
import BackwardSVG from "@/assets/backward";
import PauseSVG from "@/assets/pause";
import PlaySVG from "@/assets/play";
import ForwardSVG from "@/assets/forward";
import SettingsSVG from "@/assets/settings";
import {WebMidi} from 'webmidi';

interface Note {
  midi: number; // e.g., 60 for middle C
  time: number; // in seconds, when the note starts
  duration: number; // how long a note is held for
  name: string; // e.g. "C4"
  pitch: string; // e.g. "C"
  octave: number; // e.g. 4
  velocity: number;
}

export default function Play({
  midiData,
  duration,
}: {
  midiData: Midi;
  duration: number;
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullPiano, setIsFullPiano] = useState(true); // minMidi 21 : 36, maxMidi 108 : 96
  const playbackSpeedRef = useRef(1);

  const pianoRollContainerRef = useRef<HTMLDivElement>(null);

  const [WINDOW_SIZE, setWindowSize] = useState<number>(3);
  const MAX_WINDOW_SIZE = 20;

  const [playAlong, setPlayAlong] = useState(false);
  const [micOrMidi, setMicOrMidi] = useState("midi");

  const { fftData, midiUtils } = useMicrophone();

  const handleNoteOn = (e: any) => {
    setActiveNotes((prev) => {
      const updated = new Map(prev);
      updated.set(e.note.number, e.note);
      return updated;
    });
  };
  
  const handleNoteOff = (e: any) => {
    setActiveNotes((prev) => {
      const updated = new Map(prev);
      updated.delete(e.note.number);
      return updated;
    });
  };

  useEffect(() => {
    let input: any;

    WebMidi.enable()
      .then(() => {
        console.log(WebMidi.inputs);
        input = WebMidi.inputs[0];

        if (!input) return;

        input.addListener("noteon", "all", handleNoteOn);

        input.addListener("noteoff", "all", handleNoteOff);
      })
      .catch((err: any) =>
        console.error("WebMidi could not be enabled.", err)
      );
    
    return () => {
      if (input) {
        input.removeListener("noteon", "all", handleNoteOn);
        input.removeListener("noteoff", "all", handleNoteOff);
      }
    };
  }, []);

  const [activeNotes, setActiveNotes] = useState<Map<number, any>>(new Map());

  useEffect(()=>{
    console.log(activeNotes)
  },[activeNotes])


  // Calculate what notes are visible in the time window
  const notes = noteWindow(midiData, currentTime, WINDOW_SIZE);

  // Define piano size
  useEffect(() => {

    const noteOctaves = midiData.tracks[0].notes.map((note) => note.octave);
    const minOctave = Math.min(...noteOctaves);
    const maxOctave = Math.max(...noteOctaves);
    const octaveRange = maxOctave - minOctave + 1;

    setIsFullPiano(octaveRange > 5);
  }, [midiData]);

  function skipBackward() {
    setBuffer(new Set());
    setCurrentTime((prev) => Math.max(0, prev - WINDOW_SIZE * 0.2));
  }
  function skipForward() {
    setBuffer(new Set());
    setCurrentTime((prev) => Math.min(duration, prev + WINDOW_SIZE * 0.2));
  }
  function playPause() {
    if (isPlaying) pause();
    else play();
  }
  // Add event listeners for keyboard events
  useEffect(() => {
    const handleKeyDownEvent = (e: KeyboardEvent) => {
      if (e.keyCode === 32) {
        e.preventDefault();
        playPause();
      } else if (e.keyCode === 37) {
        e.preventDefault();
        skipBackward();
      } else if (e.keyCode === 39) {
        e.preventDefault();
        skipForward();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "=") {
        e.preventDefault();
        setWindowSize((prev) => Math.max(0.5, prev - 2));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setWindowSize((prev) => Math.min(MAX_WINDOW_SIZE, prev + 2));
      }
    };

    window.addEventListener("keydown", handleKeyDownEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyDownEvent);
    };
  });

  useEffect(() => {
    // Scrolling on piano roll will move currentTime
    const container = pianoRollContainerRef.current;
    if (!container) return;
    container.addEventListener("wheel", handleScrollEvent, { passive: false });

    return () => {
      const container = pianoRollContainerRef.current;
      if (container) {
        container.removeEventListener("wheel", handleScrollEvent);
      }
    };
  }, [pianoRollContainerRef.current]);

  const handleScrollEvent = (e: WheelEvent) => {
    e.preventDefault();

    setBuffer(new Set());

    if (e.altKey || e.ctrlKey || e.metaKey) {
      const multiplier = 0.01;
      setWindowSize((prev) => {
        let newSize = prev + e.deltaY * multiplier;
        if (newSize < 0.5) newSize = 0.5;
        if (newSize > MAX_WINDOW_SIZE) newSize = MAX_WINDOW_SIZE;
        return newSize;
      });
    } else {
      const multiplier = 0.01;
      setCurrentTime((prev) => {
        let newTime = prev + e.deltaY * multiplier;
        if (newTime < 0) newTime = 0;
        if (newTime > duration) newTime = duration;
        return newTime;
      });
    }
  };

  const sampler = useRef<PolySynth<Synth<SynthOptions>>>(null);
  const [volume, setVolume] = useState(1); // in Db variation from original

  useEffect(() => {
    sampler.current = new Tone.PolySynth(Tone.Synth).toDestination();
  }, []);

  useEffect(() => {
    sampler.current!.volume.value = volume * 50 - 50;
  }, [volume]);

  // Hashed string: note.midi-note.time-note.duration-note.midi
  // Subset of notes (which is a subset of midiData). Contains note that are currently being played,
  //      ie start <= currentTime + tolerance and end >= currentTime
  const [buffer, setBuffer] = useState(new Set<string>()); // stores the recently used notes so we don't play them again

  useEffect(() => {
    // Notes are added to buffer when they 'hit' the currentTime
    // 1.   Makes sure that notes are not played twice by synth
    // 2.   Used for piano overlay
    notes.forEach((note: Note) => {
      const TOLERANCE = 0.05;
      if (
        !buffer.has(
          `${note.name}-${note.time}-${note.duration}-${note.midi}`
        ) &&
        Math.abs(note.time - currentTime) < TOLERANCE
      ) {
        if (playAlong == false || playAlong == true)
          sampler.current?.triggerAttackRelease(
            note.name,
            (note.duration * 1/playbackSpeedRef.current),
            undefined,
            note.velocity
          );
        else {
        }
        setBuffer((buff) =>
          new Set(buff).add(
            `${note.name}-${note.time}-${note.duration}-${note.midi}`
          )
        );
      }
    });

    // Delete notes after they have left the window
    setBuffer((prev) => {
      const newBuffer = new Set(prev);
      newBuffer.forEach((encodedNote: string) => {
        const parts = encodedNote.split("-");
        // parts[1] should be note.time
        // parts[2] should be note.duration
        const noteTime = parseFloat(parts[1]);
        const noteDuration = parseFloat(parts[2]);
        if (noteTime + noteDuration < currentTime) {
          newBuffer.delete(encodedNote);
        }
      });
      return newBuffer;
    });
  }, [currentTime]);

  // Similar to buffer, but used for playing along.
  const [playAlongBuffer, setPlayAlongBuffer] = useState(new Map<string, boolean>());
  const PLAY_TOLERANCE = 0.3;

  // Here is where we check if the user is playing along
  useEffect(() => {
    if (playAlong == true && micOrMidi == "mic") {
      
      const newPlayAlongBuffer = new Map<string, boolean>();

      // Check if the two ranges overlap:
      // [currentTime - tolerance, currentTime + tolerance]
      // [note.time, note.time + note.duration]
      const window = noteWindow(midiData, currentTime, PLAY_TOLERANCE);

      window.forEach((note) => {
        const id = `${note.name}-${note.time}-${note.duration}-${note.midi}`;
        
        if (midiUtils.isMidiNotePresent(note.midi, playAlongBuffer.size, 100)) {
          newPlayAlongBuffer.set(id, true);
        } else {
          newPlayAlongBuffer.set(id, false);
        }
      });

      setPlayAlongBuffer(newPlayAlongBuffer);
    }
  }, [currentTime, playAlong, micOrMidi]);

  useEffect(() => {
    if (playAlong == true && micOrMidi == "midi") {
      
      const newPlayAlongBuffer = new Map<string, boolean>();

      // Check if the two ranges overlap:
      // [currentTime - tolerance, currentTime + tolerance]
      // [note.time, note.time + note.duration]
      const window = noteWindow(midiData, currentTime, PLAY_TOLERANCE);

      // First set everything to false
      window.forEach((note)=>{
        const id = `${note.name}-${note.time}-${note.duration}-${note.midi}`;

        newPlayAlongBuffer.set(id, false);
      })

      // Then add the active notes
      window.forEach((note) => {
        const id = `${note.name}-${note.time}-${note.duration}-${note.midi}`;
        
        activeNotes.forEach((obj)=>{
          if(obj.number == note.midi) {
            newPlayAlongBuffer.set(id, true);
          }
        })
      });

      activeNotes.forEach((obj) => {
        // Check if there's already an entry for this MIDI note in the buffer.
        const exists = Array.from(newPlayAlongBuffer.keys()).some((key) =>
          key.endsWith(`-${obj.number}`)
        );

        if (!exists) { 
          // Add with the correct state.
          newPlayAlongBuffer.set(`unknown-0-0-${obj.number}`, false);
        }
      });
      console.log(newPlayAlongBuffer)
      setPlayAlongBuffer(newPlayAlongBuffer); 
    }
  }, [currentTime, playAlong, micOrMidi, activeNotes]);

  // Only for the stupid react button
  const [isPlaying, setIsPlaying] = useState(false);

  // High resolution clock using requestAnimationFrame
  // Updates based on delta time from previous frame, so playback is not affected by cpu speed
  const isPlayingRef = useRef(false);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  const animate = (time: number) => {
    if (previousTimeRef.current != null && isPlayingRef.current) {
      const delta = (time - previousTimeRef.current) / 1000; // convert to seconds
      setCurrentTime((prev) => prev + delta * playbackSpeedRef.current);
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
  };

  const pause = () => {
    setIsPlaying(false);
    if (isPlayingRef.current && requestRef.current) {
      isPlayingRef.current = false;
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  };

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return `${hours > 0 ? hours.toString().padStart(2, "0") + ":" : ""}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <section>
      <EditorNav/>
      
      <div className="flex flex-col w-full min-h-screen h-screen bg-black text-white p-6">
        <div
          className="w-full h-full overflow-y-auto"
          ref={pianoRollContainerRef}
        >
          <PianoRoll
            notes={notes}
            windowStart={currentTime}
            windowDuration={WINDOW_SIZE}
            isFullPiano={isFullPiano}
            playAlong={playAlong}
            playAlongBuffer={playAlongBuffer}
          />
        </div>

        <div className="w-full h-32">
          <Piano
            notes={buffer}
            playAlongBuffer={playAlongBuffer}
            isFullPiano={isFullPiano}
            sampler={sampler.current}
            playAlong={playAlong}
          ></Piano>
        </div>

        <div className="w-full justify-center items-center flex flex-col">
          <div className="container px-3 lg:px-5">
            <div className="mt-2 flex gap-3">
              <p className="font-mono text-xs">{formatTime(currentTime)}</p>

              {/* Stolen from shadcn ts */}
              <SliderPrimitive.Root
                className="relative flex w-full touch-none select-none items-center"
                min={0}
                max={duration}
                step={0.01}
                value={[currentTime]}
                onValueChange={(e: any) => {
                  setBuffer(new Set());
                  setCurrentTime(parseFloat(e[0]));
                }}
              >
                <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-700">
                  <SliderPrimitive.Range className="absolute h-full bg-white" />
                </SliderPrimitive.Track>
              </SliderPrimitive.Root>
              <p className="font-mono text-xs">{formatTime(duration)}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 w-full items-center mt-2">

              <div className="flex justify-center sm:justify-start flex-row gap-3">
                <div className="flex flex-col gap-1 w-[150px] items-center border border-neutral-500 rounded-md p-2">
                  <span 
                  onClick={()=>setWindowSize(3)}
                  className="font-mono text-xs truncate hover:cursor-pointer">
                    Zoom:&nbsp;{WINDOW_SIZE.toFixed(2)}s
                  </span>
                  <div className="flex flex-row gap-1 w-full">
                    <Button 
                    onClick={()=>setWindowSize((prev)=> {
                      if(prev+2 > MAX_WINDOW_SIZE) {
                        return MAX_WINDOW_SIZE
                      }
                      return prev+2
                    })}
                    size="icon" 
                    variant="ghost" 
                    className="flex items-center pt-5 justify-center text-lg p-3 w-[12px] h-[12px]">
                      -
                    </Button>
                       
                    <Slider
                    className="w-full"
                    min={0.5}
                    max={MAX_WINDOW_SIZE}
                    step={0.01}
                    value={[MAX_WINDOW_SIZE + 0.5 - WINDOW_SIZE]}
                    onValueChange={([e]) => {
                      const inverted = MAX_WINDOW_SIZE + 0.5 - e;
                      setWindowSize(inverted)
                    }}
                    ></Slider>

                    <Button
                    onClick={()=>setWindowSize((prev)=> {
                      if(prev-2 < 0.5) {
                        return 0.5
                      }
                      return prev-2
                    })}
                    size="icon" 
                    variant="ghost" 
                    className="flex items-center justify-center text-lg p-3 w-[12px] h-[12px]">
                      +
                    </Button>
                                  
                  </div>
                </div>

                <div className="flex flex-col gap-1 border border-neutral-500 rounded-md p-2 w-[150px] items-center">
                  <span
                  onClick={()=>playbackSpeedRef.current = 1} 
                  className="font-mono text-xs truncate hover:cursor-pointer">
                    Speed:&nbsp;{playbackSpeedRef.current.toFixed(1)}x
                  </span>
                  <div className="flex flex-row gap-1 w-full">
                    <Button 
                    onClick={()=>playbackSpeedRef.current = playbackSpeedRef.current - 0.2}
                    size="icon" 
                    variant="ghost" 
                    className="flex items-center justify-center text-lg p-3 w-[12px] h-[12px]">
                      -
                    </Button>   
                        
                    <Slider
                      className="w-full"
                      min={0.1}
                      max={2}
                      step={0.01}
                      value={[playbackSpeedRef.current]}
                      onValueChange={(e) => playbackSpeedRef.current = e[0]}
                    ></Slider>

                    <Button
                    onClick={()=>playbackSpeedRef.current = playbackSpeedRef.current + 0.2}
                    size="icon" 
                    variant="ghost" 
                    className="flex items-center justify-center text-lg p-3 w-[12px] h-[12px]">
                      +
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        variant={"ghost"}
                        className="w-7 h-7 group"
                      >
                        <LoopSVG className="invert-0 group-hover:invert" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enable Looping</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 group"
                        onClick={skipBackward}
                      >
                        <BackwardSVG className="invert-0 group-hover:invert" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Seek Backward (Left Arrow)</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 group"
                        onClick={playPause}
                      >
                        {isPlaying === true ? (
                          <PauseSVG className="invert-0 group-hover:invert" />
                        ) : (
                          <PlaySVG className="invert-0 group-hover:invert" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Play/Pause (Space)</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 group"
                        onClick={skipForward}
                      >
                        <ForwardSVG className="invert-0 group-hover:invert" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Seek Forward (Right Arrow)</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 group"
                        // TODO: On click
                      >
                        <SettingsSVG className="invert-0 group-hover:invert" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex gap-3 items-center justify-center sm:justify-end">
                {playAlong ? (
                  <div className="flex flex-row gap-2">
                    {micOrMidi == "midi" ?
                      <Button
                      className="group w-[40px]"
                      variant="destructive"
                      onClick={()=>setMicOrMidi("mic")}>
                        MIDI
                      </Button>
                      :
                      <Button
                      className="group w-[40px]"
                      variant="destructive"
                      onClick={()=>setMicOrMidi("midi")}>
                        MIC
                      </Button>
                    }
                    
                    <Button
                    className="group w-[40px]"
                    variant="secondary"
                    onClick={() => setPlayAlong(false)}>
                      <MicrophoneSVG className="invert"/>
                    </Button>
                  </div>
                  
                ) : (
                  <Button
                  className="group w-[40px]"
                  variant="outline"
                  size="icon"
                  onClick={() => setPlayAlong(true)}>
                    <HeadphoneSVG className="group-hover:invert"/>
                  </Button>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Knob size={40} value={volume} onChange={setVolume}></Knob>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Volume Knob</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
}

function noteWindow(
  midiData: Midi,
  windowStart: number,
  windowDuration = 3
): Note[] {
  const windowEnd = windowStart + windowDuration;

  // For each track, filter out the notes that start in our time window.
  const notes: Note[] = midiData.tracks.flatMap((track) =>
    track.notes.filter(
      (note) =>
        // Check if [note.time,note.time+note.duration] overlaps with [windowStart,windowEnd]
        note.time + note.duration > windowStart && note.time < windowEnd
    )
  );

  return notes;
}
