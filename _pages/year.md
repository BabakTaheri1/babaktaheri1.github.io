---
layout: page
permalink: /publications/year
title: publications
description:
pubtype: type
post-header: true
sorting: year
firstyear: 2014
nav: false
social: true
---
{% include bibbuttons.liquid %}
{% assign yearnow = "now" | date: "%Y" %}

{% capture paper_counter %}
{% bibliography_count -f {{site.scholar.bibliography}} %}
{% endcapture %}

<div style="counter-reset:bibitem {{ paper_counter | plus:1 }}"></div>

{% for y in (page.firstyear..yearnow) reversed %}

  {% capture papers_year %}{% bibliography_count -f {{site.scholar.bibliography}} -q @*[year={{y}}]* %}{% endcapture %}
  {% if papers_year != '0' %}
  <div class="publications">
    <h2 class="year">{{y}}</h2>
        {% bibliography -f {{site.scholar.bibliography}} -q @*[year={{y}}]* %}
  </div>
  {% endif %}
{% endfor %}