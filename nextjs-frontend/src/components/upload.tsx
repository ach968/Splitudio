"use client"

import DragDropSVG from "@/assets/drag-drop";
import EditorNav from "@/components/editor-nav";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import PremiumText from "@/components/premium-text";
import Link from "next/link";
import YoutubeSVG from "@/assets/youtube";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Input } from "./ui/input";
import { redirect } from "next/navigation";
import { Progress } from "./ui/progress";
import { motion } from "framer-motion"

export default function Upload({ isPremiumUser } : { isPremiumUser : boolean }) {
    // For drag and drop
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // For youtube link
    const inputRef = useRef<HTMLInputElement>(null);

    const [serverReturn, setServerReturn] = useState(false);
    const serverReturnRef = useRef(false);

    useEffect(() => {
        serverReturnRef.current = serverReturn;
    }, [serverReturn]);

    // For showing upload progress (simulate for now)
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [fileName, setFileName] = useState<string>("");

    // Function to process files (validate, then upload)
    const handleFiles = (files: FileList) => {
        if (files.length !== 1) {
            return alert("Upload only 1 file at a time");
        }
        const file = files[0];
        const validExtensions = [".mp3", ".wav", ".flac", ".aac"];
        const fileNameLC = file.name.toLowerCase();
        if (!validExtensions.some(ext => fileNameLC.endsWith(ext))) {
            return alert("Upload an mp3, wav, flac, or aac file");
        }
        setFileName(file.name);


        fakeLoading(8);

        // simualte waiting for server to respond with a project-id
        setTimeout(()=> {
            console.log("SERVER RESPONSE")
            setServerReturn(true);
            setTimeout(()=>{
                redirect('/editor/project-id-returned')
            }, 200);
            
        }, 10000)

        console.log("Files selected:", file);
    };
    
    const handleLink = (youtubeLink : string) => {
        fakeLoading(5);

        // Replace with real logic later
        setTimeout(()=> {
            console.log("SERVER RESPONSE")
            setServerReturn(true);
            setTimeout(()=>{
                redirect('/editor/project-id-returned')
            }, 200);
            
        }, 7000)
    };

    const fakeLoading = (estimatedTime: number) => {

        setUploadProgress(0);

        // Math for logarithmic fake progress bar
        let currTime = 0;
        const interval = setInterval(() => {
            currTime = currTime + 1;

            // will give us 0.0 to 1.0
            let progress = (1-Math.exp(-1*currTime/estimatedTime));
            
            // scale progress to shadcn progress value (0-100) with a bit of padding on the right
            progress *= (95)
            
            setUploadProgress(progress);

            if (serverReturnRef.current === true) {
                setUploadProgress(100);
                clearInterval(interval);
            }
        }, 1000);
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

    return (
        <section>
            <div className="w-screen flex h-screen bg-black">
                <div className="flex flex-col justify-start w-full h-full">
                    <EditorNav />
                    <div className="flex justify-center w-full mt-28">
                        <div className="container px-3 lg:px-5 flex justify-center">
                            <motion.div
                            initial={{opacity:0, y:7}}
                            animate={{opacity:1, y:0}}
                            transition={{duration: 0.5}}>
                                <Tabs defaultValue="upload" className="w-[700px]">
                                    <TabsList className="flex w-full bg-transparent justify-start border-neutral-500 border-b-2 rounded-none p-0 m-0">
                                        <TabsTrigger
                                            className="data-[state=active]:bg-transparent data-[state=active]:text-white border-b-2 data-[state=active]:border-white border-neutral-500 rounded-none"  
                                            value="upload">
                                            <p className="text-base leading-7 mx-2">Upload</p>
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            className="data-[state=active]:bg-transparent data-[state=active]:text-white border-b-2 data-[state=active]:border-white border-neutral-500 rounded-none"  
                                            value="youtube-link">
                                            <p className="text-base leading-7 mx-2">Youtube Link</p>
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
                                                "hover:cursor-pointer flex flex-col gap-3 w-full h-[300px] rounded-xl border-2 border-dashed border-neutral-500 justify-center items-center transition-colors",
                                                dragActive ? "bg-neutral-900" : "bg-black"
                                            )}>
                                            <DragDropSVG className="w-16 h-16" />
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
                                                    Max song length 2 mins. Upgrade to <Link href="/profile"><PremiumText /></Link>
                                                </p>
                                            }
                                            { uploadProgress != null && 
                                                <div className="w-full max-w-[400px] mt-4">
                                                    <Progress value={uploadProgress}></Progress>
                                                </div>
                                            }
                                            {/* { fileName && uploadProgress === 100 && (
                                                <p className="text-green-500 mt-2">Uploaded {fileName} successfully!</p>
                                            )} */}
                                        </div>
                                        {/* Hidden file input to open file explorer */}
                                        {
                                            uploadProgress == null &&
                                            <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".mp3,audio/*"
                                            className="hidden"
                                            onChange={handleFileInputChange}/>
                                        }
                                    </TabsContent>
                                    <TabsContent value="youtube-link" className="pt-7">
                                        <div className="relative flex flex-row items-center">
                                            <YoutubeSVG className="h-7 w-7 absolute left-2" />
                                            <Input 
                                                ref={inputRef}
                                                className="pl-11 border-neutral-500 text-white"
                                                placeholder="https://www.youtube.com/..."
                                                onKeyDown={(e)=>{
                                                    if(e.key === 'Enter'){
                                                        handleLink(inputRef.current!.value);
                                                    }
                                                }}
                                            />
                                        </div>
                                        { uploadProgress != null && 
                                            <div className="w-full mt-4">
                                                <Progress value={uploadProgress}></Progress>
                                            </div>
                                        }
                                    </TabsContent>
                                </Tabs>
                            </motion.div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
