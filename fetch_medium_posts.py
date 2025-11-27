"""
Export every Medium post written by the user "mister.funable" to Markdown files,
with optional chronological prefixes and local image mirroring.

Usage:
  1. Install dependencies: pip install medium-api
  2. Export RAPIDAPI_KEY env var: export RAPIDAPI_KEY="your-key"
  3. Run: python fetch_medium_posts.py [--username ...] [--out-dir ...]
"""

from __future__ import annotations

import argparse
import mimetypes
import os
import re
import sys
from datetime import datetime
from importlib import import_module
from pathlib import Path
from typing import Iterable, Set
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


def load_medium_class():
    try:
        return import_module("medium_api").Medium
    except ImportError as exc:  # pragma: no cover
        raise SystemExit(
            "medium-api is required. Install it with `pip install medium-api`."
        ) from exc


Medium = load_medium_class()

INVALID_FILENAME_CHARS = r'[\\/*?:"<>|]'
SOURCE_LINE_PATTERN = re.compile(r"<!--\s*Source:\s*(.*?)\s*-->")
IMAGE_PATTERN = re.compile(
    r"!\[(?P<alt>[^\]]*)\]\((?P<url>[^)\s]+)(?:\s+\"[^\"]*\")?\)"
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Download Medium posts for a user and save them as Markdown files."
    )
    parser.add_argument(
        "--username",
        default="mister.funable",
        help="Medium username to export posts for (default: %(default)s).",
    )
    parser.add_argument(
        "--out-dir",
        default="exports/medium_posts",
        help="Directory where Markdown files should be written (default: %(default)s).",
    )
    parser.add_argument(
        "--prepend-order",
        action="store_true",
        help="Prefix filenames with chronological order indexes (oldest → newest).",
    )
    parser.add_argument(
        "--download-images",
        action="store_true",
        help="Download every image referenced in the markdown body.",
    )
    parser.add_argument(
        "--images-dir",
        help="Directory to store downloaded images (defaults to <out-dir>/images).",
    )
    return parser


def sanitize_title(title: str, fallback: str) -> str:
    """Remove filesystem-hostile characters but otherwise keep the original title."""
    cleaned = re.sub(INVALID_FILENAME_CHARS, "", title).strip()
    cleaned = re.sub(r"\s+", " ", cleaned.replace("\n", " "))
    return cleaned or fallback


def sanitize_folder_component(text: str, fallback: str) -> str:
    cleaned = re.sub(INVALID_FILENAME_CHARS, "", text).strip().replace(" ", "_")
    return cleaned or fallback


def ensure_unique(name: str, seen: Set[str]) -> str:
    candidate = name
    idx = 2
    while candidate.lower() in seen:
        candidate = f"{name} ({idx})"
        idx += 1
    seen.add(candidate.lower())
    return candidate


def extract_article_id_from_url(url: str | None) -> str | None:
    if not url:
        return None
    parsed = urlparse(url.strip())
    path = parsed.path.strip("/")
    if not path:
        return None
    slug = path.split("/")[-1]
    candidate = slug.split("-")[-1]
    candidate = candidate.strip()
    return candidate if candidate and candidate.isalnum() else None


def collect_existing_article_ids(out_dir: Path) -> Set[str]:
    ids: Set[str] = set()
    if not out_dir.exists():
        return ids

    for md_file in out_dir.glob("*.md"):
        try:
            with md_file.open("r", encoding="utf-8") as handle:
                for _ in range(5):
                    line = handle.readline()
                    if not line:
                        break
                    match = SOURCE_LINE_PATTERN.search(line)
                    if match:
                        article_id = extract_article_id_from_url(match.group(1))
                        if article_id:
                            ids.add(article_id.lower())
                        break
        except OSError:
            continue

    return ids


def upgrade_medium_image_url(url: str) -> str:
    if "miro.medium.com" not in url:
        return url

    upgraded = re.sub(r"resize:[^/]+", "resize:fit:2400", url)
    upgraded = re.sub(r"max/\d+", "max/2400", upgraded)
    return upgraded


def determine_extension(url: str, content_type: str | None) -> str:
    parsed = urlparse(url)
    suffix = Path(parsed.path).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        return ".jpg" if suffix == ".jpeg" else suffix

    if content_type:
        guessed = mimetypes.guess_extension(content_type.split(";")[0].strip())
        if guessed:
            if guessed == ".jpe":
                return ".jpg"
            return guessed

    return ".jpg"


def download_image(url: str, dest_dir: Path, base_name: str) -> Path | None:
    dest_dir.mkdir(parents=True, exist_ok=True)
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urlopen(req, timeout=45) as response:
            data = response.read()
            content_type = response.headers.get("Content-Type")
    except (HTTPError, URLError) as exc:
        print(f"[warn] Failed to download image {url}: {exc}", file=sys.stderr)
        return None

    extension = determine_extension(url, content_type)
    dest_path = dest_dir / f"{base_name}{extension}"
    dest_path.write_bytes(data)
    return dest_path


