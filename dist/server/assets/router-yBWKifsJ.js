import { Link, useParams, useRouter as useRouter$1, useRouterState, createRootRoute, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, notFound, createRouter } from '@tanstack/react-router';
import { jsx, jsxs, Fragment as Fragment$1 } from 'react/jsx-runtime';
import { twMerge } from 'tailwind-merge';
import * as React from 'react';
import { useMemo, useState, Fragment, lazy, useRef } from 'react';
import { cva } from 'class-variance-authority';
import { r as resolveLinkItems, L as Link2, a as LargeSearchToggle, T as ThemeToggle, b as LanguageToggle, c as Languages, S as SearchToggle, C as ChevronDown, d as buttonVariants, e as LanguageToggleText, u as useIsScrollTop, f as LinkItem, g as SearchProvider, h as useRouter, i as usePathname, I as I18nContext, j as defaultTranslations, F as FrameworkProvider, s as source, k as browserCollections, D as DocsPage, l as DocsTitle, m as DocsDescription, n as DocsBody, K as KeyCombo, o as KeySeq, p as Key, q as KeybindList, M as Mermaid, t as defaultMdxComponents, v as findPath, w as basename, x as extname } from './source-z941Y2wC.js';
import * as Primitive from '@radix-ui/react-navigation-menu';
import { ThemeProvider } from 'next-themes';
import { DirectionProvider } from '@radix-ui/react-direction';
import { Feed } from 'feed';
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from '../server.js';
import { search, getByID, save, create, insertMultiple } from '@orama/orama';

const NavigationMenu = Primitive.Root;
const NavigationMenuList = Primitive.List;
const NavigationMenuItem = React.forwardRef(({ className, children, ...props }, ref) => (jsx(Primitive.NavigationMenuItem, { ref: ref, className: twMerge('list-none', className), ...props, children: children })));
NavigationMenuItem.displayName = Primitive.NavigationMenuItem.displayName;
const NavigationMenuTrigger = React.forwardRef(({ className, children, ...props }, ref) => (jsx(Primitive.Trigger, { ref: ref, className: twMerge('data-[state=open]:bg-fd-accent/50', className), ...props, children: children })));
NavigationMenuTrigger.displayName = Primitive.Trigger.displayName;
const NavigationMenuContent = React.forwardRef(({ className, ...props }, ref) => (jsx(Primitive.Content, { ref: ref, className: twMerge('absolute inset-x-0 top-0 overflow-auto fd-scroll-container max-h-[80svh] data-[motion=from-end]:animate-fd-enterFromRight data-[motion=from-start]:animate-fd-enterFromLeft data-[motion=to-end]:animate-fd-exitToRight data-[motion=to-start]:animate-fd-exitToLeft', className), ...props })));
NavigationMenuContent.displayName = Primitive.Content.displayName;
const NavigationMenuLink = Primitive.Link;
const NavigationMenuViewport = React.forwardRef(({ className, ...props }, ref) => (jsx("div", { ref: ref, className: "flex w-full justify-center", children: jsx(Primitive.Viewport, { ...props, className: twMerge('relative h-(--radix-navigation-menu-viewport-height) w-full origin-[top_center] overflow-hidden transition-[width,height] duration-300 data-[state=closed]:animate-fd-nav-menu-out data-[state=open]:animate-fd-nav-menu-in', className) }) })));
NavigationMenuViewport.displayName = Primitive.Viewport.displayName;

