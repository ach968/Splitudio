from utils.find_key import find_key
from utils.find_tempo import find_tempo

# from utils.midi_extraction import mp3_midi
from firebase_functions import https_fn
import pandas as pd


# @https_fn.on_request(memory=512)
def midi_to_sheets():
    audio_path = "file1.mp3"
    # df: pd.DataFrame = mp3_midi(audio_path=audio_path)
    with open("tmp/file1_basic_pitch.csv", "r") as f:
        df = pd.read_csv(
            f,
            delimiter=",",
            header=0,
            usecols=range(4),
            names=["start_time_s", "end_time_s", "pitch_midi", "velocity"],
        )

    pop_mean = df["velocity"].mean()
    pop_std = df["velocity"].std()
    rows_to_keep = df["velocity"].apply(
        lambda x: velocity_threshold(x, pop_mean, pop_std)
    )
    df.drop(df[~rows_to_keep].index, inplace=True)
    print(df.head())
    start_times = df["start_time_s"].drop_duplicates().dropna().tolist()
    print(len(start_times))

    tempo = find_tempo(start_times=start_times)

    print(tempo)

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


