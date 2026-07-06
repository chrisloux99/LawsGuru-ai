"""Vector store — turbovec IdMapIndex wrapper with persistence."""

import json
import os
import sys
from pathlib import Path
from typing import Optional

import numpy as np

from turbovec import IdMapIndex

DATA_DIR = Path(os.environ.get("DATA_DIR", "./data"))
INDEX_PATH = DATA_DIR / "index.tvim"
DOCSTORE_PATH = DATA_DIR / "docstore.json"

# Global state
_index: Optional[IdMapIndex] = None
_docstore: dict[str, dict] = {}  # chunk_id -> {text, metadata}
_file_chunks: dict[str, list[str]] = {}  # drive_file_id -> [chunk_ids]

DIM = 768  # nomic-embed-text dimension
BIT_WIDTH = 4


def _get_index() -> IdMapIndex:
    global _index
    if _index is None:
        if INDEX_PATH.exists():
            _index = IdMapIndex.load(str(INDEX_PATH))
            _load_docstore()
        else:
            _index = IdMapIndex(dim=DIM, bit_width=BIT_WIDTH)
    return _index


def _load_docstore():
    global _docstore, _file_chunks
    if DOCSTORE_PATH.exists():
        data = json.loads(DOCSTORE_PATH.read_text())
        _docstore = data.get("docstore", {})
        _file_chunks = data.get("file_chunks", {})


def _save():
    """Persist index and docstore to disk."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    _get_index().write(str(INDEX_PATH))
    DOCSTORE_PATH.write_text(
        json.dumps({"docstore": _docstore, "file_chunks": _file_chunks})
    )


def add_documents(chunks: list[dict]):
    """Add document chunks to the index. Each chunk has id, text, metadata."""
    from embedder import embed_texts

    index = _get_index()

    ids = []
    texts = []
    for chunk in chunks:
        cid = chunk["id"]
        ids.append(cid)
        texts.append(chunk["text"])

        # Update docstore
        _docstore[cid] = {"text": chunk["text"], "metadata": chunk["metadata"]}

        # Track file -> chunks mapping
        fid = chunk["metadata"]["driveFileId"]
        if fid not in _file_chunks:
            _file_chunks[fid] = []
        if cid not in _file_chunks[fid]:
            _file_chunks[fid].append(cid)

    # Embed
    embeddings = embed_texts(texts)

    # Convert IDs to uint64
    id_array = np.array(
        [int(h, 16) & 0xFFFFFFFFFFFFFFFF for h in ids], dtype=np.uint64
    )

    index.add_with_ids(embeddings, id_array)
    _save()


def search(
    query_embedding: np.ndarray, k: int = 5, allowlist_ids: Optional[list[str]] = None
) -> list[dict]:
    """Search the index. Returns list of {chunk_id, score, text, metadata}."""
    index = _get_index()

    if len(index) == 0:
        return []

    query = query_embedding.reshape(1, -1)

    allowlist = None
    if allowlist_ids:
        allowlist = np.array(
            [int(h, 16) & 0xFFFFFFFFFFFFFFFF for h in allowlist_ids],
            dtype=np.uint64,
        )

    scores, ids = index.search(query, k=k, allowlist=allowlist)

    results = []
    for score, chunk_hash in zip(scores[0], ids[0]):
        # Find the chunk_id from the hash
        chunk_id = None
        for cid in _docstore:
            cid_hash = int(cid, 16) & 0xFFFFFFFFFFFFFFFF
            if cid_hash == chunk_hash:
                chunk_id = cid
                break

        if chunk_id and chunk_id in _docstore:
            results.append(
                {
                    "chunk_id": chunk_id,
                    "score": float(score),
                    "text": _docstore[chunk_id]["text"],
                    "metadata": _docstore[chunk_id]["metadata"],
                }
            )

    return results


def remove_by_file_id(drive_file_id: str) -> int:
    """Remove all chunks of a document by Drive file ID."""
    index = _get_index()
    chunk_ids = _file_chunks.get(drive_file_id, [])
    removed = 0

    for cid in chunk_ids:
        cid_hash = int(cid, 16) & 0xFFFFFFFFFFFFFFFF
        try:
            if index.remove(cid_hash):
                removed += 1
        except (KeyError, Exception):
            pass
        _docstore.pop(cid, None)

    _file_chunks.pop(drive_file_id, None)
    if removed > 0:
        _save()
    return removed


def get_status() -> dict:
    """Get index status info."""
    index = _get_index()

    index_size = 0
    if INDEX_PATH.exists():
        index_size = INDEX_PATH.stat().st_size

    return {
        "totalVectors": len(index),
        "totalDocuments": len(_file_chunks),
        "dim": index.dim or DIM,
        "bitWidth": BIT_WIDTH,
        "indexSize": _format_size(index_size),
    }


def list_documents() -> list[dict]:
    """List all indexed documents."""
    result = []
    for fid, chunk_ids in _file_chunks.items():
        if not chunk_ids:
            continue
        first_chunk = _docstore.get(chunk_ids[0], {})
        meta = first_chunk.get("metadata", {})
        result.append(
            {
                "driveFileId": fid,
                "fileName": meta.get("fileName", "Unknown"),
                "mimeType": meta.get("mimeType", ""),
                "chunkCount": len(chunk_ids),
                "indexedAt": meta.get("indexedAt", ""),
                "lastModified": meta.get("lastModified", ""),
            }
        )
    return result


def _format_size(size_bytes: int) -> str:
    if size_bytes == 0:
        return "0 B"
    k = 1024
    sizes = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= k and i < len(sizes) - 1:
        size_bytes /= k
        i += 1
    return f"{size_bytes:.1f} {sizes[i]}"


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--status", action="store_true")
    parser.add_argument("--list", action="store_true")
    parser.add_argument("--remove", type=str, help="Drive file ID to remove")
    args = parser.parse_args()

    if args.status:
        print(json.dumps(get_status()))
    elif args.list:
        print(json.dumps(list_documents()))
    elif args.remove:
        removed = remove_by_file_id(args.remove)
        print(json.dumps({"removed": removed}))
    else:
        print(json.dumps(get_status()))
