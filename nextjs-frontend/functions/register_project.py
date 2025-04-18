import json
import os
import datetime as _dt
from typing import Any, Dict, List, Optional

from firebase_functions import https_fn
from google.cloud import storage
import firebase_admin
from firebase_admin import firestore

BUCKET_NAME: str = "STORAGE_BUCKET"

db = firestore.Client()
storage_client = storage.Client()
bucket = storage_client.bucket(BUCKET_NAME)

# Where we stage files inside the Cloud Function
TMP_DIR = "/tmp"

# --- helpers -----------------------------------------------------------------
VALID_EXTS = (".mp3", ".wav", ".flac", ".aac")


def _err(message: str, status: int = 400) -> https_fn.Response:
    return https_fn.Response(json.dumps({"error": message}), status)


def _json_resp(obj: Dict[str, Any], status: int = 200) -> https_fn.Response:
    return https_fn.Response(json.dumps(obj), status, {"Content-Type": "application/json"})


# --- HTTPS Function ----------------------------------------------------------
@https_fn.on_request(memory=512, timeout_sec=60, cpu=1)
def register_project(req: https_fn.Request) -> https_fn.Response:

    if req.method != "POST":
        return _err("POST only", 405)

    data: Dict[str, Any] = req.get_json(silent=True) or {}
    required = ("pid", "pName", "storagePath")
    if not all(k in data and data[k] for k in required):
        return _err(f"Missing required fields: {', '.join(required)}")

    pid: str = data["pid"]
    p_name: str = data["pName"]
    storage_path: str = data["storagePath"]
    uid: Optional[str] = data.get("uid")
    is_public: bool = bool(data.get("isPublic", False))
    collab_ids: List[str] = data.get("collaboratorIds", [])

    # ------------------------------------------------------------------ #
    # 1 . Validate Storage object & pull metadata
    # ------------------------------------------------------------------ #
    blob = bucket.blob(storage_path)
    if not blob.exists():
        return _err("File not found in storage", 404)

    blob.reload()
    filename_lc = os.path.basename(storage_path).lower()
    if not filename_lc.endswith(VALID_EXTS):
        return _err("Invalid file type")

    size = blob.size or 0
    content_type = blob.content_type or "application/octet-stream"

    # Signed URL (change expiry as needed)
    download_url = blob.generate_signed_url(
        method="GET",
        version="v4",
    )

    # ------------------------------------------------------------------ #
    # 2 . Create / update Project doc
    # ------------------------------------------------------------------ #
    project_ref = db.collection("projects").document(pid)
    now = firestore.SERVER_TIMESTAMP

    project_doc = {
        "pid": pid,
        "uid": uid,
        "pName": p_name,
        "createdAt": now,
        "updatedAt": now,
        "collaboratorIds": collab_ids,
        "originalMp3": storage_path,
        "isPublic": is_public,
        "tracks": [],                           # empty until you add stems
    }

    project_ref.set(project_doc, merge=True)

    # ------------------------------------------------------------------ #
    # 3 . Add CloudFile sub‑doc
    # ------------------------------------------------------------------ #
    cloud_file = {
        "url": download_url,
        "size": size,
        "contentType": content_type,
        "uploadDate": now,
        "storagePath": storage_path,
    }
    project_ref.collection("files").add(cloud_file)

    # ------------------------------------------------------------------ #
    # 4 . Return success
    # ------------------------------------------------------------------ #
    return _json_resp(
        {
            "status": "ok",
            "projectDocPath": project_ref.path,
            "fileDocAdded": True,
            "downloadUrl": download_url,
        }
    )
