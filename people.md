---
layout: page
title: People
permalink: /people/
---

{% assign current_people = site.people | where: "status", "current" %}
{% include people/grid.html people=current_people title="Current Team" %}

{% assign visiting_people = site.people | where: "status", "visitor" %}
{% include people/grid.html people=visiting_people title="Visiting" %}

{% assign alumni = site.people | where: "status", "alumni" %}
{% include people/grid.html people=alumni title="Alumni" %}
