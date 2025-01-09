---
layout: cv
permalink: /cv/
title: My CV
tags: [about]
modified: 2025-01-08
comments: false
---


<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{ page.title }}</title>

  <!-- Example: Using a Google Font (optional) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link 
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" 
    rel="stylesheet"
  >

  <style>
    /* Global styles */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Roboto', Arial, sans-serif; /* or your preferred font */
      line-height: 1.5;
      color: #333;
      background-color: #f5f5f5;
    }

    /* Page container for controlling overall width */
    .page-container {
      max-width: 1000px;
      margin: 2em auto;
      padding: 0 1em;
      background: #fff;
    }

    /* Section containers - reused for Education, Experience, Honors, etc. */
    .cv-section {
      background: #fdfdfd;
      padding: 1.5em;
      border: 1px solid #eee;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.07);
      margin-bottom: 1.5em;
    }

    /* Section heading (e.g. "Education", "Experience", etc.) */
    .section-heading {
      margin-top: 0;
      margin-bottom: 1em;
      font-size: 1.6em;
      color: #333;
      font-weight: 500;
      border-bottom: 2px solid #eee; /* subtle divider line under heading */
      padding-bottom: 0.3em;
    }

    /* Entry container: used for individual education items, experiences, etc. */
    .entry {
      margin-bottom: 1.5em;
    }

    /* Entry heading, e.g. school/company name, in a smaller heading level */
    .entry h3 {
      margin: 0;
      font-size: 1.2em;
      color: #555;
      font-weight: 500;
    }

    /* Optional location styling in parentheses */
    .location {
      font-weight: normal;
      color: #999;
      margin-left: 0.4em;
    }

    /* Paragraph under each entry (like degree, role, or bullet lists) */
    .entry p, 
    .entry ul {
      margin: 0.5em 0 0 0; 
      color: #666;
      font-size: 0.95em;
    }

    /* Date range styling */
    .date-range {
      font-size: 0.85em;
      font-style: italic;
      color: #999;
      margin-left: 0.5em;
    }

    /* Indent lists, remove default bullets if desired */
    .entry ul {
      list-style: disc;
      margin-left: 1.5em;
    }

    /* TIMELINE STYLES (applied only to Experience) */
    .timeline {
      position: relative;
      padding: 2em 0;
    }
    .timeline::before {
      content: "";
      position: absolute;
      left: 30px; /* position of vertical line */
      top: 0;
      bottom: 0;
      width: 2px;
      background: #ddd;
    }
    .timeline-item {
      position: relative;
      margin-bottom: 2em;
      padding-left: 60px; /* space for bullet + line */
    }
    .timeline-item::before {
      content: "";
      position: absolute;
      left: 22px; /* bullet center */
      top: 4px;
      width: 16px;
      height: 16px;
      background: #fff;
      border: 2px solid #ccc;
      border-radius: 50%;
    }
    .timeline-item h3 {
      font-size: 1.2em;
      margin: 0;
    }
    .timeline-item p {
      margin-top: 0.5em;
    }
  </style>
