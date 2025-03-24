"use client"
import { useEffect, useRef, useState } from "react";

function isBlackKey(midi: number): boolean {
    const mod = midi % 12;
    // Black keys are C#, D#, F#, G#, A#
    return [1, 3, 6, 8, 10].includes(mod);
}

export default function Piano({notes, isFullPiano} : {notes: Set<string>, isFullPiano: boolean} ) {
    // init constants
    const MIN_MIDI = isFullPiano ? 21 : 36;
    const MAX_MIDI = isFullPiano ? 108 : 96;
    const KEY_COUNT = MAX_MIDI - MIN_MIDI + 1;

    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0 });
    
    // Encode:
    // ${note.name}-${note.time}-${note.duration}-${note.midi}
    const activeMidis: Set<number> = new Set(
        Array.from(notes).map(encodedNote => Number(encodedNote.split("-")[3]))
      );
    const KEY_WIDTH = dimensions.width / KEY_COUNT;


    const getKeyColor = (midi: number) => {
        const baseColor = isBlackKey(midi) ? "#000" : "#fff";
        if (activeMidis.has(midi)) {
            // Apply a semi-transparent blue overlay
            return `linear-gradient(rgba(0, 0, 255, 0.5), rgba(0, 0, 255, 0.3)), ${baseColor}`;
        }
        return baseColor;
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
    className="relative"
    style={{ width: "100%", height: "100%" }}>
        {Array.from({ length: KEY_COUNT }, (_, idx) => {
        const midi = MIN_MIDI + idx;
        return (
          <div
            key={midi}
            className="absolute h-full border-black border rounded-sm"
            style={{
              left: idx * KEY_WIDTH,
              width: KEY_WIDTH,
              pointerEvents: "none",
              background: getKeyColor(midi)
            }}
          />
        );
      })}
    </div>    
}