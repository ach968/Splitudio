import { Button } from "../ui/button";
import heroImage from "@/assets/hero-image.png"
import Link from "next/link";
import { easeOut, motion, useScroll, useTransform} from "motion/react"
import { useRef } from "react";

export default function Hero() {
  const containerRef = useRef(null);

  const scroll = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const opacity = useTransform(scroll.scrollYProgress, [0,1], [1,-1])
  
  return <motion.section
    ref={containerRef}
    style={{
      opacity: opacity
    }}
    className="w-full select-none flex justify-center mt-24 md:mt-5 md:pb-10 overflow-x-clip">
    <div className="container">
      <div className="md:flex items-center justify-center px-5">
        <div className="md:w-[578px]">
          <motion.h1
          initial={{
            opacity:0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 2
          }}
          className="text-5xl lg:text-7xl font-bold tracking-tighter header-gradient mt-6">
            Unleash the Hidden Layers of Your Music
          </motion.h1>
          <motion.p
          initial={{
            opacity:0,
          }}
          animate={{
            opacity:1,
          }}
          transition={{
            duration: 1,
            delay: 0.3,
          }}
          className="md:text-lg lg:text-xl text-white tracking-tight mt-6">
            Extract and transform music into instrument tracks, 
            ready for MP3 download, MIDI conversion, and sheet music creation.
          </motion.p>
          <div className="flex gap-2 items-center mt-[30px]">
            <motion.div
            initial={{
              opacity:0,
            }}
            animate={{
              opacity:1,
            }}
            transition={{
              duration: 1,
              delay: 0.6
            }}
            >
              <Link href="/projects">
                <Button variant="outline" className="btn btn-primary">
                  Try for free
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
            initial={{
              opacity:0,
            }}
            animate={{
              opacity:1,
            }}
            transition={{
              duration: 1,
              delay: 0.9
            }}>
              <Link href="/pricing">
                <Button variant="secondary" className="btn btn-text gap-1">
                  <span>Learn more</span>
                </Button>
              </Link>
            </motion.div>
            
          </div>
        </div>
        <div className="mt-10 overflow-clip relative items-center flex">
          <motion.div 
          initial={{
            opacity:0,
          }}
          animate={{
            opacity:1,
          }}
          transition={{
            duration: 2,
            ease: easeOut,
          }}
          className="xl:w-[700px] lg:w-[600px] md:w-[450px] select-none">
            <motion.img 
            className="pointer-events-none" 
            src={heroImage.src} 
            alt="image of tracks" 
            initial={{
              filter: "brightness(0.6) saturate(1)"
            }}
            animate={{
              filter: "brightness(1.2) saturate(1.2)",
            }}
            transition={{
              duration: 2,
              ease: easeOut,
            }}
            width={800} height={800} />
          </motion.div>
          
        </div>
      </div>
    </div>
  </motion.section>
}