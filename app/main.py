from fastapi import FastAPI, Request, Query
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json
from pathlib import Path

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")


@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse(request, "index.html", {"current_page": "home"})

@app.get("/research")
async def research(request: Request):
    return templates.TemplateResponse(request, "research.html", {"current_page": "research"})

@app.get("/people")
async def people(request: Request):
    return templates.TemplateResponse(request, "people.html", {"current_page": "people"})

@app.get("/phd")
async def phd(request: Request):
    return templates.TemplateResponse(request, "phd.html", {"current_page": "phd"})

@app.get("/internships")
async def internships(request: Request):
    return templates.TemplateResponse(request, "internships.html", {"current_page": "internships"})


@app.get("/events")
async def events(request: Request, page: int = Query(1, ge=1)):
    # Load seminars data
    seminars_file = Path("app/static/data/seminars.json")
    with open(seminars_file, "r") as f:
        seminars = json.load(f)
    
    # Pagination
    items_per_page = 10
    total_items = len(seminars)
    total_pages = (total_items + items_per_page - 1) // items_per_page  # Ceiling division
    
    start_index = (page - 1) * items_per_page
    end_index = start_index + items_per_page
    paginated_seminars = seminars[start_index:end_index]
    
    return templates.TemplateResponse(request, "events.html", {
        "current_page": "events",
        "seminars": paginated_seminars,
        "page": page,
        "total_pages": total_pages,
        "has_prev": page > 1,
        "has_next": page < total_pages
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