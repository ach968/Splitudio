import React, { useEffect, useRef, useState } from "react";

interface Note {
  midi: number; // e.g., 60 for middle C
  time: number; // in seconds, when the note starts
  duration: number; // in seconds, how long the note lasts
  name: string; // e.g., "C4"
  pitch: string;
  octave: number;
}

interface PianoRollProps {
  notes: Note[];
  windowStart: number; // start time of the current window in seconds
  windowDuration: number; // e.g., 3 seconds
  isFullPiano: boolean;
  playAlong: boolean;
  playAlongBuffer: Map<string, boolean>;
}

export default function PianoRoll({
  notes,
  windowStart,
  windowDuration,
  isFullPiano,
  playAlong,
  playAlongBuffer,
}: PianoRollProps) {
  // init constants
  const MIN_MIDI = isFullPiano ? 21 : 36;
  const MAX_MIDI = isFullPiano ? 108 : 96;
  const KEY_COUNT = MAX_MIDI - MIN_MIDI + 1;

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const KEY_WIDTH = dimensions.width / KEY_COUNT;
  // TIME_SCALE is how many pixels represent a second.
  const TIME_SCALE = dimensions.height / windowDuration;

  // Dynamic resizing of piano
  useEffect(() => {
    if (!containerRef.current) return;

    // Watch for container resizes
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const createNote = (note: Note, index: number) => {
    // Calculate the note's vertical position and height:
    // top is relative to the windowStart
    const bottom = (note.time - windowStart) * TIME_SCALE;
    const height = note.duration * TIME_SCALE;

    // Calculate horizontal position: each key is keyWidth pixels wide
    const left = (note.midi - MIN_MIDI) * KEY_WIDTH;

    if (playAlong === true) {
      const hash = `${note.name}-${note.time}-${note.duration}-${note.midi}`;
      if (playAlongBuffer.has(hash) == true) {
        const playing = playAlongBuffer.get(hash);

        if (playing === false) {
          return (
            <div
              key={index}
              className="absolute bg-neutral-200 rounded-sm border-4 border-violet-400"
              style={{
                bottom: bottom,
                left,
                width: KEY_WIDTH,
                height,
                overflow: "hidden",
                zIndex: index + 10,
              }}
            ></div>
          );
        } else if (playing === true) {
          return (
            <div
              key={index}
              className="absolute bg-orange-500 rounded-sm border-4 border-red-500"
              style={{
                bottom: bottom,
                left,
                width: KEY_WIDTH,
                height,
                overflow: "hidden",
                zIndex: index + 10,
              }}
            ></div>
          );
        }
      }
      return (
        <div
          key={index}
          className="absolute bg-neutral-500 rounded-sm border-4 border-violet-400"
          style={{
            bottom: bottom, // Clip if note starts above window
            left,
            width: KEY_WIDTH,
            height,
            overflow: "hidden",
            zIndex: index + 10,
          }}
        ></div>
      );
    }
    
    return (
      <div
        key={index}
        className="absolute bg-neutral-200 rounded-sm border-4 border-violet-400"
        style={{
          bottom: bottom, // Clip if note starts above window
          left,
          width: KEY_WIDTH,
          height,
          overflow: "hidden",
          zIndex: index + 10,
        }}
      ></div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative border border-neutral-800 bg-neutral-950 overflow-y-clip w-full h-full"
    >
      {/* Render falling note blocks */}
      {notes.map((note, index) => createNote(note, index))}

      {/* Show lines for note alignment */}
      {Array.from({ length: KEY_COUNT }).map((_, idx) => (
        <div
          key={idx}
          className="absolute border-r border-neutral-800"
          style={{
            left: idx * KEY_WIDTH,
            width: KEY_WIDTH,
            height: dimensions.height,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}
