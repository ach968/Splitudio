'use client'
import PremiumText from "@/components/premium-text";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Link from "next/link";

export default function Pricing() {
  return <section className="select-none">
      <div className="bg-black justify-center flex flex-col">
      <div className="w-full flex justify-center mt-32 mb-36 md:pb-10 overflow-x-clip">
        <div className="container">
          <div className="text-center mb-12 text-white">
            <motion.h2
            initial={{opacity:0}}
            animate={{opacity:1}}
            transition={{duration:0.5}} 
            className="lg:text-4xl text-3xl mb-4 premium-background">Simple, Transparent Pricing</motion.h2>
            <motion.p
            initial={{opacity:0}}
            animate={{opacity:1}}
            transition={{duration:0.5, delay: 0.2}} 
            className="text-neutral-400 text-sm">Start for free—upgrade when you're ready to unlock more.</motion.p>
          </div>

          <div className="flex flex-col items-center md:justify-center md:items-stretch md:flex-row gap-8">
            <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            transition={{duration:0.5, delay: 0.4}} 
            className="border max-w-[400px] border-white rounded-2xl p-8 flex flex-col items-start bg-white text-black justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
                <p className="text-3xl font-bold mb-4">$0<span className="text-base text-neutral-700"> / month</span></p>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li>Upload songs up to <span className="font-semibold text-black">2 minutes</span> in length</li>
                  <li>Limited number of projects</li>
                  <li>Stem separation + MIDI conversion</li>
                  <li>Download stems as MP3</li>
                  <li>MIDI playback in browser</li>
                  <li>Play along to MIDI in browser</li>
                  <li>Store your projects on the cloud</li>
                </ul>
              </div>
              
              <Button className="mt-7">
                <Link href="/projects">
                  Start For Free
                </Link>
              </Button>
            </motion.div>

            <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            transition={{duration:0.5, delay: 0.6}} 
            className="border max-w-[400px] border-white rounded-2xl p-8 flex flex-col items-start bg-black text-white justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2"><PremiumText></PremiumText></h3>
                <p className="text-3xl font-bold mb-4">$5<span className="text-base text-neutral-400"> / month</span></p>
                <ul className="space-y-2 text-sm text-neutral-400">
                  <li>Upload songs up to <span className="font-semibold text-white">20 minutes</span> in length</li>
                  <li><span className="font-semibold text-white">Unlimited</span> projects</li>
                  <li>And everything from the free tier!</li>
                </ul>
              </div>
              
              <Button variant="outline" className="mt-7">
                <Link href="/profile">
                  Subscribe
                </Link>
              </Button>
            </motion.div>

            
          </div>
        </div>
      </div>
    </div>
  </section>
  
}
