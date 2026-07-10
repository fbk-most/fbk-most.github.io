# MoST Website

This repository contains the sources of MoST research unit website. We're a
research unit of the [Digital Society center](https://digis.fbk.eu) at
[Fondazione Bruno Kessler](https://www.fbk.eu) in Trento, Italy.

# FastAPI Base Project

## Run locally

```bash
uvicorn app.main:app --reload --port 4000
```

Alternatively you can use Docker.

Install Docker Compose using [the official instructions published on
the Docker website](https://docs.docker.com/compose/install/).

Then, run the following command to start a local server:

```bash
docker-compose up
```

and follow the instructions printed on the screen, including the URL of the
locally-running website, which should be `http://127.0.0.1:4000/`.

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

### Adding a New Team Member, News and Events

Ask administrators for instructions.

### Adding Seminars

Seminars are handled via Google Sheets, which are in visualization-only mode inside MoST Drive Folder.
At midnight the website is updated if there are any modifications to that Google Sheet.

## Getting Help

In case of need, please contact the owner or the maintainer of the website.
- Owner: [@marcopistore](https://github.com/pistore)
- Maintainer: [@federicalago](https://github.com/Flake22)

## License

This website is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/).

## TODO

- Disable hexagons on mobile or use something else in general
- Rotate people hexagons
- Define people ordering
