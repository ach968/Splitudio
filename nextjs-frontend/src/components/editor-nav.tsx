"use client";


import Share from "@/components/share-dialog-header";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { redirect, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./authContext";
import Logo from "./logo";
import ProfileSVG from "@/assets/profile-svg";
import LogoutSVG from "@/assets/logout-svg";
import { Button } from "./ui/button";
import Image from "next/image";

export default function EditorNav({
  projectId,
  projectName,
}: {
  projectId?: string;
  projectName?: string;
}) {
  const pathname = usePathname();
  const [isSharing, setIsSharing] = useState(false);

  const { user, loading } = useAuth();

  const path = usePathname();

  // REDIRECT TO HOME PAGE IF NOT LOGGED IN
  useEffect(() => {
    if (!user) {
      redirect("/login");
    }
  }, [user]);

  return (
    <nav className="bg-black/50 backdrop-blur-md h-[80px] z-[999] justify-center items-center w-screen flex fixed top-0">
      <div className="flex flex-row w-full container items-center justify-between px-6 text-sm">
        <div className="flex gap-5 text-neutral-400 items-center underline-offset-4">
          <Link 
          href="/"
          className="relative flex w-[40px] h-[40px] items-center justify-center">
            <div 
            onClick={()=>{
              window.location.href = "/";
            }}
            className="scale-[0.2]">
              <Logo />
            </div>
          </Link>

          <Link
          scroll={false} 
          href="/projects">
            <p
              onClick={()=>{
                window.location.href = "/projects";
              }}
              className={twMerge(
                pathname === "/projects" && "text-white",
                "hover:cursor-pointer hover:text-white hover:underline"
              )}
            >
              Projects
            </p>
          </Link>

          <Link  
          href="/editor">
            <p
              onClick={()=>{
                window.location.href = "/editor";
              }}
              className={twMerge(
                pathname.startsWith("/editor") && "text-white",
                "hover:cursor-pointer hover:text-white hover:underline"
              )}
            >
              Editor
            </p>
          </Link>

          {projectId && projectId != "" && projectName && (
            <Link href="#">
              <Dialog onOpenChange={(open) => setIsSharing(open)}>
                <DialogTrigger>
                  <p
                    className={twMerge(
                      isSharing && "text-white",
                      "hover:cursor-pointer hover:text-white hover:underline"
                    )}
                  >
                    Share
                  </p>
                </DialogTrigger>
                <DialogContent>
                  <Share projectId={projectId} projectName={projectName} />
                </DialogContent>
              </Dialog>
            </Link>
          )}
        </div>
        
        <div className="flex gap-1">
          <Link href="/profile" legacyBehavior passHref>
            <Button 
            variant={pathname.endsWith("/profile") ? "secondary" : "ghost"} className="group p-2">
              <p className="hidden sm:block">Profile</p>
              {
                user?.photoURL ?
                <img className="w-6 h-6 rounded-full object-cover group-hover:brightness-90 transition-all" src={user.photoURL} alt="user photo"></img> 
                :
                <ProfileSVG className={twMerge("group-hover:invert", pathname.endsWith("/profile") && "invert", "h-6 w-6")}></ProfileSVG>
              }
              
            </Button>
          </Link>

          <Link href="/logout" legacyBehavior passHref>
            <Button variant="ghost" className="group p-2">
              <LogoutSVG className="group-hover:invert"></LogoutSVG>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
