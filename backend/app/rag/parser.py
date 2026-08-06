from app.schemas.chat import AnswerBullet, AnswerSection


def parse_markdown(text: str) -> list[AnswerSection]:
    """Convert Claude's markdown response to AnswerSection[].

    ## heading    → AnswerSection.heading
    plain text    → AnswerSection.paragraph
    - **lead** …  → AnswerSection.bullets entry

    Malformed input never raises — it degrades to paragraph content.
    """
    sections: list[AnswerSection] = []
    heading: str | None = None
    paragraph: str | None = None
    bullets: list[AnswerBullet] = []

    def flush() -> None:
        if heading is not None or paragraph is not None or bullets:
            sections.append(
                AnswerSection(heading=heading, paragraph=paragraph, bullets=list(bullets))
            )

    for raw_line in text.split("\n"):
        line = raw_line.rstrip()

        if not line:
            continue

        if line.startswith("#"):
            flush()
            heading = line.lstrip("#").strip()
            paragraph = None
            bullets.clear()
            continue

        if line.startswith("- "):
            body = line[2:].strip()
            if body.startswith("**"):
                inner = body[2:]
                close = inner.find("**")
                if close != -1:
                    lead = inner[:close]
                    continuation = inner[close + 2:].lstrip("— ").strip()
                    bullets.append(AnswerBullet(lead=lead, continuation=continuation))
                    continue
            # Malformed or plain bullet — treat as paragraph content
            paragraph = (paragraph + " " + line).strip() if paragraph else line
            continue

        paragraph = (paragraph + " " + line).strip() if paragraph else line

    flush()
    return sections
