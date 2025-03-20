"use client"
import { Label } from "@/components/ui/label"
import { Button } from "./ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Switch } from "@/components/ui/switch"
import { useState } from "react";

export default function Share({projectId, projectName} : {projectId: string, projectName: string}) {

    const [shared, setShared] = useState(true);

    const enableShare = () => {

    }
    const copyLink = () => {

    }

    return <DialogHeader>
        <DialogTitle>Share "{projectName}"</DialogTitle>
        <DialogDescription className="pb-7">
            When sharing is enabled, anyone with the project link will be able to view your project
        </DialogDescription>
        <div className="flex gap-3 items-center">
            <Switch disabled={true} checked={shared} onCheckedChange={setShared} id="enable-sharing" />
            <Label htmlFor="enable-sharing">Enable Sharing</Label>
        </div>
        <div className="pt-2">
            <Button onClick={copyLink} variant="default">
                Copy Link
            </Button>
        </div>
    </DialogHeader>
}