import requests
import csv, json

SHEET_ID = "1f2TdtDaVzKAB1CGaxNQG91AS4CdyEZ97cxJ8YEVx6Dg"
URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv"
DEST_FILE = "_posts/news.json"

response = requests.get(URL)
response.raise_for_status()

# Read CSV lines
lines = response.text.splitlines()
reader = csv.DictReader(lines[2:])  # skip the first comment row

news_list = []

for row in reader:
    if not row["TITLE"]:
        continue

    # Reformat date DD/MM/YYYY -> YYYY-MM-DD
    try:
        day, month, year = row["DATE"].split("/")
        row["DateISO"] = f"{year}-{month}-{day}"
    except Exception:
        row["DateISO"] = "9999-12-31"  # fallback for invalid dates

    # Default image if missing
    if not row.get("Image"):
        row["Image"] = "/assets/images/digital-twin-fbk.jpg"

    # Priority to 0 if missing or invalid
    if not row.get("Priority") or not row["Priority"].isdigit():
        row["Priority"] = 0
    else:
        row["Priority"] = int(row["Priority"])

    news_list.append(row)

# Save as JSON for Jekyll
with open(DEST_FILE, "w", encoding="utf-8") as f:
    json.dump(news_list, f, ensure_ascii=False, indent=2)

"""
TODO: create GitHub Action to run this script periodically

name: Update News CSV

on:
  schedule:
    # Runs at 00:00 and 12:00 UTC every day
    - cron: "0 0,12 * * *"
  workflow_dispatch: # Allows manual run

jobs:
  update-news:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.x"

      - name: Install requests
        run: pip install requests

      - name: Download Google Sheet CSV
        run: python scripts/download_news.py

      - name: Commit and push CSV
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add _data/news.csv
          git commit -m "Update news CSV" || echo "No changes to commit"
          git push

"""
