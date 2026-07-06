"""RAG pipeline — embed query, search turbovec, build context."""

import json
import sys
import os
from pathlib import Path

# Add python dir to path
sys.path.insert(0, str(Path(__file__).parent))

from embedder import embed_query
from vector_store import search


def run_pipeline(query: str, k: int = 5) -> dict:
    """Run the RAG pipeline: embed query -> search -> build context."""
    # Embed the query
    query_vec = embed_query(query)

    # Search the vector store
    results = search(query_vec, k=k)

    # Build context string
    context_parts = []
    sources = []

    for i, r in enumerate(results):
        source_label = f"[Source {i+1}: {r['metadata'].get('fileName', 'Unknown')}]"
        context_parts.append(f"{source_label}\n{r['text']}")
        sources.append(
            {
                "fileName": r["metadata"].get("fileName", "Unknown"),
                "score": r["score"],
                "chunkIndex": r["metadata"].get("chunkIndex", 0),
            }
        )

    context = "\n\n---\n\n".join(context_parts)

    return {"context": context, "sources": sources}


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--query", required=True, help="Search query")
    parser.add_argument("--k", type=int, default=5, help="Number of results")
    args = parser.parse_args()

    result = run_pipeline(args.query, args.k)
    print(json.dumps(result))
