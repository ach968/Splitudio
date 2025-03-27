from basic_pitch.inference import predict_and_save, predict
from basic_pitch import ICASSP_2022_MODEL_PATH
import time
import pandas as pd
from frequency_lookup_table import frequency_to_note


def mp3_midi_save(audio_path, output):
    predict_and_save(
        audio_path_list=[audio_path],
        output_directory=output,
        save_midi=True,
        save_model_outputs=True,  # npz file
        save_notes=True,  # csv file
        model_or_model_path=ICASSP_2022_MODEL_PATH,
        sonify_midi=True,  # .wav file
    )


def mp3_midi(audio_path: str):
    model_output, midi_data, note_events = predict(audio_path=audio_path)
    df = pd.DataFrame(
        note_events,
        columns=["start_time_s", "end_time_s", "pitch_midi", "velocity", "pitch_bend"],
    )
    df.sort_values(by=["start_time_s"], inplace=True, ascending=True)
    df["note_duration"] = df["end_time_s"] - df["start_time_s"]
    df["pitch_frequency"] = df["pitch_midi"].apply(pitch_midi_to_frequency)
    df["note_name"] = df["pitch_frequency"].apply(
        lambda x: frequency_to_note.get(x, "null")
    )
    print(df.head())


def pitch_midi_to_frequency(pitch_midi: float) -> float:
    return round(440.0 * 2 ** ((pitch_midi - 69) / 12), 2)


def get_key_profiles():
    """
    Generate key profiles for all 24 (12 major and minor) keys of the chromatic scale. 
    The base C major and C minor profiles are derived from Krumhansl's 1990 experiments.

    Returns:
        dict: A dictionary of key profiles.
    """
    # Base profiles from (Krumhansl, 1990)
    # Each value represents the relative strength/importance of that note in the respective key.
    c_major = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
    c_minor = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

    # Generate all 24 profiles by shifting
    key_profiles = {}
    for key in range(12):  # 0 = C, 1 = C#, ..., 11 = B
        key_profiles[f"{key}m"] = [c_major[(i - key) % 12] for i in range(12)]
        key_profiles[f"{key}n"] = [c_minor[(i - key) % 12] for i in range(12)]

    return key_profiles


if __name__ == "__main__":
    start = time.time()
    audio_path = "pure-love-304010.mp3"
    # mp3_midi_save(audio_path, "output")
    mp3_midi(audio_path)
    print("Track length: 1:18")

    # print(get_key_profiles())

    print("Time taken: ", time.time() - start)
