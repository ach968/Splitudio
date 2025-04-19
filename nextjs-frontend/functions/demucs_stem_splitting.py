import shutil
import tempfile
from firebase_functions import https_fn
from flask import jsonify
from utils.midi_extraction import mp3_midi_save, mp3_midi_cleanup
import logging
from utils.bucket_upload import upload_to_storage
from google.cloud import storage
import os
from dotenv import load_dotenv
import requests
from demucs.separate import main

load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


@https_fn.on_request(memory=32768, cpu=8)
def demucs_stem_splitting(req: https_fn.Request) -> https_fn.Response:
    try:
        if req.content_type == "application/json":
            request_json = req.get_json()
            project_id = request_json.get("project_id")
        else:
            project_id = req.form.get("project_id")

        audio_file = req.files["audio"]

        if not audio_file:
            return jsonify({"error": "No audio file provided"}), 400
        if not project_id:
            return jsonify({"error": "No project_id provided"}), 400

        # Save the uploaded audio file to a temporary path
        _, temp_path = tempfile.mkstemp()
        audio_file.save(temp_path)

        logging.info("Temporary file upload created at: %s", temp_path)

        # Perform audio separation using Demucs
        output_dir = (
            tempfile.mkdtemp()
        )  # creates unique temporary directory for this thread
        main(["--two-stems=vocals", "--mp3", "--out", output_dir, temp_path])

        # Collect separated files and upload them to Google Cloud Storage
        uploaded_files = []
        bucket_name = os.getenv("STORAGE_BUCKET")

        all_uploads_successful = True

        # Get the directory that contains the separated stems
        htdemucs_dir = os.path.join(output_dir, "htdemucs")  # /tmp/tmp_****/htdemucs
        inner_dir_name = os.listdir(htdemucs_dir)[0]  # tmp_****
        inner_pathname = os.path.join(htdemucs_dir, inner_dir_name)
        logging.info(f"Separated files located at: {inner_pathname}")
        for filename in os.listdir(inner_pathname):
            if filename.endswith(".mp3"):
                logging.info(f"Processing file: {filename}")
                success = upload_to_storage(
                    filename, bucket_name, inner_pathname, project_id
                )
                if success:
                    uploaded_files.append(filename)
                else:
                    all_uploads_successful = False
                    logging.error(f"Failed to upload {filename}")
            else:
                logging.warning(f"Skipping non-mp3 file: {filename}")

        # Clean up temporary files
        try:
            os.remove(temp_path)
            shutil.rmtree(output_dir)
            logging.info("Temporary files cleaned up successfully.")
        except Exception as cleanup_error:
            logging.error(f"Error cleaning up temporary files: {cleanup_error}")

        if not all_uploads_successful:
            return jsonify({"error": "Some files failed to upload"}), 500

        return (
            jsonify(
                {
                    "status": "success",
                    "files": uploaded_files,
                    "gcs_path": f"gs://{bucket_name}/{project_id}/",
                }
            ),
            200,
        )

    except Exception as e:
        logging.error(f"Error in predict endpoint: {e}")
        return jsonify({"error": str(e)}), 500
