"use client";

import Track from "@/components/track";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import PlaySVG from "@/assets/play";
import ForwardSVG from "@/assets/forward";
import PauseSVG from "@/assets/pause";
import BackwardSVG from "@/assets/backward";
import BracketLeftSVG from "@/assets/bracket-left";
import BracketRightSVG from "@/assets/bracket-right";
import SettingsSVG from "@/assets/settings";
import LoopSVG from "@/assets/loop";

import { WaveformHighlight } from "@/components/waveformHighlight";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EditorNav from "@/components/editor-nav";
import { Project, Track as TrackInterface } from "@/types/firestore";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Link } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TrackState {
  ws: any;
  volume: number;
}

const trackList = [
  {
    trackName: "Vocals",
    waveColor: "#fb2c36",
    className: "border-red-400 shadow-[0px_0px_50px_#fb2c3633]",
  },
  {
    trackName: "Piano",
    waveColor: "#f97316",
    className: "border-orange-500 shadow-[0px_0px_50px_#f9731633]",
  },
  {
    trackName: "Guitar",
    waveColor: "#facc15",
    className: "border-yellow-400 shadow-[0px_0px_50px_#facc1533]",
  },
  {
    trackName: "Bass",
    waveColor: "#4ade80",
    className: "border-green-400 shadow-[0px_0px_50px_#4ade8033]",
  },
  {
    trackName: "Drums",
    waveColor: "#60a5fa",
    className: "border-blue-400 shadow-[0px_0px_50px_#60a5fa33]",
  },
  {
    trackName: "Other",
    waveColor: "#a78bfa",
    className: "border-violet-400 shadow-[0px_0px_50px_#a78bfa33]",
  },
];

