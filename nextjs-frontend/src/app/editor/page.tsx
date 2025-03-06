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

                <div className="border border-white absolute top-0 w-full h-[300px]"></div>

                <div className="container">
                    <div className="flex flex-col gap-6 mx-10">
                        <Track
                            className="border-[#f72a66] shadow-[0px_0px_50px_#bb637d85]"
                            fileUrl="/vocals.wav"
                            trackName="Vocal"
                            waveColor="#f72a66"
                            registerWaveSurfer={registerWaveSurfer}
                            onUniversalSeek={onUniversalSeek}
                            setIsPlaying={setIsPlaying}
                        />
                        <Track
                            className="border-[#72DDF7] shadow-[0px_0px_50px_#72DDF755]"
                            fileUrl="/drums.wav"
                            trackName="Drums"
                            waveColor="#72DDF7"
                            registerWaveSurfer={registerWaveSurfer}
                            onUniversalSeek={onUniversalSeek}
                            setIsPlaying={setIsPlaying}
                        />
                        <Track
                            className="border-[#0bff00] shadow-[0px_0px_50px_#0bff0055]"
                            fileUrl="/bass.wav"
                            trackName="Bass"
                            waveColor="#0bff00"
                            registerWaveSurfer={registerWaveSurfer}
                            onUniversalSeek={onUniversalSeek}
                            setIsPlaying={setIsPlaying}
                        />
                        <Track
                            className="border-[#ffac00] shadow-[0px_0px_50px_#ffac0055]"
                            fileUrl="/other.wav"
                            trackName="Guitar"
                            waveColor="#ff9900"
                            registerWaveSurfer={registerWaveSurfer}
                            onUniversalSeek={onUniversalSeek}
                            setIsPlaying={setIsPlaying}
                        />
                    </div>
                </div>

                <div className="border-t-2 border-gray-500 absolute bottom-0 w-full h-[300px]"></div>

            </div>
        </div>
    </section>
  );
}
