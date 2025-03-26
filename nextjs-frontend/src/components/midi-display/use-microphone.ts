import { useEffect, useRef, useState } from "react";

export function useMicrophone() {

    // Audio buffer states
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const recordedDataRef = useRef<Float32Array[]>([]);

    // FFT states
    const [fftData, setFftData] = useState<Uint8Array | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    useEffect(() => {
        async function initMic() {
            try {
                // javascript shit
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const audioContext = new AudioContext();
                audioContextRef.current = audioContext;
                const source = audioContext.createMediaStreamSource(stream);

                // Script processor processes samples in chucks; 4kb of samples on every callback
                // Each chunk represents a time frame
                const processor = audioContext.createScriptProcessor(4096, 1, 1);

                // Connect source to script processor
                source.connect(processor);
                processor.connect(audioContext.destination);

                // Create analyzer for realtime FFT
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 4096;
                analyserRef.current = analyser;

                // Connect the source to the analyser.
                source.connect(analyser);

                // Script processor callback every time it collects 4kb of samples
                processor.onaudioprocess = (event) => {

                    // We copy the chunk into our buffer
                    const inputData = event.inputBuffer.getChannelData(0);
                    recordedDataRef.current.push(new Float32Array(inputData));

                    
                    // After we've collected a certain number of chunks, we create an AudioBuffer and return it
                    if (recordedDataRef.current.length >= 5) {

                        // Determine the total length of the merged array
                        const totalLength = recordedDataRef.current.reduce(
                            (sum, arr) => sum + arr.length,
                            0
                        );

                        // Create a new merged array, putting all the arrays in our buffer one after another
                        const mergedData = new Float32Array(totalLength);
                        let offset = 0;
                        recordedDataRef.current.forEach((arr) => {
                            mergedData.set(arr, offset);
                            offset += arr.length;
                        });

                        // Create an AudioBuffer with 1 channel.
                        const buffer = audioContext.createBuffer(1, mergedData.length, audioContext.sampleRate);
                        buffer.copyToChannel(mergedData, 0);

                        // Optionally update state so your component can use it.
                        setAudioBuffer(buffer);

                        // Clear the recorded data for the next cycle.
                        recordedDataRef.current = [];
                    }
                };


                // continuously update FFT as fast as animationframes happen
                recursiveFFT();

                function recursiveFFT() {
                    if (analyser) {
                        const dataArray = new Uint8Array(analyser.frequencyBinCount);
                        analyser.getByteFrequencyData(dataArray);
                        setFftData(dataArray);
                    }
                    requestAnimationFrame(recursiveFFT);
                }
                  
            } catch (err) {
                console.error("Error accessing microphone:", err);
            }
        }

        initMic();

        // Cleanup: Stop the audio context on unmount.
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            };
    }, []);


    // After processing, we have one long Float32Array that represents the entire segment of the raw time-domain audio

    // len(audioBuffer) is 4096 * 5
    // len(fftData) is 2048
    // len(downSampledFftData) is around 100
    return { audioBuffer, fftData };
}