const navItemVariants = cva('[&_svg]:size-4', {
    variants: {
        variant: {
            main: 'inline-flex items-center gap-1 p-2 text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground data-[active=true]:text-fd-primary',
            button: buttonVariants({
                color: 'secondary',
                className: 'gap-1.5',
            }),
            icon: buttonVariants({
                color: 'ghost',
                size: 'icon',
            }),
        },
    },
    defaultVariants: {
        variant: 'main',
    },
});
function Header({ nav = {}, i18n = false, links, githubUrl, themeSwitch = {}, searchToggle = {}, }) {
    const { navItems, menuItems } = useMemo(() => {
        const navItems = [];
        const menuItems = [];
        for (const item of resolveLinkItems({ links, githubUrl })) {
            switch (item.on ?? 'all') {
                case 'menu':
                    menuItems.push(item);
                    break;
                case 'nav':
                    navItems.push(item);
                    break;
                default:
                    navItems.push(item);
                    menuItems.push(item);
            }
        }
        return { navItems, menuItems };
    }, [links, githubUrl]);
    return (jsxs(HeaderNavigationMenu, { transparentMode: nav.transparentMode, children: [jsx(Link2, { href: nav.url ?? '/', className: "inline-flex items-center gap-2.5 font-semibold", children: nav.title }), nav.children, jsx("ul", { className: "flex flex-row items-center gap-2 px-6 max-sm:hidden", children: navItems
                    .filter((item) => !isSecondary(item))
                    .map((item, i) => (jsx(NavigationMenuLinkItem, { item: item, className: "text-sm" }, i))) }), jsxs("div", { className: "flex flex-row items-center justify-end gap-1.5 flex-1 max-lg:hidden", children: [searchToggle.enabled !== false &&
                        (searchToggle.components?.lg ?? (jsx(LargeSearchToggle, { className: "w-full rounded-full ps-2.5 max-w-[240px]", hideIfDisabled: true }))), themeSwitch.enabled !== false &&
                        (themeSwitch.component ?? jsx(ThemeToggle, { mode: themeSwitch?.mode })), i18n && (jsx(LanguageToggle, { children: jsx(Languages, { className: "size-5" }) })), jsx("ul", { className: "flex flex-row gap-2 items-center empty:hidden", children: navItems.filter(isSecondary).map((item, i) => (jsx(NavigationMenuLinkItem, { className: twMerge(item.type === 'icon' && '-mx-1 first:ms-0 last:me-0'), item: item }, i))) })] }), jsxs("ul", { className: "flex flex-row items-center ms-auto -me-1.5 lg:hidden", children: [searchToggle.enabled !== false &&
                        (searchToggle.components?.sm ?? (jsx(SearchToggle, { className: "p-2", hideIfDisabled: true }))), jsxs(NavigationMenuItem, { children: [jsx(NavigationMenuTrigger, { "aria-label": "Toggle Menu", className: twMerge(buttonVariants({
                                    size: 'icon',
                                    color: 'ghost',
                                    className: 'group [&_svg]:size-5.5',
                                })), onPointerMove: nav.enableHoverToOpen ? undefined : (e) => e.preventDefault(), children: jsx(ChevronDown, { className: "transition-transform duration-300 group-data-[state=open]:rotate-180" }) }), jsxs(NavigationMenuContent, { className: "flex flex-col p-4 sm:flex-row sm:items-center sm:justify-end", children: [menuItems
                                        .filter((item) => !isSecondary(item))
                                        .map((item, i) => (jsx(MobileNavigationMenuLinkItem, { item: item, className: "sm:hidden" }, i))), jsxs("div", { className: "-ms-1.5 flex flex-row items-center gap-2 max-sm:mt-2", children: [menuItems.filter(isSecondary).map((item, i) => (jsx(MobileNavigationMenuLinkItem, { item: item, className: twMerge(item.type === 'icon' && '-mx-1 first:ms-0') }, i))), jsx("div", { role: "separator", className: "flex-1" }), i18n && (jsxs(LanguageToggle, { children: [jsx(Languages, { className: "size-5" }), jsx(LanguageToggleText, {}), jsx(ChevronDown, { className: "size-3 text-fd-muted-foreground" })] })), themeSwitch.enabled !== false &&
                                                (themeSwitch.component ?? (jsx(ThemeToggle, { mode: themeSwitch?.mode })))] })] })] })] })] }));
}
function isSecondary(item) {
    if ('secondary' in item && item.secondary != null)
        return item.secondary;
    return item.type === 'icon';
}
function HeaderNavigationMenu({ transparentMode = 'none', ...props }) {
    const [value, setValue] = useState('');
    const isTop = useIsScrollTop({ enabled: transparentMode === 'top' }) ?? true;
    const isTransparent = transparentMode === 'top' ? isTop : transparentMode === 'always';
    return (jsx(NavigationMenu, { value: value, onValueChange: setValue, asChild: true, children: jsx("header", { id: "nd-nav", ...props, className: twMerge('sticky h-14 top-0 z-40', props.className), children: jsxs("div", { className: twMerge('backdrop-blur-lg border-b transition-colors *:mx-auto *:max-w-(--fd-layout-width)', value.length > 0 && 'max-lg:shadow-lg max-lg:rounded-b-2xl', (!isTransparent || value.length > 0) && 'bg-fd-background/80'), children: [jsx(NavigationMenuList, { className: "flex h-14 w-full items-center px-4", asChild: true, children: jsx("nav", { children: props.children }) }), jsx(NavigationMenuViewport, {})] }) }) }));
}
function NavigationMenuLinkItem({ item, ...props }) {
    if (item.type === 'custom')
        return jsx("div", { ...props, children: item.children });
    if (item.type === 'menu') {
        const children = item.items.map((child, j) => {
            if (child.type === 'custom') {
                return jsx(Fragment, { children: child.children }, j);
            }
            const { banner = child.icon ? (jsx("div", { className: "w-fit rounded-md border bg-fd-muted p-1 [&_svg]:size-4", children: child.icon })) : null, ...rest } = child.menu ?? {};
            return (jsx(NavigationMenuLink, { asChild: true, children: jsx(Link2, { href: child.url, external: child.external, ...rest, className: twMerge('flex flex-col gap-2 rounded-lg border bg-fd-card p-3 transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground', rest.className), children: rest.children ?? (jsxs(Fragment$1, { children: [banner, jsx("p", { className: "text-base font-medium", children: child.text }), jsx("p", { className: "text-sm text-fd-muted-foreground empty:hidden", children: child.description })] })) }) }, `${j}-${child.url}`));
        });
        return (jsxs(NavigationMenuItem, { ...props, children: [jsx(NavigationMenuTrigger, { className: twMerge(navItemVariants(), 'rounded-md'), children: item.url ? (jsx(Link2, { href: item.url, external: item.external, children: item.text })) : (item.text) }), jsx(NavigationMenuContent, { className: "grid grid-cols-1 gap-2 p-4 md:grid-cols-2 lg:grid-cols-3", children: children })] }));
    }
    return (jsx(NavigationMenuItem, { ...props, children: jsx(NavigationMenuLink, { asChild: true, children: jsx(LinkItem, { item: item, "aria-label": item.type === 'icon' ? item.label : undefined, className: twMerge(navItemVariants({ variant: item.type })), children: item.type === 'icon' ? item.icon : item.text }) }) }));
}
function MobileNavigationMenuLinkItem({ item, ...props }) {
    if (item.type === 'custom')
        return jsx("div", { className: twMerge('grid', props.className), children: item.children });
    if (item.type === 'menu') {
        const header = (jsxs(Fragment$1, { children: [item.icon, item.text] }));
        return (jsxs("div", { className: twMerge('mb-4 flex flex-col', props.className), children: [jsx("p", { className: "mb-1 text-sm text-fd-muted-foreground", children: item.url ? (jsx(NavigationMenuLink, { asChild: true, children: jsx(Link2, { href: item.url, external: item.external, children: header }) })) : (header) }), item.items.map((child, i) => (jsx(MobileNavigationMenuLinkItem, { item: child }, i)))] }));
    }
    return (jsx(NavigationMenuLink, { asChild: true, children: jsxs(LinkItem, { item: item, className: twMerge({
                main: 'inline-flex items-center gap-2 py-1.5 transition-colors hover:text-fd-popover-foreground/50 data-[active=true]:font-medium data-[active=true]:text-fd-primary [&_svg]:size-4',
                icon: buttonVariants({
                    size: 'icon',
                    color: 'ghost',
                }),
                button: buttonVariants({
                    color: 'secondary',
                    className: 'gap-1.5 [&_svg]:size-4',
                }),
            }[item.type ?? 'main'], props.className), "aria-label": item.type === 'icon' ? item.label : undefined, children: [item.icon, item.type === 'icon' ? undefined : item.text] }) }));
}

