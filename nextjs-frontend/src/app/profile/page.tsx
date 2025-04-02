"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Footer from "@/components/footer";
import PremiumText from "@/components/premium-text";
import { useState } from "react";
import { motion } from "framer-motion";
import EditorNav from "@/components/editor-nav";
import { useAuth } from "@/components/authContext";

export default function Profile() {
  const user = useAuth();

  return (
    <section>
      <EditorNav />

      <div className="flex flex-col items-center w-full min-h-screen bg-black">
        

        {/* Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mt-20 flex justify-center items-center"
        >
          <div className="w-full max-w-[700px] px-3 lg:px-5">
            <div className="border gap-7 flex flex-col p-6 rounded-lg border-neutral-500 bg-black">
              {subscriptionStatus == 0 ? (
                <>
                  <div>
                    <p className="text-white text-2xl font-semibold">
                      Subscription
                    </p>
                    <p className="text-neutral-400">
                      Your current subscription plan is{" "}
                      <span className="text-white">Free</span>, which limits the
                      number of projects and actions available. Upgrade to{" "}
                      <PremiumText />{" "}
                      <span className="text-white">($5/month)</span>, for
                      unlimited projects.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="text-white">Current Plan: Free</p>

                    <Button variant="secondary" className="max-w-[200px]">
                      <Link href={`https://buy.stripe.com/test_dR6003eO45Bebx65kk?client_reference_id=${user.uid}`} 
                      target="_blank" 
                      rel="noopener noreferrer" >
                        Upgrade to Premium
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-white text-2xl font-semibold">
                      Subscription
                    </p>
                    <p className="text-neutral-400">
                      Your current subscription plan is <PremiumText />. You
                      have access to unlimited projects.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="text-white">
                      Current Plan: <PremiumText />
                    </p>
                    <Link href="https://billing.stripe.com/p/login/test_6oEfZv32v0vV79C000"
                    target="_blank" 
                    rel="noopener noreferrer" >
                      <p className="text-neutral-400 underline underline-offset-4 text-sm">
                        Manage my subscription
                      </p>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer></Footer>
    </section>
  );
}
