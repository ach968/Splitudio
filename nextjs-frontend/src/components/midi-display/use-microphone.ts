import { useEffect, useRef, useState } from "react";




export function useMicrophone() {


    // Audio buffer states
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const recordedDataRef = useRef<Float32Array[]>([]);

    // FFT states
    const [fftData, setFftData] = useState<Uint8Array | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    function midiToNoteName(midi: number): string {
        const name = noteNames[midi % 12];
        const octave = Math.floor(midi / 12) - 1;
        return `${name}${octave}`;
    }

    function noteNameToMidi(note: string): number {
        const match = note.match(/^([A-G]#?)(-?\d+)$/);
        if (!match) throw new Error("Invalid note format");
        const [_, name, octaveStr] = match;
        const pitchIndex = noteNames.indexOf(name);
        const octave = parseInt(octaveStr);
        return pitchIndex + (octave + 1) * 12;
    }

    function binToFreq(i: number) {
        if(audioContextRef.current && analyserRef.current)
            return i * audioContextRef.current.sampleRate / analyserRef.current.fftSize
    
        return -1
    }

    function freqToBin(freq: number) {
        if(audioContextRef.current && analyserRef.current)
            Math.max(0, Math.round(freq * analyserRef.current?.fftSize / audioContextRef.current.sampleRate))
    
        return -1
    }
    
    function isNotePresent(fftData: Uint8Array, freq: number, threshold = 20) {
        const bin = freqToBin(freq);
        const power = fftData[bin];
        const avgPower = fftData.reduce((a, b) => a + b, 0) / fftData.length;
        return (power - avgPower) > threshold;
    }

    function midiToFreq(midi: number): number {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    function freqToMidi(freq: number): number {
        return Math.max(0, Math.round(69 + 12 * Math.log2(freq / 440)));
    }

    function getTopNFrequencies(n: number): { frequency: number, amplitude: number }[] {
        if(fftData) {
            const indexedData = Array.from(fftData, (value, index) => ({ index, value }));

            const topBins = indexedData.sort((a, b) => b.value - a.value)
            .slice(0, n); // Top n bins

            // Map bins to frequencies
            const topFrequencies = topBins.map(({ index, value }) => {
                const frequency = midiUtils.binToFreq(index)
                return { frequency, amplitude: value };
            });

            return topFrequencies
        }

        return Array.from({ length: n }, () => ({ frequency: 0, amplitude: 0 }));
    }

    const midiUtils = {
        midiToFreq,
        freqToMidi,
        binToFreq,
        freqToBin,
        isNotePresent,
        midiToNoteName,
        noteNameToMidi,
        getTopNFrequencies
    };

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
    // sampleRate is usually 4800
    return { audioBuffer, fftData, midiUtils};

    
}