function HomeLayout(props) {
    const { nav = {}, links, githubUrl, i18n, themeSwitch = {}, searchToggle, ...rest } = props;
    return (jsxs("main", { id: "nd-home-layout", ...rest, className: twMerge('flex flex-1 flex-col [--fd-layout-width:1400px]', rest.className), children: [nav.enabled !== false &&
                (nav.component ?? (jsx(Header, { links: links, nav: nav, themeSwitch: themeSwitch, searchToggle: searchToggle, i18n: i18n, githubUrl: githubUrl }))), props.children] }));
}

function NotFound() {
  return /* @__PURE__ */ jsx(
    HomeLayout,
    {
      nav: {
        title: "TUIOS"
      },
      className: "text-center py-32 justify-center",
      children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-6xl font-bold text-fd-muted-foreground", children: "404" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold", children: "Page Not Found" }),
        /* @__PURE__ */ jsx("p", { className: "text-fd-muted-foreground max-w-md", children: "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable." }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/",
            className: "mt-4 px-4 py-2 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity",
            children: "Back to Home"
          }
        )
      ] })
    }
  );
}

const DefaultSearchDialog = lazy(() => import('./search-default-DW8jBTZP.js'));
function RootProvider$1({ children, dir = 'ltr', theme = {}, search, i18n, }) {
    let body = children;
    if (search?.enabled !== false)
        body = (jsx(SearchProvider, { SearchDialog: DefaultSearchDialog, ...search, children: body }));
    if (theme?.enabled !== false)
        body = (jsx(ThemeProvider, { attribute: "class", defaultTheme: "system", enableSystem: true, disableTransitionOnChange: true, ...theme, children: body }));
    if (i18n) {
        body = jsx(I18nProvider, { ...i18n, children: body });
    }
    return jsx(DirectionProvider, { dir: dir, children: body });
}
function I18nProvider({ locales = [], locale, onLocaleChange, children, translations, }) {
    const router = useRouter();
    const pathname = usePathname();
    const onChange = (value) => {
        if (onLocaleChange) {
            return onLocaleChange(value);
        }
        const segments = pathname.split('/').filter((v) => v.length > 0);
        // If locale prefix hidden
        if (segments[0] !== locale) {
            segments.unshift(value);
        }
        else {
            segments[0] = value;
        }
        router.push(`/${segments.join('/')}`);
    };
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    return (jsx(I18nContext, { value: useMemo(() => ({
            locale,
            locales,
            text: {
                ...defaultTranslations,
                ...translations,
            },
            onChange: (v) => onChangeRef.current(v),
        }), [locale, locales, translations]), children: children }));
}

