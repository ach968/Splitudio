import os
from google.cloud import storage as gcs
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def upload_to_storage(filename, bucket_name, tmp_dir, pid):
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
        bucket = gcs.Client().bucket(bucket_name)
        blob = bucket.blob(f"projects/{pid}/{filename}")
        blob.upload_from_filename(
            os.path.join(tmp_dir, filename)
        )  # Upload from tmp directory
        logging.info(f"Uploaded {filename} to {bucket_name}/{pid}/!")
        return True
    except Exception as e:
        logging.error(f"Error uploading to storage: {e}")
        return False
