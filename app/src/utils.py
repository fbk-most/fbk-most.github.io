import yaml
import markdown
import os

def parse_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    # Split front matter and body
    if text.startswith("---"):
        _, front_matter, body = text.split("---", 2)
    else:
        raise ValueError(f"No front matter found in {filepath}")

    # Parse YAML metadata
    metadata = yaml.safe_load(front_matter.strip())

    # Convert markdown to HTML
    html_content = markdown.markdown(body.strip(), extensions=["extra"])

    # Build final dictionary
    result = dict(metadata)
    result["content"] = html_content

    return result

def parse_directory(directory_path):
    current = []
    former = []

    for filename in os.listdir(directory_path):
        if filename.endswith(".md") or filename.endswith(".txt"):
            filepath = os.path.join(directory_path, filename)
            try:
                person = parse_file(filepath)
                person["filename"] = filename[:-3]
                if 'vis-order' in person and person["status"] != "alumni":
                    current.append(person)
                else:
                    former.append(person)
            except Exception as e:
                print(f"Error parsing {filename}: {e}")

    # Sort by vis-order (fallback to large number if missing)
    current.sort(key=lambda x: x.get("vis-order", float("inf")))
    former.sort(key=lambda x: x.get("vis-order", float("inf")))

    return current, former