var framework = {
  Link({ href, prefetch = true, ...props }) {
    return /* @__PURE__ */ jsx(Link, { to: href, preload: prefetch ? "intent" : false, ...props, children: props.children });
  },
  usePathname() {
    const { isLoading, pathname } = useRouterState({
      select: (state) => ({
        isLoading: state.isLoading,
        pathname: state.location.pathname
      })
    });
    const activePathname = useRef(pathname);
    return useMemo(() => {
      if (isLoading) {
        return activePathname.current;
      }
      activePathname.current = pathname;
      return pathname;
    }, [isLoading, pathname]);
  },
  useRouter() {
    const router = useRouter$1();
    return useMemo(
      () => ({
        push(url) {
          void router.navigate({
            href: url
          });
        },
        refresh() {
          void router.invalidate();
        }
      }),
      [router]
    );
  },
  useParams() {
    return useParams({ strict: false });
  }
};
function TanstackProvider({
  children,
  Link: CustomLink,
  Image: CustomImage
}) {
  return /* @__PURE__ */ jsx(
    FrameworkProvider,
    {
      ...framework,
      Link: CustomLink ?? framework.Link,
      Image: CustomImage ?? framework.Image,
      children
    }
  );
}

function RootProvider({ components, ...props }) {
    return (jsx(TanstackProvider, { Link: components?.Link, Image: components?.Image, children: jsx(RootProvider$1, { ...props, children: props.children }) }));
}

