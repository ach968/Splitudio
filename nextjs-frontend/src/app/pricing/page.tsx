import PremiumText from "@/components/premium-text";
import Topbar from "@/components/topbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return <div className="min-h-screen bg-black justify-center flex flex-col">
    <Topbar></Topbar>
    <section className="w-full flex justify-center pt-20 pb-20 md:pt-5 md:pb-10 overflow-x-clip">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-white rounded-2xl p-8 flex flex-col items-start bg-white text-black justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
              <p className="text-3xl font-bold mb-4">$0<span className="text-base text-neutral-700"> / month</span></p>
              <ul className="space-y-3 text-sm text-neutral-700">
                <li>Upload songs up to <span className="font-semibold text-black">2 minutes</span> in length</li>
                <li>Limited number of projects</li>
                <li>Stem separation + MIDI conversion</li>
                <li>MIDI playback in browser</li>
                <li>Store your projects on the cloud</li>
              </ul>
            </div>
            
            <Button className="mt-7">
              <Link href="/signup">
                Start For Free
              </Link>
            </Button>
          </div>

          <div className="border border-white rounded-2xl p-8 flex flex-col items-start bg-black text-white justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2"><PremiumText></PremiumText></h3>
              <p className="text-3xl font-bold mb-4">$5<span className="text-base text-neutral-400"> / month</span></p>
              <ul className="space-y-3 text-sm text-neutral-400">
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
          </div>

          
        </div>
      </div>
    </section>
  </div>
  
}
