"""Download Allen Brain Cell Atlas WHB-10Xv3 data into data/processed/.

The WHB-10X clustering release stores:
  - Cell/gene metadata and taxonomy (CSV) - see WHB-10X-clustering docs
  - Expression matrices as h5ad (Neurons + Nonneurons, raw + log2)

Docs: https://alleninstitute.github.io/abc_atlas_access/descriptions/WHB-10X-clustering.html
"""

from __future__ import annotations

import argparse
from pathlib import Path

from abc_atlas_access.abc_atlas_cache.abc_project_cache import AbcProjectCache

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CACHE_DIR = PROJECT_ROOT / "data" / "processed" / "abc_atlas"

WHB_MATRIX_CHOICES = {
    "neurons-log2": "WHB-10Xv3-Neurons/log2",
    "neurons-raw": "WHB-10Xv3-Neurons/raw",
    "nonneurons-log2": "WHB-10Xv3-Nonneurons/log2",
    "nonneurons-raw": "WHB-10Xv3-Nonneurons/raw",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--cache-dir",
        type=Path,
        default=DEFAULT_CACHE_DIR,
        help="AbcProjectCache download directory (default: data/processed/abc_atlas)",
    )
    parser.add_argument(
        "--metadata",
        action="store_true",
        help="Download WHB-10Xv3 + WHB-taxonomy metadata (clustering annotations)",
    )
    parser.add_argument(
        "--matrix",
        choices=[*WHB_MATRIX_CHOICES.keys(), "all"],
        help="Download one or all WHB-10Xv3 h5ad expression matrices",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List available WHB files and sizes, then exit",
    )
    return parser.parse_args()


def open_cache(cache_dir: Path) -> AbcProjectCache:
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache = AbcProjectCache.from_cache_dir(cache_dir)
    print(f"Manifest: {cache.current_manifest}")
    return cache


def print_inventory(cache: AbcProjectCache) -> None:
    print("\nWHB-10Xv3 expression matrices:")
    for name in cache.list_expression_matrix_files("WHB-10Xv3"):
        print(f"  - {name}")
    print(f"  Total size: {cache.get_directory_expression_matrix_size('WHB-10Xv3')}")

    print("\nWHB-10Xv3 metadata:")
    for name in cache.list_metadata_files("WHB-10Xv3"):
        print(f"  - {name}")
    print(f"  Total size: {cache.get_directory_metadata_size('WHB-10Xv3')}")

    print("\nWHB-taxonomy metadata:")
    for name in cache.list_metadata_files("WHB-taxonomy"):
        print(f"  - {name}")
    print(f"  Total size: {cache.get_directory_metadata_size('WHB-taxonomy')}")


def download_metadata(cache: AbcProjectCache) -> list[Path]:
    print("\nDownloading WHB-10Xv3 metadata...")
    paths = cache.get_directory_metadata("WHB-10Xv3")
    print(f"  WHB-10Xv3: {len(paths)} files")

    print("Downloading WHB-taxonomy metadata...")
    taxonomy_paths = cache.get_directory_metadata("WHB-taxonomy")
    print(f"  WHB-taxonomy: {len(taxonomy_paths)} files")
    return paths + taxonomy_paths


def download_matrix(cache: AbcProjectCache, matrix_key: str) -> Path:
    file_name = WHB_MATRIX_CHOICES[matrix_key]
    print(f"\nDownloading {file_name} ...")
    path = cache.get_file_path(directory="WHB-10Xv3", file_name=file_name)
    print(f"  Saved to: {path}")
    return path


def main() -> None:
    args = parse_args()
    cache = open_cache(args.cache_dir)

    if args.list:
        print_inventory(cache)
        return

    if not args.metadata and not args.matrix:
        print_inventory(cache)
        print(
            "\nNo download selected. Examples:\n"
            "  python scripts/download_whb_data.py --metadata --matrix nonneurons-log2\n"
            "  python scripts/download_whb_data.py --matrix all"
        )
        return

    downloaded: list[Path] = []

    if args.metadata:
        downloaded.extend(download_metadata(cache))

    if args.matrix:
        if args.matrix == "all":
            for key in WHB_MATRIX_CHOICES:
                downloaded.append(download_matrix(cache, key))
        else:
            downloaded.append(download_matrix(cache, args.matrix))

    print("\nDownload complete.")
    for path in downloaded:
        print(f"  {path}")


if __name__ == "__main__":
    main()
