import os
import requests
import csv, json

LINK_NEWS = os.environ.get("LINK_NEWS")
LINK_SEMINARS = os.environ.get("LINK_SEMINARS")


def likely_mojibake(s: str) -> bool:
    # heuristics: common mojibake fragments (Ã, â, sequences like â, and replacement char)
    return any(x in s for x in ("â", "â€", "Ã", "\ufffd"))


def repair_mojibake(s: str) -> str:
    try:
        # Re-interpret the string as Latin-1 bytes, then decode as UTF-8
        return s.encode("latin1").decode("utf-8")
    except Exception:
        return s  # if repair fails, return original


def maybe_repair_text(text_bytes: bytes) -> str:
    """Decode bytes to text, repairing mojibake if necessary."""
    # Try straightforward UTF-8 decode
    try:
        text = text_bytes.decode("utf-8")
    except UnicodeDecodeError:
        # Fallback: try latin1 then decode to utf-8 if needed
        try:
            text = text_bytes.decode("latin1")
        except Exception:
            # Last resort: use 'utf-8' with replacement
            text = text_bytes.decode("utf-8", errors="replace")

    # If heuristics detect mojibake, attempt the latin1->utf-8 repair
    if likely_mojibake(text):
        repaired = repair_mojibake(text)
        # If repair produced fewer suspicious sequences, keep it
        if not likely_mojibake(repaired):
            return repaired
        # Otherwise keep the original decoded text (maybe it's fine)
    return text


def download_csv(sheet_id):
    URL = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"

    response = requests.get(URL)
    response.raise_for_status()
    return response


def parses_news_csv(response):
    # Read CSV lines
    lines = response.text.splitlines()
    reader = csv.DictReader(lines[2:])  # skip the first comment row

    news_list = []

    for row in reader:
        if not row["TITLE"]:
            continue

        # Priority to 0 if missing or invalid
        if not row.get("Priority") or not row["Priority"].isdigit():
            row["Priority"] = 0
        else:
            row["Priority"] = int(row["Priority"])

        news_list.append(row)

    return news_list


def save_json(dest_file, news_list):
    with open(dest_file, "w", encoding="utf-8") as f:
        json.dump(news_list, f, ensure_ascii=False, indent=2)


def parse_seminars_csv(response):
    lines = response.text.splitlines()
    reader = csv.DictReader(lines)

    seminar_list = []

    for row in reader:
        # repair each field individually if needed
        for k, v in list(row.items()):
            if isinstance(v, str) and likely_mojibake(v):
                row[k] = repair_mojibake(v)
        # normalise Public to int (example)
        pub = row.get("Public")
        if not pub or not str(pub).strip().isdigit():
            row["Public"] = 0
        else:
            row["Public"] = int(pub)
        if row["Public"] == 1:
            seminar_list.append(
                {
                    "Date": row["Date"],
                    "Title": row["Title"],
                    "Speaker": row["Speaker"],
                    "Topic": row["Topic"],
                }
            )

    return seminar_list


response = download_csv(LINK_NEWS)
news_list = parses_news_csv(response)
save_json("_data/news.json", news_list)

response = download_csv(LINK_SEMINARS)
seminars_list = parse_seminars_csv(response)
save_json("_data/seminars.json", seminars_list)