export default function Editor({project, tracks} : {project: Project, tracks: TrackInterface[]}) {

  const [isPlaying, setIsPlaying] = useState(false);
  const [trackStates, setTrackStates] = useState<Record<string, TrackState>>({});
  const [currentTime, setCurrentTime] = useState(0);
  const [selected, setSelected] = useState(false);

  // Prevent feedback loop
  const isSeekingRef = useRef(false);
  const lastSeekTimeRef = useRef<number | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  // This is all for highlighting a section
  const MINWIDTH = 1;
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

  const projectId = project.pid;
  const PROJECTNAME = project.pName;
  const FILENAME = project.fileName;
  
  useEffect(() => {
    if (containerRef.current && wrapperRef.current) {
      const containerRect = wrapperRef.current?.getBoundingClientRect();
      const waveformRect = containerRef.current.getBoundingClientRect();
      setWaveformOffset(waveformRect.left - containerRect.left);
      setWaveformWidth(waveformRect.width);
    }
  }, [containerRef.current, wrapperRef.current, waveformWidth]);

  const registerWaveSurfer = (id: string, ws: any) => {
    setTrackLength(ws.getDuration());
    setTrackStates((prev: Record<string, TrackState>) => {
      return {
        ...prev,
        [id]: { ws, volume: 1 },
      };
    });
  };

  async function downloadOriginalMp3() {
    try {
      const res = await fetch(`/api/audio?projectId=${encodeURIComponent(projectId)}`, {
        method: 'GET',
      });
  
      if (!res.ok) throw new Error('Failed to fetch audio');
  
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
  
      const a = document.createElement('a');
      a.href = url;
      a.download = `${PROJECTNAME}.mp3`;
      a.click();
      
    } catch (error) {
      toast({title: "Download failed", description: "Something went wrong :/"})
    }
  }

  const updateTrackVolume = (id: string, newVolume: number) => {
    if (focused != null && focused != id) {
      setFocusedLayer(null);
    }

    setTrackStates((prev: Record<string, TrackState>) => {
      const track = prev[id];
      if (track && track.ws) {
        track.ws.setVolume(newVolume);
      }
      return {
        ...prev,
        [id]: { ...track, volume: newVolume },
      };
    });
  };

  const setFocusedLayer = (setId: string | null) => {
    if (setId == null) {
      Object.values(trackStates).forEach((trackState) => {
        if (trackState.ws) trackState.ws.setVolume(trackState.volume);
      });
    } else {
      Object.entries(trackStates).forEach(([id, trackState]) => {
        if (setId != id && trackState.ws) {
          trackState.ws.setVolume(0);
        } else {
          trackState.ws.setVolume(trackState.volume);
        }
      });
    }

    setFocused(setId);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (manualSelecting || selected) return;
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
    if (manualSelecting || selected) return;
    if (!isSelecting || !containerRef.current) return;

    // if you're wondering, I cooked up this shit
    const rect = containerRef.current.getBoundingClientRect();
    const moveX = e.clientX - rect.left;
    const timePerPixel = trackLength / rect.width;
    const computedTime = moveX * timePerPixel;
    if (
      computedTime > trackLength ||
      Math.abs(start! - computedTime) < MINWIDTH
    )
      setEnd(null);
    else setEnd(computedTime);
  };

  const handleMouseUp = () => {
    if (manualSelecting || selected) return;
    if (!isSelecting) return;
    if (start && end) {
      setTimeout(() => {
        seekAll(start, false);
      }, 50);
    }

    setIsSelecting(false);

    if (end && start && Math.abs(start - end) > MINWIDTH) {
      setSelected(true);
    }
  };

  const selectStart = () => {
    setManualSelecting(true);
    setSelected(false);
    setLooping(false);

    // Pick an arbitrary track (they should be in sync) to get the current time
    const ws = Object.values(trackStates).find(({ ws }) => ws)?.ws;
    if (ws) {
      setStart(ws.getCurrentTime());
      setEnd(null);
    }
  };

  const selectEnd = () => {
    if (!containerRef.current) return;

    let newEnd;
    const ws = Object.values(trackStates).find(({ ws }) => ws)?.ws;
    if (ws) {
      newEnd = ws.getCurrentTime();
    }

    if (newEnd && start && Math.abs(start - newEnd) > MINWIDTH) {
      setManualSelecting(false);
      setEnd(ws.getCurrentTime());
      const rect = containerRef.current.getBoundingClientRect();
      setWaveformWidth(rect.width);
      setSelected(true);
    }
  };

  const onTimeUpdate = (e: any) => {
    const curr = e.media.currentTime;
    if (manualSelecting == true) {
      setEnd(curr);
    }

    setCurrentTime(curr);

    if (looping && start !== null && end !== null) {
      const loopStart = Math.min(start, end);
      const loopEnd = Math.max(start, end);

      if (curr >= loopEnd || curr < loopStart) {
        seekAll(loopStart, true);
      }
    }
  };

  // Deselect if there is a selected section
  const handleRightClick = (e: any) => {
    e.preventDefault();
    setStart(null);
    setEnd(null);
    setSelected(false);
  };

  const seekAll = (time: number, important: boolean) => {
    if (
      !important &&
      lastSeekTimeRef.current !== null &&
      Math.abs(time - lastSeekTimeRef.current) < 0.1
    )
      return;
    lastSeekTimeRef.current = time;

    if (isSeekingRef.current) return;
    isSeekingRef.current = true;

    Object.values(trackStates).forEach(({ ws }) => {
      if (ws) ws.setTime(time);
    });

    requestAnimationFrame(() => {
      isSeekingRef.current = false;
    });
  };

  // Seeking with one wavesurfer seeks for all instances
  const onUniversalSeek = useCallback(
    (e: any) => {
      const newTime = e.media.currentTime;

      seekAll(newTime, false);
    },
    [trackStates]
  );

  // Control play/pause for all tracks
  const onUniversalPlayPause = () => {
    Object.values(trackStates).forEach(({ ws }) => {
      if (ws) ws.playPause();
    });
    setIsPlaying((prev) => !prev);
  };

  // When clicking a link, we need to pause before the DOM lets us redirect
  const onUniversalPause = () => {
    Object.values(trackStates).forEach(({ ws }) => {
      if (ws) ws.pause();
    });
    setIsPlaying(false);
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

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return `${hours > 0 ? hours.toString().padStart(2, "0") + ":" : ""}${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.keyCode === 32) {
        e.preventDefault();
        onUniversalPlayPause();
      } else if (e.keyCode === 37) {
        e.preventDefault();
        onUniversalSkipBackward();
      } else if (e.keyCode === 39) {
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
        <div className="flex flex-col justify-start w-full h-full">
          <EditorNav
            projectName={PROJECTNAME}
            projectId={projectId}
          ></EditorNav>

          <div className="mt-20 mb-3 flex w-full justify-center">
            <div className="container px-5">
              <div className=" flex gap-3 place-items-baseline">
                <p
                className="text-2xl lg:text-3xl font-semibold text-white truncate">
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
                onContextMenuCapture={(e) => {
                  handleRightClick(e);
                }}
                onPointerDownCapture={handleMouseDown}
                onPointerMoveCapture={handleMouseMove}
                onPointerUpCapture={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="relative flex flex-col gap-3 border border-neutral-700 rounded-lg lg:gap-6 lg:p-5 p-3"
              >
                <WaveformHighlight
                  containerRef={containerRef.current} // reads container ref
                  start={start}
                  end={end}
                  trackLength={trackLength}
                  waveformWidth={waveformWidth}
                  waveformOffset={waveformOffset}
                  minWidth={MINWIDTH}
                />
                {trackList.map(({ trackName, waveColor, className }) => {
                  const matchedTrack = tracks.find((t) =>
                    t.instrument.toLowerCase() === trackName.toLowerCase() 
                    || t.instrument=='no_vocals' && trackName=='Other' // Weird thing for 2 stem splitting
                  );

                  if (!matchedTrack) return null;

                  return (
                    <Track
                      key={matchedTrack.trackId}
                      projectId={projectId}
                      id={matchedTrack.trackId}
                      className={className}
                      trackName={trackName}
                      waveColor={waveColor}
                      registerWaveSurfer={registerWaveSurfer}
                      onUniversalSeek={onUniversalSeek}
                      setIsPlaying={setIsPlaying}
                      volume={trackStates[matchedTrack.trackId]?.volume ?? 1}
                      updateVolume={updateTrackVolume}
                      focused={focused}
                      setFocused={setFocusedLayer}
                      waveformContainerRef={containerRef}
                      onTimeUpdate={onTimeUpdate}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* TOOLBAR */}
          <div className=" flex w-full justify-center">
            <div className="container lg:px-5 px-3">
              <div className="relative border-b border-neutral-700 block py-1 min-h-7 w-full gap-2">
                <div className="hidden sm:block absolute left-0 top-1/2 transform -translate-y-1/2 pl-4">
                  <p className="text-white text-sm font-mono">
                    {formatTime(currentTime)} / {formatTime(trackLength)}
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          size="icon"
                          variant={looping ? "secondaryIcon" : "ghost"}
                          className="w-7 h-7 group"
                          onClick={() => setLooping((prev) => !prev)}
                        >
                          <LoopSVG className="invert-0 group-hover:invert" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enable Looping</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          size="icon"
                          variant={manualSelecting ? "secondaryIcon" : "ghost"}
                          className="w-7 h-7 group"
                          onClick={selectStart}
                        >
                          <BracketLeftSVG className="invert-0 group-hover:invert" />
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
                          <BackwardSVG className="invert-0 group-hover:invert" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Seek Backward (Left Arrow)</p>
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
                          {isPlaying === true ? (
                            <PauseSVG className="invert-0 group-hover:invert" />
                          ) : (
                            <PlaySVG className="invert-0 group-hover:invert" />
                          )}
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
                          variant={manualSelecting ? "secondaryIcon" : "ghost"}
                          className="w-7 h-7 group"
                          onClick={selectEnd}
                        >
                          <BracketRightSVG className="invert-0 group-hover:invert" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select End</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Dialog>
                          <DialogTrigger>
                            <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 group"
                            >
                              <SettingsSVG className="invert-0 group-hover:invert" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogTitle>
                              <h3
                              className="text-xl"
                              >Quick Guide</h3>
                            </DialogTitle>
                            
                            <div className="flex flex-col gap-1">
                              <p>Click on a track to seek.</p>
                              <p>Click and drag to select a section (enable looping).</p>
                              <p>Left arrow to seek backwards.</p>
                              <p>Right arrow to seek forwards.</p>
                              <p>Space to pause/play.</p>
                            </div>

                            <p
                            onClick={()=>downloadOriginalMp3()}
                            className="text-neutral-700 underline hover:cursor-pointer"
                            >Download original mp3
                            </p>
                          </DialogContent>
                        </Dialog>                        
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Quick Guide</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
