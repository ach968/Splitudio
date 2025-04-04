import { Button } from "../ui/button";
import Image from "next/image";
import heroImage from "@/assets/hero-image.png"
import Link from "next/link";

export default function Hero() {
  return <section className="w-full flex justify-center mt-24 md:pb-10 overflow-x-clip">
    <div className="container">
      <div className="md:flex items-center justify-center px-5">
        <div className="md:w-[578px]">
          {/* <div className="tag">Powered by AI</div> */}
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter header-gradient mt-6">
            Unleash the Hidden Layers of Your Music
          </h1>
          <p className="md:text-lg lg:text-xl text-white tracking-tight mt-6">
            Extract and transform music into instrument tracks, 
            ready for MP3 download, MIDI conversion, and sheet music creation.
          </p>
          <div className="flex gap-2 items-center mt-[30px]">
            <Link href="/projects">
              <Button variant="outline" className="btn btn-primary">
                Try for free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="secondary" className="btn btn-text gap-1">
                <span>Learn more</span>
              </Button>
            </Link>
            
          </div>
        </div>
        <div className="mt-10 overflow-clip relative items-center flex">
          <div className="xl:w-[700px] lg:w-[600px] md:w-[450px] select-none">
            <Image className="filter animate-pulse-filters saturate-150 brightness-125 pointer-events-none" src={heroImage} alt="image of tracks" width={800} height={800}></Image>
          </div>
          
        </div>
      </div>
    </div>
  </section>
}