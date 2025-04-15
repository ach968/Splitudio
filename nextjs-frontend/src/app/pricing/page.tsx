'use client'
import Footer from "@/components/footer";
import Pricing from "@/components/home/pricing";
import PremiumText from "@/components/premium-text";
import Topbar from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Link from "next/link";

export default function Page() {
  return <section>
      <Topbar></Topbar>
      <Pricing></Pricing>
      <Footer></Footer>
    </section>
}
