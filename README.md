# Ashley — Astro Recreation

A faithful recreation of the [Ashley BSL Themes demo](https://miller.bslthemes.com/ashley-demo/home-1.html) built in **Astro**.

## Stack
- [Astro](https://astro.build) v4
- Vanilla CSS (no framework)
- Google Fonts: Cormorant Garamond + DM Sans
- Zero JS dependencies (Astro islands-only approach)

## Project Structure

```
ashley-astro/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.astro       ← Fixed nav + fullscreen overlay menu
│   │   ├── Hero.astro         ← Full-height hero with headline
│   │   ├── About.astro        ← Studio intro + dual image grid
│   │   ├── Services.astro     ← Dark section with service list rows
│   │   ├── Team.astro         ← 4-column team grid
│   │   ├── Testimonials.astro ← Draggable testimonial slider
│   │   ├── Partners.astro     ← Partner logos strip
│   │   ├── Blog.astro         ← 2-column blog card grid
│   │   └── Footer.astro       ← Dark footer with newsletter input
│   ├── layouts/
│   │   └── Layout.astro       ← Base HTML shell + scroll reveal script
│   ├── pages/
│   │   ├── index.astro        ← Homepage (all sections assembled)
│   │   ├── portfolio.astro    ← Stub
│   │   ├── services.astro     ← Stub
│   │   ├── contact.astro      ← Stub
│   │   └── blog.astro         ← Stub
│   └── styles/
│       └── global.css         ← All styles (CSS variables, sections, responsive)
├── astro.config.mjs
└── package.json
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321)

## Build for Production

```bash
npm run build
npm run preview
```

## Customisation Notes

- **Colors** — edit CSS variables in `src/styles/global.css` (`:root` block)
- **Fonts** — swap Google Fonts imports in `src/layouts/Layout.astro`
- **Content** — all copy lives directly in the `.astro` component files as front-matter arrays
- **Images** — the demo currently uses the original BSL theme CDN URLs; replace with your own assets under `public/img/`
- **Stub pages** — `portfolio`, `services`, `contact`, `blog` are scaffolded but empty; build them out using the same Layout wrapper

## Features Implemented

- ✅ Sticky header with scroll-state class
- ✅ Fullscreen overlay navigation with ESC + close-button support
- ✅ Hero section with animated headline and scroll CTA
- ✅ About section with asymmetric image grid
- ✅ Dark services section with hover-animated rows
- ✅ Team grid with photo hover zoom
- ✅ Testimonial card slider (prev/next)
- ✅ Partner logos strip
- ✅ Blog 2-column card layout
- ✅ Dark footer with newsletter input
- ✅ Scroll-reveal animations (IntersectionObserver)
- ✅ Fully responsive (mobile breakpoints in global.css)
