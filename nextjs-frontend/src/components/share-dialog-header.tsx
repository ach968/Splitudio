"use client";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { storeProject } from "@/lib/utils";
import { Project } from "@/types/firestore";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./authContext";
import { redirect } from "next/navigation";

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
    if(user.loading) return;

    fetch("/api/get_project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pid: projectId
      })
    }).catch((err)=>{
      redirect("/");
    }).then(res=>res.json())
    .then((p)=>{
      if(p == undefined) return;
      setProject(p.project);
      setShared(p.project.isPublic);
    }).finally(()=>setDisabled(false));
  }, [user])

  const enableShare = (status: boolean) => {
    const prev = !status;
    setShared(status);
    setDisabled(true);

    if(project == undefined) return;

    storeProject({
      ...project,
      isPublic: status
    }).catch((err)=>{
      setShared(prev);
      toast({title: "ERROR", description: "Couldn't update shared status"})
    }).finally(()=>setDisabled(false))
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/editor/${project?.pid}`);
    toast({title: "Copied to clipboard!"})
  };

  return (
    <DialogHeader>
      <DialogTitle>Share "{projectName}"</DialogTitle>
      {
        user?.uid === project?.uid ?
        <>
          <DialogDescription className="pb-7">
          If sharing is enabled, anyone with the link can view your project.
          Otherwise, only you can access it.
          </DialogDescription>
          <div className="flex gap-3 items-center">
          <Switch
            disabled={disabled}
            checked={shared}
            onCheckedChange={(checked)=>enableShare(checked)}
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
            checked={shared}
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
