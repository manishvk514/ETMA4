# Everything Media - Premium website redesign

This folder contains a complete premium static website for Everything Media.

No framework. No build step. Upload these files to GitHub/Vercel exactly as they are.

## Files

```text
everything-media-premium/
├── index.html                         full website markup and improved copy
├── style.css                          premium visual system, responsive layout, 3D CSS, animation states
├── script.js                          motion system, preloader, canvas particles, parallax, reel scroll, form
├── vercel.json                        Vercel settings and security headers
├── README.md                          this file
├── ANIMATION_AND_VISUAL_SYSTEM.md      handoff notes for the design/motion direction
└── midjourney-prompts.md              prompts for replacing placeholder visuals with branded assets
```

## What changed from the original version

- Stronger premium positioning and tighter copy.
- Editorial cinematic typography using Instrument Serif, Inter, and JetBrains Mono.
- Large hero with hard-cut stills, lens metadata, filmstrip texture, glass UI plates, and a CSS 3D lens object.
- Animated particle constellation background.
- Custom viewfinder cursor and mouse-reactive spotlight.
- Premium bento capability cards with 3D elements and hover tilt.
- Sticky horizontal work reel on desktop, swipeable reel on mobile.
- Method section rebuilt as a cinematic production system.
- Visual-system section explaining the premium UI language.
- Contact form keeps the no-backend mailto workflow.
- Full reduced-motion support.

## Deploy to Vercel

1. Create or open the GitHub repository for the website.
2. Upload all files from this folder.
3. In Vercel, import the repository.
4. Keep the default settings and deploy.
5. Add the domain in Vercel project settings if needed.

## Replace the placeholder images

The website currently uses Unsplash URLs as placeholders inside `index.html`.

Replace these first:

1. Hero stills: search for `.hero-still` and replace the `background-image` URLs.
2. Work reel cards: search for `.work-card` and replace each `<img src="...">`.

Recommended export sizes:

- Hero stills: 2600 x 1600 px or larger.
- Large work cards: 2400 x 1500 px.
- Standard work cards: 1800 x 2200 px or 1800 x 1200 px depending on crop.

Use warm contrast, deep blacks, copper highlights, and cinematic negative space so the visuals match the design system.

## Form behaviour

The contact form opens the visitor's email client with a pre-filled email to:

`hello@everythingmedia.co.in`

To connect a real form backend later, replace the form handler inside `script.js` with Formspree, Resend, or a Vercel serverless function.

## Performance notes

- The 3D visuals are CSS and canvas based, so there is no heavy 3D library.
- The particle field caps device pixel ratio for performance.
- Motion is disabled for visitors who prefer reduced motion.
- On mobile, the horizontal reel becomes a native swipeable carousel.

## Brand line

Tools change. Taste doesn't.
