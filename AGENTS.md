# AGENTS.md

This file helps AI agents work effectively in this repository.

## Project Overview

This is the **official documentation site for TUIOS** (Terminal UI Operating System) built with:
- **Fumadocs** (docs framework) - https://fumadocs.dev
- **Next.js 16** (React framework with App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** (styling)
- **Biome** (linting and formatting)
- **Bun** (package manager)

The project documents TUIOS, a Go-based terminal window manager.

## Essential Commands

```bash
bun run dev        # Development server (port 3000)
bun run build      # Build for production (static export to out/)
bun run types:check # Type checking
bun run lint       # Linting
bun run format     # Formatting
```

## Project Structure

```
/
├── app/                   # Next.js App Router
│   ├── layout.tsx        # Root layout
│   ├── global.css        # Tailwind + custom styles
│   ├── (home)/           # Landing page
│   ├── docs/             # Documentation routes
│   ├── api/search/       # Static search endpoint
│   └── og/docs/          # OG image generation
├── components/           # React components
│   ├── layout/docs/      # Customized DocsLayout
│   └── mdx/              # MDX components (mermaid)
├── content/docs/         # MDX documentation files
├── lib/                  # Utilities (source.ts, layout.shared.tsx)
├── public/               # Static assets
├── source.config.ts      # Fumadocs MDX config
└── next.config.mjs       # Next.js config (static export)
```

## Deployment

- **Target**: GitHub Pages at `tuios.gaurav.zip`
- **Workflow**: Push to main → GitHub Actions builds → Deploys `out/` folder

## Key Notes

1. **Icon names**: lucide-react uses `House` not `Home`
2. **Static export**: No server features, use `staticGET` for search
3. **Generated files**: Don't edit `.source/*`
