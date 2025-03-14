"use client";

import Track from "@/components/track";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import PlaySVG from "@/assets/play"
import ForwardSVG from "@/assets/forward"
import PauseSVG from "@/assets/pause"
import BackwardSVG from "@/assets/backward";
import ListSVG from "@/assets/list"
import MenuSVG from "@/assets/menu"
import Link from "next/link";
import { WaveformHighlight } from "@/components/waveformHighlight";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import EditorNav from "@/components/editor-nav";


interface TrackState {
    ws: any;
    volume: number;
}

export default function Home() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackStates, setTrackStates] = useState<Record<number, TrackState>>({});
    const [currentTime, setCurrentTime] = useState(0);
    const [selected, setSelected] = useState(false);

    // Prevent feedback loop
    const isSeekingRef = useRef(false);
    const [focused, setFocused] = useState<number | null>(null);

    // This is all for highlighting a section
    const MINWIDTH = 5;
    const [isSelecting, setIsSelecting] = useState(false);
    const [start, setStart] = useState<number | null>(null);
    const [end, setEnd] = useState<number | null>(null);
    const [waveformWidth, setWaveformWidth] = useState(0);
    const [trackLength, setTrackLength] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [waveformOffset, setWaveformOffset] = useState(0);
    
    // Highlighting using buttons
    const [manualSelecting, setManualSelecting] = useState(false);

    // Enable looping of highlighted section
    const [looping, setLooping] = useState(false);

    const PROJECTNAME = "Untitled Project" // TODO HOOK UP TO BACKEND
    const FILENAME = "this_is_a_filler_file_name.mp3" // TODO HOOK UP TO BACKEND

    useEffect(() => {
        if (containerRef.current && wrapperRef.current) {
          const containerRect = wrapperRef.current?.getBoundingClientRect();
          const waveformRect = containerRef.current.getBoundingClientRect();
          setWaveformOffset(waveformRect.left - containerRect.left);
          setWaveformWidth(waveformRect.width);
        }
    }, [containerRef.current, wrapperRef.current, waveformWidth]);

    const registerWaveSurfer = (id: number, ws: any) => {
        setTrackLength(ws.getDuration())
        setTrackStates((prev: Record<number, TrackState>) => {
            return {
                ...prev,
                [id]: {ws, volume: 1}
            }
        })
    };

    const updateTrackVolume = (id:number, newVolume: number) => {
        if(focused != null && focused != id) {
            setFocusedLayer(null);
        }

        setTrackStates((prev: Record<number, TrackState>) => {
            const track = prev[id]
            if(track && track.ws) {
                track.ws.setVolume(newVolume);
            }
            return {
                ...prev, 
                [id]: {...track, volume: newVolume}
            }
        })
    }

    const setFocusedLayer = (setId: number | null) => {
        if(setId == null) {
            Object.values(trackStates).forEach((trackState) => {
                if (trackState.ws) trackState.ws.setVolume(trackState.volume);
            });
        }
        else {
            Object.entries(trackStates).forEach(([id, trackState])=> {
                if(setId != Number(id) && trackState.ws) {
                    trackState.ws.setVolume(0);
                }
                else {
                    trackState.ws.setVolume(trackState.volume)
                }
            })
        }

        setFocused(setId);
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if(manualSelecting || selected) return;
        if (!containerRef.current) return;

        // if you're wondering, chatgpt cooked up this shit
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const timePerPixel = trackLength / rect.width; // seconds per pixel
        
        const computedTime = clickX * timePerPixel;
        const clampedTime = Math.max(0, Math.min(computedTime, trackLength));

        setStart(clampedTime);
        setEnd(null);
        setWaveformWidth(rect.width);
        setIsSelecting(true);
    };
      
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if(manualSelecting || selected) return;
        if (!isSelecting || !containerRef.current) return;

        // if you're wondering, I cooked up this shit
        const rect = containerRef.current.getBoundingClientRect();
        const moveX = e.clientX - rect.left;
        const timePerPixel = trackLength / rect.width;
        const computedTime = moveX * timePerPixel;
        const clampedTime = Math.max(0, Math.min(computedTime, trackLength));
        setEnd(clampedTime);
    };
    
    const handleMouseUp = () => {
        if(manualSelecting || selected) return;
        if (!isSelecting) return;
        if(start){
            // requestAnimationFrame(()=> {
            //     requestAnimationFrame(()=> {
            //         seekAll(start)
            //     })
                
            // })
            setTimeout(()=> {
                seekAll(start)
            }, 50)
        } 
        setIsSelecting(false);
        
        if(end && start && Math.abs(start-end) > MINWIDTH) {
            setSelected(true)
        }
    };

    const selectStart = () => {
        setManualSelecting(true);
        setSelected(false);
        
        // Pick an arbitrary track (they should be in sync) to get the current time
        const ws = Object.values(trackStates).find(({ ws }) => ws)?.ws;
        if (ws) {
            setStart(ws.getCurrentTime());
            setEnd(null)
        }
    };
      
    const selectEnd = () => {
        if (!containerRef.current) return;
        setManualSelecting(false);

        const ws = Object.values(trackStates).find(({ ws }) => ws)?.ws;
            if (ws) {
                setEnd(ws.getCurrentTime());
            }

            const rect = containerRef.current.getBoundingClientRect();
            setWaveformWidth(rect.width);

        if(end != null && start && Math.abs(start-end) > MINWIDTH) {
            
            setSelected(true)
        }
    };

    const onTimeUpdate = (e: any) => {
        var curr = e.media.currentTime
        if(manualSelecting == true) {
            setEnd(curr)
        }

        setCurrentTime(curr)

        // TODO: implement looping toggle
        if(looping) {
            const newTime = e.media.currentTime;
            if(start && end) {
                if(end > start && newTime > end) seekAll(start)
                if(start > end && newTime > start) seekAll(end)
            }
        }
        
    }

    const handleRightClick = (e: any) => {
        e.preventDefault();
        setStart(null)
        setEnd(null)
        setSelected(false)
    }

    const seekAll = (time: number) => {
        if (isSeekingRef.current) return;
        isSeekingRef.current = true;

        Object.values(trackStates).forEach(({ ws }) => {
            if (ws) ws.setTime(time);
        });

        requestAnimationFrame(()=> {
            isSeekingRef.current = false;
        })
    }

    // Seeking with one wavesurfer seeks for all instances
    const onUniversalSeek = useCallback((e: any) => {
        const newTime = e.media.currentTime;
        seekAll(newTime)
        
    }, [trackStates]);

    // Control play/pause for all tracks
    const onUniversalPlayPause = () => {
        Object.values(trackStates).forEach(({ ws }) => {
            if (ws) ws.playPause();
        });
        setIsPlaying((prev) => !prev);
    };

    const onUniversalSkipForward = () => {
        const anyWs = Object.values(trackStates).find(({ ws }) => ws)?.ws;
        if (anyWs) {
            const newTime = anyWs.getCurrentTime() + 5;
            Object.values(trackStates).forEach(({ ws }) => {
                if (ws) ws.setTime(newTime);
            });
        }
    };

    const onUniversalSkipBackward = () => {
        const anyWs = Object.values(trackStates).find(({ ws }) => ws)?.ws;
        if (anyWs) {
            const newTime = anyWs.getCurrentTime() - 5;
            Object.values(trackStates).forEach(({ ws }) => {
                if (ws) ws.setTime(newTime);
            });
        }
    };
    

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
  }, [trackStates]);

  return (
  <section>
        <div className="w-screen flex h-screen bg-black">
            <div className="flex flex-col justify-center w-full h-full">
                
                <EditorNav></EditorNav>

                <div className="mt-20 mb-3 flex w-full justify-center">
                    <div className="container lg:px-5 px-3">
                        <div className=" flex gap-3 place-items-baseline">
                            <p className="text-3xl lg:text-4xl font-semibold text-white truncate">
                                {PROJECTNAME}
                            </p>
                            <p className="text-base text-neutral-400 truncate">
                                / {FILENAME}
                            </p>
                        </div>
                    </div>
                </div>

                {/* TRACK CONTAINER THING -- IT RESIZES */}
                <div className="flex w-full justify-center overflow-x-hidden">
                    <div ref={wrapperRef} className="container mx-3">
                        <div
                        onContextMenuCapture={(e)=>{handleRightClick(e)}}
                        onPointerDownCapture={handleMouseDown} 
                        onPointerMoveCapture={handleMouseMove} 
                        onPointerUpCapture={handleMouseUp} 
                        onMouseLeave={handleMouseUp}
                        className="relative flex flex-col gap-3 border border-neutral-700 rounded-lg lg:gap-6 lg:p-5 p-3">
                            
                            <WaveformHighlight
                                containerRef={containerRef.current} // reads container ref
                                start={start}
                                end={end}
                                trackLength={trackLength}
                                waveformWidth={waveformWidth}
                                waveformOffset={waveformOffset}
                                minWidth={MINWIDTH}
                            />
                            
                            <Track
                                id={1}
                                className="border-red-400 shadow-[0px_0px_50px_#fb2c3633]"
                                fileUrl="/vocals.wav"
                                trackName="Vocal"
                                waveColor="#fb2c36"
                                registerWaveSurfer={registerWaveSurfer}
                                onUniversalSeek={onUniversalSeek}
                                setIsPlaying={setIsPlaying}
                                volume={trackStates[1] ? trackStates[1].volume : 1}
                                updateVolume={(updateTrackVolume)}
                                focused={focused}
                                setFocused={setFocusedLayer}
                                waveformContainerRef={containerRef} // Sets container ref on the waveform
                                onTimeUpdate={onTimeUpdate}
                            />
                            <Track
                                id={2}
                                className="border-yellow-400 shadow-[0px_0px_50px_#efb10033]"
                                fileUrl="/drums.wav"
                                trackName="Drums"
                                waveColor="#efb100"
                                registerWaveSurfer={registerWaveSurfer}
                                onUniversalSeek={onUniversalSeek}
                                setIsPlaying={setIsPlaying}
                                volume={trackStates[2] ? trackStates[2].volume : 1}
                                updateVolume={(updateTrackVolume)}
                                focused={focused}
                                setFocused={setFocusedLayer}
                                onTimeUpdate={onTimeUpdate}
                            />
                            <Track
                                id={3}
                                className="border-lime-400 shadow-[0px_0px_50px_#7ccf0033]"
                                fileUrl="/bass.wav"
                                trackName="Bass"
                                waveColor="#7ccf00"
                                registerWaveSurfer={registerWaveSurfer}
                                onUniversalSeek={onUniversalSeek}
                                setIsPlaying={setIsPlaying}
                                volume={trackStates[3] ? trackStates[3].volume : 1}
                                updateVolume={(updateTrackVolume)}
                                focused={focused}
                                setFocused={setFocusedLayer}
                                onTimeUpdate={onTimeUpdate}
                            />
                            <Track
                                id={4}
                                className="border-teal-400 shadow-[0px_0px_50px_#00bba733]"
                                fileUrl="/other.wav"
                                trackName="Guitar"
                                waveColor="#00bba7"
                                registerWaveSurfer={registerWaveSurfer}
                                onUniversalSeek={onUniversalSeek}
                                setIsPlaying={setIsPlaying}
                                volume={trackStates[4] ? trackStates[4].volume : 1}
                                updateVolume={(updateTrackVolume)}
                                focused={focused}
                                setFocused={setFocusedLayer}
                                onTimeUpdate={onTimeUpdate}
                            />
                            <Track
                                id={5}
                                className="border-red-400 shadow-[0px_0px_50px_#fb2c3633]"
                                fileUrl="/vocals.wav"
                                trackName="Vocal"
                                waveColor="#fb2c36"
                                registerWaveSurfer={registerWaveSurfer}
                                onUniversalSeek={onUniversalSeek}
                                setIsPlaying={setIsPlaying}
                                volume={trackStates[5] ? trackStates[5].volume : 1}
                                updateVolume={(updateTrackVolume)}
                                focused={focused}
                                setFocused={setFocusedLayer}
                                onTimeUpdate={onTimeUpdate}
                            />
                            <Track
                                id={6}
                                className="border-yellow-400 shadow-[0px_0px_50px_#efb10033]"
                                fileUrl="/drums.wav"
                                trackName="Drums"
                                waveColor="#efb100"
                                registerWaveSurfer={registerWaveSurfer}
                                onUniversalSeek={onUniversalSeek}
                                setIsPlaying={setIsPlaying}
                                volume={trackStates[6] ? trackStates[6].volume : 1}
                                updateVolume={(updateTrackVolume)}
                                focused={focused}
                                setFocused={setFocusedLayer}
                                onTimeUpdate={onTimeUpdate}
                            />
                           
                        </div>
                    </div>
                </div>

                <p className="text-white">
                    {(currentTime/3600).toFixed(0).padStart(2, '0') != "00" && `${(currentTime/3600).toFixed(0).padStart(2, '0')}:`}
                    {((currentTime % 3600) / 60).toFixed(0).padStart(2, '0')}: 
                    {(currentTime % 60).toFixed(0).padStart(2, '0')}
                </p>

                {/* TOOLBAR */}
                <div className=" flex w-full justify-center mb-5">
                    <div className="container lg:px-5 px-3">
                        <div className="border-b border-neutral-700 py-1 w-full min-h-7 flex justify-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="w-7 h-7 group"
                                            // TODO: On click
                                        >
                                            <MenuSVG className="invert-0 group-hover:invert" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Icon</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button 
                                            size="icon" 
                                            variant={manualSelecting ? "secondary" :"ghost"} 
                                            className="w-7 h-7 group"
                                            onClick={selectStart}
                                        >
                                            [
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Select Start</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="w-7 h-7 group"
                                            onClick={onUniversalSkipBackward}
                                        >
                                            <BackwardSVG className="invert-0 group-hover:invert"/>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Seek Forward (Left Arrow)</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="w-7 h-7 group"
                                            onClick={onUniversalPlayPause}
                                        >
                                            {isPlaying===true ? <PauseSVG className="invert-0 group-hover:invert" /> 
                                            : <PlaySVG className="invert-0 group-hover:invert"/>}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Play/Pause (Space)</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="w-7 h-7 group"
                                            onClick={onUniversalSkipForward}
                                        >
                                            <ForwardSVG className="invert-0 group-hover:invert" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Seek Forward (Right Arrow)</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button 
                                            size="icon" 
                                            variant={manualSelecting ? "secondary" : "ghost"} 
                                            className="w-7 h-7 group"
                                            onClick={selectEnd}
                                        >
                                            ]
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Select End</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Button 
                                size="icon" 
                                variant={looping ? "secondary" : "ghost"} 
                                className="w-7 h-7 group"
                                onClick={()=>setLooping((prev)=>!prev)}
                            >
                                <ListSVG className="invert-0 group-hover:invert" />
                            </Button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
