"use client";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { getProject, storeProject } from "@/lib/utils";
import { Project } from "@/types/firestore";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./authContext";

export default function Share({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [shared, setShared] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const user = useAuth();
  
  useEffect(()=>{
    getProject(projectId).then((project)=>{
      if(project == undefined) return;
      setProject(project)
      setShared(project.isPublic);
    }).finally(()=>setDisabled(false))
  }, [])

  const enableShare = (status: boolean) => {
    var prev = shared;
    setShared(status);
    setDisabled(true);

    if(project == undefined) return;

    storeProject({
      ...project,
      isPublic: status
    }).catch((err)=>{
      setShared(prev);
      console.log(err)
      toast({title: "ERROR", description: "Couldn't update shared status"})
    }).finally(()=>setDisabled(false))
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`http://localhost:3000/editor/${project?.pid}`);
    toast({title: "Copied to clipboard!"})
  };

  return (
    <DialogHeader>
      <DialogTitle>Share "{projectName}"</DialogTitle>
      {
        user.uid === project?.uid ?
        <>
          <DialogDescription className="pb-7">
          If sharing is enabled, anyone with the link can view your project.
          Otherwise, only you can access it.
          </DialogDescription>
          <div className="flex gap-3 items-center">
          <Switch
            disabled={disabled}
            checked={shared}
            onCheckedChange={enableShare}
            id="enable-sharing"
          />
          <Label htmlFor="enable-sharing">Enable Sharing</Label>
          </div>
        </>
        :
        <>
          <DialogDescription className="pb-7">
          Sharing is enabled, anyone with the link can view your project.
          Since you’re not the owner, you don’t have permission to change its visibility.
          </DialogDescription>
          <div className="flex gap-3 items-center">
          <Switch
            disabled={true}
            checked={true}
            id="enable-sharing"
          />
          <Label htmlFor="enable-sharing">Enable Sharing</Label>
          </div>
        </>
      }
      
      <div className="pt-2">
        <Button onClick={copyLink} variant="default">
          Copy Link
        </Button>
      </div>
    </DialogHeader>
  );
}
