---
layout: bib
permalink: /publications/
title: publications
description: You can also browse my Google Scholar profile.
nav: true
nav_order: 2
---

{% include bib_search.liquid %}

<div class="publications">
{% bibliography --group_by type --group_order preprints,articles,inproceedings,incollection,phdthesis,mastersthesis %}
</div>