const appCss = "/assets/app-CdHxxy13.css";

const Route$5 = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "TUIOS Documentation - Terminal UI Operating System"
      }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/tuios-icon.png" },
      { rel: "apple-touch-icon", href: "/tuios-icon.png" },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "TUIOS Documentation",
        href: "https://tuios.gaurav.zip/rss.xml"
      }
    ]
  }),
  component: RootComponent
});
function RootComponent() {
  return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { className: "flex flex-col min-h-screen", children: [
      /* @__PURE__ */ jsx(RootProvider, { children }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}

const $$splitComponentImporter$1 = () => import('./index-EwFob8LB.js');
const Route$4 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});

const baseUrl = "https://tuios.gaurav.zip";
function getRSS() {
  const feed = new Feed({
    title: "TUIOS Documentation",
    id: `${baseUrl}/docs`,
    link: `${baseUrl}/docs`,
    language: "en",
    copyright: "All rights reserved 2025, Gaurav Gosain",
    description: "A modern terminal window manager with vim-like controls"
  });
  for (const page of source.getPages()) {
    feed.addItem({
      id: page.url,
      title: page.data.title,
      description: page.data.description,
      link: `${baseUrl}${page.url}`,
      date: new Date(page.data.lastModified ?? Date.now()),
      author: [
        {
          name: "Gaurav Gosain"
        }
      ]
    });
  }
  return feed.rss2();
}

const Route$3 = createFileRoute("/rss/xml")({
  server: {
    handlers: {
      GET: () => {
        return new Response(getRSS(), {
          headers: {
            "Content-Type": "application/xml"
          }
        });
      }
    }
  }
});

async function getLLMText(page) {
  const processed = await page.data.getText("processed");
  return `# ${page.data.title} (${page.url})

${processed}`;
}

const Route$2 = createFileRoute("/llms-full/txt")({
  server: {
    handlers: {
      GET: async () => {
        const scan = source.getPages().map(getLLMText);
        const scanned = await Promise.all(scan);
        return new Response(scanned.join("\n\n"), {
          headers: {
            "Content-Type": "text/plain"
          }
        });
      }
    }
  }
});

const createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    functionId,
    [TSS_SERVER_FUNCTION]: true
  });
};

const $$splitComponentImporter = () => import('./_-ClZJQ8t1.js');
const Route$1 = createFileRoute("/docs/$")({
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  loader: async ({
    params
  }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await loader({
      data: slugs
    });
    await clientLoader.preload(data.path);
    return data;
  }
});
const loader_createServerFn_handler = createSsrRpc("3dffc64eabe29fc8f5f4021f5e1cdf4bfea9319ffba3a59848ead9dcd2fa0308");
const loader = createServerFn({
  method: "GET"
}).inputValidator((slugs) => slugs).handler(loader_createServerFn_handler, async ({
  data: slugs
}) => {
  const page = source.getPage(slugs);
  if (!page) throw notFound();
  return {
    tree: source.pageTree,
    path: page.path
  };
});
const clientLoader = browserCollections.docs.createClientLoader({
  component({
    toc,
    frontmatter,
    default: MDX
  }) {
    return /* @__PURE__ */ jsxs(DocsPage, { toc, children: [
      /* @__PURE__ */ jsx(DocsTitle, { children: frontmatter.title }),
      /* @__PURE__ */ jsx(DocsDescription, { children: frontmatter.description }),
      /* @__PURE__ */ jsx(DocsBody, { children: /* @__PURE__ */ jsx(MDX, { components: {
        ...defaultMdxComponents,
        Mermaid,
        KeybindList,
        Key,
        KeySeq,
        KeyCombo
      } }) })
    ] });
  }
});

