from app.rag.parser import parse_markdown


def test_heading_and_paragraph_round_trip():
    text = "## Overall alignment\n\nStrong. Linear weights product judgement."
    sections = parse_markdown(text)
    assert len(sections) == 1
    assert sections[0].heading == "Overall alignment"
    assert "Strong" in sections[0].paragraph
    assert sections[0].bullets == []


def test_bullets_parsed_with_lead_and_continuation():
    text = (
        "## Where you match\n\n"
        "- **Product-owned surfaces** — you led the billing dashboard end to end.\n"
        "- **React and TypeScript at depth** — six years, two on a design-systems team."
    )
    sections = parse_markdown(text)
    assert len(sections) == 1
    assert sections[0].heading == "Where you match"
    assert len(sections[0].bullets) == 2
    assert sections[0].bullets[0].lead == "Product-owned surfaces"
    assert "billing dashboard" in sections[0].bullets[0].continuation
    assert sections[0].bullets[1].lead == "React and TypeScript at depth"


def test_multiple_sections_split_correctly():
    text = (
        "## Section one\n\nParagraph one.\n\n"
        "## Section two\n\nParagraph two."
    )
    sections = parse_markdown(text)
    assert len(sections) == 2
    assert sections[0].heading == "Section one"
    assert sections[1].heading == "Section two"


def test_no_heading_section():
    text = "Just a plain closing paragraph with no heading."
    sections = parse_markdown(text)
    assert len(sections) == 1
    assert sections[0].heading is None
    assert "closing paragraph" in sections[0].paragraph


def test_malformed_input_does_not_raise():
    assert parse_markdown("") == []
    assert parse_markdown("**unclosed bold") is not None
    result = parse_markdown("## Heading only")
    assert result[0].heading == "Heading only"
    assert result[0].paragraph is None
    assert result[0].bullets == []
    # Bullet with no closing ** falls back gracefully
    result2 = parse_markdown("- **no closing")
    assert result2 is not None


def test_h1_treated_as_heading():
    text = "# Top level heading\n\nContent below."
    sections = parse_markdown(text)
    assert sections[0].heading == "Top level heading"