def process_markdown_images(
    markdown_text: str,
    download_images: bool,
    article_images_dir: Path | None,
    markdown_dir: Path,
) -> str:
    if not download_images or article_images_dir is None:
        return markdown_text

    cache: dict[str, str] = {}
    image_counter = 1

    def replacement(match: re.Match[str]) -> str:
        nonlocal image_counter
        alt = match.group("alt")
        raw_url = match.group("url").strip()
        remote_url = upgrade_medium_image_url(raw_url)
        display_target = remote_url
        comment = f"<!-- Image Source: {remote_url}"

        local_rel = cache.get(remote_url)
        if local_rel is None:
            base_name = f"img-{image_counter:02d}"
            downloaded_path = download_image(remote_url, article_images_dir, base_name)
            if downloaded_path:
                rel_path = os.path.relpath(downloaded_path, start=markdown_dir).replace(
                    os.sep, "/"
                )
                cache[remote_url] = rel_path
                local_rel = rel_path
                image_counter += 1

        if local_rel:
            display_target = local_rel
            comment += f" | Local: {local_rel}"

        comment += " -->"
        return f"{comment}\n![{alt}]({display_target})"

    return IMAGE_PATTERN.sub(replacement, markdown_text)


def build_markdown_payload(
    article,
    download_images: bool,
    out_dir: Path,
    images_dir: Path,
    folder_label: str,
) -> str:
    """Combine the exported markdown with metadata and optional local asset refs."""
    source_url = article.url or f"https://medium.com/p/{article.article_id}"
    metadata_lines = [f"<!-- Source: {source_url} -->"]
    if article.published_at:
        metadata_lines.append(f"<!-- Published: {article.published_at.isoformat()} -->")
    metadata_lines.append("")  # blank line before actual markdown

    raw_body = (article.markdown or "").strip()
    body = raw_body if raw_body else f"# {article.title or 'Untitled'}\n"

    body = process_markdown_images(
        body,
        download_images=download_images,
        article_images_dir=(images_dir / folder_label) if download_images else None,
        markdown_dir=out_dir,
    )

    return "\n".join(metadata_lines) + body + ("\n" if not body.endswith("\n") else "")


def export_articles(
    ordered_articles,
    out_dir: Path,
    existing_ids: Set[str],
    *,
    prepend_order: bool,
    order_width: int,
    download_images: bool,
    images_dir: Path,
) -> tuple[int, int, Iterable[tuple[int, str, Path]]]:
    out_dir.mkdir(parents=True, exist_ok=True)
    seen_names: Set[str] = {path.stem.lower() for path in out_dir.glob("*.md")}
    saved_paths = []
    skipped = 0

    for idx, article in enumerate(ordered_articles, start=1):
        if article.article_id and article.article_id.lower() in existing_ids:
            skipped += 1
            continue

        title = article.title or f"Untitled {article.article_id}"
        sanitized = sanitize_title(title, fallback=f"article-{article.article_id or idx}")
        prefix = f"{idx:0{order_width}d}" if prepend_order else ""
        prefixed_name = f"{prefix} - {sanitized}" if prefix else sanitized
        unique_name = ensure_unique(prefixed_name[:120].rstrip(" ."), seen_names)
        destination = out_dir / f"{unique_name}.md"
        folder_label = sanitize_folder_component(
            prefix or sanitized, fallback=f"article-{article.article_id or idx}"
        )
        payload = build_markdown_payload(
            article,
            download_images=download_images,
            out_dir=out_dir,
            images_dir=images_dir,
            folder_label=folder_label,
        )
        destination.write_text(payload, encoding="utf-8")
        saved_paths.append((idx, title, destination))
        if article.article_id:
            existing_ids.add(article.article_id.lower())

    return len(saved_paths), skipped, saved_paths


def main() -> None:
    args = build_parser().parse_args()

    api_key = os.getenv("RAPIDAPI_KEY")
    if not api_key:
        sys.exit("RAPIDAPI_KEY not found in environment.")

    medium = Medium(api_key)
    user = medium.user(username=args.username)

    # Populate user.articles with info + markdown.
    user.fetch_articles(markdown=True)

    if not user.articles:
        print(f"No articles found for {args.username}.")
        return

    out_dir = Path(args.out_dir)
    images_dir = Path(args.images_dir) if args.images_dir else out_dir / "images"
    if args.download_images:
        images_dir.mkdir(parents=True, exist_ok=True)

    articles = sorted(
        user.articles,
        key=lambda art: (
            art.published_at if isinstance(art.published_at, datetime) else datetime.max
        ),
    )
    order_width = max(1, len(str(len(articles))))

    existing_ids = collect_existing_article_ids(out_dir)
    print(
        f"Found {len(articles)} articles for {args.username}. "
        f"{len(existing_ids)} already present in {out_dir}."
    )

    written, skipped, records = export_articles(
        articles,
        out_dir,
        existing_ids,
        prepend_order=args.prepend_order,
        order_width=order_width,
        download_images=args.download_images,
        images_dir=images_dir,
    )

    if written:
        print(f"\nExported {written} new posts to {out_dir}:\n")
        for idx, title, path in records:
            print(f"{idx:02d}. {title} -> {path}")
    else:
        print("\nNo new posts to export.")

    if skipped:
        print(f"\nSkipped {skipped} posts already in {out_dir}.")

    print(f"\nNumber of pinned articles: {user.total_pinned_articles}")


if __name__ == "__main__":
    main()
