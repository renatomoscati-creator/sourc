#!/usr/bin/env python3
"""
Scraping Output Organizer — Recurring Task Script
===================================================
Validates, organizes, and reports on web scraping outputs
for the Innovis VC Milan Sourcing Tool.

Designed to run every 8 hours via cron or Qwen Code /loop.

Usage:
    python3 scripts/organize_scraping_outputs.py [--dry-run]
"""

import json
import os
import sys
import shutil
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path("/Users/renatomoscati/sourc")
ORGANIZED_DIR = PROJECT_ROOT / "Agent for Scraping and Sourcing"
RAW_DIR = ORGANIZED_DIR / "raw-data"
PROCESSED_DIR = ORGANIZED_DIR / "processed-data"
REPORTS_DIR = ORGANIZED_DIR / "reports"
LOGS_DIR = ORGANIZED_DIR / "logs"
AGENT_RUNS_DIR = LOGS_DIR / "agent-runs"

DRY_RUN = "--dry-run" in sys.argv

def log(msg: str):
    print(f"[organizer] {msg}")

def ensure_dirs():
    """Create directory structure if it doesn't exist."""
    for d in [ORGANIZED_DIR, RAW_DIR, PROCESSED_DIR, REPORTS_DIR, LOGS_DIR, AGENT_RUNS_DIR]:
        d.mkdir(parents=True, exist_ok=True)
    # Firecrawl subdirs within raw-data
    (RAW_DIR / "firecrawl-sources" / "contacts").mkdir(parents=True, exist_ok=True)
    (RAW_DIR / "firecrawl-sources" / "polihub").mkdir(parents=True, exist_ok=True)
    AGENT_RUNS_DIR.mkdir(parents=True, exist_ok=True)
    log("Directory structure ensured.")

def validate_json_files() -> list:
    """Validate all JSON files in organized directories."""
    results = []
    json_dirs = [PROCESSED_DIR, RAW_DIR]
    for base in json_dirs:
        for f in base.rglob("*.json"):
            rel = f.relative_to(ORGANIZED_DIR)
            try:
                with open(f, "r", encoding="utf-8") as fh:
                    data = json.load(fh)
                count = len(data) if isinstance(data, list) else "object"
                results.append({
                    "file": str(rel),
                    "status": "valid",
                    "records": count,
                    "size_kb": round(f.stat().st_size / 1024, 1)
                })
            except Exception as e:
                results.append({
                    "file": str(rel),
                    "status": "INVALID",
                    "error": str(e)
                })
    return results

def copy_new_files(source: Path, dest: Path, pattern: str = "*") -> int:
    """Copy new files from source to dest if they don't already exist at dest."""
    count = 0
    if not source.exists():
        return count
    for f in source.glob(pattern):
        if f.is_file():
            target = dest / f.name
            if not target.exists():
                if not DRY_RUN:
                    shutil.copy2(f, target)
                log(f"  {'[DRY] ' if DRY_RUN else ''}Copied {f.name}")
                count += 1
    return count

def copy_firecrawl_sources():
    """Copy firecrawl source data into raw-data/firecrawl-sources/."""
    firecrawl_root = PROJECT_ROOT / ".firecrawl"
    for subdir in ["contacts", "polihub"]:
        src = firecrawl_root / subdir
        dest = RAW_DIR / "firecrawl-sources" / subdir
        count = copy_new_files(src, dest)
        if count > 0:
            log(f"  Copied {count} files from .firecrawl/{subdir}/")

