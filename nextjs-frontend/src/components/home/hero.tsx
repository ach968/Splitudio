import { Button } from "../ui/button";
import Image from "next/image";
import trackImage from "@/assets/bruh.png"
export default function Hero() {
  return <section className="w-full flex justify-center pt-20 pb-20 md:pt-5 md:pb-10 overflow-x-clip">
  <div className="container">
    <div className="md:flex items-center px-5">
      <div className="md:w-[578px]">
        <div className="tag">Version 2.0 is here</div>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter header-gradient mt-6">
          Unleash the Hidden Layers of Your Music
        </h1>
        <p className="md:text-lg lg:text-xl text-white tracking-tight mt-6">
          Extract and transform music into isolated instrument tracks, 
          ready for download, MIDI conversion, and sheet music creation.
        </p>
        <div className="flex gap-1 items-center mt-[30px]">
          <Button variant="outline" className="btn btn-primary">Try for free</Button>
          <Button variant="secondary" className="btn btn-text gap-1">
            <span>Learn more</span>
          </Button>
        </div>
      </div>
      <div className="mt-10 overflow-clip relative items-center flex">
        <div className="xl:w-[700px] lg:w-[600px] md:w-[500px]">
          <Image src={trackImage} alt="image of tracks" width={800} height={800}></Image>
        </div>
        
      </div>
    </div>
  </div>
</section>
}