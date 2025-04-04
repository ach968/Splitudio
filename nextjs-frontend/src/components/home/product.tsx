import tracksImage from "@/assets/tracks-image.jpg"
import Image from "next/image";

export default function Product() {
  return <section className="bg-black py-20 px-5 w-full flex flex-col justify-center md:pt-7 items-center overflow-x-clip">
    <div className="mt-5 container text-white flex flex-col items-center">
      <div className="flex w-full flex-col justify-center items-center">
        <div className="tag">
          1
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl premium-background mt-5">
          AI-Powered Stem Separation
        </h2>
        
        <p className="text-neutral-400 text-sm mt-5 max-w-[670px] text-center">
          Learning a new instrument? Throwing a karaoke party? We’ve got you covered.
          We isolate vocals, drums, bass, and more with precision. Our AI model handles the heavy lifting—so you can focus on having fun.
        </p>
      </div>
      <div className="md:max-w-[800px] xl:max-w-[1000px] saturate-150 mt-10 select-none">
        <Image className="pointer-events-none" src={tracksImage} alt="editor demo image"></Image>
      </div>
    </div>

    <div className="container text-white mt-5">
      <div className="flex w-full flex-col justify-center items-center">
        <div className="tag">
          2
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl premium-background mt-5">
          Stem-to-Midi Conversion
        </h2>
        <p className="text-neutral-400 text-sm mt-5 max-w-[670px] text-center">
          Transform stems into MIDI files with a single click.
          Listen to them in-browser, practice along in real time, or download and create your own arrangements.
        </p>
      </div>
      <div className=" mt-10">

      </div>
    </div>
  </section>;
}