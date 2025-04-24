import Image from "next/image";
import Andrew from "@/assets/andrew.jpg"
import Nick from "@/assets/nick.jpg"
import Slava from "@/assets/slava.jpg"
import Link from "next/link";

export default function About() {
  return <section className="flex justify-center mb-44 pointer-events-none select-none">
    <div className="container px-3">
      <h2 className="text-white text-2xl md:text-3xl lg:text-4xl premium-background text-center ">
        About Us
      </h2>
      <p className="text-neutral-400 text-sm text-center max-w-2xl mx-auto mt-5">
        We’re a team of students from UW-Madison passionate about technology and creating engaging tools. This project 
        began as a simple idea at the <Link className="underline underline-offset-2" href="https://techexplorationlab.wisc.edu/">Tech Exploration Lab</Link>, 
        and has evolved into a full-featured learning and exploration app.
      </p>
      <div className="flex md:flex-row flex-col gap-4 justify-center items-center text-neutral-400 mt-7">
        <div className="text-center">
          <Image className="w-72 object-cover rounded-xl" src={Andrew} alt="Andrew picture" />
          <p className="mt-4 font-semibold">Andrew</p>
        </div>
        <div className="text-center">
          <Image className="w-72 object-cover rounded-xl" src={Nick} alt="Nick picture" />
          <p className="mt-4 font-semibold">Nick</p>
        </div>
        <div className="text-center">
          <Image className="w-72 object-cover rounded-xl" src={Slava} alt="Slava picture" />
          <p className="mt-4 font-semibold">Slava</p>
        </div>
      </div>
    </div>
  </section>
}