---
layout: page
title: People
permalink: /people/
---

<h2>Current Team</h2>
<div class="people-grid">
  {% assign current_people = site.people | where: "status", "current" %}
  {% for person in current_people %}
    <div class="person-card">
      {% if person.image %}
        <img src="{{ person.image | relative_url }}" alt="{{ person.name }}">
      {% endif %}
      <h3><a href="{{ person.url | relative_url }}">{{ person.name }}</a></h3>
      <p>{{ person.position }}</p>
      {% if person.excerpt %}
        {{ person.excerpt }}
        <a href="{{ person.url | relative_url }}">Read
        more about {{ person.name }} ...</a>
      {% endif %}
    </div>
  {% endfor %}
</div>

{% assign alumni = site.people | where: "status", "alumni" %}
{% if alumni.size > 0 %}
<h2>Alumni</h2>
<div class="people-grid">
  {% for person in alumni %}
    <div class="person-card">
      <h3><a href="{{ person.url | relative_url }}">{{ person.name }}</a></h3>
      {% if person.excerpt %}
        {{ person.excerpt }}
        <a href="{{ person.url | relative_url }}">Read
        more about {{ person.name }} ...</a>
      {% endif %}
    </div>
  {% endfor %}
</div>
{% endif %}
