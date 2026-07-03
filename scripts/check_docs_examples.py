#!/usr/bin/env python3
"""Validate executable documentation examples against the Edge CLI."""

from __future__ import annotations

import argparse
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


LEARN_SAMPLE_SCHEMA = "edge.demo.learn.sample.v1"
FACTS_SCHEMA = "edge.demo.facts.v1"
TOOLS_MANIFEST_SCHEMA = "edge.demo.tools.manifest.v1"

KNOWN_EDGE_PREFIXES = tuple(
    tuple(value.split())
    for value in (
        "edge doctor",
        "edge --version",
        "edge studio",
        "edge models list",
        "edge models where",
        "edge models doctor",
        "edge models fetch",
        "edge export scaffold",
        "edge tools validate",
        "edge tools inspect",
        "edge demo chat",
        "edge demo facts import",
        "edge demo facts import-url",
        "edge demo facts crawl-url",
        "edge demo facts list",
        "edge demo facts inspect",
        "edge demo tools validate",
        "edge demo receipt",
        "edge demo local-only",
        "edge demo reuse",
        "edge demo imprint run",
        "edge demo imprint compare",
        "edge demo learn run",
        "edge demo learn sample init",
        "edge demo learn sample validate",
    )
)


@dataclass(frozen=True)
class Fence:
    path: Path
    line: int
    language: str
    body: str

    def label(self, root: Path) -> str:
        return f"{self.path.relative_to(root)}:{self.line}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="edge-developers checkout root")
    parser.add_argument("--edge-cli", default=os.environ.get("EDGE_CLI", ""), help="Path to the edge executable")
    parser.add_argument(
        "--edge-module",
        default=os.environ.get("EDGE_CLI_MODULE", "edgestudio.cli.main"),
        help="Python module entrypoint used when --edge-cli is not set",
    )
    parser.add_argument("--skip-cli", action="store_true", help="Only parse examples; do not call Edge CLI")
    args = parser.parse_args()

    root = args.root.resolve()
    edge_base = resolve_edge_base(args.edge_cli, args.edge_module)
    if not edge_base and not args.skip_cli:
        print("Edge CLI not found. Install edge-studio, set EDGE_CLI, or set EDGE_CLI_MODULE.", file=sys.stderr)
        return 1

    failures: list[str] = []
    stats = {"json": 0, "schema": 0, "python_tools": 0, "edge_help": 0}

    with tempfile.TemporaryDirectory(prefix="edge-docs-examples-") as tmp:
        tmp_root = Path(tmp)
        env = isolated_edge_env(tmp_root)
        all_fences = list(iter_fences(root))
        validate_json_fences(root, tmp_root, all_fences, edge_base, env, args.skip_cli, failures, stats)
        validate_python_tool_fences(root, tmp_root, all_fences, edge_base, env, args.skip_cli, failures, stats)
        validate_edge_commands(root, all_fences, edge_base, env, args.skip_cli, failures, stats)

    if failures:
        print("Docs example guard failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    print(
        "Docs example guard ok: "
        f"json={stats['json']}, schema_cli={stats['schema']}, "
        f"python_tools={stats['python_tools']}, edge_help={stats['edge_help']}"
    )
    return 0


def resolve_edge_base(edge_cli: str, edge_module: str) -> list[str]:
    if edge_cli:
        return [edge_cli]
    if edge_module:
        return [sys.executable, "-m", edge_module]
    discovered = shutil.which("edge")
    return [discovered] if discovered else []


def isolated_edge_env(tmp_root: Path) -> dict[str, str]:
    env = os.environ.copy()
    env["EDGESTUDIO_DATA_DIR"] = str(tmp_root / "edgestudio-data")
    env["EDGESTUDIO_CACHE_DIR"] = str(tmp_root / "edgestudio-cache")
    env["HOME"] = str(tmp_root / "home")
    return env


def iter_markdown_files(root: Path) -> Iterable[Path]:
    for base in (
        root / "docs",
        root / "i18n/zh/docusaurus-plugin-content-docs/current",
    ):
        if base.exists():
            yield from sorted(path for path in base.rglob("*.md") if path.is_file())
    for path in (root / "README.md", root / "README.zh.md", root / "static" / "EDGE_AGENT_GUIDE.md", root / "static" / "EDGE_AGENT_GUIDE.zh.md"):
        if path.exists():
            yield path


def iter_fences(root: Path) -> Iterable[Fence]:
    for path in iter_markdown_files(root):
        lines = path.read_text(encoding="utf-8").splitlines()
        index = 0
        while index < len(lines):
            opening = re.match(r"^```(?P<language>[A-Za-z0-9_+.-]*)\s*$", lines[index])
            if not opening:
                index += 1
                continue
            language = opening.group("language") or "plain"
            start_line = index + 1
            body_lines: list[str] = []
            index += 1
            while index < len(lines) and not lines[index].startswith("```"):
                body_lines.append(lines[index])
                index += 1
            yield Fence(path=path, line=start_line, language=language, body="\n".join(body_lines).strip("\n"))
            index += 1


