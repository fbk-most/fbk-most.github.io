from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json
import base64
import re
from pathlib import Path
from datetime import datetime, timedelta

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")


def _normalize_image(image_path):
    if not image_path:
        return ""
    return image_path if image_path.startswith("/") else f"/{image_path}"


def _load_news():
    news_file = Path("app/static/data/news.json")
    with open(news_file, "r") as f:
        news = json.load(f)

    # Sort by date (newest first)
    for item in news:
        item["parsed_date"] = datetime.strptime(item["Date"], "%Y-%m-%d")
    news.sort(key=lambda x: x["parsed_date"], reverse=True)

    return news


def _slugify(name, surname):
    raw = f"{name or ''}-{surname or ''}".strip("-").lower()
    return "-".join(raw.split())


def _people_sort_key(person):
    order = person.get("order")
    try:
        order_val = int(order)
    except (TypeError, ValueError):
        order_val = float("inf")
    return (
        order_val,
        (person.get("surname") or "").lower(),
        (person.get("name") or "").lower(),
    )


def _prepare_person(person):
    enriched = dict(person)
    enriched["image"] = _normalize_image(enriched.get("image", ""))
    enriched["display_name"] = (
        f"{(enriched.get('name') or '').strip()} {(enriched.get('surname') or '').strip()}".strip()
    )
    enriched["slug"] = _slugify(enriched.get("name"), enriched.get("surname"))
    return enriched