def copy_root_files():
    """Copy relevant root-level files into organized directories."""
    # Log files -> logs/
    log_files = ["dedup_log.txt", "run_log.txt", "sources_queue.txt",
                 "qualified_startups.txt", "rejected_or_low_score.txt", "agent_state.json"]
    date_suffix = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    logs_dest = LOGS_DIR
    for lf in log_files:
        src = PROJECT_ROOT / lf
        if src.exists():
            name = lf.replace(".txt", f"_{date_suffix}.txt").replace(".json", f"_{date_suffix}.json")
            target = logs_dest / name
            if not target.exists():
                if not DRY_RUN:
                    shutil.copy2(src, target)
                log(f"  {'[DRY] ' if DRY_RUN else ''}Copied {lf} -> {name}")

    # Agent run logs
    agent_logs = ["sourcing_agent_output.log", "sourcing_v2_output.log"]
    for lf in agent_logs:
        src = PROJECT_ROOT / lf
        if src.exists():
            target = AGENT_RUNS_DIR / lf.replace(".log", f"_{date_suffix}.log")
            if not target.exists():
                if not DRY_RUN:
                    shutil.copy2(src, target)
                log(f"  {'[DRY] ' if DRY_RUN else ''}Copied {lf} -> {target.name}")

    # Raw data files
    raw_files = ["registro_raw_matches.json", "startups_2025.pdf"]
    for rf in raw_files:
        src = PROJECT_ROOT / rf
        if src.exists():
            target = RAW_DIR / rf
            if not target.exists():
                if not DRY_RUN:
                    shutil.copy2(src, target)
                log(f"  {'[DRY] ' if DRY_RUN else ''}Copied {rf}")

    # Processed data files
    data_dir = PROJECT_ROOT / "data"
    if data_dir.exists():
        for f in data_dir.glob("registro_*"):
            if f.is_file():
                target = PROCESSED_DIR / f.name
                if not target.exists():
                    if not DRY_RUN:
                        shutil.copy2(f, target)
                    log(f"  {'[DRY] ' if DRY_RUN else ''}Copied data/{f.name}")

def count_files(directory: Path) -> int:
    """Count total files in directory recursively."""
    if not directory.exists():
        return 0
    return sum(1 for _ in directory.rglob("*") if _.is_file())

def generate_report(validation_results: list, new_files: int):
    """Generate a timestamped organization report."""
    now = datetime.now(timezone.utc)
    date_str = now.strftime("%Y-%m-%d")
    timestamp = now.isoformat()

    valid_count = sum(1 for r in validation_results if r["status"] == "valid")
    invalid_count = sum(1 for r in validation_results if r["status"] == "INVALID")
    total_records = sum(
        r["records"] for r in validation_results
        if r["status"] == "valid" and isinstance(r["records"], int)
    )

    report = f"""# Organization Report — {date_str} (Recurring Run)

**Run Time:** {timestamp}
**Organized By:** Qwen Code — Scraping Output Organizer Agent (automated script)
**Mode:** {'Dry Run' if DRY_RUN else 'Full Organization'}

## Summary

| Metric | Value |
|--------|-------|
| Total files in organized dir | {count_files(ORGANIZED_DIR)} |
| New files copied this run | {new_files} |
| JSON files validated | {len(validation_results)} |
| Valid JSON | {valid_count} |
| Invalid JSON | {invalid_count} |
| Total records across all JSON | {total_records:,} |
| Total directory size | {get_dir_size(ORGANIZED_DIR)} |

## Validation Results

{'| File | Status | Records | Size (KB) |\n|------|--------|---------|-----------|' if validation_results else 'No JSON files found to validate.'}
"""
    for r in validation_results:
        status_icon = "✅" if r["status"] == "valid" else "❌"
        records = f"{r['records']:,}" if isinstance(r["records"], int) else str(r["records"])
        report += f"| {status_icon} {r['file']} | {r['status']} | {records} | {r['size_kb']} |\n"

    report += f"""
## Actions Taken
1. Validated {len(validation_results)} JSON files ({valid_count} valid, {invalid_count} invalid)
2. Copied {new_files} new files from source directories
3. Verified directory structure integrity
4. Updated organization manifest

## Issues Found
{'- No issues detected' if invalid_count == 0 else f'- {invalid_count} JSON file(s) failed validation (see table above)'}

## Recommendations
- Monitor for new scraping outputs before next run
- Consider expanding AI evaluation coverage
- Review DuckDuckGo search reliability
"""

    report_path = REPORTS_DIR / f"organization_report_{date_str}.md"
    if not DRY_RUN:
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(report)
    log(f"Report generated: {report_path.name}")
    return report_path

def get_dir_size(path: Path) -> str:
    """Get human-readable directory size."""
    if not path.exists():
        return "0B"
    total = 0
    for f in path.rglob("*"):
        if f.is_file():
            total += f.stat().st_size
    if total < 1024:
        return f"{total}B"
    elif total < 1024 * 1024:
        return f"{total / 1024:.1f}KB"
    elif total < 1024 * 1024 * 1024:
        return f"{total / (1024 * 1024):.1f}MB"
    else:
        return f"{total / (1024 * 1024 * 1024):.1f}GB"

