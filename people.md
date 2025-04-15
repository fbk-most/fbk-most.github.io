git checkout main
---git checkout -b doc/sammer sheereen
layout: page
title: People
permalink: /people/
---
git clone git@github.com:fbk-most/fbk-most.github.io
{% assign current_people = site.people | where: "status", "current" %}
{% include people/grid.html people=current_people title="Current Team" %}

{% assign visiting_people = site.people | where: "status", "visitor" %}
{% include people/grid.html people=visiting_people title="Visiting" %}

{% assign alumni = site.people | where: "status", "alumni" %}
{% include people/grid.html people=alumni title="Alumni" %}