def _load_people():
    people_file = Path("app/static/data/people.json")
    with open(people_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    result = {}
    for bucket in ("current", "visitor", "alumni"):
        people_list = [_prepare_person(p) for p in data.get(bucket, [])]
        people_list.sort(key=_people_sort_key)
        result[bucket] = people_list

    return result


@app.get("/")
async def home(request: Request):
    news = _load_news()

    three_months_ago = datetime.now() - timedelta(days=90)
    recent_or_important = [
        item
        for item in news
        if item["parsed_date"] >= three_months_ago or item.get("ShowAlways")
    ]

    # Build display list with the combined string
    news_items = [
        {
            "image": _normalize_image(item.get("Image", "")),
            "label": f"{item['Date']} - {item['Title']}",
        }
        for item in recent_or_important
    ]

    return templates.TemplateResponse(
        request,
        "index.html",
        {
            "current_page": "home",
            "news_items": news_items,
        },
    )


@app.get("/research")
async def research(request: Request):
    return templates.TemplateResponse(
        request, "research.html", {"current_page": "research"}
    )


@app.get("/people")
async def people(request: Request):
    people_data = _load_people()
    return templates.TemplateResponse(
        request,
        "people.html",
        {
            "current_page": "people",
            "current_people": people_data["current"],
            "visitor_people": people_data["visitor"],
            "former_people": people_data["alumni"],
        },
    )


@app.get("/people/{slug}")
async def person_detail(request: Request, slug: str):
    people_data = _load_people()

    person = None
    status = None
    for bucket in ("current", "visitor", "alumni"):
        match = next((p for p in people_data[bucket] if p["slug"] == slug), None)
        if match:
            person = match
            status = bucket
            break

    if not person or status == "alumni":
        raise HTTPException(status_code=404, detail="Person not found")

    return templates.TemplateResponse(
        request, "person.html", {"current_page": "people", "person": person}
    )


# @app.get("/phd")
# async def phd(request: Request):
#     return templates.TemplateResponse(request, "phd.html", {"current_page": "phd"})


@app.get("/internships")
async def internships(request: Request):
    return templates.TemplateResponse(
        request, "internships.html", {"current_page": "internships"}
    )


@app.get("/events")
async def events(request: Request, page: int = Query(1, ge=1)):

    # --- SEMINARS ---
    seminars_file = Path("app/static/data/seminars.json")
    with open(seminars_file, "r") as f:
        seminars = json.load(f)

    seminars = seminars[::-1]

    # Pagination
    items_per_page = 10
    total_items = len(seminars)
    total_pages = (
        total_items + items_per_page - 1
    ) // items_per_page  # Ceiling division

    start_index = (page - 1) * items_per_page
    end_index = start_index + items_per_page
    paginated_seminars = seminars[start_index:end_index]

    # --- NEWS ---
    news = _load_news()

    three_months_ago = datetime.now() - timedelta(days=90)
    recent_news = [
        item
        for item in news
        if item["parsed_date"] >= three_months_ago or item.get("ShowAlways")
    ]
    older_news = [
        item
        for item in news
        if item["parsed_date"] < three_months_ago and not item.get("ShowAlways")
    ]

    # Build display lists
    def build_news_items(news_list):
        return [
            {
                "label": f"{item['Date']} - {item['Title']}",
                "description": item.get("Description", ""),
                "link": item.get("Link", ""),
                "image": _normalize_image(item.get("Image", "")),
            }
            for item in news_list
        ]

    recent_news_items = build_news_items(recent_news)
    older_news_items = build_news_items(older_news)

    # --- RETURN ---

    return templates.TemplateResponse(
        request,
        "events.html",
        {
            "current_page": "events",
            "seminars": paginated_seminars,
            "page": page,
            "total_pages": total_pages,
            "has_prev": page > 1,
            "has_next": page < total_pages,
            "recent_news": recent_news_items,
            "older_news": older_news_items,
        },
    )


@app.get("/contacts")
async def contacts(request: Request):
    return templates.TemplateResponse(
        request, "contacts.html", {"current_page": "contacts"}
    )


@app.get("/digital_urban_futures")
async def digital_urban_futures(request: Request):
    return templates.TemplateResponse(
        request, "digital_urban_futures.html", {"current_page": "digital_urban_futures"}
    )


@app.get("/digital_urban_futures_archive")
async def digital_urban_futures_archive(request: Request):
    return templates.TemplateResponse(
        request,
        "digital_urban_futures_archive.html",
        {"current_page": "digital_urban_futures_archive"},
    )


@app.get("/news-editor")
async def news_editor(request: Request):
    return templates.TemplateResponse(
        request, "news_editor.html", {"current_page": "news_editor"}
    )


@app.post("/api/update-news")
async def update_news(request: Request):
    try:
        data = await request.json()
        news_data = data.get("newsData", [])

        # Validate the data structure
        if not isinstance(news_data, list):
            return {"error": "Invalid data format"}

        # Write to news.json (the file the site actually reads)
        news_file = Path("app/static/data/news.json")
        with open(news_file, "w", encoding="utf-8") as f:
            json.dump(news_data, f, ensure_ascii=False, indent=2)

        return {"success": True}
    except Exception as e:
        return {"error": str(e)}


@app.get("/people-editor")
async def news_editor(request: Request):
    return templates.TemplateResponse(
        request, "people_editor.html", {"current_page": "people_editor"}
    )


@app.get("/people-adder")
async def news_editor(request: Request):
    return templates.TemplateResponse(
        request, "people_adder.html", {"current_page": "people_adder"}
    )


PEOPLE_IMAGES_DIR = Path("app/static/images/people")


@app.post("/api/upload-people-image")
async def upload_people_image(request: Request):
    try:
        data = await request.json()
        filename = data.get("filename", "")
        data_url = data.get("data", "")

        # Only allow safe, pre-normalized filenames (letters, numbers, hyphens)
        if not filename or not re.fullmatch(r"[a-z0-9-]+", filename):
            return {"error": "Invalid filename"}

        match = re.match(r"^data:image/(\w+);base64,(.+)$", data_url, re.DOTALL)
        if not match:
            return {"error": "Invalid image data"}

        ext = match.group(1).lower()
        ext = "jpg" if ext == "jpeg" else ext
        if ext not in {"png", "jpg", "webp", "gif"}:
            return {"error": "Unsupported image type"}

        image_bytes = base64.b64decode(match.group(2))

        PEOPLE_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
        file_path = PEOPLE_IMAGES_DIR / f"{filename}.{ext}"
        with open(file_path, "wb") as f:
            f.write(image_bytes)

        return {"success": True, "path": f"/static/images/people/{filename}.{ext}"}

    except Exception as e:
        return {"error": str(e)}


@app.post("/api/update-people")
async def update_people(request: Request):
    try:
        data = await request.json()

        # Validate the data structure
        if not isinstance(data, dict):
            return {"error": "Invalid data format"}

        expected_keys = {"current", "visitor", "alumni"}
        if not expected_keys.issubset(data.keys()):
            return {"error": "Missing required categories"}

        people_file = Path("app/static/data/people.json")
        with open(people_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return {"success": True}

    except Exception as e:
        return {"error": str(e)}
