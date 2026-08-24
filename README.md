# VivekJoshy.com

Personal website for Vivek Joshy built with Nuxt 3, Tailwind CSS, and DaisyUI.

## Features

- System / light / dark theming, applied before first paint so there is no flash
- WCAG 2.2 AA: contrast-gated palette, skip link, `:focus-visible` rings, reduced-motion support
- Interactive OpenSkill playground running the Weng-Lin models in the browser
- Adoption figures fetched at build time rather than hardcoded

## Tech Stack

- [Nuxt 4](https://nuxt.com/) - Vue Framework
- [Tailwind CSS 4](https://tailwindcss.com/) - CSS-first configuration
- [DaisyUI 5](https://daisyui.com/) - Component library
- [TypeScript](https://www.typescriptlang.org/) - Static Type Checking

## Build gates

`prebuild` runs three checks; any failure stops the build.

| Script | Checks |
| --- | --- |
| `scripts/verify-openskill.mjs` | The browser port of the Weng-Lin models matches `openskill.py` to 1e-6 across 78 assertions. Regenerate the fixture with `scripts/gen-openskill-reference.py`. |
| `scripts/check-contrast.mjs` | Every palette pair in both themes meets WCAG 2.2 AA. |
| `scripts/fetch-evidence.mjs` | Refreshes `app/data/evidence.json` from PyPI, npm, GitHub and Semantic Scholar, falling back to the committed copy if a source is down. |

## Resume

`public/assets/resume.pdf` is generated from `resume-src/fancy-rover.tex`:

```bash
cd resume-src && pdflatex -interaction=nonstopmode fancy-rover.tex
cp fancy-rover.pdf ../public/assets/resume.pdf
```

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

## Development

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build
```

## Deployment

This site is deployed on [Vercel](https://vercel.com).

Check out the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more deployment options.
