import Track from "@/components/track";
import { Button } from "@/components/ui/button";
import PlaySVG from "@/assets/play"
import ForwardSVG from "@/assets/forward"
import PauseSVG from "@/assets/pause"
import BackwardSVG from "@/assets/backward";
import BracketLeftSVG from "@/assets/bracket-left";
import BracketRightSVG from "@/assets/bracket-right";
import SettingsSVG from "@/assets/settings";
import LoopSVG from "@/assets/loop";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import EditorNav from "@/components/editor-nav";
import SkeletonTrack from "@/components/skeleton-track";

interface TrackState {
    ws: any;
    volume: number;
}

export default function Editor() {

    

  return (
  <section>
        <div className="w-screen flex h-screen bg-black">
            <div className="flex flex-col justify-start w-full h-full">
                
                <EditorNav/>

                <div className="mt-28 mb-3 flex w-full justify-center">
                    <div className="container px-5">
                        <div className=" flex gap-3 place-items-baseline">
                            <p className="animate-pulse">
                                <div className="w-[200px] h-9 bg-neutral-500 rounded-md"></div>
                            </p>
                            <p className=" animate-pulse">
                                <div className="w-[100px] h-4 bg-neutral-500 rounded-md"></div>
                            </p>
                        </div>
                    </div>
                </div>

                {/* TRACK CONTAINER THING -- IT RESIZES */}
                <div className="flex w-full justify-center overflow-x-hidden">
                    <div className="container mx-3">
                        <div
                        className="relative flex flex-col gap-3 border border-neutral-700 rounded-lg lg:gap-6 lg:p-5 p-3">
                            <SkeletonTrack />
                            <SkeletonTrack />
                            <SkeletonTrack />
                            <SkeletonTrack />
                        </div>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className=" flex w-full justify-center">
                    <div className="container lg:px-5 px-3">
                        <div className="relative border-b border-neutral-700 block py-1 min-h-7 w-full gap-2">

                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 pl-4">
                                <p className="text-white text-sm font-mono">
                                    {"0:00"} / {"0:00"}
                                </p>
                            </div>

                            <div className="flex justify-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button 
                                                size="icon" 
                                                variant="ghost"
                                                className="w-7 h-7 group"
                                            >
                                                <LoopSVG className="invert-0 group-hover:invert"/>
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
                                                variant="ghost"
                                                className="w-7 h-7 group"
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
                                            >
                                                <PlaySVG className="invert-0 group-hover:invert"/>
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
                                                variant="ghost"
                                                className="w-7 h-7 group"
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
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="w-7 h-7 group"
                                            >
                                                <SettingsSVG className="invert-0 group-hover:invert" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Settings</p>
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
