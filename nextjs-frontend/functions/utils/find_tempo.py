import numpy as np


def find_tempo(start_times: list) -> float:
    sample_rate = 100  # Hz, adjust resolution as needed
    max_time = max(start_times)
    signal = np.zeros(int(max_time * sample_rate) + 1)
    for t in start_times:
        signal[int(t * sample_rate)] = 1

    fft = np.fft.fft(signal)
    frequencies = np.fft.fftfreq(
        len(signal), d=1 / sample_rate
    )  # d = time step in seconds
    dominant_freq = abs(
        frequencies[np.argmax(np.abs(fft[1 : len(signal) // 2]))]
    )  # Ignore DC (0 Hz)
    bpm = dominant_freq * 60

    return bpm if bpm > 0 else 0
