"use client";

import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import Hero from "@/components/home/hero";
import Product from "@/components/home/product";
export default function Home() {
  return (
    <div className="relative min-h-screen bg-black justify-center flex flex-col">
      <Topbar />
      <Hero></Hero>
      <Product></Product>
      <Footer />
    </div>
  );
}
