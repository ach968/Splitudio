import { useEffect, useRef, useState } from "react";


export function useMicrophone() {
  // Audio buffer states
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordedDataRef = useRef<Float32Array[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // FFT states
  const [fftData, setFftData] = useState<Uint8Array | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

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

  function binToFreq(i: number): number {
    if (audioContextRef.current && analyserRef.current)
      return (
        (i * audioContextRef.current.sampleRate) / analyserRef.current.fftSize
      );

    return -1;
  }

  function freqToBin(freq: number): number {
    if (audioContextRef.current && analyserRef.current)
      return Math.max(
        0,
        Math.round(
          (freq * analyserRef.current?.fftSize) /
            audioContextRef.current.sampleRate
        )
      );

    return -1;
  }


  // TODO: Factor in the number of notes passed in.
  function getPeaks(fftData: Uint8Array, tolerance: number, totalNotes: number): number[] {
    const peaks: number[] = [];

    // Calculate the average amplitude across the entire FFT array.
    const avg = fftData.slice(0, 500).reduce((sum, value) => sum + value, 0) / 500;

    // Iterate through fftData and pick peaks that exceed both neighboring bins
    // and our dynamic threshold.
    for (let i = 1; i < fftData.length - 1; i++) {
      if (
        fftData[i] > fftData[i - 1] &&
        fftData[i] >= fftData[i + 1] &&
        fftData[i] > avg + tolerance
      ) {
        peaks.push(i);
      }
    }
    return peaks;
  }

  // When playing along to midi, instead of guessing what/how many notes the user
  // is playing and comparing it to the midi, we can benefit from going the other
  // way around: Knowing what midi notes (and how many) SHOULD be played at a
  // given time frame, and comparing that to the FFT buckets of the user.
  function isMidiNotePresent(
    midi: number,
    totalNotes: number,
    tolerance = 50
  ): boolean {
    
    if (fftData) {
      
      // Add tolerance to the midi note
      const freqRange: [number, number] = midiFreqRange(midi);
      // Now find the range of user buckets that we want to check for
      const [binStart, binEnd] = freqRangeToBinRange(freqRange);
      // const freq = midiToFreq(midi);
      // const bin = freqToBin(freq);

      let max = 0;
      for(let i = binStart; i<binEnd; i++) {
        max = Math.max(max, fftData[i])
      }
      
      const peaks = getPeaks(fftData, tolerance, totalNotes);
      const isPeak = peaks.some((peak) => peak >= binStart && peak <= binEnd);

      return isPeak

      // if any of these buckets are "prominent", return true, otherwise return false
      // var candidates = getTopNCandidates(totalNotes * 2);

      // const avg = fftData.slice(0, 1000).reduce((prev, i)=>prev+i, 0) / 1000
      // candidates = candidates.filter((cand)=> cand.amplitude > avg + tolerance)
      
      // if(fftData[freqToBin(midiToFreq(midi))] > avg + tolerance) {
      //   return true;
      // }
      // for(let i = binStart; i<binEnd; i++) {
      //   if(fftData[i] > avg + tolerance) {
      //     return true;
      //   }
      // }

      // console.log(candidates)
      // const prominentBins = new Set<number>(
      //   candidates.map((cand) => freqToBin(cand.frequency))
      // );

      // // If any bin in the note's range is in the prominent bins set, it's present
      // for (let i = binStart; i <= binEnd; i++) {
      //   if (prominentBins.has(i)) {
      //     return true;
      //   }
      // }

      // return false;
    }

    return false;
  }

  function midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function freqToMidi(freq: number): number {
    return Math.max(0, Math.round(69 + 12 * Math.log2(freq / 440)));
  }

  function getTopNCandidates(
    n: number
  ): { frequency: number; amplitude: number }[] {
    if (fftData) {
      const indexedData = Array.from(fftData, (value, index) => ({
        index,
        value,
      }));

      // Top n bins
      const topBins = indexedData.sort((a, b) => b.value - a.value).slice(0, n);

      // Map bins to frequencies
      const topFrequencies = topBins.map(({ index, value }) => {
        const frequency = midiUtils.binToFreq(index);
        return { frequency, amplitude: value };
      });

      return topFrequencies;
    }

    return Array.from({ length: n }, () => ({ frequency: 0, amplitude: 0 }));
  }

  function midiFreqRange(midi: number): [number, number] {
    const lower = midiToFreq(midi - 0.5);
    const upper = midiToFreq(midi + 0.5);
    return [lower, upper];
  }

  function freqRangeToBinRange(freqRange: [number, number]): [number, number] {
    if (!audioContextRef.current || !analyserRef.current) return [0, 0];
    const fftSize = analyserRef.current.fftSize;
    const sampleRate = audioContextRef.current.sampleRate;

    const [fLow, fHigh] = freqRange;
    const binLow = Math.floor((fLow * fftSize) / sampleRate);
    const binHigh = Math.ceil((fHigh * fftSize) / sampleRate);

    return [binLow, binHigh];
  }

  // I TRIED TO COOK BUT THIS DOEST'T WORK
  // function getTopNCandidates(n: number): { midi: number, frequency: number, amplitude: number }[] {
  //     if (fftData && binToFreq && freqToMidi) {

  //         // Buckets and midi have a many to one relationship
  //         // so we want to add up the amplitudes of buckets that map to a midi note
  //         const midiBins = new Map<number, number>(); // midi -> total amplitude

  //         for (let i = 0; i < fftData.length; i++) {
  //             const freq = binToFreq(i);
  //             const amp = fftData[i];
  //             const midi = freqToMidi(freq);

  //             // Accumulate amplitude per midi
  //             midiBins.set(midi, (midiBins.get(midi) ?? 0) + amp);
  //         }

  //         // Convert midi map to array of objects
  //         const candidates = Array.from(midiBins.entries()).map(([midi, amplitude]) => ({
  //             midi,
  //             frequency: midiToFreq(midi), // canonical frequency for that midi
  //             amplitude,
  //         }));

  //         // Sort and return top n
  //         return candidates.sort((a, b) => b.amplitude - a.amplitude).slice(0, n);
  //     }

  //     return Array.from({ length: n }, () => ({ midi: 0, frequency: 0, amplitude: 0 }));
  // }

  const midiUtils = {
    freqToMidi,
    binToFreq,
    midiToNoteName,
    noteNameToMidi,
    getTopNCandidates,
    freqToBin,
    isMidiNotePresent,
  };

  useEffect(() => {
    async function initMic() {
      try {
        // javascript shit
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(streamRef.current);
        
        // Script processor processes samples in chucks; 4kb of samples on every callback
        // Each chunk represents a time frame
        processorRef.current = audioContext.createScriptProcessor(4096, 1, 1);

        // Connect source to script processor
        source.connect(processorRef.current);
        processorRef.current.connect(audioContext.destination);

        // Create analyzer for realtime FFT
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 4096;
        analyserRef.current = analyser;

        // Connect the source to the analyser.
        source.connect(analyser);

        // Script processor callback every time it collects 4kb of samples
        processorRef.current.onaudioprocess = (event) => {
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
            const buffer = audioContext.createBuffer(
              1,
              mergedData.length,
              audioContext.sampleRate
            );
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
        streamRef.current?.getTracks()[0].stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }

      if (processorRef.current) {
        processorRef.current.disconnect();
      }
    };
  }, []);

  // After processing, we have one long Float32Array that represents the entire segment of the raw time-domain audio

  // len(audioBuffer) is 4096 * 5
  // len(fftData) is 2048
  // sampleRate is usually 4800
  return { audioBuffer, fftData, midiUtils };
}
