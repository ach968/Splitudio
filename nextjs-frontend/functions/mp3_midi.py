import datetime
from firebase_functions import https_fn
from flask import jsonify
from utils.midi_extraction import mp3_midi_save, mp3_midi_cleanup
import logging
from utils.bucket_upload import upload_to_storage
from google.cloud import storage
import os
from dotenv import load_dotenv
from google.auth import default, impersonated_credentials

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

SERVICE_ACCOUNT_EMAIL = os.getenv("SERVICE_ACCOUNT_EMAIL")


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

    try:
        credentials, project = default()
        signing_credentials = impersonated_credentials.Credentials(
            source_credentials=credentials,
            target_principal=SERVICE_ACCOUNT_EMAIL,
            target_scopes=["https://www.googleapis.com/auth/devstorage.read_only"],
            lifetime=300,
        )
        logging.info(f"Using service account {SERVICE_ACCOUNT_EMAIL} for impersonation")

        # Create storage client with impersonated credentials
        storage_client = storage.Client(
            credentials=signing_credentials, project=project
        )

        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(f"projects/{project_id}/{file_name}")

        # Create tmp directory if it doesn't exist
        os.makedirs("tmp", exist_ok=True)

        temp_file = f"tmp/{file_name}"
        blob.download_to_filename(temp_file)

        download_url = blob.generate_signed_url(
            expiration=datetime.timedelta(hours=5),
            method="GET",
            version="v4",
        )
        logging.info(f"Download URL generated: {download_url}")
    except Exception as e:
        logging.error(f"Error downloading file from GCS: {str(e)}")
        return https_fn.Response(
            f"Error downloading file from GCS: {str(e)}", status=500
        )

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
                "gcs_path": download_url,
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
