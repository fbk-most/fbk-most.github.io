---
layout: page
title: People
permalink: /people/
---

{% assign current_people = site.people | where: "status", "current" | sort: "order" %}
{% include people/grid.html people=current_people title="Team" %}

{% assign visiting_people = site.people | where: "status", "visitor" | sort: "order" %}
{% include people/grid.html people=visiting_people title="Visiting" %}

{% assign alumni = site.people | where: "status", "alumni" | sort: "order" %}
{% include people/grid.html people=alumni title="Alumni" %}
