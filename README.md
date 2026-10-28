# StarLight-Landing

Landing page for [Project StarLight](https://github.com/mooner1022/StarLight), served at https://starlight.mooner.dev.

Built with SvelteKit 3 and Svelte 5, prerendered with `adapter-static` and deployed to GitHub Pages on every push to `main`.

## Development

Requires Node.js 22.17 or newer.

```sh
npm install
npm run dev      # dev server
npm run check    # type check
npm run build    # static site in build/
npm run preview  # serve the build locally
```

## Structure

- `src/routes/[[lang=lang]]/` — pages. Korean lives at `/`, English at `/en` (matcher in `src/params.ts`).
- `src/lib/i18n.ts` — all copy, in Korean and English.
- `src/lib/sections/` — the sections of the landing page.
- `src/lib/versions.ts` — release channels, read from [starlight-version](https://github.com/mooner1022/starlight-version).
  Versions are fetched at build time and again when the page opens; `PRIMARY_CHANNEL` picks the hero download.
