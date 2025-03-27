from basic_pitch.inference import predict_and_save, predict
from basic_pitch import ICASSP_2022_MODEL_PATH
import time
import pandas as pd
from frequency_lookup_table import frequency_to_note


CHROMATIC_SCALE = {
    0: "C",
    1: "C#",
    2: "D",
    3: "D#",
    4: "E",
    5: "F",
    6: "F#",
    7: "G",
    8: "G#",
    9: "A",
    10: "A#",
    11: "B",
}


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
    return df


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
        key_profiles[f"{CHROMATIC_SCALE[key]}maj"] = [
            c_major[(i - key) % 12] for i in range(12)
        ]
        key_profiles[f"{CHROMATIC_SCALE[key]}min"] = [
            c_minor[(i - key) % 12] for i in range(12)
        ]

    return key_profiles


def get_pitch_distribution(df: pd.DataFrame) -> list:
    """
    Gets the pitch ditribution (total duration) of the given notes in the dataframe.

    Args:
        df (pd.DataFrame): Dataframe input of all the MIDI note events

    Returns:
        list: a vector of 12 elements representing the total duration of each pitch class
    """
    duration = [0] * 12
    current_start_time = df.iloc[0]["start_time_s"]
    for _, row in df.iterrows():
        if row["start_time_s"] == current_start_time:
            continue
        current_start_time = row["start_time_s"]
        pitch_class = row["pitch_midi"] % 12
        if pitch_class not in duration:
            duration[pitch_class] = row["note_duration"]
        else:
            duration[pitch_class] += row["note_duration"]

    return duration


def correlation(x, y):
    x_mean = sum(x) / 12
    y_mean = sum(y) / 12
    num = sum((xi - x_mean) * (yi - y_mean) for xi, yi in zip(x, y))
    den = (
        sum((xi - x_mean) ** 2 for xi in x) * sum((yi - y_mean) ** 2 for yi in y)
    ) ** 0.5

    return num / den if den != 0 else 0


def find_key(input_vector: list):
    scores = {}
    key_profiles = get_key_profiles()
    for key, profile in key_profiles.items():
        scores[key] = correlation(input_vector, profile)
    best_key = max(scores, key=scores.get)
    return best_key, scores[best_key]


if __name__ == "__main__":
    start = time.time()
    audio_path = "pure-love-304010.mp3"
    df: pd.DataFrame = mp3_midi(audio_path)

    pitch_distribution = get_pitch_distribution(df)
    key = find_key(pitch_distribution)
    print("Key: ", key[0])

    print("Time taken: ", time.time() - start)
