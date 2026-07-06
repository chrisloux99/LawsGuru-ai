"""Embedding service — wraps Ollama nomic-embed-text."""

import json
import sys
from typing import Optional

import ollama
import numpy as np


DEFAULT_MODEL = "nomic-embed-text"
DEFAULT_HOST = "http://localhost:11434"


def get_client(host: Optional[str] = None) -> ollama.Client:
    return ollama.Client(host=host or DEFAULT_HOST)


def embed_texts(
    texts: list[str],
    model: str = DEFAULT_MODEL,
    host: Optional[str] = None,
) -> np.ndarray:
    """Embed a batch of texts. Returns float32 array of shape (n, dim)."""
    client = get_client(host)

    all_embeddings = []
    for text in texts:
        response = client.embeddings(model=model, prompt=text)
        all_embeddings.append(response["embedding"])

    return np.array(all_embeddings, dtype=np.float32)


def embed_query(
    query: str,
    model: str = DEFAULT_MODEL,
    host: Optional[str] = None,
) -> np.ndarray:
    """Embed a single query. Returns float32 array of shape (dim,)."""
    client = get_client(host)
    response = client.embeddings(model=model, prompt=query)
    return np.array(response["embedding"], dtype=np.float32)


def get_dim(model: str = DEFAULT_MODEL, host: Optional[str] = None) -> int:
    """Get the embedding dimension by probing with a test string."""
    vec = embed_texts(["test"], model=model, host=host)
    return vec.shape[1]


if __name__ == "__main__":
    # Test embedding
    dim = get_dim()
    print(json.dumps({"dim": dim, "model": DEFAULT_MODEL}))
