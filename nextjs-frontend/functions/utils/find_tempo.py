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


def find_tempo_autocorrelate(start_times: list) -> float:
    # Parameters
    sample_rate = 100  # Hz (10 ms resolution)
    max_time = max(start_times)
    signal_length = int(max_time * sample_rate) + 1
    signal = np.zeros(signal_length)
    for t in start_times:
        signal[int((t - min(start_times)) * sample_rate)] = 1  # Shift to start at 0

    # Autocorrelation
    autocorr = np.correlate(signal, signal, mode="full")
    autocorr = autocorr[len(autocorr) // 2 :]  # Positive lags only

    # Restrict to 60-200 BPM (0.3-1.0 seconds)
    min_lag = int(0.3 * sample_rate)  # 30 samples
    max_lag = int(1.0 * sample_rate)  # 100 samples
    autocorr_segment = autocorr[min_lag:max_lag]
    peak_lag = np.argmax(autocorr_segment) + min_lag
    beat_period = peak_lag / sample_rate  # Seconds
    bpm = 60 / beat_period
    return bpm if bpm > 0 else 0


def find_time_signature(start_times: list, bpm: float, tolerance: float = 0.1) -> tuple[int, int]:
    """
    Attempts to find the time signature (numerator, denominator) from note start times and tempo.

    Args:
        start_times: List of note start times (in seconds).
        bpm: The tempo in beats per minute.
        tolerance: Tolerance for beat alignment (in seconds).

    Returns:
        A tuple (numerator, denominator) representing the time signature, or (4, 4) if not found.
    """
    if bpm <= 0:
        return 4, 4  # Default to 4/4 if tempo is invalid

    beat_period = 60 / bpm  # Seconds per beat
    potential_measures = []

    for i in range(1, 10):  # Test numerators 1 to 9
        for j in [2, 4, 8, 16]:  # Test denominators 2, 4, 8, 16
            measure_length = i * (4 / j) * beat_period  # Length of a measure in seconds
            potential_measures.append((i, j, measure_length))
    
    measure_counts = {}
    
    for (num,denom,measure_length) in potential_measures:
        measure_counts[(num,denom)] = 0

    for start_time in start_times:
      for (num,denom,measure_length) in potential_measures:
        measure_number = start_time // measure_length
        remainder = start_time % measure_length
        
        if remainder <= tolerance or measure_length - remainder <= tolerance:
          measure_counts[(num,denom)] +=1

    best_signature = (4, 4)
    best_count = 0
    for (num,denom),count in measure_counts.items():
        if count > best_count:
            best_count = count
            best_signature = (num,denom)
    
    return best_signature