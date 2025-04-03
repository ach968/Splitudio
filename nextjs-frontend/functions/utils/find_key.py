import time
import pandas as pd
from utils.lookup_tables import KEY_PROFILES


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
