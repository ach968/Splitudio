from firebase_functions import https_fn
from flask import jsonify
from utils.midi_extraction import mp3_midi_save, mp3_midi_cleanup
import logging
from utils.bucket_upload import upload_to_storage
from google.cloud import storage
import os
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


@https_fn.on_request(memory=4096, cpu=8)
def mp3_to_midi(req: https_fn.Request) -> https_fn.Response:
    if req.content_type == "application/json":
        request_json = req.get_json()
        mp3_file_link = request_json.get("mp3_file_link")
        project_id = request_json.get("project_id")
    else:
        mp3_file_link = req.form.get("mp3_file_link")
        project_id = req.form.get("project_id")

    if not mp3_file_link:
        return https_fn.Response("No mp3 file provided", status=400)
    if not project_id:
        return https_fn.Response("No project ID provided", status=400)

    file_name = mp3_file_link.split("/")[-1]
    bucket_name = os.getenv("STORAGE_BUCKET")

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(f"projects/{project_id}/{file_name}")

    # Create tmp directory if it doesn't exist
    os.makedirs("tmp", exist_ok=True)

    temp_file = f"tmp/{file_name}"
    blob.download_to_filename(temp_file)

    mp3_file_link = temp_file

    try:
        mp3_midi_save(audio_path=mp3_file_link)

        for file in os.listdir("tmp"):
            upload_to_storage(
                filename=file,
                bucket_name=bucket_name,
                tmp_dir="tmp",
                pid=project_id,
            )

        file_name = file_name.replace(".mp3", ".mid")

        return jsonify(
            {
                "status": "success",
                "gcs_path": f"https://storage.cloud.google.com/{bucket_name}/projects/{project_id}/{file_name}",
            }
        )

    except Exception as e:
        logging.error(f"Error processing MP3 file: {str(e)}")
        return https_fn.Response(f"Error processing MP3 file: {str(e)}", status=500)

    finally:
        try:
            mp3_midi_cleanup(output="tmp")
        except Exception as e:
            logging.error(f"Error during cleanup: {str(e)}")
            return https_fn.Response(f"Error during cleanup: {str(e)}", status=500)
