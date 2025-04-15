"use client";

import Logo from "@/components/logo";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import Hero from "@/components/home/hero";
import Product from "@/components/home/product";
import Pricing from "@/components/home/pricing";
export default function Home() {
  return (
    <div className="relative min-h-screen bg-black justify-center flex flex-col">
      <Topbar />
      <Hero></Hero>
      <Product></Product>
      <Pricing></Pricing>
      <Footer />
    </div>
  );
}