// src/utils/remove-undefined.ts
function removeUndefined(value, deep = false) {
  const obj = value;
  for (const key in obj) {
    if (obj[key] === void 0) delete obj[key];
    if (!deep) continue;
    const entry = obj[key];
    if (typeof entry === "object" && entry !== null) {
      removeUndefined(entry, deep);
      continue;
    }
    if (Array.isArray(entry)) {
      for (const item of entry) removeUndefined(item, deep);
    }
  }
  return value;
}

// src/search/index.ts
function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buildRegexFromQuery(q) {
  const trimmed = q.trim();
  if (trimmed.length === 0) return null;
  const terms = Array.from(
    new Set(
      trimmed.split(/\s+/).map((t) => t.trim()).filter(Boolean)
    )
  );
  if (terms.length === 0) return null;
  const escaped = terms.map(escapeRegExp).join("|");
  return new RegExp(`(${escaped})`, "gi");
}
function createContentHighlighter(query) {
  const regex = typeof query === "string" ? buildRegexFromQuery(query) : query;
  return {
    highlight(content) {
      if (!regex) return [{ type: "text", content }];
      const out = [];
      let i = 0;
      for (const match of content.matchAll(regex)) {
        if (i < match.index) {
          out.push({
            type: "text",
            content: content.substring(i, match.index)
          });
        }
        out.push({
          type: "text",
          content: match[0],
          styles: {
            highlight: true
          }
        });
        i = match.index + match[0].length;
      }
      if (i < content.length) {
        out.push({
          type: "text",
          content: content.substring(i)
        });
      }
      return out;
    }
  };
}

async function searchSimple(db, query, params = {}) {
  const highlighter = createContentHighlighter(query);
  const result = await search(db, {
    term: query,
    tolerance: 1,
    ...params,
    boost: {
      title: 2,
      ..."boost" in params ? params.boost : void 0
    }
  });
  return result.hits.map((hit) => ({
    type: "page",
    content: hit.document.title,
    breadcrumbs: hit.document.breadcrumbs,
    contentWithHighlights: highlighter.highlight(hit.document.title),
    id: hit.document.url,
    url: hit.document.url
  }));
}
async function searchAdvanced(db, query, tag = [], {
  mode = "fulltext",
  ...override
} = {}) {
  if (typeof tag === "string") tag = [tag];
  let params = {
    ...override,
    mode,
    where: removeUndefined({
      tags: tag.length > 0 ? {
        containsAll: tag
      } : void 0,
      ...override.where
    }),
    groupBy: {
      properties: ["page_id"],
      maxResult: 8,
      ...override.groupBy
    }
  };
  if (query.length > 0) {
    params = {
      ...params,
      term: query,
      properties: mode === "fulltext" ? ["content"] : ["content", "embeddings"]
    };
  }
  const highlighter = createContentHighlighter(query);
  const result = await search(db, params);
  const list = [];
  for (const item of result.groups ?? []) {
    const pageId = item.values[0];
    const page = getByID(db, pageId);
    if (!page) continue;
    list.push({
      id: pageId,
      type: "page",
      content: page.content,
      breadcrumbs: page.breadcrumbs,
      contentWithHighlights: highlighter.highlight(page.content),
      url: page.url
    });
    for (const hit of item.result) {
      if (hit.document.type === "page") continue;
      list.push({
        id: hit.document.id.toString(),
        content: hit.document.content,
        breadcrumbs: hit.document.breadcrumbs,
        contentWithHighlights: highlighter.highlight(hit.document.content),
        type: hit.document.type,
        url: hit.document.url
      });
    }
  }
  return list;
}

