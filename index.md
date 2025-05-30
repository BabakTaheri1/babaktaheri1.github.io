---
layout: home2
title: Me in a Nutshell
description: "Babak Taheri's website"
tags: [Jekyll, theme, responsive, blog, template]
image:
  feature: laguna.jpg
---

<style>
  /* General page text improvements */
  .page-content p, .page-content li { /* Assuming your main content is within a div with class 'page-content' or similar */
    line-height: 1.65;
    font-size: 1.05em; /* Slightly larger for readability */
    color: #4a4a4a; /* Main text gray */
  }
  .page-content a {
    color: #2a2a2a; /* Dark gray for links, almost black for good contrast */
    text-decoration: none;
    font-weight: 500; /* Slightly bolder for links */
  }
  .page-content a:hover {
    color: #000000; /* Black on hover */
    text-decoration: underline;
  }

  /* News Section Styling */
  .news-container {
    margin: 2em 0;
    border-radius: 10px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.07); /* Subtle shadow */
    overflow: hidden; /* To respect border-radius with inner elements */
    background-color: #fff; /* Explicit background for the container */
  }

  .news-header {
    padding: 0.8em 1.5em; /* Adjusted padding */
    background-color: #f5f5f5; /* Very light gray background for header */
    border-bottom: 1px solid #e0e0e0; /* Light gray separator */
  }

  .news-header h3 {
    margin: 0;
    font-size: 1.6em; /* Slightly larger heading */
    text-align: left;
    color: #2a2a2a; /* Very dark gray for heading */
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Modern font stack */
  }

  .news-scrollable-content {
    max-height: 350px; /* Increased height slightly */
    overflow-y: auto;
    padding: 1em 0.5em 1em 1.5em; /* Adjusted padding, less on right due to scrollbar */
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Consistent modern font */
    font-size: 0.98em; /* Slightly adjusted for readability */
    line-height: 1.6;
    color: #4a4a4a; /* Main text gray for news content */
  }
  /* Custom scrollbar for webkit browsers */
  .news-scrollable-content::-webkit-scrollbar {
    width: 8px;
  }
  .news-scrollable-content::-webkit-scrollbar-track {
    background: #eeeeee; /* Lighter track */
    border-radius: 10px;
  }
  .news-scrollable-content::-webkit-scrollbar-thumb {
    background: #b0b0b0; /* Medium gray scrollbar thumb */
    border-radius: 10px;
  }
  .news-scrollable-content::-webkit-scrollbar-thumb:hover {
    background: #888888; /* Darker gray on hover */
  }

  .news-list {
    list-style-type: none; /* Ensures no default bullets (like diamonds, discs, etc.) */
    margin: 0;
    padding: 0;
  }

  .news-item {
    margin-bottom: 1.2em; /* Spacing between news items */
    padding-right: 1em; /* Space for content before scrollbar might appear */
  }
  .news-item:last-child {
    margin-bottom: 0;
  }

  .news-date {
    font-weight: bold;
    color: #333333; /* Dark gray for dates */
    margin-right: 0.5em; /* Space after the date */
  }

  .news-item a {
    color: #1a1a1a; /* Dark gray/almost black for links */
    text-decoration: none;
    font-weight: 500;
  }
  .news-item a:hover {
    color: #000000; /* Black on hover */
    text-decoration: underline;
  }
  .news-item a .fas { /* Font Awesome icon styling within news links */
    margin-right: 5px;
    color: #555555; /* Medium gray for icons to be slightly less dominant than link text */
    width: 1.1em; /* Ensure icons take up similar space */
    text-align: center;
  }
  .news-item a:hover .fas {
    color: #222222; /* Darker gray for icons on hover */
  }

  /* Specific styling for publication venues mentioned in news */
  .publication-venue { /* Re-using from previous publication styling */
    font-weight: bold;
    color: #333333; /* Dark gray for venue names */
    font-style: italic;
  }

  /* Clustrmaps Container */
  .clustrmaps-container {
    width: 90%; /* More responsive width */
    max-width: 400px; /* Max width as before */
    margin: 2em auto; /* Centering and vertical spacing */
  }
</style>

<div class="page-content"> <p>I am a Research Scientist at <a href="https://www.hitachienergy.com/us/en" target="_blank">Hitachi Energy Research</a>.</p>

  <p>I recently completed my PhD in the School of Electrical and Computer Engineering at the <a href="https://www.gatech.edu/" target="_blank">Georgia Institute of Technology</a>, and I was fortunate to be advised by <a href="https://molzahn.github.io/index.html" target="_blank">Prof. Daniel Molzahn</a>.</p>

  <p>My passion lies in harnessing the power of mathematical optimization and machine learning techniques to foster a more reliable, resilient, affordable, and sustainable energy future. Outside of my work in research, I enjoy traveling, hiking, watching movies, and playing soccer and volleyball.</p>
