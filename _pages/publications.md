---
layout: page
permalink: /publications/
title: publications
#description: You can also browse my <a>href="https://scholar.google.com/citations?user=7_H8IkUAAAAJ&hl=en" target="_blank"> Google Scholar</a> profile.
nav: true
nav_order: 2
---

{% include bib_search.liquid %}

<div class="publications">
{% bibliography --group_by type --group_order preprints,articles,inproceedings,incollection,phdthesis,mastersthesis %}
</div>