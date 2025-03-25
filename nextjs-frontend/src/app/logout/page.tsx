"use client"

import { useEffect } from "react";
import { signOut } from "@/lib/firebase/auth";

export default function Logout() {
  useEffect(() => {
    signOut();
    window.location.href = "/";
  }, []);

  return (
    <div className="flex flex-col items-center w-full h-screen bg-black">
      <div className="flex-1 container pt-28 flex justify-center items-start">
        <div className="px-3 lg:px-5 max-w-[500px] w-full">
          <h1 className="text-4xl font-bold text-white">Logging out...</h1>
        </div>
      </div>
    </div>
  );
}
