#!/usr/bin/env python3
"""
Parse .md people files and produce a structured JSON with
three lists: current, alumni, visitor.
"""

import json
import re
import sys
from pathlib import Path

def parse_md_file(filepath: Path) -> dict:
    text = filepath.read_text(encoding="utf-8")
 
    # Files are wrapped in --- delimiters: --- frontmatter --- bio
    parts = text.split("---")
    # parts[0] is empty (before opening ---), parts[1] is frontmatter, parts[2] is bio
    frontmatter = parts[1].strip() if len(parts) > 1 else parts[0].strip()
    bio = parts[2].strip() if len(parts) > 2 else ""
 
    record = {}
 
    for line in frontmatter.splitlines():
        line = line.strip()
        if not line:
            continue
 
        # Strip inline comments
        line = re.sub(r"\s*#.*$", "", line).strip()
 
        if ":" not in line:
            continue
 
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip().strip('"').strip("'").strip()
 
        record[key] = value
 
    record["bio"] = bio
    return record
 
 
def main(input_dir: str = ".", output_file: str = "people.json"):
    input_path = Path(input_dir)
    md_files = sorted(input_path.glob("*.md"))
 
    if not md_files:
        print(f"No .md files found in '{input_dir}'")
        sys.exit(1)
 
    buckets = {"current": [], "visitor": [], "alumni": []}
    SKIP_FIELDS = {"vis-order", "status"}
 
    for md_file in md_files:
        record = parse_md_file(md_file)
 
        status = record.get("status", "current").lower()
        if status not in buckets:
            print(f"Warning: unknown status '{status}' in {md_file.name}, skipping.")
            continue
 
        # Remove unwanted fields
        clean = {k: v for k, v in record.items() if k not in SKIP_FIELDS}
 
        # Convert 'order' to int for sorting (keep as string in output)
        buckets[status].append(clean)
 
    # Sort each bucket by the 'order' field (numeric), falling back to 0
    for key in buckets:
        buckets[key].sort(key=lambda r: int(r.get("order", 0) or 0))
 
    output_path = Path(output_file)
    output_path.write_text(
        json.dumps(buckets, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"Written {sum(len(v) for v in buckets.values())} records to '{output_file}'")
    for key, members in buckets.items():
        print(f"  {key}: {len(members)}")


if __name__ == "__main__":
    people_dir = Path(__file__).parent.parent / "app" / "static" / "people"
    output_file = Path(__file__).parent.parent / "app" / "static" / "data" / "people.json"
    main(people_dir, output_file)