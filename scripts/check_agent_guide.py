#!/usr/bin/env python3
"""Guard the published code-agent guide against drift and duplicate sources."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from check_versions import read_versions_page  # noqa: E402


GUIDES = (
    Path("static/EDGE_AGENT_GUIDE.md"),
    Path("static/EDGE_AGENT_GUIDE.zh.md"),
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="edge-developers checkout root")
    args = parser.parse_args()

    root = args.root.resolve()
    versions = read_versions_page(root / "docs" / "versions.md")
    failures: list[str] = []

    for rel in GUIDES:
        path = root / rel
        if not path.exists():
            failures.append(f"missing guide source: {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        check_contains(rel, text, "# EDGE_AGENT_GUIDE.md", failures)
        check_contains(rel, text, "edge-studio 0.0.1rc22", failures, replacement=f"edge-studio {versions.edge_studio}")
        check_contains(rel, text, versions.edge_kit, failures)
        check_contains(rel, text, versions.edge_engine, failures)
        check_contains(rel, text, versions.edge_halo_binary, failures)
        check_contains(rel, text, "edge demo learn run", failures)
        check_contains(rel, text, "edge export scaffold", failures)
        check_contains(rel, text, "Neural Imprint", failures)
        if len(text.splitlines()) < 200:
            failures.append(f"{rel}: guide is unexpectedly short")

    for base in (root / "docs", root / "i18n"):
        if not base.exists():
            continue
        for duplicate in base.rglob("EDGE_AGENT_GUIDE*.md"):
            failures.append(
                f"{duplicate.relative_to(root)}: duplicate guide source; keep the canonical published guide under static/"
            )

    if failures:
        print("Agent guide guard failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    print("Agent guide guard ok: static/EDGE_AGENT_GUIDE*.md are the canonical published sources")
    return 0


def check_contains(
    rel: Path,
    text: str,
    needle: str,
    failures: list[str],
    *,
    replacement: str | None = None,
) -> None:
    expected = replacement or needle
    if expected not in text:
        failures.append(f"{rel}: missing `{expected}`")


if __name__ == "__main__":
    raise SystemExit(main())
