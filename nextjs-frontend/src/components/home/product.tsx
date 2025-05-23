import tracksImage from "@/assets/tracks-image.jpg"
import listenImage from "@/assets/listen-image.jpg"
import playImage from "@/assets/play-along-image.jpg"

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export default function Product() {
  const containerRef = useRef(null);
  
  const mainScroll = useScroll({
    target: containerRef,
    offset: ["start end", "end center"]
  });

  const mainFade = useTransform(mainScroll.scrollYProgress, [0,0.1,0.8,1], [0.3,1,1,-1])


  const scroll = useScroll({
    target: containerRef,
    offset: ["start center", "end end"]
  });


  const step1Opacity = useTransform(scroll.scrollYProgress, [0,1/7,2/7,3/7,4/7,5/7,6/7,1], [1,1,0,0,0,0,0,0])
  const step2Opacity = useTransform(scroll.scrollYProgress, [0,1/7,2/7,3/7,4/7,5/7,6/7,1], [0,0,0,1,1,0,0,0])
  const step3Opacity = useTransform(scroll.scrollYProgress, [0,1/7,2/7,3/7,4/7,5/7,6/7,1], [0,0,0,0,0,0,1,1])

  return <motion.section
  id="features"
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
  style={{
    opacity: mainFade
  }}
  ref={containerRef} 
  className="bg-black min-h-[1700px] mt-28 md:mt-72 px-5 w-full select-none flex flex-col md:pt-7 items-center relative justify-start mb-28 overflow-x-clip">
    <motion.div
    style={{
      opacity: step1Opacity
    }}
    className="sticky top-1/2 -translate-y-1/2 h-0 justify-center
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
      <div className="w-full md:max-w-[700px] xl:max-w-[900px] saturate-150 mt-10 select-none">
        <Image className="object-contain w-full max-h-[50vh] pointer-events-none" src={tracksImage} alt="editor demo image"></Image>
      </div>
    </motion.div>

    <motion.div 
    style={{
      opacity: step2Opacity
    }}
    className="sticky top-1/2 -translate-y-1/2 h-0 justify-center
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
          Listen to them in-browser or download and create your own arrangements.
        </p>
      </div>
      <div className="w-full md:max-w-[700px] xl:max-w-[900px] saturate-150 mt-10 select-none">
        <Image className="object-contain w-full max-h-[50vh] pointer-events-none" src={listenImage} alt="midi player demo image"></Image>
      </div>
    </motion.div>
    
    <motion.div 
    style={{
      opacity: step3Opacity
    }}
    className="sticky top-1/2 -translate-y-1/2 h-0 justify-center
    container text-white mt-5 flex flex-col items-center">
      <div className="flex w-full flex-col justify-center items-center">
        <div className="tag">
          3
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl premium-background mt-5">
          Interactive Play-Along Mode
        </h2>
        <p className="text-neutral-400 text-sm mt-5 max-w-[670px] text-center">
          Whether you're using a MIDI keyboard or playing with your instrument into the microphone, take your practice to the next level by playing along with your tracks in real time.
        </p>
      </div>
      <div className="w-full md:max-w-[700px] xl:max-w-[900px] saturate-150 mt-10 select-none">
        
        <Image className="object-contain max-h-[50vh] w-full pointer-events-none" src={playImage} alt="playalong demo image"></Image>
      </div>
    </motion.div>

  </motion.section>;
}