"use client"

import DragDropSVG from "@/assets/drag-drop";
import EditorNav from "@/components/editor-nav";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import PremiumText from "@/components/premium-text";
import Link from "next/link";
import PlaySVG from "@/assets/play";
import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Input } from "./ui/input";
import YoutubeSVG from "@/assets/youtube";
import { redirect } from "next/navigation";
export default function Upload({isPremiumUser} : {isPremiumUser : boolean}) {
    
    // For drag and drop
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // For youtube link
    const inputRef = useRef<HTMLInputElement>(null);

    // Function to process files (validate, then upload)
    const handleFiles = (files: FileList) => {
        console.log("Files selected:", files);
        if(files.length != 1) {
            alert("Upload only 1 file at a time")
        }

        if(!files[0].name.toLocaleLowerCase().endsWith(".mp3") ||
        !files[0].name.toLocaleLowerCase().endsWith(".wav") ||
        !files[0].name.toLocaleLowerCase().endsWith(".flac") ||
        !files[0].name.toLocaleLowerCase().endsWith(".aac")) {
            alert("Upload an mp3, wav, flac, or aac file")
        }

    };
    
    const handleLink = (youtubeLink : string) => {
        redirect(`/editor/${"prooject-id from backend"}`)
    }

    // Open file explorer when clicking the drop area
    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    return <section>
        <div className="w-screen flex h-screen bg-black">
            <div className="flex flex-col justify-start w-full h-full">
                <EditorNav></EditorNav>
                <div className="flex justify-center w-full mt-28">
                
                    <div className="container px-3 lg:px-5 flex justify-center">
                        <Tabs defaultValue="upload" className="w-[700px]">
                            <TabsList className="flex w-full bg-transparent justify-start border-neutral-500 border-b-2 rounded-none p-0 m-0">
                                <TabsTrigger
                                className="data-[state=active]:bg-transparent data-[state=active]:text-white border-b-2 data-[state=active]:border-white border-neutral-500 rounded-none"  
                                value="upload">
                                    <p
                                    
                                    className="text-base leading-7 mx-2">
                                        Upload
                                    </p>
                                </TabsTrigger>
                                <TabsTrigger 
                                className="data-[state=active]:bg-transparent data-[state=active]:text-white border-b-2 data-[state=active]:border-white border-neutral-500 rounded-none"  
                                value="youtube-link">
                                    <p className="text-base leading-7 mx-2">
                                        Youtube Link
                                    </p>
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="pt-7">
                                <div
                                onClick={handleClick}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={twMerge(
                                    "hover:cursor-pointer flex flex-col gap-3 w-full h-[300px] rounded-xl border-2 border-dashed border-neutral-500 justify-center items-center",
                                    dragActive ? "bg-neutral-900" : ""
                                )}>
                                    <DragDropSVG className="w-16 h-16"></DragDropSVG>
                                    <p className="text-lg">
                                        <span className="text-neutral-400">Drag and drop or </span>
                                        <span className="text-white">select files</span>
                                    </p>
                                    { isPremiumUser ?
                                        <p className="text-sm text-neutral-400">
                                            Max song length 20 mins. Longer songs may require more processing time. 
                                        </p>
                                        :
                                        
                                        <p className="text-sm text-neutral-400">
                                            Max song length 2 mins. Upgrade to <Link href="/profile"> <PremiumText></PremiumText> </Link> 
                                        </p>
                                    }
                                </div>
                                {/* Hidden file input to open file explorer */}
                                <input
                                ref={fileInputRef}
                                type="file"
                                accept=".mp3,audio/*"
                                className="hidden"
                                onChange={handleFileInputChange}
                                />
                            </TabsContent>
                            <TabsContent value="youtube-link" className="pt-7">
                                <div className="relative flex flex-row items-center">
                                    <YoutubeSVG className="h-7 w-7 absolute left-2" />
                                    <Input 
                                    ref={inputRef}
                                    className="pl-11 border-neutral-500 text-white"
                                    placeholder="https://www.youtube.com/..."
                                    onKeyDown={(e)=>{
                                        if(e.key == 'Enter'){
                                            handleLink(inputRef.current!.value)
                                        }
                                    }}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                
            </div>
        </div>
    </section>
}