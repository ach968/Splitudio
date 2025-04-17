from basic_pitch import ICASSP_2022_MODEL_PATH
from basic_pitch.inference import predict_and_save, predict
import pandas as pd
from utils.lookup_tables import FREQUENCY_TO_NOTE
import logging
import os

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def mp3_midi_cleanup(output="tmp"):
    try:
        for file in os.listdir(output):
            file_path = os.path.join(output, file)
            if os.path.isfile(file_path):
                os.remove(file_path)
        logging.info(f"Cleanup completed for directory: {output}")
    except Exception as e:
        logging.error(f"Error during cleanup of directory {output}: {str(e)}")
        raise e


def mp3_midi_save(audio_path, output="tmp"):
    try:
        predict_and_save(
            audio_path_list=[audio_path],
            output_directory=output,
            save_midi=True,
            save_model_outputs=False,  # npz file
            save_notes=True,  # csv file
            model_or_model_path=ICASSP_2022_MODEL_PATH,
            sonify_midi=False,  # .wav file
        )
        logging.info(f"MP3 to MIDI conversion saved to {output}")
    except Exception as e:
        logging.error(f"Error during MP3 to MIDI conversion: {str(e)}")
        raise e


def mp3_midi(audio_path: str) -> pd.DataFrame:
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
