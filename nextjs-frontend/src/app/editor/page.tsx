"use client";
import Image from "next/image";
import WavesurferPlayer, { WavesurferProps } from "@wavesurfer/react";
import Track from "@/components/track";
import { useState, useEffect } from "react";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
export default function Home() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [waveSurfers, setWaveSurfers] = useState<any[]>([]);
    // Prevent feedback loop
    const [isSeeking, setIsSeeking] = useState(false);

    // Callback to register each track's wavesurfer instance
    const registerWaveSurfer = (ws: any) => {
        setWaveSurfers((prev) => [...prev, ws]);
    };

    // Seeking with one wavesurfer seeks for all instances
    const onUniversalSeek = (e: any) => {
        if (isSeeking) return;

        setIsSeeking(true);
        const newTime = e.media.currentTime;
        waveSurfers.forEach((ws) => ws.setTime(newTime));

        setTimeout(() => {
        setIsSeeking(false);
        }, 100);
    };

    // Control play/pause for all wavesurfers
    const onUniversalPlayPause = () => {
        waveSurfers.forEach((ws) => ws.playPause());
        setIsPlaying((prev) => !prev);
    };

    const onUniversalSkipForward = () => {
        const newTime = waveSurfers[0].getCurrentTime() + 5;
        waveSurfers.forEach((ws) => ws.setTime(newTime));
    } 

    const onUniversalSkipBackward = () => {
        const newTime = waveSurfers[0].getCurrentTime() - 5;
        waveSurfers.forEach((ws) => ws.setTime(newTime));
    }

    useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.keyCode === 32) {
            e.preventDefault();
            onUniversalPlayPause();
        }
        else if(e.keyCode === 37) {
            e.preventDefault();
            onUniversalSkipBackward();
        }
        else if(e.keyCode === 39) {
            e.preventDefault();
            onUniversalSkipForward();
        }
        
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [waveSurfers]);

  return (
  <section>
        <div className="w-screen flex h-screen bg-black">
            <div className="flex flex-col justify-center relative w-full h-full">

                {/* TRACK CONTAINER THING -- IT RESIZES */}
                <div className="flex w-full justify-center overflow-x-hidden">
                    <div className="container lg:p-5 p-3">
                        <div className="flex flex-col gap-5 border border-gray-700 rounded-lg lg:gap-7 lg:p-5 p-3">
                            <Track
                                className="border-red-400 shadow-[0px_0px_50px_#fb2c3655]"
                                fileUrl="/vocals.wav"
                                trackName="Vocal"
                                waveColor="#fb2c36"
                                registerWaveSurfer={registerWaveSurfer}
                                onUniversalSeek={onUniversalSeek}
                                setIsPlaying={setIsPlaying}
                            />
                            <Track
                                className="border-yellow-400 shadow-[0px_0px_50px_#efb10055]"
                                fileUrl="/drums.wav"
                                trackName="Drums"
                                waveColor="#efb100"
                                registerWaveSurfer={registerWaveSurfer}
                                onUniversalSeek={onUniversalSeek}
                                setIsPlaying={setIsPlaying}
                            />
                            <Track
                                className="border-lime-400 shadow-[0px_0px_50px_#7ccf0055]"
                                fileUrl="/bass.wav"
                                trackName="Bass"
                                waveColor="#7ccf00"
                                registerWaveSurfer={registerWaveSurfer}
                                onUniversalSeek={onUniversalSeek}
                                setIsPlaying={setIsPlaying}
                            />
                            <Track
                                className="border-teal-400 shadow-[0px_0px_50px_#00bba755]"
                                fileUrl="/other.wav"
                                trackName="Guitar"
                                waveColor="#00bba7"
                                registerWaveSurfer={registerWaveSurfer}
                                onUniversalSeek={onUniversalSeek}
                                setIsPlaying={setIsPlaying}
                            />
                            <Track
                                className="border-red-400 shadow-[0px_0px_50px_#fb2c3655]"
                                fileUrl="/vocals.wav"
                                trackName="Vocal"
                                waveColor="#fb2c36"
                                registerWaveSurfer={registerWaveSurfer}
                                onUniversalSeek={onUniversalSeek}
                                setIsPlaying={setIsPlaying}
                            />
                            <Track
                                className="border-yellow-400 shadow-[0px_0px_50px_#efb10055]"
                                fileUrl="/drums.wav"
                                trackName="Drums"
                                waveColor="#efb100"
                                registerWaveSurfer={registerWaveSurfer}
                                onUniversalSeek={onUniversalSeek}
                                setIsPlaying={setIsPlaying}
                            />
                        </div>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className=" flex w-full justify-center mb-20">
                    <div className="container lg:px-5 px-3">
                        <div className="border-b border-t border-gray-700 py-1 w-full min-h-7 flex justify-center gap-2">
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="w-7 h-7"
                                onClick={onUniversalSkipBackward}>{"<"}</Button>
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="w-7 h-7"
                                onClick={onUniversalPlayPause}
                            >{isPlaying===true ? "||" : "PLAY"}</Button>
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="w-7 h-7"
                                onClick={onUniversalSkipForward}>{">"}</Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>
  );
}
