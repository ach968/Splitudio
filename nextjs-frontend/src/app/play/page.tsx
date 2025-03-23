"use client"

import { useEffect } from "react";
import MidiPlayer from "midi-player-js"

export default function MidiTestPage() {
    // useEffect(() => {
    //     // Check if we're in the browser
    //     if (typeof window !== "undefined") {
    //       // Override the loadFile method to fetch the MIDI file
    //       MidiPlayer.Player.prototype.loadFile = function (url: string) {
    //         fetch(url)
    //           .then((res) => res.arrayBuffer())
    //           .then((arrayBuffer) => {
    //             // Create a Uint8Array from the ArrayBuffer.
    //             // MidiPlayerJS expects a Node Buffer; this may be enough,
    //             // but if not, you could consider using a polyfill for Buffer.
    //             this.buffer = new Uint8Array(arrayBuffer);
    //             // Call fileLoaded so that playback can continue.
    //             this.fileLoaded();
    //           })
    //           .catch((error) => {
    //             console.error("Failed to load MIDI file:", error);
    //           });
    //       };
    //     }
    // }, []);

    useEffect(() => {
        // Create a new MidiPlayer instance with an event callback
        const player = new MidiPlayer.Player((event:any) => {
            console.log("MIDI event:", event);
        });
      
        // Load a MIDI file from the public folder (adjust the path as needed)
        //   player.loadFile("/sample.mid");
        fetch("/AM_I_BLUE_AB.mid")
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
            player.loadArrayBuffer(arrayBuffer);
            const events = player.dryRun();
            console.log(events)
        })
        .catch((error) => {
            console.error("Failed to load MIDI file:", error);
        });
        
        // Cleanup: stop the player on component unmount
        return () => {
            player.stop();
        };
    }, []);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-2xl font-bold">MidiPlayerJS Test</h1>
        <p>Check the console for MIDI events in JSON format.</p>
      </div>
    );
  }