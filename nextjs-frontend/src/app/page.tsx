'use client'
import Image from "next/image";
import WavesurferPlayer, { WavesurferProps } from '@wavesurfer/react'
import Track from "@/components/track";
import { useState } from "react";
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
    waveSurfers.forEach(ws => ws.setTime(newTime));

    setTimeout(() => {
      setIsSeeking(false);
    }, 100);
  }

  // Control play/pause for all wavesurfers
  const onUniversalPlayPause = () => {
    waveSurfers.forEach(ws => ws.playPause()); 
    setIsPlaying(!isPlaying);
  };

  return <section>
    {/* Universal Play/Pause Button */}
    <div className="my-4">
      <button 
        onClick={onUniversalPlayPause}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        {isPlaying ? 'Pause All' : 'Play All'}
      </button>
    </div>
    <div className="flex justify-center items-center">
      <div className="container">
        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <Track className="bg-red-700 w-full" fileUrl="/vocals.wav" trackName="Milabo" waveColor="White" registerWaveSurfer={registerWaveSurfer} onUniversalSeek={onUniversalSeek}></Track>
          </div>
          <div className="flex justify-center">
            <Track className="bg-blue-700 w-full" fileUrl="/drums.wav" trackName="Milabo" waveColor="White" registerWaveSurfer={registerWaveSurfer} onUniversalSeek={onUniversalSeek}></Track>
          </div>
          <div className="flex justify-center">
            <Track className="bg-green-700 w-full" fileUrl="/bass.wav" trackName="Milabo" waveColor="White" registerWaveSurfer={registerWaveSurfer} onUniversalSeek={onUniversalSeek}></Track>
          </div>
          <div className="flex justify-center">
            <Track className="bg-yellow-700 w-full" fileUrl="/other.wav" trackName="Milabo" waveColor="White" registerWaveSurfer={registerWaveSurfer} onUniversalSeek={onUniversalSeek}></Track>
          </div>
        </div>
      </div>
    </div>
    
    
    
  </section>
}
