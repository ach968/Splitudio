# app.py (Flask Endpoint)
from flask import Flask, request, jsonify
from demucs.separate import main
from google.cloud import storage as gcs
import tempfile
import os
from dotenv import load_dotenv
import shutil
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

load_dotenv()

app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"}), 200


@app.route("/predict", methods=["POST"])
def predict():
    try:
        audio_file = request.files["audio"]
        project_id = request.form.get("project_id")

        if not audio_file:
            return jsonify({"error": "No audio file provided"}), 400
        if not project_id:
            return jsonify({"error": "No project_id provided"}), 400

        # Save the uploaded audio file to a temporary path
        _, temp_path = tempfile.mkstemp()
        audio_file.save(temp_path)
        
        logging.info("Temporary file upload created at: %s", temp_path)

        # Perform audio separation using Demucs
        output_dir = tempfile.mkdtemp() # creates unique temporary directory for this thread
        main(["--two-stems=vocals", "--mp3","--out", output_dir, temp_path])

        # Collect separated files and upload them to Google Cloud Storage
        uploaded_files = []
        bucket_name = os.getenv("STORAGE_BUCKET")
        
        all_uploads_successful = True

        # Get the directory that contains the separated stems
        htdemucs_dir = os.path.join(output_dir, "htdemucs") # /tmp/tmp_****/htdemucs
        inner_dir_name = os.listdir(htdemucs_dir)[0]  # tmp_****
        inner_pathname = os.path.join(htdemucs_dir, inner_dir_name)
        logging.info(f"Separated files located at: {inner_pathname}")
        for filename in os.listdir(inner_pathname):
            if filename.endswith(".mp3"):
                logging.info(f"Processing file: {filename}")
                success = _upload_to_storage(filename, bucket_name, inner_pathname, project_id)
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


def _upload_to_storage(filename, bucket_name, tmp_dir, pid):
    """
    Uploads a file from the tmp directory to Google Cloud Storage.

    Args:
        filename (str): The name of the file to upload.
        bucket_name (str): The name of the GCS bucket.
        tmp_dir (str): The directory containing the file.
        pid (str): The project ID for the file path in GCS.

    Returns:
        bool: True if the upload was successful, False otherwise.
    """
    try:
        logging.info(f"Uploading {filename} to bucket {bucket_name}...")
        storage_client = gcs.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(f"projects/{pid}/{filename}")
        blob.upload_from_filename(
            os.path.join(tmp_dir, filename)
        )  # Upload from tmp directory
        logging.info(f"Uploaded {filename} to {bucket_name}/{pid}/!")
        return True
    except Exception as e:
        logging.error(f"Error uploading to storage: {e}")
        return False


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
