# Deployment Guide

## Current Architecture (Updated for Static Export)

This documentation site is now built with:
- **TanStack Start** - React framework in SPA mode
- **Fumadocs** - Documentation components
- **Static Export** - Pre-rendered at build time

The site is fully static and ready for GitHub Pages deployment.

## Build Output

```bash
bun run build
```

Output directory: `dist/client/`
- Contains all static HTML, CSS, JS files
- Pre-rendered pages for instant loading
- Client-side routing for navigation

## GitHub Pages Deployment (Recommended)

### Automatic Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:

1. Builds the site on push to `main` branch
2. Uploads static files from `dist/client/`
3. Deploys to GitHub Pages

### Manual Setup Steps

1. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Source: "GitHub Actions"

2. **Custom Domain** (optional):
   - DNS CNAME record pointing to `<username>.github.io`
   - File `public/CNAME` already configured with `tuios.gaurav.zip`

3. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure static export"
   git push origin main
   ```

4. **Monitor Deployment**:
   - Check Actions tab for build progress
   - Site will be live at `https://<username>.github.io/<repo>/` or custom domain

## Alternative Deployment Options

### Vercel

1. Import GitHub repository
2. Vercel auto-detects TanStack Start
3. Build command: `bun run build`
4. Output directory: `dist/client`
5. Custom domain configuration in dashboard

### Netlify

1. Connect GitHub repository
2. Build settings:
   - Build command: `bun run build`
   - Publish directory: `dist/client`
3. Add custom domain in site settings

### Cloudflare Pages

1. Connect GitHub repository
2. Build configuration:
   - Framework preset: None (or TanStack Start if available)
   - Build command: `bun run build`
   - Build output directory: `dist/client`
3. Custom domain via dashboard

## Local Preview

Test the production build locally:

```bash
bun run build
bun run preview
```

Open http://localhost:4173/

## Site Features

### Endpoints Available

- `/` - Landing page
- `/docs` - Documentation home
- `/docs/*` - Individual documentation pages
- `/rss.xml` - RSS feed for documentation updates
- `/llms-full.txt` - Full documentation text for AI/LLM consumption
- `/api/search` - Search API (client-side index)

### Static Assets

- Pre-rendered HTML for all pages (SEO-friendly)
- Optimized JavaScript bundles with code splitting
- Catppuccin theme CSS
- Search index for offline search

## Configuration Files

- `vite.config.ts` - SPA mode enabled, static build configuration
- `source.config.ts` - Fumadocs MDX processing
- `.github/workflows/deploy.yml` - GitHub Actions deployment
- `public/CNAME` - Custom domain configuration

## Troubleshooting

### 404 Errors on Refresh

If you get 404 errors when refreshing on sub-pages:
- GitHub Pages: This is handled by TanStack Start's client-side routing
- Other hosts: May need to configure fallback to `index.html`

### Custom Domain Not Working

1. Verify DNS CNAME record points to `<username>.github.io`
2. Check `public/CNAME` contains correct domain
3. Wait 24-48 hours for DNS propagation

### Build Failures

1. Check Node.js/Bun version compatibility
2. Clear `node_modules` and reinstall: `rm -rf node_modules bun.lock && bun install`
3. Check GitHub Actions logs for specific errors

## Migration from Server-Side Rendering

Previously this site used:
- Nitro server (removed)
- Server-side API routes (converted to static)
- Dynamic rendering (now pre-rendered)

All functionality maintained in static export:
- Search works via client-side index
- RSS feed generated at build time
- LLM text endpoints accessible as static files
