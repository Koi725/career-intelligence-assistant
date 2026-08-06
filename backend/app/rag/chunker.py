import bisect

import tiktoken


class Chunker:
    # cl100k_base is the tokenizer for text-embedding-3-small. Chunk budgets
    # are counted in OpenAI tokens while generation runs on Claude — close
    # enough at this scope, but naming it rather than leaving it implicit.
    CHUNK_SIZE = 500
    CHUNK_OVERLAP = 50

    def __init__(self) -> None:
        self._enc = tiktoken.get_encoding("cl100k_base")

    def chunk_resume(self, pages: list[str]) -> list[dict]:
        tagged: list[tuple[int, str]] = []
        for page_num, page_text in enumerate(pages, 1):
            for para in page_text.split("\n\n"):
                para = para.strip()
                if para:
                    tagged.append((page_num, para))
        return self._chunk(tagged, "page")

    def chunk_job(self, text: str) -> list[dict]:
        tagged: list[tuple[int, str]] = []
        for section_num, para in enumerate(text.split("\n\n"), 1):
            para = para.strip()
            if para:
                tagged.append((section_num, para))
        return self._chunk(tagged, "section")

    def _chunk(self, tagged: list[tuple[int, str]], meta_key: str) -> list[dict]:
        if not tagged:
            return []

        all_tokens: list[int] = []
        para_ends: set[int] = set()
        meta_starts: list[int] = []
        meta_values: list[int] = []

        for meta_val, para in tagged:
            start = len(all_tokens)
            tokens = self._enc.encode(para)
            if not tokens:
                continue
            meta_starts.append(start)
            meta_values.append(meta_val)
            all_tokens.extend(tokens)
            para_ends.add(len(all_tokens))

        if not all_tokens:
            return []

        def meta_at(pos: int) -> int:
            idx = bisect.bisect_right(meta_starts, pos) - 1
            return meta_values[max(0, idx)]

        chunks: list[dict] = []
        pos = 0

        while pos < len(all_tokens):
            ideal_end = min(pos + self.CHUNK_SIZE, len(all_tokens))

            # Prefer paragraph boundaries to avoid splitting mid-sentence;
            # fall back to a hard split only when no boundary fits the window.
            chunk_end = ideal_end
            if ideal_end < len(all_tokens):
                candidates = [e for e in para_ends if pos < e <= ideal_end]
                if candidates:
                    chunk_end = max(candidates)

            content = self._enc.decode(all_tokens[pos:chunk_end])
            chunks.append({"content": content.strip(), "meta": {meta_key: meta_at(pos)}})

            if chunk_end >= len(all_tokens):
                break

            next_pos = chunk_end - self.CHUNK_OVERLAP
            pos = next_pos if next_pos > pos else chunk_end

        total = len(chunks)
        for i, chunk in enumerate(chunks):
            chunk["meta"]["chunk_index"] = i + 1
            chunk["meta"]["total"] = total

        return chunks
