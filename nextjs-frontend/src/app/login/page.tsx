"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import Topbar from "@/components/topbar";

export default function AuthPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signInWithGoogle();
      const user = result.user;

      console.log("User signed in:", user.displayName);

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <div className="flex flex-col items-center w-full min-h-screen bg-black">
        <Topbar />
        <div className="flex-1 container pt-28 flex justify-center items-start">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container pt-28 flex flex-col justify-center items-center"
          >
            <h1 className="text-2xl font-bold text-white mb-6">Sign in</h1>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <Button
              type="button"
              variant="outline"
              className="w-full max-w-md border-neutral-500 text-white hover:text-black hover:bg-white"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
            <p className="text-neutral-400 mt-4 text-sm">Sign up with Google</p>
          </motion.div>
        </div>
        <Footer />
      </div>
    </section>
  );
}
