from typing import Protocol, runtime_checkable

from fastembed import TextEmbedding


@runtime_checkable
class Embedder(Protocol):
    def embed(self, texts: list[str]) -> list[list[float]]:
        ...


class LocalEmbedder:
    def __init__(self) -> None:
        self._model = TextEmbedding("BAAI/bge-small-en-v1.5")

    def embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        return [emb.tolist() for emb in self._model.embed(texts)]
