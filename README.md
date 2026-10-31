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

## Plugin docs

The plugin developer wiki at `/docs` is built from markdown in `src/docs/<locale>/`.

- The folder is the sidebar section (`start`, `guides`, `reference`), or set `section:` in the frontmatter. `order:` sorts
  pages within a section, and `index.md` is the wiki's front page.
- Frontmatter takes `title` (required), `description`, `order`, `section` and `layout` (`sdk` adds the SDK download cards).
- Link between pages with `/docs/<path>`; links are rewritten for the locale. `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`,
  `[!WARNING]` and `[!CAUTION]` render as callouts, and fences accept `title="file.kt"`.
- Pages are rendered at build time with marked and shiki (`src/lib/docs/*.server.ts`), so neither ships to the browser.
- English pages fall back to the Korean file until `src/docs/en/<path>.md` exists.
- The SDK release shown on `/docs/sdk` is in `src/lib/docs/sdk.ts`. Set an artifact's `url` to enable its download button.
