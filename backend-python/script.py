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
        save_model_outputs=True,
        save_notes=True,
        model_or_model_path=ICASSP_2022_MODEL_PATH,
        sonify_midi=True,
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


if __name__ == "__main__":
    start = time.time()
    audio_path = "pure-love-304010.mp3"
    # mp3_midi_save(audio_path, "output")
    mp3_midi(audio_path)
    print("Track length: 1:18")
    print("Time taken: ", time.time() - start)