</div>

<div class="news-container">
  <div class="news-header">
    <h3>News</h3>
  </div>
  <div class="news-scrollable-content">
    <ul class="news-list">
      <li class="news-item">
        <span class="news-date">📅 May 2025:</span>
        Our paper
        <a href="https://arxiv.org/pdf/2411.10528" target="_blank">
          <i class="fas fa-newspaper"></i> on the DC Optimal Transmission Switching Problem
        </a>
        has been accepted to <i><span class="publication-venue">IEEE Transactions on Power Systems</span></i>.
      </li>
      <li class="news-item">
        <span class="news-date">📅 December 2024:</span>
        I defended my dissertation <em>“Improving Power System Approximations Through Machine Learning-Inspired Optimization Methods”</em> to complete the PhD degree.
      </li>
      <li class="news-item">
        <span class="news-date">📅 October 2024:</span>
        Check out our new
        <a href="https://arxiv.org/pdf/2410.11725" target="_blank">
          <i class="fas fa-file-alt"></i> preprint
        </a>
        on improving the accuracy of DC optimal power flow models.
      </li>
      <li class="news-item">
        <span class="news-date">📅 July 2024:</span>
        I received the Dominion Energy Inclusion, Equity, and Diversity Scholarship Award for the second consecutive time.
      </li>
      <li class="news-item">
        <span class="news-date">📅 May 2024:</span>
        I began my summer internship at Dominion Energy in the Electric Transmission Strategic Initiatives group.
      </li>
      <li class="news-item">
        <span class="news-date">📅 May 2024:</span>
        I defended my PhD proposal and became a PhD candidate.
      </li>
      <li class="news-item">
        <span class="news-date">📅 May 2024:</span>
        I received my second MSc degree in Electrical and Computer Engineering, this time from the Georgia Institute of Technology.
      </li>
      <li class="news-item">
        <span class="news-date">📅 April 2024:</span>
        Our
        <a href="https://ieeexplore.ieee.org/document/10508102" target="_blank">
          <i class="fas fa-newspaper"></i> paper
        </a>
        on power systems resilience has been accepted for publication in the <i><span class="publication-venue">IEEE Transactions on Power Systems</span></i>.
      </li>
      <li class="news-item">
        <span class="news-date">📅 April 2024:</span>
        Check out our new
        <a href="https://arxiv.org/pdf/2404.05125" target="_blank">
          <i class="fas fa-file-alt"></i> preprint
        </a>
        on an optimized LinDistFlow model for power distribution networks.
      </li>
      <li class="news-item">
        <span class="news-date">📅 March 2024:</span>
        Two papers
        [<a href="https://arxiv.org/pdf/2310.00447" target="_blank"><i class="fas fa-file-alt"></i>1</a>, <a href="https://arxiv.org/pdf/2304.11418" target="_blank"><i class="fas fa-file-alt"></i>2</a>] have been accepted for the <i><span class="publication-venue">23rd Power Systems Computational Conference (PSCC)</span></i>,
        to appear in <i><span class="publication-venue">Electric Power Systems Research</span></i>. We are looking to present our papers in Paris this summer.
      </li>
      <li class="news-item">
        <span class="news-date">📅 February 2024:</span>
        I presented our
        <a href="https://ieeexplore.ieee.org/abstract/document/10472173" target="_blank">
          <i class="fas fa-microphone-alt"></i> paper </a>
        on power system equivalents at the <i><span class="publication-venue">Texas Power and Energy Conference (TPEC)</span></i>.
      </li>
      <li class="news-item">
        <span class="news-date">📅 January 2024:</span>
        I began my part-time internship at North American Electric Reliability Corporation (NERC) in the Advanced System Analytics &amp; Modeling (ASAM) department.
      </li>
      <li class="news-item">
        <span class="news-date">📅 August 2023:</span>
        I received the Dominion Energy Inclusion, Equity, and Diversity Scholarship Award.
      </li>
      <li class="news-item">
        <span class="news-date">📅 June 2023:</span>
        I presented our
        <a href="https://arxiv.org/pdf/2209.04399" target="_blank">
          <i class="fas fa-microphone-alt"></i> paper </a>
        on the AC power flow feasibility restoration at the <i><span class="publication-venue">American Control Conference (ACC)</span></i>.
      </li>
      <li class="news-item">
        <span class="news-date">📅 May 2023:</span>
        I started my internship at Dominion Energy in the ET Planning-Modeling team.
      </li>
    </ul>
  </div>
</div>

<div class="clustrmaps-container">
  <script
    type="text/javascript"
    id="clustrmaps"
    src="//clustrmaps.com/map_v2.js?cl=ffffff&w=100%25&t=tt&d=IOXQwQpSC0JvOPauXcqdxTU8zarkV5M0XYAfgrG4TXs&co=606060&cmo=202020"
  ></script>
  </div>
