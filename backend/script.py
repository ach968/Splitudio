from basic_pitch.inference import predict_and_save, predict
from basic_pitch import ICASSP_2022_MODEL_PATH


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
    # process MIDI


if __name__ == "__main__":
    audio_path = "pure-love-304010.mp3"
    mp3_midi_save(audio_path, "output")
