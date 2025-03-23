"use client";

import { useState } from "react";

// Dummy MIDI data following the Tone.js JSON layout
const midiData = {
  header: {
    name: "Test Song",
    tempos: [{ time: 0, bpm: 120 }],
    timeSignatures: [{ time: 0, numerator: 4, denominator: 4 }],
    PPQ: 480,
  },
  duration: 120, // total duration in seconds
  tracks: [
    {
      name: "Piano",
      channel: 1,
      notes: [
        { midi: 60, time: 1.2, ticks: 576, name: "C4", pitch: "C", octave: 4, velocity: 0.8, duration: 0.5 },
        { midi: 62, time: 2.0, ticks: 960, name: "D4", pitch: "D", octave: 4, velocity: 0.7, duration: 0.7 },
        { midi: 64, time: 3.5, ticks: 1680, name: "E4", pitch: "E", octave: 4, velocity: 0.9, duration: 1.0 },
        { midi: 67, time: 4.2, ticks: 2016, name: "G4", pitch: "G", octave: 4, velocity: 0.8, duration: 0.8 },
      ],
      controlChanges: {},
      instrument: { number: 1, family: "piano", name: "Acoustic Grand Piano", percussion: false },
    },
  ],
};

// This component displays all notes that start between `windowStart` and `windowStart + windowDuration`
function NoteWindow({ windowStart, windowDuration = 3 }: { windowStart: number; windowDuration?: number }) {
  const windowEnd = windowStart + windowDuration;

  // For each track, filter out the notes that start in our time window.
  const notes = midiData.tracks.flatMap(track =>
    track.notes.filter(note => 
        // Check if [note.time,note.time+note.duration] overlaps with [windowStart,windowEnd]
        (note.time + note.duration > windowStart) && (note.time < windowEnd)
    )
  );

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg mt-4">
      <h2 className="text-xl mb-2">
        Notes from {windowStart.toFixed(2)}s to {windowEnd.toFixed(2)}s
      </h2>
      {notes.length === 0 ? (
        <p>No notes in this window.</p>
      ) : (
        <ul className="list-disc ml-4">
          {notes.map((note, index) => (
            <li key={index}>
              {note.name} (MIDI: {note.midi}) – starts at {note.time.toFixed(2)}s, duration {note.duration.toFixed(2)}s
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MidiWindowDemo() {
  const [currentTime, setCurrentTime] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl mb-4">MIDI Note Window Demo</h1>
      <div>
        <label htmlFor="timeSlider" className="block mb-2">
          Current Time: {currentTime.toFixed(2)}s
        </label>
        <input
          type="range"
          id="timeSlider"
          min="0"
          max={midiData.duration}
          step="0.01"
          value={currentTime}
          onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      <NoteWindow windowStart={currentTime} windowDuration={3} />
    </div>
  );
}
