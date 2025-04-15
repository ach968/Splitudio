# app.py (Flask Endpoint)
from flask import Flask, request, jsonify
from demucs.separate import main
from google.cloud import storage as gcs
import tempfile
import os
from dotenv import load_dotenv

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

        # Perform audio separation using Demucs
        output_dir = tempfile.mkdtemp()  # Temporary directory for separated files
        main(["--two-stems=vocals", "--out", output_dir, temp_path])

        # Collect separated files and upload them to Google Cloud Storage
        uploaded_files = []
        bucket_name = os.getenv("STORAGE_BUCKET")
        for filename in os.listdir(output_dir):
            if _upload_to_storage(filename, bucket_name, output_dir, project_id):
                uploaded_files.append(filename)

        # Clean up temporary files
        os.remove(temp_path)
        for filename in uploaded_files:
            os.remove(os.path.join(output_dir, filename))

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
        print(f"Uploading {filename} to bucket {bucket_name}...")
        bucket = gcs.Client().bucket(bucket_name)
        blob = bucket.blob(f"projects/{pid}/{filename}")
        blob.upload_from_filename(
            os.path.join(tmp_dir, filename)
        )  # Upload from tmp directory
        print(f"Uploaded {filename} to {bucket_name}/{pid}/!")
        return True
    except Exception as e:
        print(f"Error uploading to storage: {e}")
        return False


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