// src/search/orama/create-endpoint.ts
function createEndpoint(server) {
  const { search } = server;
  return {
    ...server,
    async staticGET() {
      return Response.json(await server.export());
    },
    async GET(request) {
      const url = new URL(request.url);
      const query = url.searchParams.get("query");
      if (!query) return Response.json([]);
      return Response.json(
        await search(query, {
          tag: url.searchParams.get("tag")?.split(",") ?? void 0,
          locale: url.searchParams.get("locale") ?? void 0,
          mode: url.searchParams.get("mode") === "vector" ? "vector" : "full"
        })
      );
    }
  };
}
var advancedSchema = {
  content: "string",
  page_id: "string",
  type: "string",
  breadcrumbs: "string[]",
  tags: "enum[]",
  url: "string",
  embeddings: "vector[512]"
};
async function createDB({
  indexes,
  tokenizer,
  search: _,
  ...rest
}) {
  const items = typeof indexes === "function" ? await indexes() : indexes;
  const db = create({
    schema: advancedSchema,
    ...rest,
    components: {
      ...rest.components,
      tokenizer: tokenizer ?? rest.components?.tokenizer
    }
  });
  const mapTo = [];
  items.forEach((page) => {
    const pageTag = page.tag ?? [];
    const tags = Array.isArray(pageTag) ? pageTag : [pageTag];
    const data = page.structuredData;
    let id = 0;
    mapTo.push({
      id: page.id,
      page_id: page.id,
      type: "page",
      content: page.title,
      breadcrumbs: page.breadcrumbs,
      tags,
      url: page.url
    });
    const nextId = () => `${page.id}-${id++}`;
    if (page.description) {
      mapTo.push({
        id: nextId(),
        page_id: page.id,
        tags,
        type: "text",
        url: page.url,
        content: page.description
      });
    }
    for (const heading of data.headings) {
      mapTo.push({
        id: nextId(),
        page_id: page.id,
        type: "heading",
        tags,
        url: `${page.url}#${heading.id}`,
        content: heading.content
      });
    }
    for (const content of data.contents) {
      mapTo.push({
        id: nextId(),
        page_id: page.id,
        tags,
        type: "text",
        url: content.heading ? `${page.url}#${content.heading}` : page.url,
        content: content.content
      });
    }
  });
  await insertMultiple(db, mapTo);
  return db;
}

// src/search/orama/create-from-source.ts
function defaultBuildIndex(source) {
  function isBreadcrumbItem(item) {
    return typeof item === "string" && item.length > 0;
  }
  return async (page) => {
    let breadcrumbs;
    let structuredData;
    if ("structuredData" in page.data) {
      structuredData = page.data.structuredData;
    } else if ("load" in page.data && typeof page.data.load === "function") {
      structuredData = (await page.data.load()).structuredData;
    }
    if (!structuredData)
      throw new Error(
        "Cannot find structured data from page, please define the page to index function."
      );
    const pageTree = source.getPageTree(page.locale);
    const path = findPath(
      pageTree.children,
      (node) => node.type === "page" && node.url === page.url
    );
    if (path) {
      breadcrumbs = [];
      path.pop();
      if (isBreadcrumbItem(pageTree.name)) {
        breadcrumbs.push(pageTree.name);
      }
      for (const segment of path) {
        if (!isBreadcrumbItem(segment.name)) continue;
        breadcrumbs.push(segment.name);
      }
    }
    return {
      title: page.data.title ?? basename(page.path, extname(page.path)),
      breadcrumbs,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData
    };
  };
}
function createFromSource(source, options = {}) {
  const { buildIndex = defaultBuildIndex(source) } = options;
  if (source._i18n) {
    return createI18nSearchAPI("advanced", {
      ...options,
      i18n: source._i18n,
      indexes: async () => {
        const indexes = source.getLanguages().flatMap((entry) => {
          return entry.pages.map(async (page) => ({
            ...await buildIndex(page),
            locale: entry.language
          }));
        });
        return Promise.all(indexes);
      }
    });
  }
  return createSearchAPI("advanced", {
    ...options,
    indexes: async () => {
      const indexes = source.getPages().map((page) => buildIndex(page));
      return Promise.all(indexes);
    }
  });
}

