"use client";
import Image from "next/image";
import WavesurferPlayer, { WavesurferProps } from "@wavesurfer/react";
import Track from "@/components/track";
import { useState, useEffect } from "react";
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

    useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.keyCode === 32) {
            e.preventDefault();
            onUniversalPlayPause();
        }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [waveSurfers]);

  return (
  <section className="w-screen h-screen bg-black">
        <div className="relative flex h-screen">
            <div className="flex flex-col justify-center items-center w-full h-full">
                <div className="container border border-gray-300 overflow-x-hidden ">
                    <div className="flex flex-col gap-5 md:gap-6 mx-10 my-10">
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
                    </div>
                </div>

                <div className="border-t-2 border-gray-500 bottom-0 w-full h-[100px]"></div>

            </div>
        </div>
    </section>
  );
}
