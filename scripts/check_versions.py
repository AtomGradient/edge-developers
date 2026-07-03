#!/usr/bin/env python3
"""Validate public docs version pins against release authority files."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


PYPI_URL = "https://pypi.org/pypi/edge-studio/json"


@dataclass(frozen=True)
class Versions:
    edge_studio: str
    edge_kit: str
    edge_engine: str
    edge_halo_binary: str
    scaffold_edge_kit: str
    scaffold_edge_halo_binary: str


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="edge-developers checkout root")
    parser.add_argument("--edge-kit-repo", type=Path, default=None, help="edge-kit checkout")
    parser.add_argument("--edge-scaffold-repo", type=Path, default=None, help="edge-scaffold checkout")
    parser.add_argument("--edge-halo-binary-repo", type=Path, default=None, help="edge-halo-binary checkout")
    parser.add_argument("--skip-pypi", action="store_true", help="Skip the live PyPI latest-release check")
    parser.add_argument(
        "--print",
        dest="print_key",
        choices=["edge-studio", "edge-kit", "edge-engine", "edge-halo-binary"],
        help="Print one version from docs/versions.md and exit",
    )
    args = parser.parse_args()

    root = args.root.resolve()
    doc_versions = read_versions_page(root / "docs" / "versions.md")

    if args.print_key:
        mapping = {
            "edge-studio": doc_versions.edge_studio,
            "edge-kit": doc_versions.edge_kit,
            "edge-engine": doc_versions.edge_engine,
            "edge-halo-binary": doc_versions.edge_halo_binary,
        }
        print(mapping[args.print_key])
        return 0

    zh_versions = read_versions_page(root / "i18n/zh/docusaurus-plugin-content-docs/current/versions.md")
    failures: list[str] = []
    compare_versions("i18n zh versions page", doc_versions, zh_versions, failures)

    authorities = read_authority_versions(
        root=root,
        edge_kit_repo=args.edge_kit_repo,
        edge_scaffold_repo=args.edge_scaffold_repo,
        edge_halo_binary_repo=args.edge_halo_binary_repo,
        skip_pypi=args.skip_pypi,
    )
    compare_versions("authority files", doc_versions, authorities, failures)
    failures.extend(scan_public_pin_fragments(root, doc_versions))

    if failures:
        print("Version guard failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    print(
        "Version guard ok: "
        f"edge-studio={doc_versions.edge_studio}, "
        f"edge-kit={doc_versions.edge_kit}, "
        f"edge-engine={doc_versions.edge_engine}, "
        f"edge-halo-binary={doc_versions.edge_halo_binary}"
    )
    return 0


def read_versions_page(path: Path) -> Versions:
    text = read_text(path)

    edge_studio_match = re.search(r"edge-studio==(?P<version>0\.0\.1rc\d+)", text)
    edge_studio_tag_match = re.search(r"GitHub tag `v(?P<version>0\.0\.1rc\d+)`", text)
    edge_kit_match = re.search(r"\|\s*Edge Kit\s*\|\s*`(?P<version>1\.0\.0-rc\d+)`", text)
    edge_engine_match = re.search(r"\|\s*Edge Engine\s*\|\s*`(?P<version>1\.0\.0-rc\d+)`", text)
    edge_halo_match = re.search(r"\|\s*Edge Halo binary\s*\|\s*`(?P<version>1\.0\.0-rc\d+)`", text)
    scaffold_match = re.search(
        r"\|\s*Edge Scaffold\s*\|\s*[^`]*`(?P<kit>1\.0\.0-rc\d+)`[^`]*`(?P<halo>1\.0\.0-rc\d+)`",
        text,
    )
    required = {
        "edge-studio": edge_studio_match,
        "edge-studio GitHub tag": edge_studio_tag_match,
        "edge-kit": edge_kit_match,
        "edge-engine": edge_engine_match,
        "edge-halo-binary": edge_halo_match,
        "edge-scaffold": scaffold_match,
    }
    missing = [name for name, match in required.items() if match is None]
    if missing:
        raise SystemExit(f"{path}: missing version entries: {', '.join(missing)}")

    edge_studio = edge_studio_match.group("version")
    if edge_studio_tag_match.group("version") != edge_studio:
        raise SystemExit(f"{path}: PyPI pin and GitHub tag disagree")

    return Versions(
        edge_studio=edge_studio,
        edge_kit=edge_kit_match.group("version"),
        edge_engine=edge_engine_match.group("version"),
        edge_halo_binary=edge_halo_match.group("version"),
        scaffold_edge_kit=scaffold_match.group("kit"),
        scaffold_edge_halo_binary=scaffold_match.group("halo"),
    )


def read_authority_versions(
    *,
    root: Path,
    edge_kit_repo: Path | None,
    edge_scaffold_repo: Path | None,
    edge_halo_binary_repo: Path | None,
    skip_pypi: bool,
) -> Versions:
    edge_kit_root = resolve_repo(
        root,
        edge_kit_repo,
        env_name="EDGE_KIT_REPO",
        repo_name="edge-kit",
        sentinel=".dependency_versions",
    )
    scaffold_root = resolve_repo(
        root,
        edge_scaffold_repo,
        env_name="EDGE_SCAFFOLD_REPO",
        repo_name="edge-scaffold",
        sentinel="project.yml",
    )
    halo_binary_root = resolve_repo(
        root,
        edge_halo_binary_repo,
        env_name="EDGE_HALO_BINARY_REPO",
        repo_name="edge-halo-binary",
        sentinel="Package.swift",
    )

    dependency_versions = read_key_values(edge_kit_root / ".dependency_versions")
    scaffold_text = read_text(scaffold_root / "project.yml")
    halo_package_text = read_text(halo_binary_root / "Package.swift")

    edge_studio = os.environ.get("EDGE_STUDIO_PYPI_VERSION", "").strip()
    if not edge_studio and not skip_pypi:
        edge_studio = latest_pypi_version()
    if not edge_studio:
        edge_studio = "__pypi_skipped__"

    return Versions(
        edge_studio=edge_studio,
        edge_kit=require_key(dependency_versions, "edge_kit", edge_kit_root / ".dependency_versions"),
        edge_engine=require_key(dependency_versions, "edge_engine", edge_kit_root / ".dependency_versions"),
        edge_halo_binary=extract_halo_binary_version(halo_package_text, halo_binary_root / "Package.swift"),
        scaffold_edge_kit=extract_project_exact_version(scaffold_text, "EdgeKit", scaffold_root / "project.yml"),
        scaffold_edge_halo_binary=extract_project_exact_version(scaffold_text, "EdgeHalo", scaffold_root / "project.yml"),
    )


def resolve_repo(root: Path, explicit: Path | None, *, env_name: str, repo_name: str, sentinel: str) -> Path:
    candidates: list[Path] = []
    if explicit is not None:
        candidates.append(explicit)
    env_value = os.environ.get(env_name, "").strip()
    if env_value:
        candidates.append(Path(env_value))
    candidates.extend([root.parent / repo_name, root / ".ci-deps" / repo_name])

    for candidate in candidates:
        resolved = candidate.expanduser().resolve()
        if (resolved / sentinel).exists():
            return resolved

    searched = ", ".join(str(path.expanduser()) for path in candidates)
    raise SystemExit(
        f"cannot find {repo_name}/{sentinel}; set {env_name} or pass --{repo_name}-repo. searched: {searched}"
    )


def read_key_values(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for raw_line in read_text(path).splitlines():
        line = raw_line.split("#", 1)[0].strip()
        if not line or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


def require_key(values: dict[str, str], key: str, path: Path) -> str:
    value = values.get(key)
    if not value:
        raise SystemExit(f"{path}: missing {key}")
    return value


def extract_project_exact_version(text: str, package_name: str, path: Path) -> str:
    pattern = re.compile(
        rf"^\s{{2}}{re.escape(package_name)}:\s*$"
        rf"(?P<body>(?:\n\s{{4,}}\S.*)+)",
        re.MULTILINE,
    )
    match = pattern.search(text)
    if not match:
        raise SystemExit(f"{path}: missing package {package_name}")
    version_match = re.search(r"^\s+exactVersion:\s*(?P<version>1\.0\.0-rc\d+)\s*$", match.group("body"), re.MULTILINE)
    if not version_match:
        raise SystemExit(f"{path}: package {package_name} missing exactVersion")
    return version_match.group("version")


def extract_halo_binary_version(text: str, path: Path) -> str:
    match = re.search(r"/releases/download/(?P<version>1\.0\.0-rc\d+)/EdgeHalo\.xcframework\.zip", text)
    if not match:
        raise SystemExit(f"{path}: missing EdgeHalo binary release URL")
    return match.group("version")


def latest_pypi_version() -> str:
    with urllib.request.urlopen(PYPI_URL, timeout=20) as response:
        payload = json.loads(response.read().decode("utf-8"))
    releases = payload.get("releases")
    if isinstance(releases, dict) and releases:
        versions = [version for version in releases if version_key(version) is not None]
        if versions:
            return max(versions, key=lambda version: version_key(version) or ())
    info = payload.get("info") if isinstance(payload.get("info"), dict) else {}
    version = str(info.get("version") or "").strip()
    if version:
        return version
    raise SystemExit("PyPI response did not include a usable edge-studio version")


def version_key(version: str) -> tuple[int, int, int, int, int] | None:
    match = re.fullmatch(r"(\d+)\.(\d+)\.(\d+)(?:rc(\d+))?", version)
    if not match:
        return None
    major, minor, patch = (int(match.group(index)) for index in (1, 2, 3))
    rc = match.group(4)
    return (major, minor, patch, 0 if rc is not None else 1, int(rc or 0))


def compare_versions(label: str, expected: Versions, actual: Versions, failures: list[str]) -> None:
    fields = (
        "edge_studio",
        "edge_kit",
        "edge_engine",
        "edge_halo_binary",
        "scaffold_edge_kit",
        "scaffold_edge_halo_binary",
    )
    for field in fields:
        actual_value = getattr(actual, field)
        if actual_value == "__pypi_skipped__":
            continue
        expected_value = getattr(expected, field)
        if actual_value != expected_value:
            failures.append(f"{label}: {field} is {actual_value}, docs/versions.md says {expected_value}")


def scan_public_pin_fragments(root: Path, versions: Versions) -> list[str]:
    failures: list[str] = []
    for path in public_text_files(root):
        rel = path.relative_to(root).as_posix()
        if rel.endswith("changelog.md"):
            continue
        text = read_text(path)
        lines = text.splitlines()

        for match in re.finditer(r"edge-studio==(?P<version>0\.0\.1rc\d+)", text):
            version = match.group("version")
            if version != versions.edge_studio:
                failures.append(f"{rel}: edge-studio install pin {version} != {versions.edge_studio}")

        for match in re.finditer(r"`v(?P<version>0\.0\.1rc\d+)`", text):
            version = match.group("version")
            if version != versions.edge_studio:
                failures.append(f"{rel}: Edge Studio tag v{version} != v{versions.edge_studio}")

        failures.extend(scan_swift_package_pins(rel, text, versions))
        failures.extend(scan_line_version_mentions(rel, lines, versions))
    return failures


def public_text_files(root: Path) -> Iterable[Path]:
    explicit = [root / "README.md", root / "README.zh.md"]
    for path in explicit:
        if path.exists():
            yield path
    for base in (
        root / "docs",
        root / "i18n/zh/docusaurus-plugin-content-docs/current",
        root / "static",
    ):
        if not base.exists():
            continue
        yield from sorted(path for path in base.rglob("*.md") if path.is_file())


def scan_swift_package_pins(rel: str, text: str, versions: Versions) -> list[str]:
    failures: list[str] = []
    pattern = re.compile(
        r'\.package\(\s*url:\s*"https://github\.com/AtomGradient/(?P<repo>edge-kit|edge-halo-binary)(?:\.git)?",\s*'
        r'exact:\s*"(?P<version>1\.0\.0-rc\d+)"',
        re.DOTALL,
    )
    for match in pattern.finditer(text):
        expected = versions.edge_kit if match.group("repo") == "edge-kit" else versions.edge_halo_binary
        if match.group("version") != expected:
            failures.append(f"{rel}: {match.group('repo')} SPM pin {match.group('version')} != {expected}")
    return failures


def scan_line_version_mentions(rel: str, lines: list[str], versions: Versions) -> list[str]:
    failures: list[str] = []
    for number, line in enumerate(lines, start=1):
        rc_versions = re.findall(r"1\.0\.0-rc\d+", line)
        if not rc_versions:
            continue
        lower = line.lower()
        checks: list[tuple[str, str]] = []
        table_surface = markdown_table_surface_label(line)
        if table_surface == "edge-kit":
            checks.append(("edge-kit", versions.edge_kit))
        elif table_surface == "edge-engine":
            checks.append(("edge-engine", versions.edge_engine))
        elif table_surface == "edge-halo-binary":
            checks.append(("edge-halo-binary", versions.edge_halo_binary))
        if table_surface != "edge-engine" and (
            "edge-kit" in lower or "edge kit" in lower or "git -c edge-kit checkout" in lower
        ):
            checks.append(("edge-kit", versions.edge_kit))
        if table_surface != "edge-kit" and ("edge-engine" in lower or "edge engine" in lower):
            checks.append(("edge-engine", versions.edge_engine))
        if table_surface != "edge-halo-binary" and ("edge-halo-binary" in lower or "edge halo binary" in lower):
            checks.append(("edge-halo-binary", versions.edge_halo_binary))
        if not checks:
            continue
        for label, expected in dict(checks).items():
            if expected not in rc_versions:
                failures.append(f"{rel}:{number}: {label} mention has {rc_versions}, expected {expected}")
    return failures


def markdown_table_surface_label(line: str) -> str | None:
    cells = [cell.strip().lower() for cell in line.strip().strip("|").split("|")]
    if not cells:
        return None
    first = cells[0]
    if first in {"edge kit", "edge-kit"}:
        return "edge-kit"
    if first in {"edge engine", "edge-engine"}:
        return "edge-engine"
    if first in {"edge halo binary", "edge-halo-binary"}:
        return "edge-halo-binary"
    return None


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise SystemExit(f"missing required file: {path}") from exc


if __name__ == "__main__":
    raise SystemExit(main())
