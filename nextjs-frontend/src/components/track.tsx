import WavesurferPlayer, { WavesurferProps } from '@wavesurfer/react'
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface TrackProps {
    fileUrl: string;
    waveColor: string;
    trackName: string;
    className: string;
    onUniversalSeek: (time: number) => void;
    registerWaveSurfer: (ws: any) => void;
}

export default function Track({ fileUrl, waveColor, trackName, className, registerWaveSurfer, onUniversalSeek} : TrackProps) {

    const [wavesurfer, setWavesurfer] = useState<any>(null);
    const [volume, setVolume] = useState(1);

    const onReady = (ws: any) => {
        setWavesurfer(ws);
        ws.setVolume(volume);
        registerWaveSurfer(ws);
    };
  
    const onVolumeChange = (e: any) => {
        const newVolume = Number(e.target.value);
        setVolume(newVolume);
        wavesurfer && wavesurfer.setVolume(newVolume);
    };
  
    return (
      <div className={twMerge(className, " p-4 rounded-xl flex items-center")}>
        {/* Volume Control */}
        <div className="mr-4">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={onVolumeChange}
            className="w-20 accent-black"
          />
        </div>
  
        {/* Waveform Display */}
        <div className="flex-grow">
          <WavesurferPlayer
            height={100}
            progressColor={"black"}
            waveColor={waveColor}
            url={fileUrl}
            onReady={onReady}
            onSeeking={(e: any)=> onUniversalSeek(e)}
          />
        </div>
  
        {/* Action Buttons */}
        <div className="ml-4 flex flex-col space-y-2">
          <button className="bg-black text-white py-1 px-2 rounded ">
            Get Sheet Music
          </button>
          <button className="bg-black text-white py-1 px-2 rounded">
            Download MP3
          </button>
        </div>
      </div>
    );
  }