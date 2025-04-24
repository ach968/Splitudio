"use client";

import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import Hero from "@/components/home/hero";
import Product from "@/components/home/product";
import About from "@/components/home/about";
export default function Home() {
  return (
    <div className="relative min-h-screen bg-black justify-center flex flex-col">
      <Topbar />
      <Hero></Hero>
      <Product></Product>
      <About></About>
      <Footer />
    </div>
  );
}
