"use client";

import DragDropSVG from "@/assets/drag-drop";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PremiumText from "@/components/premium-text";
import Link from "next/link";
import YoutubeSVG from "@/assets/youtube";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Input } from "./ui/input";
import { redirect } from "next/navigation";
import { Progress } from "./ui/progress";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import EditorNav from "./editor-nav";
import { storeProject, storeCloudFile, getCustomer } from "@/lib/utils";
import { Customer, Project } from "@/types/firestore";
import { useAuth } from "./authContext";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/firebase";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Button } from "./ui/button";

const validateFileDuration = (
  file: File,
  isPremium: boolean
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.addEventListener("loadedmetadata", () => {
      const duration = audio.duration;
      const maxDuration = isPremium ? 20 * 60 : 5 * 60; // 20 minutes for premium, 5 minutes for free
      URL.revokeObjectURL(audio.src);
      resolve(duration <= maxDuration);
    });
    audio.addEventListener("error", () => {
      reject(new Error("Failed to load audio metadata"));
    });
  });
};

export default function Upload() {

  const [selectedModel, setSelectedModel] = useState<"6-stem" | "4-stem" | "2-stem">("6-stem")

  // For drag and drop
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User instance
  const { user } = useAuth();
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  useEffect(()=>{
    if(user?.uid)
      getCustomer().then((customer: Customer | undefined)=>{
        if(!customer) return;
          if(customer.subscriptionStatus == "active") setIsPremiumUser(true); 
      })
  },[user])

  // For youtube link
  const inputRef = useRef<HTMLInputElement>(null);

  const [serverReturn, setServerReturn] = useState(false);
  const serverReturnRef = useRef(false);

  useEffect(() => {
    serverReturnRef.current = serverReturn;
  }, [serverReturn]);

  // For showing upload progress (simulate for now)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const { toast } = useToast();

  const createProject = async (project: Project) => {
    try {
      const result = await storeProject(project);
      console.log(result)
      redirect(`/projects/${project.pid}`);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Function to process files (validate, then upload)
  const handleFiles = async (files: FileList) => {
    try {
      setUploadProgress(0);

      if (files.length !== 1) {
        toast({
          title: "ERROR",
          description: "Please upload 1 file",
        });
        return;
      }
      const file = files[0];
      const validExtensions = [".mp3", ".wav", ".flac", ".aac"];
      const fileNameLC = file.name.toLowerCase();
      if (!validExtensions.some((ext) => fileNameLC.endsWith(ext))) {
        toast({
          title: "ERROR",
          description: "Please upload an mp3, wav, flac, or aac file",
        });
        setUploadProgress(null);
        return;
      }
      setFileName(file.name);
      setUploadProgress(25);

      // client side duration check
      const isValidDuration = await validateFileDuration(file, isPremiumUser);
      
      if (!isValidDuration) {
        const maxAllowed = isPremiumUser ? "20 minutes" : "5 minutes";
        toast({
          title: "ERROR",
          description: `Please upload a file shorter than ${maxAllowed}`,
        });
        setUploadProgress(null);
        setFileName(null);
        return;
      }

      // create firestore project entry
      const newProject: Project = {
        pid: uuidv4(),
        uid: user?.uid || null,
        pName: "Untitiled Project",
        model: selectedModel,
        fileName: file.name,
        isPublic: false,
      };

      createProject(newProject);

      // Upload file to Firebase Storage
      const storageRef = ref(
        storage,
        `projects/${newProject.pid}/` + file.name
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // displaying progress
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error("Upload failed", error);
          toast({
            title: "ERROR",
            description: "Upload failed: " + error.message,
          });
          setUploadProgress(null);
          setFileName(null);
          return;
        },
        async () => {
          setUploadProgress(100);

          // Get the download URL
          const downloadURL = await getDownloadURL(storageRef);

          // Store file information in Firestore
          const cloudFile = {
            url: downloadURL,
            size: file.size,
            contentType: file.type,
            storagePath: storageRef.fullPath,
          };

          try {
            await storeCloudFile(newProject.pid, cloudFile);
            
          } catch(error: any) {
            console.error("Failed to store file info to cloud file", error);
            toast({
              title: "ERROR",
              description: "Failed to store file: " + error.message,
            });
            setUploadProgress(null);
            setFileName(null);
          }

          setTimeout(()=>{
            redirect(`/editor/${newProject.pid}`);
          }, 300)
        }
      );
    } catch (err: any) {
      toast({
        title: "ERROR",
        description: "Something went wrong",
      });
      setUploadProgress(null);
      setFileName(null);
    }
  };

  const handleLink = (youtubeLink: string) => {
    fakeLoading(5);

    // Replace with real logic later
    setTimeout(() => {
      setServerReturn(true);
      setTimeout(() => {
        redirect("/editor/project-id-returned");
      }, 200);
    }, 7000);
  };

  const fakeLoading = (estimatedTime: number) => {
    setUploadProgress(0);

    // Math for logarithmic fake progress bar
    let currTime = 0;
    const interval = setInterval(() => {
      currTime = currTime + 1;

      // will give us 0.0 to 1.0
      let progress = 1 - Math.exp((-1 * currTime) / estimatedTime);

      // scale progress to shadcn progress value (0-100) with a bit of padding on the right
      progress *= 95;

      setUploadProgress(progress);

      if (serverReturnRef.current === true) {
        setUploadProgress(100);
        clearInterval(interval);
      }
    }, 1000);
  };

  // Open file explorer when clicking the drop area
  const handleClick = () => {
    
    // WARM UP FUNCTIONS
    try{
      fetch("https://us-central1-splitudio-19e91.cloudfunctions.net/demucs_stem_splitting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.parse(JSON.stringify({}))
      });
      fetch("https://us-central1-splitudio-19e91.cloudfunctions.net/mp3_to_midi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.parse(JSON.stringify({}))
      });
    }
    catch(err) {
      // Do nothing
    }
    

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
          <div className="flex justify-center w-full mt-20">
            <div className="container px-3 lg:px-5 flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Tabs defaultValue="upload" className="w-full md:w-[700px] sm:w-[600px] ">
                  <TabsList className="flex w-full bg-transparent justify-start border-neutral-500 border-b-2 rounded-none p-0 m-0">
                    <TabsTrigger
                      disabled={uploadProgress != null}
                      className="data-[state=active]:bg-transparent data-[state=active]:text-white border-b-2 data-[state=active]:border-white border-neutral-500 rounded-none"
                      value="upload"
                    >
                      <p className="text-base leading-7 mx-2">Upload</p>
                    </TabsTrigger>
                    <TabsTrigger
                      disabled={true}
                      className="data-[state=active]:bg-transparent data-[state=active]:text-white border-b-2 data-[state=active]:border-white border-neutral-500 rounded-none"
                      value="youtube-link"

                    >
                      <p className="text-base leading-7 mx-2">Youtube Link (disabled)</p>
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
                        "hover:cursor-pointer flex flex-col gap-3 w-full h-[300px] rounded-xl border-2 border-dashed border-neutral-500 justify-center items-center px-5 transition-colors",
                        dragActive ? "bg-neutral-900" : "bg-black"
                      )}
                    >
                      <DragDropSVG className="w-16 h-16" />
                      <p className="text-lg">
                        <span className="text-neutral-400">
                          Drag and drop or{" "}
                        </span>
                        <span className="text-white">select files</span>
                      </p>
                      {isPremiumUser ? (
                        <p className="text-sm text-neutral-400">
                          Max song length 20 mins. Longer songs may require more
                          processing time.
                        </p>
                      ) : (
                        <p className="text-sm text-neutral-400">
                          Max song length 5 mins. Upgrade to{" "}
                          <Link href="/profile">
                            <PremiumText />
                          </Link>
                        </p>
                      )}
                      {uploadProgress != null && (
                        <div className="w-full max-w-[300px] sm:max-w-[400px] mt-4">
                          <Progress value={uploadProgress}></Progress>
                        </div>
                      )}
                      {fileName && (
                        <p className="text-neutral-400 text-sm mt-2 truncate max-w-[400px]">
                          Uploading {fileName} ...
                        </p>
                      )}
                    </div>
                    {/* Hidden file input to open file explorer */}
                    {uploadProgress == null && (
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".mp3,audio/*"
                        className="hidden"
                        onChange={handleFileInputChange}
                      />
                    )}
                  </TabsContent>
                </Tabs>

                <p
                className="mt-5 text-white font-mono"
                >Select Model:</p>
                <div className="flex mt-2 gap-2">
                  {
                    selectedModel == "6-stem" ?
                    <Button
                    variant="secondary" 
                    className="border border-white rounded-md p-2">
                      <p className="text-black text-sm">6 Stem</p>
                    </Button>
                    :
                    <Button 
                    onClick={()=>setSelectedModel("6-stem")}
                    className="border border-neutral-500 rounded-md p-2">
                      <p className="text-neutral-400 text-sm">6 Stem</p>
                    </Button>
                  }
                  {
                    selectedModel == "4-stem" ?
                    <Button
                    variant="secondary" 
                    className="rounded-md border border-white p-2">
                      <p className="text-black text-sm">4 Stem (refined)</p>
                    </Button>
                    :
                    <Button 
                    onClick={()=>setSelectedModel("4-stem")}
                    className="border border-neutral-500 rounded-md p-2">
                      <p className="text-neutral-400 text-sm">4 Stem (refined)</p>
                    </Button>
                  }
                  {
                    selectedModel == "2-stem" ?
                    <Button 
                    variant="secondary" 
                    className="rounded-md border border-white p-2">
                      <p className="text-black text-sm">2 Stem</p>
                    </Button>
                    :
                    <Button 
                    onClick={()=>setSelectedModel("2-stem")}
                    className="border border-neutral-500 rounded-md p-2">
                      <p className="text-neutral-400 text-sm">2 Stem</p>
                    </Button>
                  }
                </div>

                <div className="mt-3 font-mono text-sm text-neutral-400">
                  {
                    selectedModel == '6-stem' ?
                    <p>Vocal, drums, bass, guitar, piano, and other</p>
                    : selectedModel == '4-stem' ? 
                    <p>Vocal, drums, bass, and other. This model has the best split quality!</p>
                    :
                    <p>Vocal & instrumental</p>
                  }
                </div>
                
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