def validate_json_fences(
    root: Path,
    tmp_root: Path,
    fences: list[Fence],
    edge_base: list[str],
    env: dict[str, str],
    skip_cli: bool,
    failures: list[str],
    stats: dict[str, int],
) -> None:
    learn_samples_by_path: dict[Path, Path] = {}
    parsed_blocks: list[tuple[Fence, Any, Path]] = []

    for fence in fences:
        if fence.language != "json":
            continue
        stats["json"] += 1
        try:
            payload = json.loads(fence.body)
        except json.JSONDecodeError as exc:
            failures.append(f"{fence.label(root)}: invalid JSON fence: {exc.msg}")
            continue
        out_path = tmp_root / "json" / safe_name(root, fence, ".json")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        parsed_blocks.append((fence, payload, out_path))
        if isinstance(payload, dict) and payload.get("schema_version") == LEARN_SAMPLE_SCHEMA:
            learn_samples_by_path[fence.path] = out_path

    if skip_cli:
        return

    for fence, payload, out_path in parsed_blocks:
        if not isinstance(payload, dict):
            continue
        schema = payload.get("schema_version")
        if schema == LEARN_SAMPLE_SCHEMA:
            run_edge_json(root, edge_base, ["demo", "learn", "sample", "validate", str(out_path), "--json"], env, fence, failures)
            stats["schema"] += 1
        elif schema == FACTS_SCHEMA:
            run_edge_json(root, edge_base, ["demo", "facts", "import", str(out_path), "--json"], env, fence, failures)
            stats["schema"] += 1
        elif schema == TOOLS_MANIFEST_SCHEMA:
            command = ["demo", "tools", "validate", str(out_path), "--json"]
            sample_path = learn_samples_by_path.get(fence.path)
            if sample_path is not None:
                command.extend(["--learn-sample", str(sample_path)])
            run_edge_json(root, edge_base, command, env, fence, failures)
            stats["schema"] += 1


def validate_python_tool_fences(
    root: Path,
    tmp_root: Path,
    fences: list[Fence],
    edge_base: list[str],
    env: dict[str, str],
    skip_cli: bool,
    failures: list[str],
    stats: dict[str, int],
) -> None:
    if skip_cli:
        return
    for fence in fences:
        if fence.language != "python" or "edge_tool" not in fence.body:
            continue
        out_path = tmp_root / "python" / safe_name(root, fence, ".py")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(fence.body + "\n", encoding="utf-8")
        run_edge_json(root, edge_base, ["tools", "validate", str(out_path), "--json"], env, fence, failures)
        stats["python_tools"] += 1


def validate_edge_commands(
    root: Path,
    fences: list[Fence],
    edge_base: list[str],
    env: dict[str, str],
    skip_cli: bool,
    failures: list[str],
    stats: dict[str, int],
) -> None:
    if skip_cli:
        return

    seen_prefixes: set[tuple[str, ...]] = set()
    for fence in fences:
        if fence.language != "bash":
            continue
        for command in edge_commands_from_bash(fence.body):
            prefix = command_prefix(command)
            if prefix is None:
                failures.append(f"{fence.label(root)}: unknown Edge CLI command: {' '.join(command[:5])}")
                continue
            if prefix in seen_prefixes:
                continue
            seen_prefixes.add(prefix)
            suffix = list(prefix[1:])
            if suffix != ["--version"]:
                suffix.append("--help")
            result = subprocess.run(
                [*edge_base, *suffix],
                cwd=str(root),
                env=env,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=30,
            )
            if result.returncode != 0:
                failures.append(
                    f"{fence.label(root)}: `{' '.join(prefix)} {'--help' if suffix != ['--version'] else ''}` failed "
                    f"({result.returncode}): {summarize_process(result)}"
                )
            else:
                stats["edge_help"] += 1


def edge_commands_from_bash(body: str) -> Iterable[list[str]]:
    logical_lines: list[str] = []
    current = ""
    for raw_line in body.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.endswith("\\"):
            current += line[:-1].rstrip() + " "
            continue
        current += line
        logical_lines.append(current.strip())
        current = ""
    if current.strip():
        logical_lines.append(current.strip())

    for line in logical_lines:
        if not line.startswith("edge "):
            continue
        try:
            tokens = shlex.split(line)
        except ValueError:
            continue
        if tokens and tokens[0] == "edge":
            yield tokens


def command_prefix(tokens: list[str]) -> tuple[str, ...] | None:
    best: tuple[str, ...] | None = None
    for prefix in KNOWN_EDGE_PREFIXES:
        if len(tokens) >= len(prefix) and tuple(tokens[: len(prefix)]) == prefix:
            if best is None or len(prefix) > len(best):
                best = prefix
    return best


def run_edge_json(
    root: Path,
    edge_base: list[str],
    args: list[str],
    env: dict[str, str],
    fence: Fence,
    failures: list[str],
) -> None:
    result = subprocess.run(
        [*edge_base, *args],
        cwd=str(root),
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=45,
    )
    if result.returncode != 0:
        failures.append(
            f"{fence.label(root)}: `edge {' '.join(args)}` failed ({result.returncode}): "
            f"{summarize_process(result)}"
        )
        return
    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        failures.append(f"{fence.label(root)}: `edge {' '.join(args)}` did not emit JSON: {exc.msg}")
        return
    if isinstance(payload, dict) and payload.get("ok") is False:
        failures.append(f"{fence.label(root)}: `edge {' '.join(args)}` returned ok=false")


def summarize_process(result: subprocess.CompletedProcess[str]) -> str:
    combined = "\n".join(part for part in (result.stdout.strip(), result.stderr.strip()) if part)
    return combined[:800] if combined else "(no output)"


def safe_name(root: Path, fence: Fence, suffix: str) -> str:
    rel = fence.path.relative_to(root).as_posix()
    slug = re.sub(r"[^A-Za-z0-9_.-]+", "_", rel)
    return f"{slug}_{fence.line}{suffix}"


if __name__ == "__main__":
    raise SystemExit(main())
