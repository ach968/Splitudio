from basic_pitch.inference import predict_and_save, predict
from basic_pitch import ICASSP_2022_MODEL_PATH
import time
import pandas as pd
from lookup_tables import (
    FREQUENCY_TO_NOTE,
    KEY_PROFILES,
)


def mp3_midi_save(audio_path, output):
    predict_and_save(
        audio_path_list=[audio_path],
        output_directory=output,
        save_midi=True,
        save_model_outputs=False,  # npz file
        save_notes=False,  # csv file
        model_or_model_path=ICASSP_2022_MODEL_PATH,
        sonify_midi=False,  # .wav file
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
        lambda x: FREQUENCY_TO_NOTE.get(x, "null")
    )
    return df


def pitch_midi_to_frequency(pitch_midi: float) -> float:
    return round(440.0 * 2 ** ((pitch_midi - 69) / 12), 2)


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


def correlation(x: list, y: list) -> float:
    """
    Calculates the correlation between two vectors.

    Returns:
        float: correlation value
    """
    x_mean = sum(x) / 12
    y_mean = sum(y) / 12
    num = sum((xi - x_mean) * (yi - y_mean) for xi, yi in zip(x, y))
    den = (
        sum((xi - x_mean) ** 2 for xi in x) * sum((yi - y_mean) ** 2 for yi in y)
    ) ** 0.5

    return num / den if den != 0 else 0


def find_key(input_vector: list, key_profiles: dict = KEY_PROFILES) -> tuple:
    """
    Finds the key of the song based on the pitch distribution vector through an implementation of
    the Krumhansl-Schmuckler algorithm.

    Args:
        input_vector (list): a vector of 12 elements representing the total duration of each pitch class

    Returns:
        tuple: a tuple containing the name of the key and the correlation score
    """
    scores = {}
    for key, profile in key_profiles.items():
        scores[key] = correlation(input_vector, profile)
    best_key = max(scores, key=scores.get)
    return best_key, scores[best_key]


if __name__ == "__main__":
    start = time.time()
    audio_path = "file1.mp3"

    # mp3_midi_save(audio_path, "output")df: pd.DataFrame = mp3_midi(audio_path)

    df: pd.DataFrame = mp3_midi(audio_path)
    pitch_distribution = get_pitch_distribution(df)
    key = find_key(pitch_distribution)
    print("Key: ", key[0])

    print("Time taken: ", time.time() - start)
