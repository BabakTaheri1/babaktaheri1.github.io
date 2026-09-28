# Website maintenance

## Build and publish

Ruby 3.3 is specified in `.ruby-version`. All site workflows use that version;
`.github/actions/setup-site` supplies the shared build dependencies.

Run `bundle install`, then `JEKYLL_ENV=production bundle exec jekyll build`.
ImageMagick must be installed. Python/Jupyter is not needed for the current pages.

`jekyll.yml` is the only publishing workflow. Pull requests build without deploying;
pushes to `main` build and deploy through the GitHub Pages artifact API.
The repository's **Settings → Pages → Source** must be **GitHub Actions**.
`broken-links-site.yml` checks local links after a successful main-branch deployment.

## Published content

About, Publications, Projects, CV, News, and the six standalone demos remain
published. The Demos index at `/code/` has been removed; the individual demonstrations
remain accessible through Projects. Theme sample posts, books, teaching, people, repository listings, and the
sample dropdown page are excluded in `_config.yml`. Their source is retained.
External example feeds and placeholder comment settings are disabled or removed.

## Images and metadata

The portrait stays eager-loaded; publication thumbnails load lazily.
The shared image include escapes alt text and defaults missing descriptions to an
empty alt attribute. The portrait has a meaningful description; paper figures are
identified by publication title.

`assets/img/social-preview.png` is the 1200 × 630 sharing card, with editable vector
source at `assets/img/social/preview.svg`. Open Graph, Twitter large-image cards,
and JSON-LD are enabled. JSON-LD strings use JSON encoding.

## Optional scripts

The global math/zoom settings make the features available, while each page opts in:

- `math: true`: Projects (Euler's identity).
- `zoom: true`: About and Publications (publication figures).

Standalone demos manage their own scripts. When adding a page with equations or
zoomable images, add the corresponding front-matter flag.

## Accessibility checks

Run `npm ci`, `npx playwright install chromium`, and `npm run check:a11y` after a
build. To use an installed Google Chrome locally, set `CHROME_CHANNEL=chrome`.
The audit covers five main pages in light/dark themes at 1280px and 390px widths.
Violations fail the check; `reports/accessibility.json` also records findings that
need manual review. GitHub Actions runs these checks on pushes and pull requests.
Automated checks do not replace keyboard and screen-reader review.

## Measured script savings

Run `npm run measure:scripts` after a build (or set `CHROME_CHANNEL=chrome`).
The comparison serves the same built pages twice, restoring the former global
math/zoom script tags for the baseline. Each navigation uses a fresh browser
context. Results are written to `reports/script-loading.json`.

Local Chrome measurements on 2026-09-28:

| Page         | Optional script requests, before → after | Decoded JavaScript removed |
| ------------ | ---------------------------------------- | -------------------------- |
| About        | 5 → 2                                    | 1,173,400 bytes            |
| Publications | 5 → 2                                    | 1,173,400 bytes            |
| Projects     | 5 → 3                                    | 9,811 bytes                |
| CV           | 5 → 0                                    | 1,183,211 bytes            |

These are **uncompressed script payloads**, not compressed network transfer sizes
or measured page-load speedups. Third-party analytics/badge requests can vary, so
the table isolates the five optional script resources. Math and zoom remain
available where their content needs them.

## Verification for this update

- Production Jekyll build passed with Ruby 3.3.12; existing Sass deprecation warnings remain.
- Generated-page checks passed for metadata, script selection, image loading, and control targets.
- Before removing the Demos index, all 24 page/theme/viewport accessibility scans completed with zero detected violations;
  the report retains 14 automated findings that require manual review.
- Browser interaction checks passed for keyboard disclosures, publication filtering,
  mobile navigation, thumbnail proportions, and equation rendering on Projects and the former Demos index.
- Changes have not been deployed, and the remote Pages source setting was not changed.
