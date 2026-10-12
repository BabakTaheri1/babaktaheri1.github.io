---
layout: page
math: true
title: Interactive Demos
permalink: /projects/
description: Interactive experiments in power systems and mathematics.
nav: true
nav_order: 3
display_categories: [Power Systems, Math]
horizontal: false
---

<div class="projects">

<p class="demo-intro">Explore power factor, network flows, and a few mathematical ideas by changing the numbers and watching the result. Each demo includes a short explanation of what you’re seeing.</p>

{% assign all_items = site.projects | concat: site.code %} {% if site.enable_project_categories and page.display_categories %}
{% for category in page.display_categories %}

  <h2 class="category" id="{{ category | slugify }}">{{ category }}</h2>

{% assign categorized_projects = all_items | where: "category", category %}

{% assign sorted_projects = categorized_projects | sort: "importance" %}
{% if page.horizontal %}

  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
    {% for project in sorted_projects %}
      {% include projects_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in sorted_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
  {% endif %}
  {% endfor %}

{% else %}

{% assign sorted_projects = all_items | sort: "importance" %}

{% if page.horizontal %}

  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
    {% for project in sorted_projects %}
      {% include projects_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in sorted_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
  {% endif %}
{% endif %}
</div>
