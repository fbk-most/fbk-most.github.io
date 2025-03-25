---
layout: page
title: News
permalink: /news/
---

<ul class="post-list">
  {% for post in site.posts %}
    <li>
      <span class="post-date">{{ post.date | date: "%b %-d, %Y" }}</span>
      <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
      {% if post.excerpt %}
        {{ post.excerpt }}
        <a href="{{ post.url | relative_url }}">Read
        more about "{{ post.title }}"...</a>
      {% endif %}
    </li>
  {% endfor %}
</ul>
