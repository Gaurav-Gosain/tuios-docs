# TUIOS website

The documentation, blog and release notes for [TUIOS](https://github.com/Gaurav-Gosain/tuios), the terminal multiplexer.

Live at https://tuios.gaurav.zip.

## Development

Requires [Bun](https://bun.sh/).

```bash
bun install          # install dependencies
bun run dev          # dev server at http://localhost:3000
bun run build        # static export to out/
bun run types:check  # type check
bun run lint         # lint with Biome
```

Content lives in `content/`:

- `content/docs/`: the documentation
- `content/blog/`: blog posts
- `content/releases/`: release notes

See [AGENTS.md](AGENTS.md) for the project layout and the rules for writing pages.

Built with [Next.js](https://nextjs.org/), [Fumadocs](https://fumadocs.dev/) and [Tailwind CSS](https://tailwindcss.com/). Every push to `main` deploys to GitHub Pages.

## License

MIT
