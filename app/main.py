from fastapi import FastAPI, Request, Query
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json
from pathlib import Path
from datetime import datetime, timedelta

from app.src.utils import parse_file, parse_directory

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")
people_directory = "app/static/people/"  # change this

@app.get("/")
async def home(request: Request):
    news_file = Path("app/static/data/news.json")
    with open(news_file, "r") as f:
        news = json.load(f)

    with open(news_file, "r") as f:
        news = json.load(f)

    # Sort by date (newest first)
    for item in news:
        item["parsed_date"] = datetime.strptime(item["DATE"], "%Y-%m-%d")
    news.sort(key=lambda x: x["parsed_date"], reverse=True)

    three_months_ago = datetime.now() - timedelta(days=90)
    recent_or_important = [item for item in news if item["parsed_date"] >= three_months_ago or item["Priority"]==10]    
    
    # Build display list with the combined string
    news_items = [
        {
            "image": item["Image"],
            "label": f"{item['DATE']} - {item['TITLE']}",
        }
        for item in recent_or_important
    ]
    
    return templates.TemplateResponse(request, "index.html", {
        "current_page": "home",
        "news_items": news_items,
    })

@app.get("/research")
async def research(request: Request):
    return templates.TemplateResponse(request, "research.html", {"current_page": "research"})

@app.get("/people")
async def people(request: Request):

    current, former = parse_directory(people_directory)
    return templates.TemplateResponse(request, "people.html",{
        "current_page": "people",
        "current_people": current,
        "former_people": former
    })

@app.get("/people/{slug}")
async def person_detail(request: Request, slug: str):
    directory = "app/static/people"

    person = parse_file(people_directory+slug+".md")

    #TODO: 404 if alumni or redirect to people

    if not person:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Person not found")

    return templates.TemplateResponse(request, "person.html", {
        "current_page": "people",
        "person": person
    })

@app.get("/phd")
async def phd(request: Request):
    return templates.TemplateResponse(request, "phd.html", {"current_page": "phd"})

@app.get("/internships")
async def internships(request: Request):
    return templates.TemplateResponse(request, "internships.html", {"current_page": "internships"})


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
    total_pages = (total_items + items_per_page - 1) // items_per_page  # Ceiling division
    
    start_index = (page - 1) * items_per_page
    end_index = start_index + items_per_page
    paginated_seminars = seminars[start_index:end_index]

    # --- NEWS ---
    news_file = Path("app/static/data/news.json")

    with open(news_file, "r") as f:
        news = json.load(f)

    # Sort by date (newest first)
    for item in news:
        item["parsed_date"] = datetime.strptime(item["DATE"], "%Y-%m-%d")
    news.sort(key=lambda x: x["parsed_date"], reverse=True)

    three_months_ago = datetime.now() - timedelta(days=90)
    recent_news = [item for item in news if item["parsed_date"] >= three_months_ago]
    older_news = [item for item in news if item["parsed_date"] < three_months_ago]

    # Build display lists
    def build_news_items(news_list):
        return [
            {
                "label": f"{item['DATE']} - {item['TITLE']}",
                "description": item["DESCRIPTION"],
                "link": item["Link"]
            }
            for item in news_list
        ]

    recent_news_items = build_news_items(recent_news)
    older_news_items = build_news_items(older_news)

    # --- RETURN ---
    
    return templates.TemplateResponse(request, "events.html", {
        "current_page": "events",
        "seminars": paginated_seminars,
        "page": page,
        "total_pages": total_pages,
        "has_prev": page > 1,
        "has_next": page < total_pages,
        "recent_news": recent_news_items,
        "older_news": older_news_items,
    })

@app.get("/contacts")
async def contacts(request: Request):
    return templates.TemplateResponse(request, "contacts.html", {"current_page": "contacts"})

@app.get("/digital_urban_futures")
async def digital_urban_futures(request: Request):
    return templates.TemplateResponse(request, "digital_urban_futures.html", {"current_page": "digital_urban_futures"})

@app.get("/digital_urban_futures_archive")
async def digital_urban_futures_archive(request: Request):
    return templates.TemplateResponse(request, "digital_urban_futures_archive.html", {"current_page": "digital_urban_futures_archive"})
