# MIRROR project website

The public and anonymous review pages share their layout, figures, videos, and
research content. Each version is built separately so public author information
is absent from the review page's JavaScript bundle.

All source, media, Git history, and published pages are managed in
[`pomdp-mirror/pomdp-mirror.github.io`](https://github.com/pomdp-mirror/pomdp-mirror.github.io).

- `https://pomdp-mirror.github.io/review/`: anonymous review version.
- `https://pomdp-mirror.github.io/public/`: public version, with authors and CoRL 2026.
- `https://pomdp-mirror.github.io/`: redirects to `/public/`.

## Customize

- Edit paper content in `src/App.jsx`.
- Edit public authors, affiliations, venue, and citation in `src/publication.public.js`.
- Edit anonymous metadata in `src/publication.review.js`.
- Resource URLs in `src/App.jsx` are blank; buttons are disabled until URLs are supplied.
- Edit page styling in `src/App.css` and shared layout styles in `src/index.css`.
- Media and fonts live in `public/`; this source asset directory is separate from the public page's URL.
- Update the description in `index.html` and page titles in `vite.config.js`.

## Commands

```sh
npm run dev
npm run dev:review
npm run build
npm run lint
npm run preview
```

`npm run build` creates `dist/review/`, `dist/public/`, and the root redirect.
`npm run preview` serves all three routes at `http://127.0.0.1:4173/`.

## Publish

After building and checking both pages, run `npm run deploy` to publish both
versions, or `npm run deploy:review` / `npm run deploy:public` for one version.

The `main` branch contains the editable React project and source media. The
`gh-pages` branch contains only the built site: `review/`, `public/`, and the root
redirect. Set GitHub Pages to deploy from `gh-pages` at `/` in this repository.

`npm run deploy` replaces the built site on `gh-pages`. The individual deployment
commands update only the selected version, preserving the other version. The
public deployment also updates the root redirect.

Deployment uses Git's existing authentication, including an HTTPS credential in
the current origin if present. No extra node dependencies are required.
