# MoST Website

This repository contains the sources of MoST research unit website. We're a
research unit of the [Digital Society center](https://digis.fbk.eu) at
[Fondazione Bruno Kessler](https://www.fbk.eu) in Trento, Italy.

## Deployment Location

In its current form, the website is deployed at the following URL:

https://fbk-most.github.io/

The website is available at:

https://most.fbk.eu/

## Content Management

The website is managed by the members of the research unit. To modify the
website, you need to clone the repository first:

```bash
git clone git@github.com:fbk-most/fbk-most.github.io
```

Ensure you start working from the `main` branch:

```bash
git checkout main
```

Create a new working branch:

```bash
git checkout -b doc/my-change-name
```

(Please, replace `my-change-name` with a meaningful name for your change,
otherwise you will make weeping angels cry, which is not a good thing.)

Edit the website according to the changes you want to add. Once
you're done, commit and push the changes:

```bash
git add .
git commit -m "My commit message"
git push -u origin doc/my-change-name
```

Finally, open a pull request on GitHub and ask for a review. The pull request
contains automatic checks to ensure that the changes, once deployed, would not
break the website. Once the pull request has been merged the website will be
automatically deployed and updated.

### Adding a New Team Member

Create a new markdown file in the `_people` directory with the following front matter:

```yml
---
layout: default
name: "Full Name"
position: "Job Title"
status: "current" # or "alumni" or "visitor"
image: "/assets/images/people/filename.jpg" # optional
website: "https://example.com" # optional
twitter: "username" # optional
github: "username" # optional
scholar: "id" # optional Google Scholar ID
order: "N"
---

Brief bio goes here.

<!--more--> <!-- excerpt separator -->

Extended bio and information goes here.
```

Make sure you add the corresponding image to the `assets/images/people` directory. Note that, in general, [splitting the name and the
surname of people consistently is complex across cultures](
https://shinesolutions.com/2018/01/08/falsehoods-programmers-believe-about-names-with-examples/).
For this reason, we chose to let each member to choose how they want their full
name to be written (on the file system and using UTF-8) as long as each name
component is separated by a dash character (i.e., `-`). The name
used in the filesystem inside `_people` maps to the URL that uniquely
identifies the new team member.

The `<!--more-->` tag is used to separate the excerpt shown as a preview
from the full post content shown when the post is opened.

For the **order** please follow this rule:
- 1: head of unit
- 2: senior members (after PhD)
- 3: PhD students
- 4: junior researchers (before PhD)

### Adding News and Events

News, events are seminars are handled via Google Sheets, which are in visualization-only mode inside MoST Drive Folder.
Events might also be present in MoST Google Calendar.

## Getting Help

In case of need, please contact the owner or the maintainer of the website.
- Owner: [@marcopistore][https://github.com/pistore]
- Maintainer: [@federicalago](https://github.com/Flake22)

## Testing Changes Locally

Install Docker Compose using [the official instructions published on
the Docker website](https://docs.docker.com/compose/install/).

Then, run the following command to start a local server:

```bash
docker-compose up
```

and follow the instructions printed on the screen, including the URL of the
locally-running website, which should be `http://127.0.0.1:4000/`.

## Architecture

This repository contains a pretty standard [Jekyll](https://jekyllrb.com/)
website. The website is hosted on GitHub Pages and is automatically built
whenever a pull request is merged into the `main` branch.

The following directories are of interest:

- [_data/](_data): folder containing material download from news and seminars Google Sheets.

- [_pages](_pages): contains a file for each page composing the website.

- [_people](_people): information about the people in the research unit,
including current members, alumni, and visitors.

- [assets/css](assets/css): CSS files.

- [assets/images](assets/images): images.

- [assets/js](assets/js): JavaScript files.

- [assets/vendor](assets/vendor): vendored dependencies.

- [_config.yml](config.yml): configuration file for
[Jekyll](https://jekyllrb.com/).

When building the website, [Jekyll](https://jekyllrb.com/) will generate the
content of the people pages automatically.

## License

This website is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/).

## TODO

- Fix on mobile
    - News banner not nice
    - Seminars -> not visible
- Disable hexagons on mobile or use something else in general
- Seminars table -> increase size of Date column to fit date width
- Rotate people hexagons
- Define people ordering
- Impove aligment in header for the two logos