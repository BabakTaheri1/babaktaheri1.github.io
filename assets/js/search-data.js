// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "publications",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "Some fun animations.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-began-my-internship-at-north-american-electric-reliability-corporation-nerc-in-the-advanced-system-analytics-amp-amp-modeling-asam-department",
          title: 'Began my internship at North American Electric Reliability Corporation (NERC) in the Advanced...',
          description: "",
          section: "News",},{id: "news-two-papers-accepted-to-the-23rd-power-systems-computational-conference-pscc-to-appear-in-electric-power-systems-research",
          title: 'Two papers accepted to the 23rd Power Systems Computational Conference (PSCC), to appear...',
          description: "",
          section: "News",},{id: "news-paper-accepted-to-the-ieee-transactions-on-power-systems",
          title: 'Paper accepted to the IEEE Transactions on Power Systems.',
          description: "",
          section: "News",},{id: "news-began-my-summer-internship-at-dominion-energy-in-the-electric-transmission-strategic-initiatives-group",
          title: 'Began my summer internship at Dominion Energy in the Electric Transmission Strategic Initiatives...',
          description: "",
          section: "News",},{id: "news-defended-my-ph-d-proposal-and-became-a-phd-candidate",
          title: 'Defended my Ph.D. proposal and became a PhD candidate.',
          description: "",
          section: "News",},{id: "news-received-my-second-msc-degree-in-electrical-and-computer-engineering-from-the-georgia-institute-of-technology",
          title: 'Received my second MSc degree in Electrical and Computer Engineering from the Georgia...',
          description: "",
          section: "News",},{id: "news-awarded-the-dominion-energy-inclusion-equity-and-diversity-scholarship-for-the-second-time",
          title: 'Awarded the Dominion Energy Inclusion, Equity, and Diversity Scholarship for the second time....',
          description: "",
          section: "News",},{id: "news-defended-my-ph-d-dissertation-improving-power-system-approximations-through-machine-learning-inspired-optimization-methods",
          title: 'Defended my Ph.D. dissertation: Improving Power System Approximations Through Machine Learning-Inspired Optimization Methods....',
          description: "",
          section: "News",},{id: "news-paper-accepted-to-the-ieee-transactions-on-power-systems",
          title: 'Paper accepted to the IEEE Transactions on Power Systems.',
          description: "",
          section: "News",},{id: "news-paper-accepted-to-the-ieee-transactions-on-smart-grid",
          title: 'Paper accepted to the IEEE Transactions on Smart Grid.',
          description: "",
          section: "News",},{id: "news-paper-accepted-to-the-ieee-transactions-on-power-systems",
          title: 'Paper accepted to the IEEE Transactions on Power Systems.',
          description: "",
          section: "News",},{id: "projects-reactive-power-truck",
          title: 'Reactive Power - Truck',
          description: "This reactive power metaphor uses a truck-and-hill analogy to explain system efficiency. Active power is the useful work, shown as packages being delivered...",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_reactive_truck/";
            },},{id: "projects-reactive-power-particle-flow",
          title: 'Reactive Power - Particle Flow',
          description: "This reactive power metaphor uses flowing particles to visualize electrical concepts. Useful active power is shown as blue particles moving directly to the load...",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_reactive_particle/";
            },},{id: "projects-braess-39-s-paradox",
          title: 'Braess&amp;#39;s Paradox',
          description: "Braess&#39;s Paradox is the counter-intuitive observation that removing capacity from a network, can paradoxically increase the network&#39;s overall performance.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_braess_paradox/";
            },},{id: "projects-polya-39-s-urn",
          title: 'Polya&amp;#39;s Urn 🏺',
          description: "This interactive tool simulates Polya&#39;s Urn, a classic probability model demonstrating the &quot;rich-get-richer&quot; phenomenon...",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_polya_urn/";
            },},{id: "projects-sierpinski-triangle",
          title: 'Sierpinski Triangle',
          description: "This visualization demonstrates the Chaos Game, a stochastic process that beautifully generates the deterministic fractal known as the Sierpinski Triangle.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/5_sierpinski/";
            },},{id: "projects-euler-39-s-identity",
          title: 'Euler&amp;#39;s Identity',
          description: "Euler&#39;s Identity, $e^{i\pi} + 1 = 0$, often feels like a cryptic puzzle... This visualization reveals that story, showing how constant &quot;sideways growth&quot;...",
          section: "Projects",handler: () => {
              window.location.href = "/projects/6_euler_identity/";
            },},{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
