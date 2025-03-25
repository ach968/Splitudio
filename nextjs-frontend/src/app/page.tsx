"use client";

import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
export default function Home() {
  return (
    <>
      <Topbar />
      <div className="flex flex-col items-center w-full h-screen bg-black">
        <div className="flex-1 container pt-28 flex justify-center items-start">
          <div className="px-3 lg:px-5 max-w-[500px] w-full">
            <h1 className="text-4xl font-bold text-white">
              Welcome to Splitudio
            </h1>
            <p className="text-gray-400 mt-4">Bababooey</p>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
