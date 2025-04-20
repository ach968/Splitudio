from firebase_functions import https_fn
from flask import jsonify
from utils.midi_extraction import mp3_midi_save, mp3_midi_cleanup
import logging
from utils.bucket_upload import upload_to_storage
from google.cloud import storage
import os
from dotenv import load_dotenv
import tempfile

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


@https_fn.on_request(memory=4096, cpu=8)
def mp3_to_midi(req: https_fn.Request) -> https_fn.Response:

    # Cleaning up request object
    if req.content_type == "application/json":
        request_json = req.get_json()
        mp3_file_path = request_json.get("mp3_file_path")
        project_id = request_json.get("project_id")
    else:
        mp3_file_path = req.form.get("mp3_file_path")
        project_id = req.form.get("project_id")

    if not mp3_file_path:
        return https_fn.Response("No mp3 file path provided", status=400)
    if not project_id:
        return https_fn.Response("No project ID provided", status=400)

    mp3_file_name = mp3_file_path.split("/")[-1]
    bucket_name = os.getenv("STORAGE_BUCKET")

    # Downloading the MP3 file from GCS
    temp_dir = None
    try:
        # Create storage client
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)

        # check if the midi file already exists in the bucket
        path_name_midi = mp3_file_path.replace(".mp3", ".mid")
        blob_midi = bucket.blob(path_name_midi)
        if blob_midi.exists():
            return jsonify(
                {
                    "status": "success",
                    "gcs_path": path_name_midi,
                    "message": "MIDI file already exists in the bucket.",
                }
            )

        # Create tmp directory if it doesn't exist
        os.makedirs("tmp", exist_ok=True)

        temp_dir = tempfile.mkdtemp()
        temp_mp3_path = os.path.join(
            temp_dir, mp3_file_name
        )  # Correct path for download
        logging.info(f"Downloading MP3 file from GCS to: {temp_mp3_path}")

        blob = bucket.blob(mp3_file_path)
        blob.download_to_filename(temp_mp3_path)
    except Exception as e:
        logging.error(f"Error downloading file from GCS: {str(e)}")
        return https_fn.Response(
            f"Error downloading file from GCS: {str(e)}", status=500
        )

    try:
        mp3_midi_save(audio_path=temp_mp3_path, output=temp_dir)

        midi_file = None

        # Find the MIDI and CSV files in the temp directory and upload them
        for file in os.listdir(temp_dir):
            if file.endswith(".mid") or file.endswith(".csv"):
                file_to_upload = file
                if "_basic_pitch" in file:
                    new_midi_file = file.replace("_basic_pitch", "")
                    # Rename the file on disk
                    os.rename(
                        os.path.join(temp_dir, file),
                        os.path.join(temp_dir, new_midi_file),
                    )
                    file_to_upload = new_midi_file
                    file = new_midi_file

                success = upload_to_storage(
                    filename=file_to_upload,
                    bucket_name=bucket_name,
                    tmp_dir=temp_dir,
                    pid=project_id,
                )

                if not success:
                    raise Exception("File upload failed.")

                if file_to_upload.endswith(".mid"):
                    midi_file = file_to_upload

        if not midi_file:
            raise Exception("No MIDI file was created.")

        path_name_midi = f"projects/{project_id}/{midi_file}"

        return jsonify(
            {
                "status": "success",
                "gcs_path": path_name_midi,
                "message": "MIDI and CSV files created and uploaded successfully.",
            }
        )

    except Exception as e:
        logging.error(f"Error processing MP3 file: {str(e)}")
        return https_fn.Response(f"Error processing MP3 file: {str(e)}", status=500)

    finally:
        try:
            mp3_midi_cleanup(output=temp_dir)
        except Exception as e:
            logging.error(f"Error during cleanup: {str(e)}")
