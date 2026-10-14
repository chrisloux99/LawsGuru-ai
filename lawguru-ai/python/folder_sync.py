"""Local folder sync — indexes files from a local folder (or single file).

No Google Drive required: point it at any folder on this machine and it
walks it recursively, indexing PDF / DOCX / TXT files into turbovec.
Incremental: unchanged files (same mtime + size) are skipped, changed
files are removed from the index and re-added.
"""

import json
import os
import sys
from pathlib import Path

SUPPORTED_EXTENSIONS = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
}

# Directories to never descend into (junk / huge irrelevant trees)
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv", ".next"}

DATA_DIR = Path(os.environ.get("DATA_DIR", "./data"))
STATE_PATH = DATA_DIR / "folder_sync_state.json"


def mime_for(path: Path) -> str | None:
    return SUPPORTED_EXTENSIONS.get(path.suffix.lower())


def load_sync_state() -> dict:
    if STATE_PATH.exists():
        try:
            return json.loads(STATE_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def save_sync_state(state: dict):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")


def file_signature(path: Path) -> dict:
    stat = path.stat()
    return {"mtime": stat.st_mtime, "size": stat.st_size}


def collect_files(root: Path) -> list[Path]:
    """Return supported files under root (recursive). If root is a
    single supported file, return just it."""
    if root.is_file():
        return [root] if mime_for(root) else []

    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip junk directories in-place
        dirnames[:] = [
            d for d in dirnames if not d.startswith(".") and d not in SKIP_DIRS
        ]
        for name in filenames:
            if name.startswith("."):
                continue
            p = Path(dirpath) / name
            if mime_for(p):
                files.append(p)
    files.sort()
    return files


def sync(folder_path: str) -> dict:
    """Index supported files under folder_path. Returns sync result."""
    root = Path(folder_path).expanduser().resolve()
    if not root.exists():
        return {"error": f"Path not found: {root}"}

    files = collect_files(root)
    sync_state = load_sync_state()

    new_files = []
    updated_files = []
    unchanged = 0

    for f in files:
        fid = str(f)
        sig = file_signature(f)
        prev = sync_state.get(fid)

        if prev and prev.get("mtime") == sig["mtime"] and prev.get("size") == sig["size"]:
            unchanged += 1
            continue

        if prev:
            updated_files.append(f)
        else:
            new_files.append(f)
        sync_state[fid] = sig

    # Prune state entries for files that no longer exist on disk
    known_paths = {str(f) for f in files}
    removed_from_state = [
        fid for fid in sync_state if fid not in known_paths
    ]
    for fid in removed_from_state:
        sync_state.pop(fid, None)

    save_sync_state(sync_state)

    result = {
        "total": len(files),
        "new": len(new_files),
        "updated": len(updated_files),
        "unchanged": unchanged,
        "pruned": len(removed_from_state),
        "processed": 0,
        "failed": 0,
        "errors": [],
    }

    to_index = new_files + updated_files
    if not to_index and not removed_from_state:
        from vector_store import get_status

        result["documents"] = get_status()
        return result

    from datetime import datetime, timezone

    from doc_processor import process_file
    from vector_store import add_documents, get_status, remove_by_file_id

    now = datetime.now(timezone.utc).isoformat()

    # Re-index changed files: drop old chunks first so stale vectors
    # don't linger in the index.
    for f in updated_files:
        remove_by_file_id(str(f))

    for f in to_index:
        fid = str(f)
        mime = mime_for(f) or "text/plain"
        try:
            chunks = process_file(fid, mime, fid, f.name)
            if not chunks:
                result["failed"] += 1
                result["errors"].append(f"No text extracted: {f.name}")
                continue
            for chunk in chunks:
                chunk["metadata"]["indexedAt"] = now
                chunk["metadata"]["lastModified"] = now
                chunk["metadata"]["source"] = "local"
            add_documents(chunks)
            result["processed"] += 1
        except Exception as e:
            result["failed"] += 1
            result["errors"].append(f"{f.name}: {e}")

    # Files deleted from disk since last sync: drop their vectors too
    for fid in removed_from_state:
        remove_by_file_id(fid)

    result["documents"] = get_status()
    return result


def dry_run(folder_path: str) -> dict:
    """List what would be indexed without touching the index or
    requiring turbovec / Ollama to be installed."""
    root = Path(folder_path).expanduser().resolve()
    if not root.exists():
        return {"error": f"Path not found: {root}"}

    files = collect_files(root)
    sync_state = load_sync_state()

    new_count = 0
    updated_count = 0
    unchanged_count = 0
    listing = []
    for f in files:
        fid = str(f)
        sig = file_signature(f)
        prev = sync_state.get(fid)
        status = "new"
        if prev and prev.get("mtime") == sig["mtime"] and prev.get("size") == sig["size"]:
            status = "unchanged"
            unchanged_count += 1
        elif prev:
            status = "updated"
            updated_count += 1
        else:
            new_count += 1
        listing.append(
            {
                "path": fid,
                "name": f.name,
                "mime": mime_for(f),
                "sizeBytes": sig["size"],
                "status": status,
            }
        )

    return {
        "dry_run": True,
        "root": str(root),
        "total": len(files),
        "new": new_count,
        "updated": updated_count,
        "unchanged": unchanged_count,
        "files": listing,
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--folder", required=True, help="Local folder (or single file) to index"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List what would be indexed without indexing",
    )
    args = parser.parse_args()

    if args.dry_run:
        result = dry_run(args.folder)
    else:
        result = sync(args.folder)
    print(json.dumps(result))
