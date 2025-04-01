"use client";

import Logo from "@/components/logo";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import Hero from "@/components/home/hero";
export default function Home() {
  return (
    <div className="min-h-screen bg-black justify-center flex flex-col">
      <Topbar />
      <Hero></Hero>
      <Footer />
    </div>
  );
}
