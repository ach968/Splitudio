from utils.find_key import find_key
from utils.find_tempo import find_tempo, find_tempo_autocorrelate, find_time_signature
from utils.midi_extraction import mp3_midi

# from utils.midi_extraction import mp3_midi
from firebase_functions import https_fn
import pandas as pd


# @https_fn.on_request(memory=512)
def midi_to_sheets():
    audio_path = "file1.mp3"
    df: pd.DataFrame = mp3_midi(audio_path=audio_path)

    pop_mean = df["velocity"].mean()
    pop_std = df["velocity"].std()
    rows_to_keep = df["velocity"].apply(
        lambda x: velocity_threshold(x, pop_mean, pop_std)
    )
    df.drop(df[~rows_to_keep].index, inplace=True)
    start_times = (
        df["start_time_s"]
        .sort_values(ascending=True)
        .drop_duplicates()
        .dropna()
        .tolist()
    )

    tempo = find_tempo_autocorrelate(start_times=start_times)
    time_signature = find_time_signature(start_times=start_times, bpm=tempo, tolerance=0.2)

    print(tempo)
    print(time_signature)

def velocity_threshold(velocity: float, pop_mean: float, pop_std: float) -> bool:
    """Detects if a velocity is significantly louder than the average using a Z-score threshold.

    Args:
        velocity (float): The velocity of the note to be checked.
        pop_mean (float): The mean velocity of all notes in the piece.
        pop_std (float): The standard deviation of velocities in the piece.

    Returns:
        bool: True if the velocity is significantly louder than the average (i.e., above the threshold), False otherwise.
    """
    Z_SCORE_THRESHOLD = 1.5
    z_score = (velocity - pop_mean) / pop_std
    if z_score > Z_SCORE_THRESHOLD:
        return True

    return False


if __name__ == "__main__":
    midi_to_sheets()
