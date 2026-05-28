#!/bin/bash
# Scraping Output Organizer — Recurring Loop Runner
# Runs every 8 hours via cron
# Usage: Run directly or add to crontab

cd /Users/renatomoscati/sourc
echo "=== Scraping Output Organizer ==="
echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "================================="
python3 scripts/organize_scraping_outputs.py
exit_code=$?
echo "Exit code: $exit_code"
exit $exit_code