</head>
<body>

  <!-- PAGE CONTAINER -->
  <div class="page-container">

    <!-- EDUCATION SECTION -->
    <div class="cv-section">
      <h2 class="section-heading">Education</h2>

      <div class="entry">
        <h3>Georgia Institute of Technology 
          <span class="location">(Atlanta, GA)</span>
        </h3>
        <p>
          <strong>Ph.D. in Electrical &amp; Computer Engineering</strong> 
          <span class="date-range">(Aug. 2021 – Dec. 2024)</span>
        </p>
        <ul>
          <li>Dissertation: 
            <q>Improving Power System Approximations Through Machine Learning–Inspired Optimization Methods</q>
          </li>
          <li>Advisor: Dr. Daniel K. Molzahn</li>
        </ul>
        <p>
          <strong>Minor in Industrial &amp; Systems Engineering (ISyE)</strong> 
          <span class="date-range">(Aug. 2022 – May 2024)</span>
        </p>
        <p>
          <strong>M.Sc. in Electrical &amp; Computer Engineering</strong> 
          <span class="date-range">(Aug. 2021 – May 2024)</span>
        </p>
      </div>

      <div class="entry">
        <h3>Sharif University of Technology 
          <span class="location">(Tehran)</span>
        </h3>
        <p>
          <strong>M.Sc. in Electrical Engineering</strong> 
          <span class="date-range">(Sep. 2017 – May 2019)</span>
        </p>
      </div>

      <div class="entry">
        <h3>University of Tabriz 
          <span class="location">(Tabriz)</span>
        </h3>
        <p>
          <strong>B.Sc. in Electrical Engineering</strong> 
          <span class="date-range">(Sep. 2013 – Jun. 2017)</span>
        </p>
      </div>
    </div><!-- end .cv-section -->


    <!-- EXPERIENCE SECTION (TIMELINE) -->
    <div class="cv-section">
      <h2 class="section-heading">Experience</h2>
      <div class="timeline">
        
        <!-- Hitachi -->
        <div class="timeline-item">
          <h3>Hitachi Energy Research 
            <span class="location">(Raleigh, NC)</span>
          </h3>
          <p>
            <strong>Research Scientist</strong>
            <span class="date-range">(Jan. 2025 – present)</span>
          </p>
        </div>

        <!-- Dominion Energy (Strategic Initiatives) -->
        <div class="timeline-item">
          <h3>Dominion Energy
            <span class="location">(Richmond, VA)</span>
          </h3>
          <p>
            <strong>Graduate Intern, Electric Transmission Strategic Initiatives</strong>
            <span class="date-range">(May – Aug. 2024)</span>
          </p>
        </div>

        <!-- NERC -->
        <div class="timeline-item">
          <h3>North American Electric Reliability Corporation (NERC) 
            <span class="location">(Atlanta, GA)</span>
          </h3>
          <p>
            <strong>Graduate Intern, Advanced System Analytics &amp; Modeling</strong> 
            <span class="date-range">(Jan. – May 2024)</span>
          </p>
        </div>

        <!-- Dominion Energy (Planning – Modeling) -->
        <div class="timeline-item">
          <h3>Dominion Energy 
            <span class="location">(Richmond, VA)</span>
          </h3>
          <p>
            <strong>Graduate Intern, Electric Transmission Planning</strong>
            <span class="date-range">(May – Aug. 2023)</span>
          </p>
        </div>

        <!-- Georgia Tech -->
        <div class="timeline-item">
          <h3>Georgia Institute of Technology 
            <span class="location">(Atlanta, GA)</span>
          </h3>
          <p>
            <strong>Graduate Research and Teaching Assistant</strong>
            <span class="date-range">(Aug. 2021 – Dec. 2024)</span>
          </p>
        </div>

        <!-- Sharif University -->
        <div class="timeline-item">
          <h3>Sharif University of Technology 
            <span class="location">(Tehran)</span>
          </h3>
          <p>
            <strong>Graduate Research and Teaching Assistant</strong>
            <span class="date-range">(Sep. 2017 – May 2021)</span>
          </p>
        </div>

      </div><!-- end .timeline -->
    </div><!-- end .cv-section -->


    <!-- HONORS & AWARDS SECTION -->
    <div class="cv-section">
      <h2 class="section-heading">Selected Honors &amp; Awards</h2>
      <ul>
        <li>
          <strong>Awarded the Dominion Energy Inclusion, Equity and Diversity Scholarship</strong>
          <span class="date-range">(Jul. 2024)</span>
        </li>
        <li>
          <strong>Awarded the Dominion Energy Inclusion, Equity and Diversity Scholarship</strong>
          <span class="date-range">(Aug. 2023)</span>
        </li>
        <li>
          <strong>Awarded the Georgia Tech ECE Chaddick Fellowship</strong>
          <span class="date-range">(Feb. 2020)</span>
        </li>
        <li>
          <strong>Ranked 2nd in the class of 2019 in terms of cumulative GPA, masters degree, Sharif University of Technology</strong>
          <span class="date-range">(Jun. 2019)</span>
        </li>
        <li>
          <strong>Ranked 1st in the class of 2017 in the Department of Electrical Engineering among nearly 200 entrants of 2013, in terms of cumulative GPA</strong>
          <span class="date-range">(Jun. 2017)</span>
        </li>
        <li>
          <strong>Direct admission to M.Sc. program at Sharif University of Technology as an exceptional talent, based on B.Sc. top GPA and rank</strong>
          <span class="date-range">(Apr. 2017)</span>
        </li>
      </ul>
    </div><!-- end .cv-section -->

  </div><!-- end .page-container -->
</body>
</html>
