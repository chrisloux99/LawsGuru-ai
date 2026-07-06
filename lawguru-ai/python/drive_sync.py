"""Google Drive file sync — fetches documents from a Drive folder."""

import json
import sys
import os
import io
from pathlib import Path
from typing import Optional

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

SUPPORTED_MIMES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.google-apps.document",
}

DATA_DIR = Path(os.environ.get("DATA_DIR", "./data"))
DOWNLOAD_DIR = DATA_DIR / "drive_cache"


def get_drive_service(tokens: dict):
    creds = Credentials(
        token=tokens.get("access_token"),
        refresh_token=tokens.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ.get("GOOGLE_CLIENT_ID", ""),
        client_secret=os.environ.get("GOOGLE_CLIENT_SECRET", ""),
    )
    return build("drive", "v3", credentials=creds)


def list_folder_files(service, folder_id: str) -> list[dict]:
    """List all supported files in a Drive folder (non-recursive)."""
    files = []
    page_token = None

    while True:
        query = f"'{folder_id}' in parents and trashed = false"
        response = (
            service.files()
            .list(
                q=query,
                fields="nextPageToken, files(id, name, mimeType, modifiedTime, size)",
                pageToken=page_token,
                pageSize=100,
            )
            .execute()
        )

        for f in response.get("files", []):
            if f["mimeType"] in SUPPORTED_MIMES:
                files.append(f)

        page_token = response.get("nextPageToken")
        if not page_token:
            break

    return files


def download_file(service, file_id: str, mime_type: str, dest: Path) -> Path:
    """Download a file from Drive. For Google Docs, export as text."""
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

    if mime_type == "application/vnd.google-apps.document":
        # Export Google Docs as plain text
        request = service.files().export_media(fileId=file_id, mimeType="text/plain")
        dest = dest.with_suffix(".txt")
    else:
        request = service.files().get_media(fileId=file_id)

    with open(dest, "wb") as f:
        downloader = MediaIoBaseDownload(f, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()

    return dest


def load_sync_state() -> dict:
    state_file = DATA_DIR / "sync_state.json"
    if state_file.exists():
        return json.loads(state_file.read_text())
    return {}


def save_sync_state(state: dict):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "sync_state.json").write_text(json.dumps(state, indent=2))


def sync(tokens_json: str, folder_id: str) -> dict:
    """Sync files from Google Drive. Returns sync result."""
    tokens = json.loads(tokens_json)
    service = get_drive_service(tokens)

    files = list_folder_files(service, folder_id)
    sync_state = load_sync_state()

    new_files = []
    updated_files = []
    unchanged = 0

    for f in files:
        fid = f["id"]
        last_modified = f.get("modifiedTime", "")

        if fid in sync_state and sync_state[fid] == last_modified:
            unchanged += 1
            continue

        # Download file
        safe_name = f"{fid}_{f['name']}"
        dest = DOWNLOAD_DIR / safe_name
        try:
            downloaded = download_file(service, fid, f["mimeType"], dest)
            f["local_path"] = str(downloaded)
            sync_state[fid] = last_modified

            if fid in sync_state:
                updated_files.append(f)
            else:
                new_files.append(f)
        except Exception as e:
            print(f"Warning: Failed to download {f['name']}: {e}", file=sys.stderr)

    save_sync_state(sync_state)

    # Process and index new/updated files
    all_files = new_files + updated_files
    processed = 0

    if all_files:
        from doc_processor import process_file
        from vector_store import add_documents

        for f in all_files:
            try:
                chunks = process_file(
                    f["local_path"], f["mimeType"], f["id"], f["name"]
                )
                if chunks:
                    add_documents(chunks)
                    processed += 1
            except Exception as e:
                print(
                    f"Warning: Failed to process {f['name']}: {e}", file=sys.stderr
                )

    # Get updated index status
    from vector_store import get_status

    return {
        "total": len(files),
        "new": len(new_files),
        "updated": len(updated_files),
        "unchanged": unchanged,
        "processed": processed,
        "documents": get_status(),
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--tokens", required=True, help="JSON tokens string")
    parser.add_argument("--folder-id", required=True, help="Drive folder ID")
    args = parser.parse_args()

    result = sync(args.tokens, args.folder_id)
    print(json.dumps(result))
