import tracksImage from "@/assets/tracks-image.jpg"
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export default function Product() {
  const containerRef = useRef(null);

  const scroll = useScroll({
    target: containerRef,
    offset: ["start center", "end end"]
  });
  const step1Opacity = useTransform(scroll.scrollYProgress, [0,1], [2,-2])
  const step2Opacity = useTransform(scroll.scrollYProgress, [0,1], [-2,2])

  return <motion.section
  initial={{
    opacity: 0,
  }}
  animate={{
    opacity: 1
  }}
  transition={{
    duration:1,
    delay: 0.3
  }}
  ref={containerRef} 
  className="bg-black min-h-[100vh] mt-28 md:mt-72 py-20 px-5 w-full flex flex-col md:pt-7 items-center justify-start overflow-x-clip">
    <motion.div
    style={{
      opacity: step1Opacity
    }}
    className="sticky top-1/2 -translate-y-1/2 h-[25vh] justify-center
    mt-5 container text-white flex flex-col items-center">
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
      <div className="md:max-w-[700px] xl:max-w-[900px] saturate-150 mt-10 select-none">
        <Image className="md:max-h-[50vh] w-auto pointer-events-none" src={tracksImage} alt="editor demo image"></Image>
      </div>
    </motion.div>

    <motion.div 
    style={{
      opacity: step2Opacity
    }}
    className="sticky top-1/2 -translate-y-1/2 h-[25vh] justify-center
    container text-white mt-5 flex flex-col items-center">
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
      <div className="md:max-w-[700px] xl:max-w-[900px] saturate-150 mt-10 select-none">
        <Image className="md:max-h-[50vh] w-auto pointer-events-none" src={tracksImage} alt="editor demo image"></Image>
      </div>
    </motion.div>
  </motion.section>;
}