# TUIOS Documentation

Comprehensive documentation for TUIOS - a modern terminal window manager with vim-like controls.

## 📚 Documentation Site

Visit the full documentation at: [tuios.gaurav.zip](https://tuios.gaurav.zip)

## 🛠️ Built With

- **Fumadocs** - Modern documentation framework
- **TanStack Start** - React framework (SPA mode)
- **Tailwind CSS v4** - Styling
- **MDX** - Documentation content
- **Catppuccin Theme** - Color scheme

## 🚀 Quick Start

### Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev
# Open http://localhost:3000
```

### Production Build

```bash
# Build static site
bun run build
# Output: dist/client/

# Preview locally
bun run preview
# Open http://localhost:4173
```

## 📁 Project Structure

```
tuios-docs/
├── content/docs/          # MDX documentation files
│   ├── index.mdx          # Welcome page
│   ├── getting-started.mdx
│   ├── keybindings.mdx
│   ├── configuration.mdx
│   ├── tape-scripting.mdx
│   ├── cli-reference.mdx
│   └── architecture.mdx
├── src/
│   ├── routes/            # Page routes
│   │   ├── __root.tsx     # Root layout
│   │   ├── index.tsx      # Landing page
│   │   ├── docs/          # Documentation pages
│   │   ├── api/           # Search API
│   │   ├── rss.xml.ts     # RSS feed
│   │   └── llms-full.txt.ts # LLM text endpoint
│   ├── lib/               # Utilities
│   │   ├── source.ts      # Fumadocs source config
│   │   ├── layout.shared.tsx # Navigation config
│   │   ├── rss.ts         # RSS feed generation
│   │   └── get-llm-text.ts # LLM text extraction
│   ├── components/        # React components
│   └── styles/            # Global CSS
├── public/                # Static assets
│   ├── CNAME              # Custom domain config
│   ├── sitemap.xml        # SEO sitemap
│   └── robots.txt         # Search engine config
├── vite.config.ts         # Vite configuration
├── source.config.ts       # Fumadocs MDX config
└── package.json
```

## 📖 Documentation Pages

| Page | Description | Lines |
|------|-------------|-------|
| **Welcome** | Overview, features, use cases | ~150 |
| **Getting Started** | Installation, first steps, essential keybindings | ~300 |
| **Keybindings** | Complete keyboard shortcuts reference (100+ bindings) | ~400 |
| **Configuration** | TOML config guide with customization options | ~350 |
| **Tape Scripting** | Automation DSL reference with examples | ~400 |
| **CLI Reference** | Command-line interface documentation | ~450 |
| **Architecture** | Technical internals, design patterns, diagrams | ~350 |

**Total:** ~2,400 lines of comprehensive documentation

## 🎨 Features

### Content
- 7 comprehensive documentation pages
- 100+ keybindings documented
- Mermaid architecture diagrams
- Step-by-step guides with Fumadocs components
- Code examples with syntax highlighting
- Proper `<kbd>` styling for keyboard shortcuts

### Design
- Catppuccin color theme
- Responsive mobile/desktop layout
- Professional landing page with feature cards
- 3D keyboard shortcut elements
- Smooth transitions and hover effects
- Custom scrollbar styling

### SEO & Discovery
- RSS feed at `/rss.xml`
- LLM-friendly text at `/llms-full.txt`
- Sitemap for search engines
- Robots.txt configuration
- Metadata for social sharing

### Static Export
- Full static site generation
- Pre-rendered pages for instant loading
- Client-side search with local index
- Optimized bundles with code splitting
- Ready for GitHub Pages deployment

## 🚢 Deployment

### GitHub Pages (Configured)

The repository includes GitHub Actions workflow for automatic deployment:

1. Push to `main` branch
2. GitHub Actions builds the site
3. Deploys to GitHub Pages
4. Available at custom domain: `tuios.gaurav.zip`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Alternative Platforms

Works with any static hosting:
- **Vercel** - Zero-config import
- **Netlify** - Auto-deploy from GitHub
- **Cloudflare Pages** - Fast global CDN

## 📝 Content Writing

### Adding New Pages

1. Create MDX file in `content/docs/`:
   ```mdx
   ---
   title: My New Page
   description: Page description for SEO
   ---

   # My New Page

   Content here...
   ```

2. Update `content/docs/meta.json` for sidebar ordering:
   ```json
   {
     "pages": [
       "index",
       "getting-started",
       "my-new-page"
     ]
   }
   ```

3. Build and preview:
   ```bash
   bun run dev
   ```

### Using Fumadocs Components

```mdx
import { Callout } from 'fumadocs-ui/components/callout';
import { Steps } from 'fumadocs-ui/components/steps';
import { Cards, Card } from 'fumadocs-ui/components/card';

<Callout type="info">
  Important information
</Callout>

<Steps>
### Step 1
First step content

### Step 2
Second step content
</Steps>

<Cards>
  <Card title="Feature" description="Description" />
</Cards>
```

### Keyboard Shortcuts

Use `<kbd>` tags for keyboard shortcuts:

```mdx
Press <kbd>Ctrl</kbd><kbd>B</kbd> <kbd>c</kbd> to create a new window.
```

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run lint` | Lint with Biome |
| `bun run format` | Format with Biome |
| `bun run types:check` | TypeScript type checking |

## 📦 Dependencies

### Core
- `fumadocs-core@16.2.1` - Core documentation framework
- `fumadocs-ui@16.2.1` - UI components and themes
- `fumadocs-mdx@14.0.4` - MDX processing
- `@tanstack/react-start@^1.134.12` - React framework
- `react@^19.2.0` - React library

### Utilities
- `feed@^5.1.0` - RSS feed generation
- `tailwind-merge@^3.3.1` - Tailwind utility merging
- `lucide-static@^0.552.0` - Icon library

### Build Tools
- `vite@^7.2.0` - Build tool
- `@tailwindcss/vite@^4.1.16` - Tailwind CSS v4
- `@biomejs/biome@^2.3.5` - Linting & formatting
- `typescript@^5.9.3` - TypeScript

## 📄 License

This documentation site is part of the TUIOS project.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `bun run dev`
5. Submit a pull request

For TUIOS source code contributions, see the [main repository](https://github.com/Gaurav-Gosain/tuios).

## 📞 Links

- **Documentation:** https://tuios.gaurav.zip
- **TUIOS GitHub:** https://github.com/Gaurav-Gosain/tuios
- **RSS Feed:** https://tuios.gaurav.zip/rss.xml
- **LLM Text:** https://tuios.gaurav.zip/llms-full.txt