// src/search/orama/_stemmers.ts
var STEMMERS = {
  arabic: "ar",
  armenian: "am",
  bulgarian: "bg",
  czech: "cz",
  danish: "dk",
  dutch: "nl",
  english: "en",
  finnish: "fi",
  french: "fr",
  german: "de",
  greek: "gr",
  hungarian: "hu",
  indian: "in",
  indonesian: "id",
  irish: "ie",
  italian: "it",
  lithuanian: "lt",
  nepali: "np",
  norwegian: "no",
  portuguese: "pt",
  romanian: "ro",
  russian: "ru",
  serbian: "rs",
  slovenian: "ru",
  spanish: "es",
  swedish: "se",
  tamil: "ta",
  turkish: "tr",
  ukrainian: "uk",
  sanskrit: "sk"
};

// src/search/orama/create-i18n.ts
async function getTokenizer(locale) {
  return {
    language: Object.keys(STEMMERS).find((lang) => STEMMERS[lang] === locale) ?? locale
  };
}
async function initAdvanced(options) {
  const map = /* @__PURE__ */ new Map();
  if (options.i18n.languages.length === 0) {
    return map;
  }
  const indexes = typeof options.indexes === "function" ? await options.indexes() : options.indexes;
  for (const locale of options.i18n.languages) {
    const localeIndexes = indexes.filter((index) => index.locale === locale);
    const mapped = options.localeMap?.[locale] ?? await getTokenizer(locale);
    map.set(
      locale,
      typeof mapped === "object" ? initAdvancedSearch({
        ...options,
        indexes: localeIndexes,
        ...mapped
      }) : initAdvancedSearch({
        ...options,
        language: mapped,
        indexes: localeIndexes
      })
    );
  }
  return map;
}
function createI18nSearchAPI(type, options) {
  const get = initAdvanced(options);
  return createEndpoint({
    async export() {
      const map = await get;
      const entries = Array.from(map.entries()).map(async ([k, v]) => [
        k,
        await v.export()
      ]);
      return {
        type: "i18n",
        data: Object.fromEntries(await Promise.all(entries))
      };
    },
    async search(query, searchOptions) {
      const map = await get;
      const locale = searchOptions?.locale ?? options.i18n.defaultLanguage;
      const handler = map.get(locale);
      if (handler) return handler.search(query, searchOptions);
      return [];
    }
  });
}

// src/search/server.ts
function createSearchAPI(type, options) {
  return createEndpoint(initAdvancedSearch(options));
}
function initAdvancedSearch(options) {
  const get = createDB(options);
  return {
    async export() {
      return {
        type: "advanced",
        ...save(await get)
      };
    },
    async search(query, searchOptions) {
      const db = await get;
      const mode = searchOptions?.mode;
      return searchAdvanced(db, query, searchOptions?.tag, {
        ...options.search,
        mode: mode === "vector" ? "vector" : "fulltext"
      }).catch((err) => {
        if (mode === "vector") {
          throw new Error(
            "failed to search, make sure you have installed `@orama/plugin-embeddings` according to their docs.",
            {
              cause: err
            }
          );
        }
        throw err;
      });
    }
  };
}

const server = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: "english"
});
const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => server.GET(request)
    }
  }
});

const IndexRoute = Route$4.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$5
});
const RssXmlRoute = Route$3.update({
  id: "/rss/xml",
  path: "/rss/xml",
  getParentRoute: () => Route$5
});
const LlmsFullTxtRoute = Route$2.update({
  id: "/llms-full/txt",
  path: "/llms-full/txt",
  getParentRoute: () => Route$5
});
const DocsSplatRoute = Route$1.update({
  id: "/docs/$",
  path: "/docs/$",
  getParentRoute: () => Route$5
});
const ApiSearchRoute = Route.update({
  id: "/api/search",
  path: "/api/search",
  getParentRoute: () => Route$5
});
const rootRouteChildren = {
  IndexRoute,
  ApiSearchRoute,
  DocsSplatRoute,
  LlmsFullTxtRoute,
  RssXmlRoute
};
const routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();

function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound
  });
}

const router = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    getRouter
}, Symbol.toStringTag, { value: 'Module' }));

export { HomeLayout as H, Route$1 as R, searchAdvanced as a, router as b, createContentHighlighter as c, removeUndefined as r, searchSimple as s };
