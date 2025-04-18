"use client";
import Footer from "@/components/footer";
import EditorNav from "@/components/editor-nav";
import PianoRoll from "@/components/midi-display/piano-roll";
import Piano from "@/components/midi-display/piano";
import LoadingSpinnerSVG from "@/assets/loading-spinner";
export default function Loading() {
  return (
    <section>
      <EditorNav />

      <div className="flex flex-col w-full min-h-screen h-screen bg-black text-white p-6">
        <div className="absolute z-50 bottom-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-6 flex-col items-center">
          <LoadingSpinnerSVG className="h-28 w-28" />
          <div className="animate-bounce">
            <div className="text-lg font-bold text-white flex items-center">
              <p>Generating your midi&nbsp;</p>
              <span className="inline-block animate-blink delay-0">.</span>
              <span className="inline-block animate-blink delay-75">.</span>
              <span className="inline-block animate-blink delay-150">.</span>
            </div>
          </div>
        </div>

        <div className="w-full h-full filter brightness-50 overflow-y-auto">
          <PianoRoll
            playAlong={false}
            playAlongBuffer={new Map()}
            notes={[]}
            windowStart={0}
            windowDuration={3}
            isFullPiano={false}
          />
        </div>

        <div className="w-full h-20 filter brightness-50 ">
          <Piano
            playAlong={false}
            playAlongBuffer={new Map()}
            sampler={null}
            notes={new Set()}
            isFullPiano={false}
          />
        </div>

        <div className="w-full justify-center items-center flex flex-col">
          <div className="container px-3 lg:px-5">
            <div className="mt-2 flex gap-3">
              <div className="animate-pulse">
                <div className="font-mono h-4 w-[50px] bg-neutral-400 rounded-md"></div>
              </div>

              <div className="animate-pulse delay-100 w-full justify-center flex items-center">
                <div className="font-mono h-2 w-full bg-gray-700 rounded-full "></div>
              </div>

              <div className="animate-pulse delay-200">
                <div className="font-mono h-4 w-[50px] bg-neutral-400 rounded-md"></div>
              </div>
            </div>

            <div className="mt-2 flex justify-between w-full">
              <div className="flex gap-2 w-[200px] items-center">
                <div className="animate-pulse">
                  <div className="font-mono h-4 w-[80px] bg-neutral-400 rounded-md"></div>
                </div>
                <div className="animate-pulse delay-75">
                  <div className="font-mono h-4 w-[120px] bg-neutral-400 rounded-md"></div>
                </div>
              </div>
              <div className="animate-pulse delay-200">
                <div className="font-mono h-4 w-[120px] bg-neutral-400 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}
