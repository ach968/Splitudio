from urllib.parse import urlparse
import yt_dlp as youtube_dl
from firebase_functions import https_fn
from firebase_functions.params import StringParam
import os
from google.cloud import storage as gcs


@https_fn.on_request(memory=512)
def youtube_to_mp3(req: https_fn.Request) -> https_fn.Response:
    """
    Converts a YouTube video to an MP3 file and uploads it to Firebase Cloud Storage.

    Args:
        req (https_fn.Request): The HTTP request object.

    Returns:
        https_fn.Response: The HTTP response object.
    """
    try:
        url = req.args.get("url")
        pid = req.args.get("pid")
        if not url:
            return https_fn.Response("No URL provided", status=400)
        if not pid:
            return https_fn.Response("No pid provided", status=400)

        # tmp directory existence check
        tmp_dir = os.path.join(os.getcwd(), "tmp")
        os.makedirs(tmp_dir, exist_ok=True)

        video_title = _download_youtube_audio(url, tmp_dir)
        if not video_title:
            return https_fn.Response("Failed to download Youtube video", status=500)

        # Upload the mp3 to Firebase Storage
        bucket_name_value = StringParam("STORAGE_BUCKET").value
        if not bucket_name_value:
            return https_fn.Response("No bucket name provided", status=500)

        upload_status = _upload_to_storage(
            f"{video_title}.mp3", bucket_name_value, tmp_dir, pid
        )
        if not upload_status:
            return https_fn.Response("Failed to upload to Firebase Storage", status=500)

        # Clean up the tmp directory
        os.remove(os.path.join(tmp_dir, f"{video_title}.mp3"))
        print(f"Deleted {video_title}.mp3 from tmp directory")

        return https_fn.Response(
            f"Converted and updated {video_title}.mp3!", status=200
        )
    except Exception as e:
        return https_fn.Response(
            f"An error occured when converting youtube to mp3: {str(e)}", status=500
        )


def _normalize_youtube_url(url):
    parsed = urlparse(url)
    if parsed.netloc == "youtu.be":
        return f"https://www.youtube.com/watch?v={parsed.path[1:]}"
    return url


def _download_youtube_audio(youtube_url: str, tmp_dir: str) -> str:
    """
    Downloads the audio from a YouTube video and saves it as an MP3 file.

    Args:
        youtube_url (str): The URL of the YouTube video.
        tmp_dir (str): The directory to save the downloaded audio file.

    Returns:
        str: The title of the downloaded video.
    """

    try:
        youtube_url = _normalize_youtube_url(youtube_url)
        print(f"Downloading audio from {youtube_url}...")
        video_info = youtube_dl.YoutubeDL().extract_info(youtube_url, download=False)
        title = video_info["title"]

        filename = f"{title}.mp3"

        options = {
            "format": "bestaudio/best",
            "keepvideo": False,
            "outtmpl": os.path.join(tmp_dir, filename),
        }

        with youtube_dl.YoutubeDL(options) as ydl:
            ydl.download([video_info["webpage_url"]])

        return title
    except Exception as e:
        print(f"Error downloading YouTube audio: {e}")
        return None


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
