"use client";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function Share({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [shared, setShared] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const enableShare = (status: boolean) => {
    setShared(status);
    setDisabled(true);

    // Fetch logic

    // simulate finally after fetch
    setTimeout(() => {
      setDisabled(false);
    }, 1500);
  };
  const copyLink = () => {};

  return (
    <DialogHeader>
      <DialogTitle>Share "{projectName}"</DialogTitle>
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
      <div className="pt-2">
        <Button onClick={copyLink} variant="default">
          Copy Link
        </Button>
      </div>
    </DialogHeader>
  );
}
