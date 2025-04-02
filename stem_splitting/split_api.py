import demucs.api
import demucs.separate
import os

# install demucs with
# python3 -m pip install -U demucs

# MODEL CHOICE
def choose_model():
    # to initialize with default parameters:
    separator = demucs.api.Separator()
    return separator

    # Use another model and segment:
    # separator = demucs.api.Separator(model="mdx_extra", segment=12)

    # You can also use other parameters defined

# Separating a loaded audio
#audio = "sample_song.mp3"
#origin, separated = separator.separate_tensor(audio)

# If you encounter an error like CUDA out of memory, you can use this to change parameters like `segment`:
#separator.update_parameter(segment=smaller_segment)

def detailed_separate(separator):
    # Separating an audio file
    origin, separated = separator.separate_audio_file("sample_song.mp3")

    # Remember to create the destination folder before calling `save_audio`
    # Or you are likely to recieve `FileNotFoundError`
    output_dir = "separated"  # Specify the desired folder name
    os.mkdir(output_dir, exist_ok=True)
    print(f"Folder '{output_dir}' created successfully.")

    for file, sources in separated:
        for stem, source in sources.items():
            demucs.api.save_audio(source, f"{stem}_{file}", samplerate=separator.samplerate)

    print(f"Separation complete. Stems saved in '{output_dir}'")


# use for simple separation by injecting the command line arguments
def simple_separate():
    # Assume that your command is `demucs --mp3 --two-stems vocals -n mdx_extra "track with space.mp3"`
    demucs.separate.main(["--mp3", "--two-stems", "vocals", "-n", "mdx_extra", "sample_song.mp3"])

def main():
    separator = choose_model()
    detailed_separate(separator)

if __name__ == "__main__":
    main()