#!/usr/bin/env python3
"""Compare English and Chinese docs structure."""

from __future__ import annotations

import argparse
import re
import sys
from collections import Counter
from dataclasses import dataclass
from pathlib import Path


ZH_DOCS = Path("i18n/zh/docusaurus-plugin-content-docs/current")


@dataclass(frozen=True)
class Structure:
    headings: tuple[int, ...]
    code_fences: Counter[str]
    tables: int
    admonitions: Counter[str]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="edge-developers checkout root")
    parser.add_argument("--min-pairs", type=int, default=45, help="Minimum mirrored doc pairs expected")
    args = parser.parse_args()

    root = args.root.resolve()
    failures: list[str] = []
    pair_count = 0

    for en_path in sorted((root / "docs").rglob("*.md")):
        rel = en_path.relative_to(root / "docs")
        zh_path = root / ZH_DOCS / rel
        if not zh_path.exists():
            failures.append(f"{en_path.relative_to(root)}: missing zh mirror at {ZH_DOCS / rel}")
            continue
        pair_count += 1
        en = extract_structure(en_path)
        zh = extract_structure(zh_path)
        label = rel.as_posix()
        if en.headings != zh.headings:
            failures.append(
                f"{label}: heading level tree differs: en={list(en.headings)} zh={list(zh.headings)}"
            )
        if en.code_fences != zh.code_fences:
            failures.append(
                f"{label}: fenced code languages differ: en={dict(en.code_fences)} zh={dict(zh.code_fences)}"
            )
        if en.tables != zh.tables:
            failures.append(f"{label}: table count differs: en={en.tables} zh={zh.tables}")
        if en.admonitions != zh.admonitions:
            failures.append(
                f"{label}: admonitions differ: en={dict(en.admonitions)} zh={dict(zh.admonitions)}"
            )

    if pair_count < args.min_pairs:
        failures.append(f"expected at least {args.min_pairs} mirrored docs, found {pair_count}")

    if failures:
        print("i18n structure guard failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    print(f"i18n structure guard ok: pairs={pair_count}")
    return 0


def extract_structure(path: Path) -> Structure:
    headings: list[int] = []
    code_fences: Counter[str] = Counter()
    admonitions: Counter[str] = Counter()
    tables = 0
    in_fence = False

    for line in path.read_text(encoding="utf-8").splitlines():
        fence_match = re.match(r"^```(?P<lang>[A-Za-z0-9_+.-]*)\s*$", line)
        if fence_match:
            if not in_fence:
                code_fences[fence_match.group("lang") or "plain"] += 1
            in_fence = not in_fence
            continue
        if in_fence:
            continue

        heading_match = re.match(r"^(?P<marks>#{1,6})\s+\S", line)
        if heading_match:
            headings.append(len(heading_match.group("marks")))
            continue

        admonition_match = re.match(r"^:::(?P<kind>[A-Za-z][A-Za-z0-9_-]*)(?:\s|$)", line)
        if admonition_match:
            admonitions[admonition_match.group("kind")] += 1
            continue

        if is_table_separator(line):
            tables += 1

    return Structure(
        headings=tuple(headings),
        code_fences=code_fences,
        tables=tables,
        admonitions=admonitions,
    )


def is_table_separator(line: str) -> bool:
    stripped = line.strip()
    if "|" not in stripped or "---" not in stripped:
        return False
    cells = [cell.strip() for cell in stripped.strip("|").split("|")]
    if len(cells) < 2:
        return False
    return all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells)


if __name__ == "__main__":
    raise SystemExit(main())