def update_manifest(validation_results: list, new_files: int, report_path: Path):
    """Update the organization manifest JSON."""
    now = datetime.now(timezone.utc).isoformat()
    total_records = sum(
        r["records"] for r in validation_results
        if r["status"] == "valid" and isinstance(r["records"], int)
    )

    manifest = {
        "manifestVersion": "1.1",
        "generatedAt": now,
        "lastOrganizedBy": "Qwen Code — Scraping Output Organizer Agent (automated script)",
        "runType": "scheduled-recurring",
        "projectName": "Innovis VC Milan Sourcing Tool",
        "summary": {
            "totalFilesOrganized": count_files(ORGANIZED_DIR),
            "totalDataSize": get_dir_size(ORGANIZED_DIR),
            "totalStartupRecords": total_records,
            "newFilesThisRun": new_files,
            "allJsonValid": all(r["status"] == "valid" for r in validation_results),
            "dataSources": [
                "Registro Startup Innovative IT (Italian government startup registry)",
                "Firecrawl web scraping (Polihub + company websites)",
                "DuckDuckGo search via sourcing agents v1 and v2"
            ]
        },
        "validationResults": validation_results,
        "recommendations": [
            "Check for new scraping outputs on each recurring run",
            "Enrich null websites with LinkedIn company page lookups",
            "Add funding stage detection from Crunchbase or similar API",
            "Implement deduplication across Firecrawl contacts and registry data",
            "Increase AI evaluation batch size beyond 68 companies",
            "Fix DuckDuckGo search — consider switching to Tavily, Serper, or similar API"
        ]
    }

    manifest_path = REPORTS_DIR / "organization_manifest.json"
    if not DRY_RUN:
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
    log(f"Manifest updated: {manifest_path.name}")

def main():
    log("=" * 60)
    log("Scraping Output Organizer — Starting")
    log(f"Time: {datetime.now(timezone.utc).isoformat()}")
    log(f"Mode: {'DRY RUN' if DRY_RUN else 'FULL ORGANIZATION'}")
    log("=" * 60)

    # Step 1: Ensure directory structure
    ensure_dirs()

    # Step 2: Copy new files from source directories
    log("Scanning for new files...")
    new_files = 0
    new_files += copy_new_files(PROJECT_ROOT / "data", PROCESSED_DIR, "registro_*")
    copy_firecrawl_sources()
    copy_root_files()
    log(f"Total new files copied: {new_files}")

    # Step 3: Validate all JSON files
    log("Validating JSON files...")
    validation = validate_json_files()
    valid = sum(1 for r in validation if r["status"] == "valid")
    invalid = sum(1 for r in validation if r["status"] == "INVALID")
    log(f"  Valid: {valid}, Invalid: {invalid}")

    if invalid > 0:
        log("  WARNING: Invalid JSON files detected:")
        for r in validation:
            if r["status"] == "INVALID":
                log(f"    - {r['file']}: {r.get('error', 'unknown error')}")

    # Step 4: Generate report
    report_path = generate_report(validation, new_files)

    # Step 5: Update manifest
    update_manifest(validation, new_files, report_path)

    # Step 6: Consolidate scraping data into dashboard import queue
    log("Consolidating scraping data for dashboard import...")
    import subprocess
    result = subprocess.run(
        ["npx", "tsx", "scripts/consolidate-scraping-data.ts"],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True,
        timeout=120
    )
    if result.returncode == 0:
        log("  ✓ Dashboard import queue updated")
    else:
        log(f"  WARNING: Consolidation failed: {result.stderr.strip()}")

    # Step 7: Print summary
    log("=" * 60)
    log("ORGANIZATION COMPLETE")
    log(f"  Files validated: {len(validation)}")
    log(f"  New files organized: {new_files}")
    log(f"  Directory size: {get_dir_size(ORGANIZED_DIR)}")
    log(f"  Report: {report_path.name}")
    log("=" * 60)

    return 0 if invalid == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
