import WavesurferPlayer, { WavesurferProps } from '@wavesurfer/react'
import { useState } from 'react';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { twMerge } from 'tailwind-merge';
import SheetMusic from '@/assets/sheet-music'
import MusicNote from '@/assets/music-note'
interface TrackProps {
    fileUrl: string;
    waveColor: string;
    trackName: string;
    className: string;
    onUniversalSeek: (time: number) => void;
    registerWaveSurfer: (ws: any) => void;
    setIsPlaying: (status: any) => void;
}

export default function Track({ fileUrl, waveColor, trackName, className, registerWaveSurfer, onUniversalSeek, setIsPlaying} : TrackProps) {

    const [wavesurfer, setWavesurfer] = useState<any>(null);
    const [volume, setVolume] = useState(1);

    const onReady = (ws: any) => {
        setWavesurfer(ws);
        ws.setVolume(volume);
        registerWaveSurfer(ws);
    };
  
    const onVolumeChange = (e: Number) => {
        const newVolume = Number(e)
        setVolume(newVolume);
        console.log(volume)
        wavesurfer && wavesurfer.setVolume(newVolume);
    };
  
    return (
    <div className={twMerge(className, volume == 0 && "filter brightness-50", "bg-gray-950 w-full border-2 p-2 lg:p-4 rounded-md lg:rounded-xl")}>

        <div className="flex items-center">
            {/* Left cluster */}
            <div className="mr-4 flex flex-col gap-3 items-center">
                <p className="select-none text-white font-bold text-md">
                    {trackName}
                </p>
                <Slider
                    defaultValue={[1]}
                    max={1}
                    step={0.01}
                    className='w-20'
                    onValueChange={(e)=>onVolumeChange(e[0])}
                    value={[volume]}
                />
                <Button size="icon" className="select-none w-7 h-7" variant={volume==0 ? "destructive" : "outline"} onClick={()=>{volume==0 ? onVolumeChange(1) : onVolumeChange(0)}}>M</Button>
            </div>
    
            {/* Waveform Display */}
            <div className="flex-grow">
                <WavesurferPlayer
                    height={70}
                    progressColor={waveColor}
                    waveColor="White"
                    url={fileUrl}
                    onFinish={()=>setIsPlaying(false)}
                    onReady={onReady}
                    onSeeking={(e: any)=> onUniversalSeek(e)}
                />
            </div>
    
            {/* Action Buttons */}
            <div className="ml-4 flex flex-col gap-2">
                <Button size="icon" className="w-9 h-9 rounded-full group" variant='outline' >
                    <SheetMusic className="invert-0 group-hover:invert" />
                </Button>
                <Button size="icon" className="w-9 h-9 rounded-full group" variant="outline">
                    <MusicNote className="invert-0 group-hover:invert" />
                </Button>
            </div>
        </div>
    </div>
    );
  }