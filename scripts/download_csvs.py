import os
import requests
import csv, json

# ---------------- CONFIG ----------------
LINK_NEWS = os.environ.get("LINK_NEWS")
LINK_SEMINARS = os.environ.get("LINK_SEMINARS")
LINK_PEOPLE = os.environ.get("LINK_PEOPLE")
GID_TEAM = "0"
GID_ALUMNI = "1777836024"
FOLDER_ID = os.environ.get("FOLDER_ID")
LOCAL_IMAGES_DIR = "assets/images/people/"
# ----------------------------------------

UNICODE_PUNCT_MAP = {
    # Quotes
    "“": '"',
    "”": '"',
    "„": '"',
    "‟": '"',
    "’": "'",
    "‘": "'",
    "‚": "'",
    "‛": "'",

    # Dashes
    "–": "-",
    "—": "-",
    "−": "-",

    # Ellipsis
    "…": "...",

    # Misc
    " ": " ",   # non-breaking space
}


def to_ascii_safe(s: str) -> str:
    #Fix mojibake if present
    if likely_mojibake(s):
        s = repair_mojibake(s)

    # Replace known Unicode punctuation
    for u, a in UNICODE_PUNCT_MAP.items():
        s = s.replace(u, a)

    #Possible further normalization steps commented out for now
    # Normalize accents (é → e, ñ → n)
    # s = unicodedata.normalize("NFKD", s)

    # Remove remaining non-ASCII characters
    # s = s.encode("ascii", "ignore").decode("ascii")

    return s

def likely_mojibake(s: str) -> bool:
    # heuristics: common mojibake fragments (Ã, â, sequences like â, and replacement char)
    return any(x in s for x in ("â", "â€", "Ã", "\ufffd"))


def repair_mojibake(s: str) -> str:
    try:
        # Re-interpret the string as Latin-1 bytes, then decode as UTF-8
        return s.encode("latin1").decode("utf-8")
    except Exception:
        return s  # if repair fails, return original

def download_csv(sheet_id, gid = None):

    URL = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
    if gid is not None:
        URL += f"&gid={gid}"
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

        for k, v in list(row.items()):
            if isinstance(v, str):
                row[k] = to_ascii_safe(v)

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
            if isinstance(v, str):
                row[k] = to_ascii_safe(v)
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

def parse_people_csv(response):
    lines = response.text.splitlines()
    reader = csv.DictReader(lines)

    people_list = []
    drive_dict = {}

    for row in reader:
        # repair each field individually if needed
        temp_dict = {}
        for k, v in list(row.items()):   
            if not v:
                continue

            if isinstance(v, str):
                v = to_ascii_safe(v)
            temp_dict[k.lower()] = v
        #CHECK IF IF DRIVE AND FILE AND ADD TO DICT
        if "driveid" in temp_dict and "picutre" in temp_dict:
            drive_dict[temp_dict["picutre"]] = temp_dict["driveid"]
        people_list.append(temp_dict)
    

    return people_list, drive_dict

def download_file(file_id, path):
    """Download a file from Google Drive using its ID"""
    url = f"https://drive.google.com/uc?id={file_id}&export=download"
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(path, 'wb') as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)

def download_people_images(images):
    for img_name, drive_id in images.items():
        local_path = os.path.join(LOCAL_IMAGES_DIR, img_name)
        print(f"⬇ Downloading {img_name} to {local_path}...")
        download_file(drive_id, local_path)


response = download_csv(LINK_NEWS)
news_list = parses_news_csv(response)
save_json("_data/news.json", news_list)

response = download_csv(LINK_SEMINARS)
seminars_list = parse_seminars_csv(response)
save_json("_data/seminars.json", seminars_list)

response = download_csv(LINK_PEOPLE, GID_TEAM)
team_list, team_dict = parse_people_csv(response)
save_json("_data/team.json", team_list)

response = download_csv(LINK_PEOPLE, GID_ALUMNI)
alumni_list, alumni_dict = parse_people_csv(response)
save_json("_data/alumni.json", alumni_list)

people_images = team_dict | alumni_dict
download_people_images(people_images)