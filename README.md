# MoST Website

This repository contains the sources of MoST research unit website. We're a
research unit of the [Digital Society center](https://digis.fbk.eu) at
[Fondazione Bruno Kessler](https://www.fbk.eu) in Trento, Italy.

## Architecture

This repository contains a pretty standard [Jekyll](https://jekyllrb.com/)
website. The website is hosted on GitHub Pages and is automatically built
whenever a pull request is merged into the `main` branch.

The following directories are of interest:

- [_includes/home](_includes/home): content included into the home page.

- [_includes/shared](includes/shared): content shared across multiple pages.

- [_layouts/base.html](_layouts/base.html): the base layout for all pages.

- [_layouts/home.html](_layouts/home.html): the layout for the home page.

- [_layouts/page.html](_layouts/page.html): the layout for all other pages.

- [_people](_people): information about the people in the research unit,
including current members, alumni, and visitors.

- [_posts](_posts): blog posts.

- [assets/css](assets/css): CSS files.

- [assets/img](assets/img): images.

- [assets/js](assets/js): JavaScript files.

- [_config.yml](config.yml): configuration file for
[Jekyll](https://jekyllrb.com/).

- [index.md](index.md): the home page.

- [news.md](news.md): the news page containing blog posts.

- [people.md](people.md): the people page.

When building the website, [Jekyll](https://jekyllrb.com/) will generate the
content of the news and people pages automatically.

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

Finally, open a pull request on GitHub and ask for a review. Once the pull
request has been merged the website will be automatically updated.

### Adding a New Team Member

Create a new markdown file in the `_people` directory with the following front matter:

```yml
---
layout: page
name: "Full Name"
position: "Job Title"
status: "current" # or "alumni" or "visitor"
image: "/assets/images/people/filename.jpg" # optional
website: "https://example.com" # optional
twitter: "username" # optional
github: "username" # optional
scholar: "id" # optional Google Scholar ID
---

Brief bio goes here.

<!--more--> <!-- excerpt separator -->

Extended bio and information goes here.
```

Make sure you add the corresponding image to the `assets/images/people` directory. Note that, in general, [splitting the name and the
surname of people consistently is complex across cultures](
https://shinesolutions.com/2018/01/08/falsehoods-programmers-believe-about-names-with-examples/).
For this reason, we chose to let each member to choose how they want their full
name to be written (on the file system and using UTF-8). The name
used in the filesystem inside `_people` maps to the URL that uniquely
identifies the new team member.

The `<!--more-->` tag is used to separate the excerpt shown as a preview
from the full post content shown when the post is opened.

### Adding a News Post

Create a new markdown file in the `_posts` directory with the filename format `YYYY-MM-DD-title.md` and the following front matter:

```yml
---
layout: page
title: "Post Title"
date: YYYY-MM-DD
categories: category-name
excerpt_separator: <!--more-->
---

Brief excerpt goes here.

<!--more-->

Full post content goes here.
```

The `<!--more-->` tag is used to separate the excerpt shown as a preview
from the full post content shown when the post is opened.

## Getting Help

If you run into trouble, [@bassosimone](https://github.com/bassosimone) is
here to help! (Insert here obligatory Doctor Who quote.)

## License

This website is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/).
