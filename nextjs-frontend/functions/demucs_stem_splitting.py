import shutil
import tempfile
from firebase_functions import https_fn
from flask import jsonify
import logging

import torch
from utils.bucket_upload import upload_to_storage
import os
from dotenv import load_dotenv
from demucs.separate import main
from google.cloud import storage

load_dotenv()
logging.basicConfig(level=print, format="%(asctime)s - %(levelname)s - %(message)s")


@https_fn.on_request(memory=32768, cpu=8, timeout_sec=540)
def demucs_stem_splitting(req: https_fn.Request) -> https_fn.Response:
    try:
        if req.content_type == "application/json":
            request_json = req.get_json()
            project_id = request_json.get("project_id")
            gcs_path = request_json.get("gcs_path")
            model = request_json.get(
                "model", "6-stem"
            )  # Default to 6-stem if not provided
        else:
            return jsonify({"error": "Invalid content type"}), 400

        if not project_id or not gcs_path:
            return jsonify({"error": "Missing project_id or gcs_path"}), 400

        bucket_name = os.getenv("STORAGE_BUCKET")
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(gcs_path)

        # Save the uploaded audio file to a temporary path
        _, temp_path = tempfile.mkstemp()
        blob.download_to_filename(temp_path)

        print(f"Downloaded file from GCS: {gcs_path} to {temp_path}")
        print(torch.cuda.is_available())
        # Perform audio separation using Demucs
        output_dir = tempfile.mkdtemp()

        # Determine the model name based on the 'model' parameter
        demucs_args = [
            "--device",
            "cuda",
            "--mp3",
            "--mp3-bitrate",
            "128",
            "--mp3-preset",
            "7",
            "--out",
            output_dir,
            temp_path,
        ]
        if model == "4-stem":
            demucs_model = "htdemucs_ft"
            demucs_args = ["-n", demucs_model] + demucs_args
        elif model == "2-stem":
            demucs_model = "htdemucs_ft"
            demucs_args = ["-n", demucs_model, "--two-stems=vocals"] + demucs_args
        else:
            demucs_model = "htdemucs_6s"  # Default to 6-stem
            demucs_args = ["-n", demucs_model] + demucs_args

        # creates unique temporary directory for this thread
        main(demucs_args)

        # Collect separated files and upload them to Google Cloud Storage
        uploaded_files = []
        all_uploads_successful = True

        # Get the directory that contains the separated stems
        if model == "4-stem":
            htdemucs_dir = os.path.join(
                output_dir, "htdemucs_ft"
            )  # /tmp/tmp_****/htdemucs_ft
        elif model == "2-stem":
            htdemucs_dir = os.path.join(
                output_dir, "htdemucs_ft"
            )  # /tmp/tmp_****/htdemucs_ft 
        else:
            htdemucs_dir = os.path.join(
                output_dir, "htdemucs_6s"
            )  # /tmp/tmp_****/htdemucs_6s

        inner_dir_name = os.listdir(htdemucs_dir)[0]  # tmp_****
        inner_pathname = os.path.join(htdemucs_dir, inner_dir_name)
        print(f"Separated files located at: {inner_pathname}")

        for filename in os.listdir(inner_pathname):
            if filename.endswith(".mp3"):
                print(f"Processing file: {filename}")
                success = upload_to_storage(
                    filename, bucket_name, inner_pathname, project_id
                )
                if success:
                    uploaded_files.append(f"projects/{project_id}/{filename}")
                else:
                    all_uploads_successful = False
                    logging.error(f"Failed to upload {filename}")
            else:
                logging.warning(f"Skipping non-mp3 file: {filename}")

        # Clean up temporary files
        try:
            os.remove(temp_path)
            shutil.rmtree(output_dir)
            print("Temporary files cleaned up successfully.")
        except Exception as cleanup_error:
            logging.error(f"Error cleaning up temporary files: {cleanup_error}")

        if not all_uploads_successful:
            return jsonify({"error": "Some files failed to upload"}), 500

        return (
            jsonify(
                {
                    "status": "success",
                    "files": uploaded_files,  # List of GCS-relative paths
                }
            ),
            200,
        )

    except Exception as e:
        logging.error(f"Error in predict endpoint: {e}")
        return jsonify({"error": str(e)}), 500
