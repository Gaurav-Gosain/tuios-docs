import { browser } from 'fumadocs-mdx/runtime/browser';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import { forwardRef, createElement, use, createContext, useMemo, useState, useEffect, useRef, useEffectEvent, useContext, useLayoutEffect, Fragment as Fragment$1, useCallback, useId } from 'react';
import { twMerge } from 'tailwind-merge';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cva } from 'class-variance-authority';
import { useTheme } from 'next-themes';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import scrollIntoView from 'scroll-into-view-if-needed';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { Presence } from '@radix-ui/react-presence';
import * as Primitive from '@radix-ui/react-tabs';
import { server } from 'fumadocs-mdx/runtime/server';
import * as icons from 'lucide-static';

const create$1 = browser();
const browserCollections = {
  docs: create$1.doc("docs", /* #__PURE__ */ Object.assign({"./architecture.mdx": () => Promise.resolve().then(() => __vite_glob_1_0),"./cli-reference.mdx": () => Promise.resolve().then(() => __vite_glob_1_1),"./configuration.mdx": () => Promise.resolve().then(() => __vite_glob_1_2),"./getting-started.mdx": () => Promise.resolve().then(() => __vite_glob_1_3),"./index.mdx": () => Promise.resolve().then(() => __vite_glob_1_4),"./keybindings.mdx": () => Promise.resolve().then(() => __vite_glob_1_5),"./tape-scripting.mdx": () => Promise.resolve().then(() => __vite_glob_1_6)





}))
};

const defaultAttributes = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};
const createLucideIcon = (iconName, iconNode) => {
    const Component = forwardRef(({ className, size = 24, color = 'currentColor', children, ...props }, ref) => {
        return (jsxs("svg", { ref: ref, ...defaultAttributes, width: size, height: size, stroke: color, className: twMerge('lucide', className), ...props, children: [iconNode.map(([tag, attr]) => createElement(tag, attr)), children] }));
    });
    Component.displayName = iconName;
    return Component;
};
const ChevronDown = createLucideIcon('chevron-down', [
    ['path', { d: 'm6 9 6 6 6-6', key: 'qrunsl' }],
]);
const Languages = createLucideIcon('languages', [
    ['path', { d: 'm5 8 6 6', key: '1wu5hv' }],
    ['path', { d: 'm4 14 6-6 2-3', key: '1k1g8d' }],
    ['path', { d: 'M2 5h12', key: 'or177f' }],
    ['path', { d: 'M7 2h1', key: '1t2jsx' }],
    ['path', { d: 'm22 22-5-10-5 10', key: 'don7ne' }],
    ['path', { d: 'M14 18h6', key: '1m8k6r' }],
]);
const Sidebar = createLucideIcon('panel-left', [
    [
        'rect',
        { width: '18', height: '18', x: '3', y: '3', rx: '2', key: 'afitv7' },
    ],
    ['path', { d: 'M9 3v18', key: 'fh3hqa' }],
]);
const ChevronsUpDown = createLucideIcon('chevrons-up-down', [
    ['path', { d: 'm7 15 5 5 5-5', key: '1hf1tw' }],
    ['path', { d: 'm7 9 5-5 5 5', key: 'sgt6xg' }],
]);
const Search = createLucideIcon('search', [
    ['circle', { cx: '11', cy: '11', r: '8', key: '4ej97u' }],
    ['path', { d: 'm21 21-4.3-4.3', key: '1qie3q' }],
]);
const ExternalLink = createLucideIcon('external-link', [
    ['path', { d: 'M15 3h6v6', key: '1q9fwt' }],
    ['path', { d: 'M10 14 21 3', key: 'gplh6r' }],
    [
        'path',
        {
            d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
            key: 'a6xqqp',
        },
    ],
]);
const Moon = createLucideIcon('moon', [
    ['path', { d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z', key: 'a7tn18' }],
]);
const Sun = createLucideIcon('sun', [
    ['circle', { cx: '12', cy: '12', r: '4', key: '4exip2' }],
    ['path', { d: 'M12 2v2', key: 'tus03m' }],
    ['path', { d: 'M12 20v2', key: '1lh1kg' }],
    ['path', { d: 'm4.93 4.93 1.41 1.41', key: '149t6j' }],
    ['path', { d: 'm17.66 17.66 1.41 1.41', key: 'ptbguv' }],
    ['path', { d: 'M2 12h2', key: '1t8f8n' }],
    ['path', { d: 'M20 12h2', key: '1q8mjw' }],
    ['path', { d: 'm6.34 17.66-1.41 1.41', key: '1m8zz5' }],
    ['path', { d: 'm19.07 4.93-1.41 1.41', key: '1shlcs' }],
]);
const Airplay = createLucideIcon('airplay', [
    [
        'path',
        {
            d: 'M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1',
            key: 'ns4c3b',
        },
    ],
    ['path', { d: 'm12 15 5 6H7Z', key: '14qnn2' }],
]);
createLucideIcon('menu', [
    ['line', { x1: '4', x2: '20', y1: '12', y2: '12', key: '1e0a9i' }],
    ['line', { x1: '4', x2: '20', y1: '6', y2: '6', key: '1owob3' }],
    ['line', { x1: '4', x2: '20', y1: '18', y2: '18', key: 'yk5zj1' }],
]);
createLucideIcon('x', [
    ['path', { d: 'M18 6 6 18', key: '1bl5f8' }],
    ['path', { d: 'm6 6 12 12', key: 'd8bk6v' }],
]);
createLucideIcon('loader-circle', [
    ['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56', key: '13zald' }],
]);
const CircleCheck = createLucideIcon('circle-check', [
    ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
    ['path', { d: 'm9 12 2 2 4-4', key: 'dzmm74' }],
]);
const CircleX = createLucideIcon('circle-x', [
    ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
    ['path', { d: 'm15 9-6 6', key: '1uzhvr' }],
    ['path', { d: 'm9 9 6 6', key: 'z0biqf' }],
]);
const Check = createLucideIcon('check', [
    ['path', { d: 'M20 6 9 17l-5-5', key: '1gmf2c' }],
]);
const TriangleAlert = createLucideIcon('triangle-alert', [
    [
        'path',
        {
            d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
            key: 'wmoenq',
        },
    ],
    ['path', { d: 'M12 9v4', key: 'juzpu7' }],
    ['path', { d: 'M12 17h.01', key: 'p32p05' }],
]);
const Info = createLucideIcon('info', [
    ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
    ['path', { d: 'M12 16v-4', key: '1dtifu' }],
    ['path', { d: 'M12 8h.01', key: 'e9boi3' }],
]);
createLucideIcon('copy', [
    [
        'rect',
        {
            width: '14',
            height: '14',
            x: '8',
            y: '8',
            rx: '2',
            ry: '2',
            key: '17jyea',
        },
    ],
    [
        'path',
        {
            d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2',
            key: 'zix9uf',
        },
    ],
]);
const Clipboard = createLucideIcon('clipboard', [
    [
        'rect',
        {
            width: '8',
            height: '4',
            x: '8',
            y: '2',
            rx: '1',
            ry: '1',
            key: '1',
        },
    ],
    [
        'path',
        {
            d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2',
            key: '2',
        },
    ],
]);
createLucideIcon('file-text', [
    [
        'path',
        {
            d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z',
            key: '1rqfz7',
        },
    ],
    ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4', key: 'tnqrlb' }],
    ['path', { d: 'M10 9H8', key: 'b1mrlr' }],
    ['path', { d: 'M16 13H8', key: 't4e002' }],
    ['path', { d: 'M16 17H8', key: 'z1uh3a' }],
]);
const Hash = createLucideIcon('hash', [
    ['line', { x1: '4', x2: '20', y1: '9', y2: '9', key: '4lhtct' }],
    ['line', { x1: '4', x2: '20', y1: '15', y2: '15', key: 'vyu0kd' }],
    ['line', { x1: '10', x2: '8', y1: '3', y2: '21', key: '1ggp8o' }],
    ['line', { x1: '16', x2: '14', y1: '3', y2: '21', key: 'weycgp' }],
]);
const Text = createLucideIcon('text', [
    ['path', { d: 'M15 18H3', key: 'olowqp' }],
    ['path', { d: 'M17 6H3', key: '16j9eg' }],
    ['path', { d: 'M21 12H3', key: '2avoz0' }],
]);
createLucideIcon('file', [
    [
        'path',
        {
            d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z',
            key: '1rqfz7',
        },
    ],
    ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4', key: 'tnqrlb' }],
]);
createLucideIcon('folder', [
    [
        'path',
        {
            d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
            key: '1kt360',
        },
    ],
]);
createLucideIcon('folder-open', [
    [
        'path',
        {
            d: 'm6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2',
            key: 'usdka0',
        },
    ],
]);
createLucideIcon('star', [
    [
        'path',
        {
            d: 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z',
            key: 'r04s7s',
        },
    ],
]);
const Link$1 = createLucideIcon('link', [
    [
        'path',
        {
            d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
            key: '1cjeqo',
        },
    ],
    [
        'path',
        {
            d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
            key: '19qd67',
        },
    ],
]);
createLucideIcon('square-pen', [
    [
        'path',
        {
            d: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
            key: '1m0v6g',
        },
    ],
    [
        'path',
        {
            d: 'M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z',
            key: 'ohrbg2',
        },
    ],
]);
const ChevronRight = createLucideIcon('chevron-right', [
    ['path', { d: 'm9 18 6-6-6-6', key: 'mthhwq' }],
]);
const ChevronLeft = createLucideIcon('chevron-left', [
    ['path', { d: 'm15 18-6-6 6-6', key: '1wnfg3' }],
]);
createLucideIcon('plus', [
    ['path', { d: 'M5 12h14', key: '1ays0h' }],
    ['path', { d: 'M12 5v14', key: 's699le' }],
]);
createLucideIcon('trash-2', [
    ['path', { d: 'M3 6h18', key: 'd0wm0j' }],
    ['path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', key: '4alrt4' }],
    ['path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2', key: 'v07s0e' }],
    ['line', { x1: '10', x2: '10', y1: '11', y2: '17', key: '1uufr5' }],
    ['line', { x1: '14', x2: '14', y1: '11', y2: '17', key: 'xtxkd' }],
]);
createLucideIcon('chevron-up', [
    ['path', { d: 'm18 15-6-6-6 6', key: '153udz' }],
]);

const variants = {
    primary: 'bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/80',
    outline: 'border hover:bg-fd-accent hover:text-fd-accent-foreground',
    ghost: 'hover:bg-fd-accent hover:text-fd-accent-foreground',
    secondary: 'border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
};
const buttonVariants = cva('inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring', {
    variants: {
        variant: variants,
        // fumadocs use `color` instead of `variant`
        color: variants,
        size: {
            sm: 'gap-1 px-2 py-1.5 text-xs',
            icon: 'p-1.5 [&_svg]:size-5',
            'icon-sm': 'p-1.5 [&_svg]:size-4.5',
            'icon-xs': 'p-1 [&_svg]:size-4',
        },
    },
});

// src/framework/index.tsx
var notImplemented = () => {
  throw new Error(
    "You need to wrap your application inside `FrameworkProvider`."
  );
};
var FrameworkContext = createContext({
  useParams: notImplemented,
  useRouter: notImplemented,
  usePathname: notImplemented
});
function FrameworkProvider({
  Link: Link2,
  useRouter: useRouter2,
  useParams: useParams2,
  usePathname: usePathname2,
  Image: Image2,
  children
}) {
  const framework = useMemo(
    () => ({
      usePathname: usePathname2,
      useRouter: useRouter2,
      Link: Link2,
      Image: Image2,
      useParams: useParams2
    }),
    [Link2, usePathname2, useRouter2, useParams2, Image2]
  );
  return /* @__PURE__ */ jsx(FrameworkContext, { value: framework, children });
}
function usePathname() {
  return use(FrameworkContext).usePathname();
}
function useRouter() {
  return use(FrameworkContext).useRouter();
}
function Image$1(props) {
  const { Image: Image2 } = use(FrameworkContext);
  if (!Image2) {
    const { src, alt, priority, ...rest } = props;
    return /* @__PURE__ */ jsx(
      "img",
      {
        alt,
        src,
        fetchPriority: priority ? "high" : "auto",
        ...rest
      }
    );
  }
  return /* @__PURE__ */ jsx(Image2, { ...props });
}
function Link(props) {
  const { Link: Link2 } = use(FrameworkContext);
  if (!Link2) {
    const { href, prefetch: _, ...rest } = props;
    return /* @__PURE__ */ jsx("a", { href, ...rest });
  }
  return /* @__PURE__ */ jsx(Link2, { ...props });
}

var Link2 = forwardRef(
  ({
    href = "#",
    // any protocol
    external = href.match(/^\w+:/) || // protocol relative URL
    href.startsWith("//"),
    prefetch,
    children,
    ...props
  }, ref) => {
    if (external) {
      return /* @__PURE__ */ jsx(
        "a",
        {
          ref,
          href,
          rel: "noreferrer noopener",
          target: "_blank",
          ...props,
          children
        }
      );
    }
    return /* @__PURE__ */ jsx(Link, { ref, href, prefetch, ...props, children });
  }
);
Link2.displayName = "Link";

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp(target, "default", { value: mod, enumerable: true }) ,
  mod
));

// src/utils/use-on-change.ts
function isDifferent(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return b.length !== a.length || a.some((v, i) => isDifferent(v, b[i]));
  }
  return a !== b;
}
function useOnChange(value, onChange, isUpdated = isDifferent) {
  const [prev, setPrev] = useState(value);
  if (isUpdated(prev, value)) {
    onChange(value, prev);
    setPrev(value);
  }
}

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (jsxs(ScrollAreaPrimitive.Root, { ref: ref, type: "scroll", className: twMerge('overflow-hidden', className), ...props, children: [children, jsx(ScrollAreaPrimitive.Corner, {}), jsx(ScrollBar, { orientation: "vertical" })] })));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
const ScrollViewport = React.forwardRef(({ className, children, ...props }, ref) => (jsx(ScrollAreaPrimitive.Viewport, { ref: ref, className: twMerge('size-full rounded-[inherit]', className), ...props, children: children })));
ScrollViewport.displayName = ScrollAreaPrimitive.Viewport.displayName;
const ScrollBar = React.forwardRef(({ className, orientation = 'vertical', ...props }, ref) => (jsx(ScrollAreaPrimitive.Scrollbar, { ref: ref, orientation: orientation, className: twMerge('flex select-none data-[state=hidden]:animate-fd-fade-out', orientation === 'vertical' && 'h-full w-1.5', orientation === 'horizontal' && 'h-1.5 flex-col', className), ...props, children: jsx(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-fd-border" }) })));
ScrollBar.displayName = ScrollAreaPrimitive.Scrollbar.displayName;

function normalize(url) {
    if (url.length > 1 && url.endsWith('/'))
        return url.slice(0, -1);
    return url;
}
function isActive(url, pathname, nested = true) {
    url = normalize(url);
    pathname = normalize(pathname);
    return url === pathname || (nested && pathname.startsWith(`${url}/`));
}
function isTabActive(tab, pathname) {
    if (tab.urls)
        return tab.urls.has(normalize(pathname));
    return isActive(tab.url, pathname, true);
}

const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;
const CollapsibleContent = forwardRef(({ children, ...props }, ref) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    return (jsx(CollapsiblePrimitive.CollapsibleContent, { ref: ref, ...props, className: twMerge('overflow-hidden', mounted &&
            'data-[state=closed]:animate-fd-collapsible-up data-[state=open]:animate-fd-collapsible-down', props.className), children: children }));
});
CollapsibleContent.displayName =
    CollapsiblePrimitive.CollapsibleContent.displayName;

function useMediaQuery(query, disabled = false) {
  const [isMatch, setMatch] = useState(null);
  useEffect(() => {
    if (disabled) return;
    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => {
      setMatch(mediaQueryList.matches);
    };
    handleChange();
    mediaQueryList.addEventListener("change", handleChange);
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [disabled, query]);
  return isMatch;
}

const SidebarContext = createContext(null);
const FolderContext = createContext(null);
function SidebarProvider({ defaultOpenLevel = 0, prefetch = true, children, }) {
    const closeOnRedirect = useRef(true);
    const [open, setOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const mode = useMediaQuery('(width < 768px)') ? 'drawer' : 'full';
    useOnChange(pathname, () => {
        if (closeOnRedirect.current) {
            setOpen(false);
        }
        closeOnRedirect.current = true;
    });
    return (jsx(SidebarContext, { value: useMemo(() => ({
            open,
            setOpen,
            collapsed,
            setCollapsed,
            closeOnRedirect,
            defaultOpenLevel,
            prefetch,
            mode,
        }), [open, collapsed, defaultOpenLevel, prefetch, mode]), children: children }));
}
function useSidebar() {
    const ctx = use(SidebarContext);
    if (!ctx)
        throw new Error('Missing SidebarContext, make sure you have wrapped the component in <DocsLayout /> and the context is available.');
    return ctx;
}
function useFolderDepth() {
    return use(FolderContext)?.depth ?? 0;
}
function SidebarContent({ children, }) {
    const { collapsed, mode } = useSidebar();
    const [hover, setHover] = useState(false);
    const ref = useRef(null);
    const timerRef = useRef(0);
    useOnChange(collapsed, () => {
        if (collapsed)
            setHover(false);
    });
    if (mode !== 'full')
        return;
    function shouldIgnoreHover(e) {
        const element = ref.current;
        if (!element)
            return true;
        return (!collapsed ||
            e.pointerType === 'touch' ||
            element.getAnimations().length > 0);
    }
    return children({
        ref,
        collapsed,
        hovered: hover,
        onPointerEnter(e) {
            if (shouldIgnoreHover(e))
                return;
            window.clearTimeout(timerRef.current);
            setHover(true);
        },
        onPointerLeave(e) {
            if (shouldIgnoreHover(e))
                return;
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => setHover(false), 
            // if mouse is leaving the viewport, add a close delay
            Math.min(e.clientX, document.body.clientWidth - e.clientX) > 100
                ? 0
                : 500);
        },
    });
}
function SidebarDrawerOverlay(props) {
    const { open, setOpen, mode } = useSidebar();
    if (mode !== 'drawer')
        return;
    return (jsx(Presence, { present: open, children: jsx("div", { "data-state": open ? 'open' : 'closed', onClick: () => setOpen(false), ...props }) }));
}
function SidebarDrawerContent({ className, children, ...props }) {
    const { open, mode } = useSidebar();
    const state = open ? 'open' : 'closed';
    if (mode !== 'drawer')
        return;
    return (jsx(Presence, { present: open, children: ({ present }) => (jsx("aside", { id: "nd-sidebar-mobile", "data-state": state, className: twMerge(!present && 'invisible', className), ...props, children: children })) }));
}
function SidebarViewport(props) {
    return (jsx(ScrollArea, { ...props, className: twMerge('min-h-0 flex-1', props.className), children: jsx(ScrollViewport, { className: "p-4 overscroll-contain", style: {
                maskImage: 'linear-gradient(to bottom, transparent, white 12px, white calc(100% - 12px), transparent)',
            }, children: props.children }) }));
}
function SidebarSeparator(props) {
    const depth = useFolderDepth();
    return (jsx("p", { ...props, className: twMerge('inline-flex items-center gap-2 mb-1.5 px-2 mt-6 empty:mb-0', depth === 0 && 'first:mt-0', props.className), children: props.children }));
}
function SidebarItem({ icon, children, ...props }) {
    const pathname = usePathname();
    const ref = useRef(null);
    const { prefetch } = useSidebar();
    const active = props.href !== undefined && isActive(props.href, pathname, false);
    useAutoScroll(active, ref);
    return (jsxs(Link2, { ref: ref, "data-active": active, prefetch: prefetch, ...props, children: [icon ?? (props.external ? jsx(ExternalLink, {}) : null), children] }));
}
function SidebarFolder({ defaultOpen: defaultOpenOption = false, ...props }) {
    const { defaultOpenLevel } = useSidebar();
    const depth = useFolderDepth() + 1;
    const defaultOpen = typeof defaultOpenOption === 'function'
        ? defaultOpenOption(defaultOpenLevel >= depth)
        : defaultOpenLevel >= depth || defaultOpenOption;
    const [open, setOpen] = useState(defaultOpen);
    useOnChange(defaultOpen, (v) => {
        if (v)
            setOpen(v);
    });
    return (jsx(Collapsible, { open: open, onOpenChange: setOpen, ...props, children: jsx(FolderContext, { value: useMemo(() => ({ open, setOpen, depth }), [depth, open]), children: props.children }) }));
}
function SidebarFolderTrigger(props) {
    const { open } = use(FolderContext);
    return (jsxs(CollapsibleTrigger, { ...props, children: [props.children, jsx(ChevronDown, { "data-icon": true, className: twMerge('ms-auto transition-transform', !open && '-rotate-90') })] }));
}
function SidebarFolderLink(props) {
    const ref = useRef(null);
    const { open, setOpen } = use(FolderContext);
    const { prefetch } = useSidebar();
    const pathname = usePathname();
    const active = props.href !== undefined && isActive(props.href, pathname, false);
    useAutoScroll(active, ref);
    return (jsxs(Link2, { ref: ref, "data-active": active, onClick: (e) => {
            if (e.target instanceof Element &&
                e.target.matches('[data-icon], [data-icon] *')) {
                setOpen(!open);
                e.preventDefault();
            }
            else {
                setOpen(active ? !open : true);
            }
        }, prefetch: prefetch, ...props, children: [props.children, jsx(ChevronDown, { "data-icon": true, className: twMerge('ms-auto transition-transform', !open && '-rotate-90') })] }));
}
function SidebarFolderContent(props) {
    return jsx(CollapsibleContent, { ...props, children: props.children });
}
function SidebarTrigger({ children, ...props }) {
    const { setOpen } = useSidebar();
    return (jsx("button", { "aria-label": "Open Sidebar", onClick: () => setOpen((prev) => !prev), ...props, children: children }));
}
function SidebarCollapseTrigger(props) {
    const { collapsed, setCollapsed } = useSidebar();
    return (jsx("button", { type: "button", "aria-label": "Collapse Sidebar", "data-collapsed": collapsed, onClick: () => {
            setCollapsed((prev) => !prev);
        }, ...props, children: props.children }));
}
function useAutoScroll(active, ref) {
    const { mode } = useSidebar();
    useEffect(() => {
        if (active && ref.current) {
            scrollIntoView(ref.current, {
                boundary: document.getElementById(mode === 'drawer' ? 'nd-sidebar-mobile' : 'nd-sidebar'),
                scrollMode: 'if-needed',
            });
        }
    }, [active, mode, ref]);
}

const Base = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  SidebarCollapseTrigger,
  SidebarContent,
  SidebarDrawerContent,
  SidebarDrawerOverlay,
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarViewport,
  useFolderDepth,
  useSidebar
}, Symbol.toStringTag, { value: 'Module' }));

// src/page-tree/utils.ts
function findPath(nodes, matcher, options = {}) {
  const { includeSeparator = true } = options;
  function run(nodes2) {
    let separator;
    for (const node of nodes2) {
      if (matcher(node)) {
        const items = [];
        if (separator) items.push(separator);
        items.push(node);
        return items;
      }
      if (node.type === "separator" && includeSeparator) {
        separator = node;
        continue;
      }
      if (node.type === "folder") {
        const items = node.index && matcher(node.index) ? [node.index] : run(node.children);
        if (items) {
          items.unshift(node);
          if (separator) items.unshift(separator);
          return items;
        }
      }
    }
  }
  return run(nodes) ?? null;
}

// src/utils/normalize-url.tsx
function normalizeUrl(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!url.startsWith("/")) url = "/" + url;
  if (url.length > 1 && url.endsWith("/")) url = url.slice(0, -1);
  return url;
}

function getBreadcrumbItemsFromPath(tree, path, options) {
  const {
    includePage = false,
    includeSeparator = false,
    includeRoot = false
  } = options;
  let items = [];
  for (let i = 0; i < path.length; i++) {
    const item = path[i];
    switch (item.type) {
      case "page":
        if (includePage)
          items.push({
            name: item.name,
            url: item.url
          });
        break;
      case "folder":
        if (item.root && !includeRoot) {
          items = [];
          break;
        }
        if (i === path.length - 1 || item.index !== path[i + 1]) {
          items.push({
            name: item.name,
            url: item.index?.url
          });
        }
        break;
      case "separator":
        if (item.name && includeSeparator)
          items.push({
            name: item.name
          });
        break;
    }
  }
  if (includeRoot) {
    items.unshift({
      name: tree.name,
      url: typeof includeRoot === "object" ? includeRoot.url : void 0
    });
  }
  return items;
}
function searchPath(nodes, url) {
  const normalizedUrl = normalizeUrl(url);
  return findPath(
    nodes,
    (node) => node.type === "page" && node.url === normalizedUrl
  );
}

const TreeContext = createContext(null);
const PathContext = createContext([]);
function TreeContextProvider({ tree: rawTree, children, }) {
    const nextIdRef = useRef(0);
    const pathname = usePathname();
    // I found that object-typed props passed from a RSC will be re-constructed, hence breaking all hooks' dependencies
    // using the id here to make sure this never happens
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const tree = useMemo(() => rawTree, [rawTree.$id ?? rawTree]);
    const path = useMemo(() => {
        return (searchPath(tree.children, pathname) ??
            (tree.fallback ? searchPath(tree.fallback.children, pathname) : null) ??
            []);
    }, [tree, pathname]);
    const root = path.findLast((item) => item.type === 'folder' && item.root) ?? tree;
    root.$id ?? (root.$id = String(nextIdRef.current++));
    return (jsx(TreeContext, { value: useMemo(() => ({ root, full: tree }), [root, tree]), children: jsx(PathContext, { value: path, children: children }) }));
}
function useTreePath() {
    return use(PathContext);
}
function useTreeContext() {
    const ctx = use(TreeContext);
    if (!ctx)
        throw new Error('You must wrap this component under <DocsLayout />');
    return ctx;
}

const SearchContext = createContext({
    enabled: false,
    hotKey: [],
    setOpenSearch: () => undefined,
});
function useSearchContext() {
    return use(SearchContext);
}
function MetaOrControl() {
    const [key, setKey] = useState('⌘');
    useEffect(() => {
        const isWindows = window.navigator.userAgent.includes('Windows');
        if (isWindows)
            setKey('Ctrl');
    }, []);
    return key;
}
function SearchProvider({ SearchDialog, children, preload = true, options, hotKey = [
    {
        key: (e) => e.metaKey || e.ctrlKey,
        display: jsx(MetaOrControl, {}),
    },
    {
        key: 'k',
        display: 'K',
    },
], links, }) {
    const [isOpen, setIsOpen] = useState(preload ? false : undefined);
    const onKeyDown = useEffectEvent((e) => {
        if (hotKey.every((v) => typeof v.key === 'string' ? e.key === v.key : v.key(e))) {
            setIsOpen((open) => !open);
            e.preventDefault();
        }
    });
    useEffect(() => {
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [hotKey]);
    return (jsxs(SearchContext, { value: useMemo(() => ({
            enabled: true,
            hotKey,
            setOpenSearch: setIsOpen,
        }), [hotKey]), children: [isOpen !== undefined && (jsx(SearchDialog, { open: isOpen, onOpenChange: setIsOpen, 
                // @ts-expect-error -- insert prop for official UIs
                links: links, ...options })), children] }));
}

const defaultTranslations = {
    search: 'Search',
    searchNoResult: 'No results found',
    toc: 'On this page',
    tocNoHeadings: 'No Headings',
    lastUpdate: 'Last updated on',
    chooseLanguage: 'Choose a language',
    nextPage: 'Next Page',
    previousPage: 'Previous Page',
    chooseTheme: 'Theme',
    editOnGithub: 'Edit on GitHub',
};
const I18nContext = createContext({
    text: defaultTranslations,
});
function I18nLabel(props) {
    const { text } = useI18n();
    return text[props.label];
}
function useI18n() {
    return useContext(I18nContext);
}

function SearchToggle({ hideIfDisabled, size = 'icon-sm', color = 'ghost', ...props }) {
    const { setOpenSearch, enabled } = useSearchContext();
    if (hideIfDisabled && !enabled)
        return null;
    return (jsx("button", { type: "button", className: twMerge(buttonVariants({
            size,
            color,
        }), props.className), "data-search": "", "aria-label": "Open Search", onClick: () => {
            setOpenSearch(true);
        }, children: jsx(Search, {}) }));
}
function LargeSearchToggle({ hideIfDisabled, ...props }) {
    const { enabled, hotKey, setOpenSearch } = useSearchContext();
    const { text } = useI18n();
    if (hideIfDisabled && !enabled)
        return null;
    return (jsxs("button", { type: "button", "data-search-full": "", ...props, className: twMerge('inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-1.5 ps-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground', props.className), onClick: () => {
            setOpenSearch(true);
        }, children: [jsx(Search, { className: "size-4" }), text.search, jsx("div", { className: "ms-auto inline-flex gap-0.5", children: hotKey.map((k, i) => (jsx("kbd", { className: "rounded-md border bg-fd-background px-1.5", children: k.display }, i))) })] }));
}

function mergeRefs$1(...refs) {
    return (value) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(value);
            }
            else if (ref) {
                ref.current = value;
            }
        });
    };
}

/**
 * Get link items with shortcuts
 */
function resolveLinkItems({ links = [], githubUrl, }) {
    const result = [...links];
    if (githubUrl)
        result.push({
            type: 'icon',
            url: githubUrl,
            text: 'Github',
            label: 'GitHub',
            icon: (jsx("svg", { role: "img", viewBox: "0 0 24 24", fill: "currentColor", children: jsx("path", { d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" }) })),
            external: true,
        });
    return result;
}

function LinkItem({ ref, item, ...props }) {
    const pathname = usePathname();
    const activeType = item.active ?? 'url';
    const active = activeType !== 'none' &&
        isActive(item.url, pathname, activeType === 'nested-url');
    return (jsx(Link2, { ref: ref, href: item.url, external: item.external, ...props, "data-active": active, children: props.children }));
}

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (jsx(PopoverPrimitive.Portal, { children: jsx(PopoverPrimitive.Content, { ref: ref, align: align, sideOffset: sideOffset, side: "bottom", className: twMerge('z-50 origin-(--radix-popover-content-transform-origin) overflow-y-auto max-h-(--radix-popover-content-available-height) min-w-[240px] max-w-[98vw] rounded-xl border bg-fd-popover/60 backdrop-blur-lg p-2 text-sm text-fd-popover-foreground shadow-lg focus-visible:outline-none data-[state=closed]:animate-fd-popover-out data-[state=open]:animate-fd-popover-in', className), ...props }) })));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

function LanguageToggle(props) {
    const context = useI18n();
    if (!context.locales)
        throw new Error('Missing `<I18nProvider />`');
    return (jsxs(Popover, { children: [jsx(PopoverTrigger, { "aria-label": context.text.chooseLanguage, ...props, className: twMerge(buttonVariants({
                    color: 'ghost',
                    className: 'gap-1.5 p-1.5',
                }), props.className), children: props.children }), jsxs(PopoverContent, { className: "flex flex-col overflow-x-hidden p-0", children: [jsx("p", { className: "mb-1 p-2 text-xs font-medium text-fd-muted-foreground", children: context.text.chooseLanguage }), context.locales.map((item) => (jsx("button", { type: "button", className: twMerge('p-2 text-start text-sm', item.locale === context.locale
                            ? 'bg-fd-primary/10 font-medium text-fd-primary'
                            : 'hover:bg-fd-accent hover:text-fd-accent-foreground'), onClick: () => {
                            context.onChange?.(item.locale);
                        }, children: item.name }, item.locale)))] })] }));
}
function LanguageToggleText(props) {
    const context = useI18n();
    const text = context.locales?.find((item) => item.locale === context.locale)?.name;
    return jsx("span", { ...props, children: text });
}

function useIsScrollTop({ enabled = true }) {
    const [isTop, setIsTop] = useState();
    useEffect(() => {
        if (!enabled)
            return;
        const listener = () => {
            setIsTop(window.scrollY < 10);
        };
        listener();
        window.addEventListener('scroll', listener);
        return () => {
            window.removeEventListener('scroll', listener);
        };
    }, [enabled]);
    return isTop;
}

const LayoutContext = createContext(null);
function LayoutContextProvider({ navTransparentMode = 'none', children, }) {
    const isTop = useIsScrollTop({ enabled: navTransparentMode === 'top' }) ?? true;
    const isNavTransparent = navTransparentMode === 'top' ? isTop : navTransparentMode === 'always';
    return (jsx(LayoutContext, { value: useMemo(() => ({
            isNavTransparent,
        }), [isNavTransparent]), children: children }));
}
function LayoutHeader(props) {
    const { isNavTransparent } = use(LayoutContext);
    return (jsx("header", { "data-transparent": isNavTransparent, ...props, children: props.children }));
}
function LayoutBody({ className, style, children, ...props }) {
    const { collapsed } = useSidebar();
    return (jsx("div", { id: "nd-docs-layout", className: twMerge('grid transition-[grid-template-columns] overflow-x-clip min-h-(--fd-docs-height) auto-cols-auto auto-rows-auto [--fd-docs-height:100dvh] [--fd-header-height:0px] [--fd-toc-popover-height:0px] [--fd-sidebar-width:0px] [--fd-toc-width:0px]', className), "data-sidebar-collapsed": collapsed, style: {
            gridTemplate: `"sidebar header toc"
        "sidebar toc-popover toc"
        "sidebar main toc" 1fr / minmax(var(--fd-sidebar-col), 1fr) minmax(0, calc(var(--fd-layout-width,97rem) - var(--fd-sidebar-width) - var(--fd-toc-width))) minmax(min-content, 1fr)`,
            '--fd-docs-row-1': 'var(--fd-banner-height, 0px)',
            '--fd-docs-row-2': 'calc(var(--fd-docs-row-1) + var(--fd-header-height))',
            '--fd-docs-row-3': 'calc(var(--fd-docs-row-2) + var(--fd-toc-popover-height))',
            '--fd-sidebar-col': collapsed ? '0px' : 'var(--fd-sidebar-width)',
            ...style,
        }, ...props, children: children }));
}
function LayoutTabs({ options, ...props }) {
    const pathname = usePathname();
    const selected = useMemo(() => {
        return options.findLast((option) => isTabActive(option, pathname));
    }, [options, pathname]);
    return (jsx("div", { ...props, className: twMerge('flex flex-row items-end gap-6 overflow-auto [grid-area:main]', props.className), children: options.map((option, i) => (jsx(Link2, { href: option.url, className: twMerge('inline-flex border-b-2 border-transparent transition-colors items-center pb-1.5 font-medium gap-2 text-fd-muted-foreground text-sm text-nowrap hover:text-fd-accent-foreground', option.unlisted && selected !== option && 'hidden', selected === option && 'border-fd-primary text-fd-primary'), children: option.title }, i))) }));
}

const itemVariants = cva('size-6.5 rounded-full p-1.5 text-fd-muted-foreground', {
    variants: {
        active: {
            true: 'bg-fd-accent text-fd-accent-foreground',
            false: 'text-fd-muted-foreground',
        },
    },
});
const full = [
    ['light', Sun],
    ['dark', Moon],
    ['system', Airplay],
];
function ThemeToggle({ className, mode = 'light-dark', ...props }) {
    const { setTheme, theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const container = twMerge('inline-flex items-center rounded-full border p-1', className);
    if (mode === 'light-dark') {
        const value = mounted ? resolvedTheme : null;
        return (jsx("button", { className: container, "aria-label": `Toggle Theme`, onClick: () => setTheme(value === 'light' ? 'dark' : 'light'), "data-theme-toggle": "", children: full.map(([key, Icon]) => {
                if (key === 'system')
                    return;
                return (jsx(Icon, { fill: "currentColor", className: twMerge(itemVariants({ active: value === key })) }, key));
            }) }));
    }
    const value = mounted ? theme : null;
    return (jsx("div", { className: container, "data-theme-toggle": "", ...props, children: full.map(([key, Icon]) => (jsx("button", { "aria-label": key, className: twMerge(itemVariants({ active: value === key })), onClick: () => setTheme(key), children: jsx(Icon, { className: "size-full", fill: "currentColor" }) }, key))) }));
}

// src/utils/merge-refs.ts
function mergeRefs(...refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        ref.current = value;
      }
    });
  };
}
var ActiveAnchorContext = createContext([]);
var ScrollContext = createContext({
  current: null
});
function useActiveAnchor() {
  return useContext(ActiveAnchorContext)[0];
}
function useActiveAnchors() {
  return useContext(ActiveAnchorContext);
}
function ScrollProvider({
  containerRef,
  children
}) {
  return /* @__PURE__ */ jsx(ScrollContext.Provider, { value: containerRef, children });
}
function AnchorProvider({
  toc,
  single = false,
  children
}) {
  const headings = useMemo(() => {
    return toc.map((item) => item.url.split("#")[1]);
  }, [toc]);
  return /* @__PURE__ */ jsx(ActiveAnchorContext.Provider, { value: useAnchorObserver(headings, single), children });
}
function TOCItem$2({
  ref,
  onActiveChange = () => null,
  ...props
}) {
  const containerRef = useContext(ScrollContext);
  const anchorRef = useRef(null);
  const activeOrder = useActiveAnchors().indexOf(props.href.slice(1));
  const isActive = activeOrder !== -1;
  const shouldScroll = activeOrder === 0;
  const onActiveChangeEvent = useEffectEvent(onActiveChange);
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const container = containerRef.current;
    if (container && anchor && shouldScroll)
      scrollIntoView(anchor, {
        behavior: "smooth",
        block: "center",
        inline: "center",
        scrollMode: "always",
        boundary: container
      });
  }, [containerRef, shouldScroll]);
  useEffect(() => {
    return () => onActiveChangeEvent(isActive);
  }, [isActive]);
  return /* @__PURE__ */ jsx("a", { ref: mergeRefs(anchorRef, ref), "data-active": isActive, ...props, children: props.children });
}
function useAnchorObserver(watch, single) {
  const observerRef = useRef(null);
  const [activeAnchor, setActiveAnchor] = useState(() => []);
  const stateRef = useRef(null);
  const onChange = useEffectEvent((entries) => {
    stateRef.current ??= {
      visible: /* @__PURE__ */ new Set()
    };
    const state = stateRef.current;
    for (const entry of entries) {
      if (entry.isIntersecting) {
        state.visible.add(entry.target.id);
      } else {
        state.visible.delete(entry.target.id);
      }
    }
    if (state.visible.size === 0) {
      const viewTop = entries.length > 0 ? entries[0]?.rootBounds?.top ?? 0 : 0;
      let fallback;
      let min = -1;
      for (const id of watch) {
        const element = document.getElementById(id);
        if (!element) continue;
        const d = Math.abs(viewTop - element.getBoundingClientRect().top);
        if (min === -1 || d < min) {
          fallback = element;
          min = d;
        }
      }
      setActiveAnchor(fallback ? [fallback.id] : []);
    } else {
      const items = watch.filter((item) => state.visible.has(item));
      setActiveAnchor(single ? items.slice(0, 1) : items);
    }
  });
  useEffect(() => {
    if (observerRef.current) return;
    observerRef.current = new IntersectionObserver(onChange, {
      rootMargin: "0px",
      threshold: 0.98
    });
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);
  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;
    const elements = watch.flatMap(
      (heading) => document.getElementById(heading) ?? []
    );
    for (const element of elements) observer.observe(element);
    return () => {
      for (const element of elements) observer.unobserve(element);
    };
  }, [watch]);
  return activeAnchor;
}

const TOCContext = createContext([]);
function useTOCItems() {
    return use(TOCContext);
}
function TOCProvider({ toc, children, ...props }) {
    return (jsx(TOCContext, { value: toc, children: jsx(AnchorProvider, { toc: toc, ...props, children: children }) }));
}
function TOCScrollArea({ ref, className, ...props }) {
    const viewRef = useRef(null);
    return (jsx("div", { ref: mergeRefs$1(viewRef, ref), className: twMerge('relative min-h-0 text-sm ms-px overflow-auto [scrollbar-width:none] mask-[linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] py-3', className), ...props, children: jsx(ScrollProvider, { containerRef: viewRef, children: props.children }) }));
}
function TocThumb({ containerRef, ...props }) {
    const thumbRef = useRef(null);
    return (jsxs(Fragment, { children: [jsx("div", { ref: thumbRef, role: "none", ...props }), jsx(Updater, { containerRef: containerRef, thumbRef: thumbRef })] }));
}
function Updater({ containerRef, thumbRef, }) {
    const active = useActiveAnchors();
    const onPrint = useEffectEvent(() => {
        if (!containerRef.current || !thumbRef.current)
            return;
        update(thumbRef.current, calc(containerRef.current, active));
    });
    useEffect(() => {
        if (!containerRef.current)
            return;
        const container = containerRef.current;
        const observer = new ResizeObserver(onPrint);
        observer.observe(container);
        return () => {
            observer.disconnect();
        };
    }, [containerRef]);
    if (containerRef.current && thumbRef.current) {
        update(thumbRef.current, calc(containerRef.current, active));
    }
    return null;
}
function calc(container, active) {
    if (active.length === 0 || container.clientHeight === 0) {
        return [0, 0];
    }
    let upper = Number.MAX_VALUE, lower = 0;
    for (const item of active) {
        const element = container.querySelector(`a[href="#${item}"]`);
        if (!element)
            continue;
        const styles = getComputedStyle(element);
        upper = Math.min(upper, element.offsetTop + parseFloat(styles.paddingTop));
        lower = Math.max(lower, element.offsetTop +
            element.clientHeight -
            parseFloat(styles.paddingBottom));
    }
    return [upper, lower - upper];
}
function update(element, info) {
    element.style.setProperty('--fd-top', `${info[0]}px`);
    element.style.setProperty('--fd-height', `${info[1]}px`);
}

const footerCache = new Map();
/**
 * @returns a list of page tree items (linear), that you can obtain footer items
 */
function useFooterItems() {
    const { root } = useTreeContext();
    const cached = footerCache.get(root.$id);
    if (cached)
        return cached;
    const list = [];
    function onNode(node) {
        if (node.type === 'folder') {
            if (node.index)
                onNode(node.index);
            for (const child of node.children)
                onNode(child);
        }
        else if (node.type === 'page' && !node.external) {
            list.push(node);
        }
    }
    for (const child of root.children)
        onNode(child);
    footerCache.set(root.$id, list);
    return list;
}

const TocPopoverContext = createContext(null);
function PageTOCPopover({ className, children, ...rest }) {
    const ref = useRef(null);
    const [open, setOpen] = useState(false);
    const { isNavTransparent } = use(LayoutContext);
    const onClick = useEffectEvent((e) => {
        if (!open)
            return;
        if (ref.current && !ref.current.contains(e.target))
            setOpen(false);
    });
    useEffect(() => {
        window.addEventListener('click', onClick);
        return () => {
            window.removeEventListener('click', onClick);
        };
    }, []);
    return (jsx(TocPopoverContext, { value: useMemo(() => ({
            open,
            setOpen,
        }), [setOpen, open]), children: jsx(Collapsible, { open: open, onOpenChange: setOpen, "data-toc-popover": "", className: twMerge('sticky top-(--fd-docs-row-2) z-10 [grid-area:toc-popover] h-(--fd-toc-popover-height) xl:hidden max-xl:layout:[--fd-toc-popover-height:--spacing(10)]', className), ...rest, children: jsx("header", { ref: ref, className: twMerge('border-b backdrop-blur-sm transition-colors', (!isNavTransparent || open) && 'bg-fd-background/80', open && 'shadow-lg'), children: children }) }) }));
}
function PageTOCPopoverTrigger({ className, ...props }) {
    const { text } = useI18n();
    const { open } = use(TocPopoverContext);
    const items = useTOCItems();
    const active = useActiveAnchor();
    const selected = useMemo(() => items.findIndex((item) => active === item.url.slice(1)), [items, active]);
    const path = useTreePath().at(-1);
    const showItem = selected !== -1 && !open;
    return (jsxs(CollapsibleTrigger, { className: twMerge('flex w-full h-10 items-center text-sm text-fd-muted-foreground gap-2.5 px-4 py-2.5 text-start focus-visible:outline-none [&_svg]:size-4 md:px-6', className), "data-toc-popover-trigger": "", ...props, children: [jsx(ProgressCircle, { value: (selected + 1) / Math.max(1, items.length), max: 1, className: twMerge('shrink-0', open && 'text-fd-primary') }), jsxs("span", { className: "grid flex-1 *:my-auto *:row-start-1 *:col-start-1", children: [jsx("span", { className: twMerge('truncate transition-all', open && 'text-fd-foreground', showItem && 'opacity-0 -translate-y-full pointer-events-none'), children: path?.name ?? text.toc }), jsx("span", { className: twMerge('truncate transition-all', !showItem && 'opacity-0 translate-y-full pointer-events-none'), children: items[selected]?.title })] }), jsx(ChevronDown, { className: twMerge('shrink-0 transition-transform mx-0.5', open && 'rotate-180') })] }));
}
function clamp(input, min, max) {
    if (input < min)
        return min;
    if (input > max)
        return max;
    return input;
}
function ProgressCircle({ value, strokeWidth = 2, size = 24, min = 0, max = 100, ...restSvgProps }) {
    const normalizedValue = clamp(value, min, max);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (normalizedValue / max) * circumference;
    const circleProps = {
        cx: size / 2,
        cy: size / 2,
        r: radius,
        fill: 'none',
        strokeWidth,
    };
    return (jsxs("svg", { role: "progressbar", viewBox: `0 0 ${size} ${size}`, "aria-valuenow": normalizedValue, "aria-valuemin": min, "aria-valuemax": max, ...restSvgProps, children: [jsx("circle", { ...circleProps, className: "stroke-current/25" }), jsx("circle", { ...circleProps, stroke: "currentColor", strokeDasharray: circumference, strokeDashoffset: circumference - progress, strokeLinecap: "round", transform: `rotate(-90 ${size / 2} ${size / 2})`, className: "transition-all" })] }));
}
function PageTOCPopoverContent(props) {
    return (jsx(CollapsibleContent, { "data-toc-popover-content": "", ...props, className: twMerge('flex flex-col px-4 max-h-[50vh] md:px-6', props.className), children: props.children }));
}
function PageFooter({ items, ...props }) {
    const footerList = useFooterItems();
    const pathname = usePathname();
    const { previous, next } = useMemo(() => {
        if (items)
            return items;
        const idx = footerList.findIndex((item) => isActive(item.url, pathname, false));
        if (idx === -1)
            return {};
        return {
            previous: footerList[idx - 1],
            next: footerList[idx + 1],
        };
    }, [footerList, items, pathname]);
    return (jsxs("div", { ...props, className: twMerge('@container grid gap-4', previous && next ? 'grid-cols-2' : 'grid-cols-1', props.className), children: [previous ? jsx(FooterItem, { item: previous, index: 0 }) : null, next ? jsx(FooterItem, { item: next, index: 1 }) : null] }));
}
function FooterItem({ item, index }) {
    const { text } = useI18n();
    const Icon = index === 0 ? ChevronLeft : ChevronRight;
    return (jsxs(Link2, { href: item.url, className: twMerge('flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full', index === 1 && 'text-end'), children: [jsxs("div", { className: twMerge('inline-flex items-center gap-1.5 font-medium', index === 1 && 'flex-row-reverse'), children: [jsx(Icon, { className: "-mx-1 size-4 shrink-0 rtl:rotate-180" }), jsx("p", { children: item.name })] }), jsx("p", { className: "text-fd-muted-foreground truncate", children: item.description ?? (index === 0 ? text.previousPage : text.nextPage) })] }));
}
function PageBreadcrumb({ includeRoot, includeSeparator, includePage, ...props }) {
    const path = useTreePath();
    const { root } = useTreeContext();
    const items = useMemo(() => {
        return getBreadcrumbItemsFromPath(root, path, {
            includePage,
            includeSeparator,
            includeRoot,
        });
    }, [includePage, includeRoot, includeSeparator, path, root]);
    if (items.length === 0)
        return null;
    return (jsx("div", { ...props, className: twMerge('flex items-center gap-1.5 text-sm text-fd-muted-foreground', props.className), children: items.map((item, i) => {
            const className = twMerge('truncate', i === items.length - 1 && 'text-fd-primary font-medium');
            return (jsxs(Fragment$1, { children: [i !== 0 && jsx(ChevronRight, { className: "size-3.5 shrink-0" }), item.url ? (jsx(Link2, { href: item.url, className: twMerge(className, 'transition-opacity hover:opacity-80'), children: item.name })) : (jsx("span", { className: className, children: item.name }))] }, i));
        }) }));
}

function TOCItems$1({ ref, className, ...props }) {
    const containerRef = useRef(null);
    const items = useTOCItems();
    const { text } = useI18n();
    if (items.length === 0)
        return (jsx("div", { className: "rounded-lg border bg-fd-card p-3 text-xs text-fd-muted-foreground", children: text.tocNoHeadings }));
    return (jsxs(Fragment, { children: [jsx(TocThumb, { containerRef: containerRef, className: "absolute top-(--fd-top) h-(--fd-height) w-px bg-fd-primary transition-all" }), jsx("div", { ref: mergeRefs$1(ref, containerRef), className: twMerge('flex flex-col border-s border-fd-foreground/10', className), ...props, children: items.map((item) => (jsx(TOCItem$1, { item: item }, item.url))) })] }));
}
function TOCItem$1({ item }) {
    return (jsx(TOCItem$2, { href: item.url, className: twMerge('prose py-1.5 text-sm text-fd-muted-foreground transition-colors wrap-anywhere first:pt-0 last:pb-0 data-[active=true]:text-fd-primary', item.depth <= 2 && 'ps-3', item.depth === 3 && 'ps-6', item.depth >= 4 && 'ps-8'), children: item.title }));
}

function TOCItems({ ref, className, ...props }) {
    const containerRef = useRef(null);
    const items = useTOCItems();
    const { text } = useI18n();
    const [svg, setSvg] = useState();
    useEffect(() => {
        if (!containerRef.current)
            return;
        const container = containerRef.current;
        function onResize() {
            if (container.clientHeight === 0)
                return;
            let w = 0, h = 0;
            const d = [];
            for (let i = 0; i < items.length; i++) {
                const element = container.querySelector(`a[href="#${items[i].url.slice(1)}"]`);
                if (!element)
                    continue;
                const styles = getComputedStyle(element);
                const offset = getLineOffset(items[i].depth) + 1, top = element.offsetTop + parseFloat(styles.paddingTop), bottom = element.offsetTop +
                    element.clientHeight -
                    parseFloat(styles.paddingBottom);
                w = Math.max(offset, w);
                h = Math.max(h, bottom);
                d.push(`${i === 0 ? 'M' : 'L'}${offset} ${top}`);
                d.push(`L${offset} ${bottom}`);
            }
            setSvg({
                path: d.join(' '),
                width: w + 1,
                height: h,
            });
        }
        const observer = new ResizeObserver(onResize);
        onResize();
        observer.observe(container);
        return () => {
            observer.disconnect();
        };
    }, [items]);
    if (items.length === 0)
        return (jsx("div", { className: "rounded-lg border bg-fd-card p-3 text-xs text-fd-muted-foreground", children: text.tocNoHeadings }));
    return (jsxs(Fragment, { children: [svg && (jsx("div", { className: "absolute start-0 top-0 rtl:-scale-x-100", style: {
                    width: svg.width,
                    height: svg.height,
                    maskImage: `url("data:image/svg+xml,${
                    // Inline SVG
                    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="1" fill="none" /></svg>`)}")`,
                }, children: jsx(TocThumb, { containerRef: containerRef, className: "mt-(--fd-top) h-(--fd-height) bg-fd-primary transition-all" }) })), jsx("div", { ref: mergeRefs$1(containerRef, ref), className: twMerge('flex flex-col', className), ...props, children: items.map((item, i) => (jsx(TOCItem, { item: item, upper: items[i - 1]?.depth, lower: items[i + 1]?.depth }, item.url))) })] }));
}
function getItemOffset(depth) {
    if (depth <= 2)
        return 14;
    if (depth === 3)
        return 26;
    return 36;
}
function getLineOffset(depth) {
    return depth >= 3 ? 10 : 0;
}
function TOCItem({ item, upper = item.depth, lower = item.depth, }) {
    const offset = getLineOffset(item.depth), upperOffset = getLineOffset(upper), lowerOffset = getLineOffset(lower);
    return (jsxs(TOCItem$2, { href: item.url, style: {
            paddingInlineStart: getItemOffset(item.depth),
        }, className: "prose relative py-1.5 text-sm text-fd-muted-foreground hover:text-fd-accent-foreground transition-colors wrap-anywhere first:pt-0 last:pb-0 data-[active=true]:text-fd-primary", children: [offset !== upperOffset && (jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", className: "absolute -top-1.5 start-0 size-4 rtl:-scale-x-100", children: jsx("line", { x1: upperOffset, y1: "0", x2: offset, y2: "12", className: "stroke-fd-foreground/10", strokeWidth: "1" }) })), jsx("div", { className: twMerge('absolute inset-y-0 w-px bg-fd-foreground/10', offset !== upperOffset && 'top-1.5', offset !== lowerOffset && 'bottom-1.5'), style: {
                    insetInlineStart: offset,
                } }), item.title] }));
}

function DocsPage({ breadcrumb: { enabled: breadcrumbEnabled = true, component: breadcrumb, ...breadcrumbProps } = {}, footer = {}, full = false, tableOfContentPopover: { enabled: tocPopoverEnabled, component: tocPopover, ...tocPopoverOptions } = {}, tableOfContent: { enabled: tocEnabled, component: tocReplace, ...tocOptions } = {}, toc = [], children, }) {
    // disable TOC on full mode, you can still enable it with `enabled` option.
    tocEnabled ?? (tocEnabled = !full &&
        (toc.length > 0 ||
            tocOptions.footer !== undefined ||
            tocOptions.header !== undefined));
    tocPopoverEnabled ?? (tocPopoverEnabled = toc.length > 0 ||
        tocPopoverOptions.header !== undefined ||
        tocPopoverOptions.footer !== undefined);
    let wrapper = (children) => children;
    if (tocEnabled || tocPopoverEnabled) {
        wrapper = (children) => (jsx(TOCProvider, { single: tocOptions.single, toc: toc, children: children }));
    }
    return wrapper(jsxs(Fragment, { children: [tocPopoverEnabled &&
                (tocPopover ?? (jsxs(PageTOCPopover, { children: [jsx(PageTOCPopoverTrigger, {}), jsxs(PageTOCPopoverContent, { children: [tocPopoverOptions.header, jsx(TOCScrollArea, { children: tocPopoverOptions.style === 'clerk' ? (jsx(TOCItems, {})) : (jsx(TOCItems$1, {})) }), tocPopoverOptions.footer] })] }))), jsxs("article", { id: "nd-page", "data-full": full, className: twMerge('flex flex-col w-full max-w-[900px] mx-auto [grid-area:main] px-4 py-6 gap-4 md:px-6 md:pt-8 xl:px-8 xl:pt-14', full ? 'max-w-[1200px]' : 'xl:layout:[--fd-toc-width:268px]'), children: [breadcrumbEnabled &&
                        (breadcrumb ?? jsx(PageBreadcrumb, { ...breadcrumbProps })), children, footer.enabled !== false &&
                        (footer.component ?? jsx(PageFooter, { items: footer.items }))] }), tocEnabled &&
                (tocReplace ?? (jsxs("div", { id: "nd-toc", className: "sticky top-(--fd-docs-row-1) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] flex flex-col [grid-area:toc] w-(--fd-toc-width) pt-12 pe-4 pb-2 max-xl:hidden", children: [tocOptions.header, jsxs("h3", { id: "toc-title", className: "inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground", children: [jsx(Text, { className: "size-4" }), jsx(I18nLabel, { label: "toc" })] }), jsx(TOCScrollArea, { children: tocOptions.style === 'clerk' ? (jsx(TOCItems, {})) : (jsx(TOCItems$1, {})) }), tocOptions.footer] })))] }));
}
/**
 * Add typography styles
 */
function DocsBody({ children, className, ...props }) {
    return (jsx("div", { ...props, className: twMerge('prose flex-1', className), children: children }));
}
function DocsDescription({ children, className, ...props }) {
    // Don't render if no description provided
    if (children === undefined)
        return null;
    return (jsx("p", { ...props, className: twMerge('mb-8 text-lg text-fd-muted-foreground', className), children: children }));
}
function DocsTitle({ children, className, ...props }) {
    return (jsx("h1", { ...props, className: twMerge('text-[1.75em] font-semibold', className), children: children }));
}

function Cards(props) {
    return (jsx("div", { ...props, className: twMerge('grid grid-cols-2 gap-3 @container', props.className), children: props.children }));
}
function Card({ icon, title, description, ...props }) {
    const E = props.href ? Link2 : 'div';
    return (jsxs(E, { ...props, "data-card": true, className: twMerge('block rounded-xl border bg-fd-card p-4 text-fd-card-foreground transition-colors @max-lg:col-span-full', props.href && 'hover:bg-fd-accent/80', props.className), children: [icon ? (jsx("div", { className: "not-prose mb-2 w-fit shadow-md rounded-lg border bg-fd-muted p-1.5 text-fd-muted-foreground [&_svg]:size-4", children: icon })) : null, jsx("h3", { className: "not-prose mb-1 text-sm font-medium", children: title }), description ? (jsx("p", { className: "my-0! text-sm text-fd-muted-foreground", children: description })) : null, jsx("div", { className: "text-sm text-fd-muted-foreground prose-no-margin empty:hidden", children: props.children })] }));
}

const iconClass = 'size-5 -me-0.5 fill-(--callout-color) text-fd-card';
function Callout({ children, title, ...props }) {
    return (jsxs(CalloutContainer, { ...props, children: [title && jsx(CalloutTitle, { children: title }), jsx(CalloutDescription, { children: children })] }));
}
function resolveAlias(type) {
    if (type === 'warn')
        return 'warning';
    if (type === 'tip')
        return 'info';
    return type;
}
function CalloutContainer({ type: inputType = 'info', icon, children, className, style, ...props }) {
    const type = resolveAlias(inputType);
    return (jsxs("div", { className: twMerge('flex gap-2 my-4 rounded-xl border bg-fd-card p-3 ps-1 text-sm text-fd-card-foreground shadow-md', className), style: {
            '--callout-color': `var(--color-fd-${type}, var(--color-fd-muted))`,
            ...style,
        }, ...props, children: [jsx("div", { role: "none", className: "w-0.5 bg-(--callout-color)/50 rounded-sm" }), icon ??
                {
                    info: jsx(Info, { className: iconClass }),
                    warning: jsx(TriangleAlert, { className: iconClass }),
                    error: jsx(CircleX, { className: iconClass }),
                    success: jsx(CircleCheck, { className: iconClass }),
                    idea: jsx(Sun, { className: iconClass }),
                }[type], jsx("div", { className: "flex flex-col gap-2 min-w-0 flex-1", children: children })] }));
}
function CalloutTitle({ children, className, ...props }) {
    return (jsx("p", { className: twMerge('font-medium my-0!', className), ...props, children: children }));
}
function CalloutDescription({ children, className, ...props }) {
    return (jsx("div", { className: twMerge('text-fd-muted-foreground prose-no-margin empty:hidden', className), ...props, children: children }));
}

function Heading({ as, className, ...props }) {
    const As = as ?? 'h1';
    if (!props.id)
        return jsx(As, { className: className, ...props });
    return (jsxs(As, { className: twMerge('flex scroll-m-28 flex-row items-center gap-2', className), ...props, children: [jsx("a", { "data-card": "", href: `#${props.id}`, className: "peer", children: props.children }), jsx(Link$1, { "aria-hidden": true, className: "size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" })] }));
}

function useCopyButton(onCopy) {
    const [checked, setChecked] = useState(false);
    const callbackRef = useRef(onCopy);
    const timeoutRef = useRef(null);
    callbackRef.current = onCopy;
    const onClick = useCallback(() => {
        if (timeoutRef.current)
            window.clearTimeout(timeoutRef.current);
        const res = Promise.resolve(callbackRef.current());
        void res.then(() => {
            setChecked(true);
            timeoutRef.current = window.setTimeout(() => {
                setChecked(false);
            }, 1500);
        });
    }, []);
    // Avoid updates after being unmounted
    useEffect(() => {
        return () => {
            if (timeoutRef.current)
                window.clearTimeout(timeoutRef.current);
        };
    }, []);
    return [checked, onClick];
}

const listeners = new Map();
const TabsContext$1 = createContext(null);
function useTabContext() {
    const ctx = use(TabsContext$1);
    if (!ctx)
        throw new Error('You must wrap your component in <Tabs>');
    return ctx;
}
const TabsList = Primitive.TabsList;
const TabsTrigger = Primitive.TabsTrigger;
function Tabs({ ref, groupId, persist = false, updateAnchor = false, defaultValue, value: _value, onValueChange: _onValueChange, ...props }) {
    const tabsRef = useRef(null);
    const valueToIdMap = useMemo(() => new Map(), []);
    const [value, setValue] = _value === undefined
        ? // eslint-disable-next-line react-hooks/rules-of-hooks -- not supposed to change controlled/uncontrolled
            useState(defaultValue)
        : // eslint-disable-next-line react-hooks/rules-of-hooks -- not supposed to change controlled/uncontrolled
            [_value, useEffectEvent((v) => _onValueChange?.(v))];
    useLayoutEffect(() => {
        if (!groupId)
            return;
        let previous = sessionStorage.getItem(groupId);
        if (persist)
            previous ?? (previous = localStorage.getItem(groupId));
        if (previous)
            setValue(previous);
        const groupListeners = listeners.get(groupId) ?? new Set();
        groupListeners.add(setValue);
        listeners.set(groupId, groupListeners);
        return () => {
            groupListeners.delete(setValue);
        };
    }, [groupId, persist, setValue]);
    useLayoutEffect(() => {
        const hash = window.location.hash.slice(1);
        if (!hash)
            return;
        for (const [value, id] of valueToIdMap.entries()) {
            if (id === hash) {
                setValue(value);
                tabsRef.current?.scrollIntoView();
                break;
            }
        }
    }, [setValue, valueToIdMap]);
    return (jsx(Primitive.Tabs, { ref: mergeRefs$1(ref, tabsRef), value: value, onValueChange: (v) => {
            if (updateAnchor) {
                const id = valueToIdMap.get(v);
                if (id) {
                    window.history.replaceState(null, '', `#${id}`);
                }
            }
            if (groupId) {
                const groupListeners = listeners.get(groupId);
                if (groupListeners) {
                    for (const listener of groupListeners)
                        listener(v);
                }
                sessionStorage.setItem(groupId, v);
                if (persist)
                    localStorage.setItem(groupId, v);
            }
            else {
                setValue(v);
            }
        }, ...props, children: jsx(TabsContext$1, { value: useMemo(() => ({ valueToIdMap }), [valueToIdMap]), children: props.children }) }));
}
function TabsContent({ value, ...props }) {
    const { valueToIdMap } = useTabContext();
    if (props.id) {
        valueToIdMap.set(value, props.id);
    }
    return (jsx(Primitive.TabsContent, { value: value, ...props, children: props.children }));
}

const TabsContext = createContext(null);
function Pre(props) {
    return (jsx("pre", { ...props, className: twMerge('min-w-full w-max *:flex *:flex-col', props.className), children: props.children }));
}
function CodeBlock({ ref, title, allowCopy = true, keepBackground = false, icon, viewportProps = {}, children, Actions = (props) => (jsx("div", { ...props, className: twMerge('empty:hidden', props.className) })), ...props }) {
    const inTab = use(TabsContext) !== null;
    const areaRef = useRef(null);
    return (jsxs("figure", { ref: ref, dir: "ltr", ...props, tabIndex: -1, className: twMerge(inTab
            ? 'bg-fd-secondary -mx-px -mb-px last:rounded-b-xl'
            : 'my-4 bg-fd-card rounded-xl', keepBackground && 'bg-(--shiki-light-bg) dark:bg-(--shiki-dark-bg)', 'shiki relative border shadow-sm not-prose overflow-hidden text-sm', props.className), children: [title ? (jsxs("div", { className: "flex text-fd-muted-foreground items-center gap-2 h-9.5 border-b px-4", children: [typeof icon === 'string' ? (jsx("div", { className: "[&_svg]:size-3.5", dangerouslySetInnerHTML: {
                            __html: icon,
                        } })) : (icon), jsx("figcaption", { className: "flex-1 truncate", children: title }), Actions({
                        className: '-me-2',
                        children: allowCopy && jsx(CopyButton, { containerRef: areaRef }),
                    })] })) : (Actions({
                className: 'absolute top-2 right-2 z-2 backdrop-blur-lg rounded-lg text-fd-muted-foreground',
                children: allowCopy && jsx(CopyButton, { containerRef: areaRef }),
            })), jsx("div", { ref: areaRef, ...viewportProps, role: "region", tabIndex: 0, className: twMerge('text-[0.8125rem] py-3.5 overflow-auto max-h-[600px] fd-scroll-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring', viewportProps.className), style: {
                    // space for toolbar
                    '--padding-right': !title ? 'calc(var(--spacing) * 8)' : undefined,
                    counterSet: props['data-line-numbers']
                        ? `line ${Number(props['data-line-numbers-start'] ?? 1) - 1}`
                        : undefined,
                    ...viewportProps.style,
                }, children: children })] }));
}
function CopyButton({ className, containerRef, ...props }) {
    const [checked, onClick] = useCopyButton(() => {
        const pre = containerRef.current?.getElementsByTagName('pre').item(0);
        if (!pre)
            return;
        const clone = pre.cloneNode(true);
        clone.querySelectorAll('.nd-copy-ignore').forEach((node) => {
            node.replaceWith('\n');
        });
        void navigator.clipboard.writeText(clone.textContent ?? '');
    });
    return (jsx("button", { type: "button", "data-checked": checked || undefined, className: twMerge(buttonVariants({
            className: 'hover:text-fd-accent-foreground data-checked:text-fd-accent-foreground',
            size: 'icon-xs',
        }), className), "aria-label": checked ? 'Copied Text' : 'Copy Text', onClick: onClick, ...props, children: checked ? jsx(Check, {}) : jsx(Clipboard, {}) }));
}
function CodeBlockTabs({ ref, ...props }) {
    const containerRef = useRef(null);
    const nested = use(TabsContext) !== null;
    return (jsx(Tabs, { ref: mergeRefs$1(containerRef, ref), ...props, className: twMerge('bg-fd-card rounded-xl border', !nested && 'my-4', props.className), children: jsx(TabsContext, { value: useMemo(() => ({
                containerRef,
                nested,
            }), [nested]), children: props.children }) }));
}
function CodeBlockTabsList(props) {
    return (jsx(TabsList, { ...props, className: twMerge('flex flex-row px-2 overflow-x-auto text-fd-muted-foreground', props.className), children: props.children }));
}
function CodeBlockTabsTrigger({ children, ...props }) {
    return (jsxs(TabsTrigger, { ...props, className: twMerge('relative group inline-flex text-sm font-medium text-nowrap items-center transition-colors gap-2 px-2 py-1.5 hover:text-fd-accent-foreground data-[state=active]:text-fd-primary [&_svg]:size-3.5', props.className), children: [jsx("div", { className: "absolute inset-x-2 bottom-0 h-px group-data-[state=active]:bg-fd-primary" }), children] }));
}
function CodeBlockTab(props) {
    return jsx(TabsContent, { ...props });
}

function Image(props) {
    return (jsx(Image$1, { sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px", ...props, src: props.src, className: twMerge('rounded-lg', props.className) }));
}
function Table(props) {
    return (jsx("div", { className: "relative overflow-auto prose-no-margin my-6", children: jsx("table", { ...props }) }));
}
const defaultMdxComponents = {
    CodeBlockTab,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTabsTrigger,
    pre: (props) => (jsx(CodeBlock, { ...props, children: jsx(Pre, { children: props.children }) })),
    Card,
    Cards,
    a: Link2,
    img: Image,
    h1: (props) => (jsx(Heading, { as: "h1", ...props })),
    h2: (props) => (jsx(Heading, { as: "h2", ...props })),
    h3: (props) => (jsx(Heading, { as: "h3", ...props })),
    h4: (props) => (jsx(Heading, { as: "h4", ...props })),
    h5: (props) => (jsx(Heading, { as: "h5", ...props })),
    h6: (props) => (jsx(Heading, { as: "h6", ...props })),
    table: Table,
    Callout,
    CalloutContainer,
    CalloutTitle,
    CalloutDescription,
};

function KeybindItem({ keys, action }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 py-2 px-3 rounded-lg hover:bg-fd-accent/30 transition-colors", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 min-w-fit shrink-0", children: keys }),
    /* @__PURE__ */ jsx("div", { className: "text-fd-muted-foreground flex-1", children: action })
  ] });
}
function KeybindList({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "my-6 space-y-1 rounded-lg border border-fd-border bg-fd-card/30 p-2", children });
}
KeybindList.Item = KeybindItem;
function Key({ children }) {
  return /* @__PURE__ */ jsx("kbd", { children });
}
function KeySeq({ keys }) {
  return /* @__PURE__ */ jsx(Fragment, { children: keys.map((key, i) => /* @__PURE__ */ jsxs("span", { children: [
    /* @__PURE__ */ jsx("kbd", { children: key }),
    i < keys.length - 1 && " "
  ] }, i)) });
}
function KeyCombo({ keys }) {
  return /* @__PURE__ */ jsx(Fragment, { children: keys.map((key, i) => /* @__PURE__ */ jsxs("span", { children: [
    /* @__PURE__ */ jsx("kbd", { children: key }),
    i < keys.length - 1 && "+"
  ] }, i)) });
}

function Mermaid({ chart }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return /* @__PURE__ */ jsx(MermaidContent, { chart });
}
const cache = /* @__PURE__ */ new Map();
function cachePromise(key, setPromise) {
  const cached = cache.get(key);
  if (cached) return cached;
  const promise = setPromise();
  cache.set(key, promise);
  return promise;
}
function MermaidContent({ chart }) {
  const id = useId();
  const { resolvedTheme } = useTheme();
  const { default: mermaid } = use(
    cachePromise("mermaid", () => import('mermaid'))
  );
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    fontFamily: "inherit",
    themeCSS: "margin: 1.5rem auto 0;",
    theme: resolvedTheme === "dark" ? "dark" : "default"
  });
  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${resolvedTheme}`, () => {
      return mermaid.render(id, chart.replaceAll("\\n", "\n"));
    })
  );
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: (container) => {
        if (container) bindFunctions?.(container);
      },
      dangerouslySetInnerHTML: { __html: svg }
    }
  );
}

const title = "Documentation";
const pages = ["index","getting-started","keybindings","configuration","tape-scripting","cli-reference","architecture"];
const __vite_glob_0_0 = {
  title,
  pages,
};

let frontmatter$6 = {
  "title": "Architecture",
  "description": "Technical architecture and design of TUIOS",
  "icon": "Boxes"
};
let structuredData$6 = {
  "contents": [{
    "heading": undefined,
    "content": "TUIOS is built on the Bubble Tea v2 framework following the Model-View-Update (MVU) pattern."
  }, {
    "heading": "tech-stack",
    "content": "Bubble Tea v2 - Event-driven TUI framework"
  }, {
    "heading": "tech-stack",
    "content": "Lipgloss v2 - Terminal styling with caching"
  }, {
    "heading": "tech-stack",
    "content": "go-pty - Cross-platform PTY interface"
  }, {
    "heading": "tech-stack",
    "content": "Wish v2 - SSH server framework"
  }, {
    "heading": "tech-stack",
    "content": "Cobra - CLI framework"
  }, {
    "heading": "tech-stack",
    "content": "Vendored VT emulator - Custom ANSI/VT100 terminal emulator"
  }, {
    "heading": "window-manager-apposgo",
    "content": "The central OS struct manages:"
  }, {
    "heading": "window-manager-apposgo",
    "content": "Window lifecycle (create, focus, close)"
  }, {
    "heading": "window-manager-apposgo",
    "content": "9 workspaces with independent layouts"
  }, {
    "heading": "window-manager-apposgo",
    "content": "Tiling mode with master-stack algorithm"
  }, {
    "heading": "window-manager-apposgo",
    "content": "Mouse interaction state (dragging, resizing)"
  }, {
    "heading": "window-manager-apposgo",
    "content": "Keybind registry for customization"
  }, {
    "heading": "terminal-emulation-vt",
    "content": "Custom ANSI/VT100 emulator:"
  }, {
    "heading": "terminal-emulation-vt",
    "content": "Full CSI, OSC, ESC sequence support"
  }, {
    "heading": "terminal-emulation-vt",
    "content": "10,000 line scrollback buffer"
  }, {
    "heading": "terminal-emulation-vt",
    "content": "Bidirectional Unicode support"
  }, {
    "heading": "terminal-emulation-vt",
    "content": "SGR (color/style) attribute handling"
  }, {
    "heading": "terminal-emulation-vt",
    "content": "Alternative screen buffer (for vim, less, etc.)"
  }, {
    "heading": "rendering-engine-apprendergo",
    "content": "Layer-based composition:"
  }, {
    "heading": "rendering-engine-apprendergo",
    "content": "Window layers - Terminal content with borders"
  }, {
    "heading": "rendering-engine-apprendergo",
    "content": "Overlay layers - Help, logs, cache stats"
  }, {
    "heading": "rendering-engine-apprendergo",
    "content": "Dockbar - Window list and workspace indicator"
  }, {
    "heading": "rendering-engine-apprendergo",
    "content": "Mouse cursor - Selection and interaction feedback"
  }, {
    "heading": "rendering-engine-apprendergo",
    "content": "Optimizations:"
  }, {
    "heading": "rendering-engine-apprendergo",
    "content": "Viewport culling (skip off-screen windows)"
  }, {
    "heading": "rendering-engine-apprendergo",
    "content": "Style caching with LRU eviction"
  }, {
    "heading": "rendering-engine-apprendergo",
    "content": "Adaptive refresh rates (60Hz focused, 30Hz background)"
  }, {
    "heading": "rendering-engine-apprendergo",
    "content": "Frame skipping when no changes detected"
  }, {
    "heading": "input-system-input",
    "content": "Modal routing:"
  }, {
    "heading": "input-system-input",
    "content": "Window Management Mode - Navigate, create, tile"
  }, {
    "heading": "input-system-input",
    "content": "Terminal Mode - Input forwarded to PTY"
  }, {
    "heading": "input-system-input",
    "content": "Copy Mode - Vim-style scrollback navigation"
  }, {
    "heading": "input-system-input",
    "content": "Prefix Mode - Tmux-style leader key commands"
  }, {
    "heading": "input-system-input",
    "content": "100+ configurable keybindings across modes."
  }, {
    "heading": "configuration-config",
    "content": "TOML-based configuration:"
  }, {
    "heading": "configuration-config",
    "content": "Keybinding customization per section"
  }, {
    "heading": "configuration-config",
    "content": "Appearance options (borders, dockbar, scrollback)"
  }, {
    "heading": "configuration-config",
    "content": "Platform-specific defaults (macOS Option key)"
  }, {
    "heading": "configuration-config",
    "content": "Validation and auto-migration"
  }, {
    "heading": "style-caching",
    "content": "Two-tier caching strategy:"
  }, {
    "heading": "style-caching",
    "content": "Full render cache - Complete styled output (hash-based lookup)"
  }, {
    "heading": "style-caching",
    "content": "Optimized render cache - Partial updates for minor changes"
  }, {
    "heading": "style-caching",
    "content": "Benefits:"
  }, {
    "heading": "style-caching",
    "content": "40-60% allocation reduction"
  }, {
    "heading": "style-caching",
    "content": "LRU eviction (configurable size)"
  }, {
    "heading": "style-caching",
    "content": "Automatic invalidation on content changes"
  }, {
    "heading": "style-caching",
    "content": "See cache stats with Ctrl+B D c."
  }, {
    "heading": "viewport-culling",
    "content": "Only render visible windows:"
  }, {
    "heading": "viewport-culling",
    "content": "Off-screen windows skipped"
  }, {
    "heading": "viewport-culling",
    "content": "Minimized windows excluded"
  }, {
    "heading": "viewport-culling",
    "content": "Significant CPU savings with many windows"
  }, {
    "heading": "adaptive-refresh",
    "content": "60 FPS - Focused window in terminal mode"
  }, {
    "heading": "adaptive-refresh",
    "content": "30 FPS - Background windows"
  }, {
    "heading": "adaptive-refresh",
    "content": "Frame skipping - When no changes detected"
  }, {
    "heading": "memory-pooling",
    "content": "Reusable buffers for:"
  }, {
    "heading": "memory-pooling",
    "content": "String builders"
  }, {
    "heading": "memory-pooling",
    "content": "Style objects"
  }, {
    "heading": "memory-pooling",
    "content": "Screen buffers"
  }, {
    "heading": "ssh-server-architecture",
    "content": "Built on Wish v2 (SSH framework):"
  }, {
    "heading": "ssh-server-architecture",
    "content": "Per-connection isolation:"
  }, {
    "heading": "ssh-server-architecture",
    "content": "Each SSH session gets its own OS instance"
  }, {
    "heading": "ssh-server-architecture",
    "content": "Independent workspace and window state"
  }, {
    "heading": "ssh-server-architecture",
    "content": "No shared memory between sessions"
  }, {
    "heading": "ssh-server-architecture",
    "content": "Security:"
  }, {
    "heading": "ssh-server-architecture",
    "content": "Auto-generated host keys"
  }, {
    "heading": "ssh-server-architecture",
    "content": "Public key authentication support"
  }, {
    "heading": "ssh-server-architecture",
    "content": "No password auth by default"
  }, {
    "heading": "ssh-server-architecture",
    "content": "Usage:"
  }, {
    "heading": "tape-scripting-system",
    "content": "Domain-specific language for automation:"
  }, {
    "heading": "tape-scripting-system",
    "content": "Pipeline:"
  }, {
    "heading": "tape-scripting-system",
    "content": "Lexer (tape/lexer.go) - Tokenization"
  }, {
    "heading": "tape-scripting-system",
    "content": "Parser (tape/parser.go) - AST generation"
  }, {
    "heading": "tape-scripting-system",
    "content": "Executor (tape/executor.go) - Command execution"
  }, {
    "heading": "tape-scripting-system",
    "content": "Player (tape/player.go) - Playback engine with timing"
  }, {
    "heading": "tape-scripting-system",
    "content": "Commands:"
  }, {
    "heading": "tape-scripting-system",
    "content": "Mode switching (WindowManagementMode, TerminalMode)"
  }, {
    "heading": "tape-scripting-system",
    "content": "Window operations (NewWindow, CloseWindow, RenameWindow)"
  }, {
    "heading": "tape-scripting-system",
    "content": "Workspace management (SwitchWorkspace, MoveToWorkspace)"
  }, {
    "heading": "tape-scripting-system",
    "content": "Keyboard input (Type, Enter, Ctrl+X combinations)"
  }, {
    "heading": "tape-scripting-system",
    "content": "Timing (Sleep, WaitUntilRegex)"
  }, {
    "heading": "theme-system",
    "content": "300+ built-in themes using bubbletint:"
  }, {
    "heading": "theme-system",
    "content": "ANSI 16-color palette mapping"
  }, {
    "heading": "theme-system",
    "content": "SGR sequence translation"
  }, {
    "heading": "theme-system",
    "content": "Runtime theme switching"
  }, {
    "heading": "theme-system",
    "content": "Terminal color profile detection"
  }, {
    "heading": "theme-system",
    "content": "Usage:"
  }, {
    "heading": "bubble-tea-mvu",
    "content": "Model - app.OS struct holds all state"
  }, {
    "heading": "bubble-tea-mvu",
    "content": "View - render.go generates terminal output"
  }, {
    "heading": "bubble-tea-mvu",
    "content": "Update - update.go handles messages:"
  }, {
    "heading": "bubble-tea-mvu",
    "content": "tea.KeyMsg - Keyboard input"
  }, {
    "heading": "bubble-tea-mvu",
    "content": "tea.MouseMsg - Mouse events"
  }, {
    "heading": "bubble-tea-mvu",
    "content": "tea.WindowSizeMsg - Terminal resize"
  }, {
    "heading": "bubble-tea-mvu",
    "content": "Custom messages (window exit, PTY output)"
  }, {
    "heading": "message-flow",
    "content": "Flow Explanation:"
  }, {
    "heading": "message-flow",
    "content": "User Input - Keyboard or mouse event occurs"
  }, {
    "heading": "message-flow",
    "content": "Bubble Tea - Event system captures input"
  }, {
    "heading": "message-flow",
    "content": "input.HandleInput() - Central router receives event"
  }, {
    "heading": "message-flow",
    "content": "Modal Router - Determines mode and routes to handler"
  }, {
    "heading": "message-flow",
    "content": "OS.Update() - Handler modifies application state"
  }, {
    "heading": "message-flow",
    "content": "Render - Screen updates based on new state"
  }, {
    "heading": "window-lifecycle",
    "content": "Lifecycle Stages:"
  }, {
    "heading": "window-lifecycle",
    "content": "Creation - PTY spawned, shell launched"
  }, {
    "heading": "window-lifecycle",
    "content": "Monitor - Background goroutine reads output"
  }, {
    "heading": "window-lifecycle",
    "content": "Update - Terminal emulator processes ANSI sequences"
  }, {
    "heading": "window-lifecycle",
    "content": "Render - Screen displays content"
  }, {
    "heading": "window-lifecycle",
    "content": "Cleanup - On exit, PTY closed, resources freed"
  }, {
    "heading": "testing",
    "content": "Test coverage:"
  }, {
    "heading": "testing",
    "content": "Configuration validation"
  }, {
    "heading": "testing",
    "content": "Tape parsing and execution"
  }, {
    "heading": "testing",
    "content": "VT emulator sequences"
  }, {
    "heading": "testing",
    "content": "Style cache behavior"
  }, {
    "heading": "building-from-source",
    "content": "Requirements:"
  }, {
    "heading": "building-from-source",
    "content": "Go 1.24+"
  }, {
    "heading": "building-from-source",
    "content": "C compiler (for PTY support)"
  }, {
    "heading": "building-from-source",
    "content": "Nerd Font (for icons)"
  }, {
    "heading": "cross-platform-support",
    "content": "PTY implementation:"
  }, {
    "heading": "cross-platform-support",
    "content": "Unix: terminal/pty_unix.go (uses creack/pty)"
  }, {
    "heading": "cross-platform-support",
    "content": "Windows: terminal/pty_windows.go (uses ConPTY)"
  }, {
    "heading": "cross-platform-support",
    "content": "Window sizing:"
  }, {
    "heading": "cross-platform-support",
    "content": "Unix: terminal/window_unix.go (TIOCGWINSZ ioctl)"
  }, {
    "heading": "cross-platform-support",
    "content": "Windows: terminal/window_windows.go (Windows Console API)"
  }, {
    "heading": "cross-platform-support",
    "content": "System info:"
  }, {
    "heading": "cross-platform-support",
    "content": "macOS: system/sysinfo_darwin.go (sysctl)"
  }, {
    "heading": "cross-platform-support",
    "content": "Linux: system/sysinfo_linux.go (/proc, cgroups)"
  }, {
    "heading": "contributing",
    "content": "See CONTRIBUTING.md in the main repository."
  }],
  "headings": [{
    "id": "tech-stack",
    "content": "Tech Stack"
  }, {
    "id": "core-components",
    "content": "Core Components"
  }, {
    "id": "window-manager-apposgo",
    "content": "Window Manager (app/os.go)"
  }, {
    "id": "terminal-emulation-vt",
    "content": "Terminal Emulation (vt/)"
  }, {
    "id": "rendering-engine-apprendergo",
    "content": "Rendering Engine (app/render.go)"
  }, {
    "id": "input-system-input",
    "content": "Input System (input/)"
  }, {
    "id": "configuration-config",
    "content": "Configuration (config/)"
  }, {
    "id": "performance-optimizations",
    "content": "Performance Optimizations"
  }, {
    "id": "style-caching",
    "content": "Style Caching"
  }, {
    "id": "viewport-culling",
    "content": "Viewport Culling"
  }, {
    "id": "adaptive-refresh",
    "content": "Adaptive Refresh"
  }, {
    "id": "memory-pooling",
    "content": "Memory Pooling"
  }, {
    "id": "ssh-server-architecture",
    "content": "SSH Server Architecture"
  }, {
    "id": "tape-scripting-system",
    "content": "Tape Scripting System"
  }, {
    "id": "theme-system",
    "content": "Theme System"
  }, {
    "id": "development-patterns",
    "content": "Development Patterns"
  }, {
    "id": "bubble-tea-mvu",
    "content": "Bubble Tea MVU"
  }, {
    "id": "message-flow",
    "content": "Message Flow"
  }, {
    "id": "window-lifecycle",
    "content": "Window Lifecycle"
  }, {
    "id": "testing",
    "content": "Testing"
  }, {
    "id": "building-from-source",
    "content": "Building from Source"
  }, {
    "id": "cross-platform-support",
    "content": "Cross-Platform Support"
  }, {
    "id": "contributing",
    "content": "Contributing"
  }, {
    "id": "related-documentation",
    "content": "Related Documentation"
  }]
};
const toc$6 = [{
  depth: 2,
  url: "#tech-stack",
  title: jsx(Fragment, {
    children: "Tech Stack"
  })
}, {
  depth: 2,
  url: "#core-components",
  title: jsx(Fragment, {
    children: "Core Components"
  })
}, {
  depth: 3,
  url: "#window-manager-apposgo",
  title: jsx(Fragment, {
    children: "Window Manager (app/os.go)"
  })
}, {
  depth: 3,
  url: "#terminal-emulation-vt",
  title: jsx(Fragment, {
    children: "Terminal Emulation (vt/)"
  })
}, {
  depth: 3,
  url: "#rendering-engine-apprendergo",
  title: jsx(Fragment, {
    children: "Rendering Engine (app/render.go)"
  })
}, {
  depth: 3,
  url: "#input-system-input",
  title: jsx(Fragment, {
    children: "Input System (input/)"
  })
}, {
  depth: 3,
  url: "#configuration-config",
  title: jsx(Fragment, {
    children: "Configuration (config/)"
  })
}, {
  depth: 2,
  url: "#performance-optimizations",
  title: jsx(Fragment, {
    children: "Performance Optimizations"
  })
}, {
  depth: 3,
  url: "#style-caching",
  title: jsx(Fragment, {
    children: "Style Caching"
  })
}, {
  depth: 3,
  url: "#viewport-culling",
  title: jsx(Fragment, {
    children: "Viewport Culling"
  })
}, {
  depth: 3,
  url: "#adaptive-refresh",
  title: jsx(Fragment, {
    children: "Adaptive Refresh"
  })
}, {
  depth: 3,
  url: "#memory-pooling",
  title: jsx(Fragment, {
    children: "Memory Pooling"
  })
}, {
  depth: 2,
  url: "#ssh-server-architecture",
  title: jsx(Fragment, {
    children: "SSH Server Architecture"
  })
}, {
  depth: 2,
  url: "#tape-scripting-system",
  title: jsx(Fragment, {
    children: "Tape Scripting System"
  })
}, {
  depth: 2,
  url: "#theme-system",
  title: jsx(Fragment, {
    children: "Theme System"
  })
}, {
  depth: 2,
  url: "#development-patterns",
  title: jsx(Fragment, {
    children: "Development Patterns"
  })
}, {
  depth: 3,
  url: "#bubble-tea-mvu",
  title: jsx(Fragment, {
    children: "Bubble Tea MVU"
  })
}, {
  depth: 3,
  url: "#message-flow",
  title: jsx(Fragment, {
    children: "Message Flow"
  })
}, {
  depth: 3,
  url: "#window-lifecycle",
  title: jsx(Fragment, {
    children: "Window Lifecycle"
  })
}, {
  depth: 2,
  url: "#testing",
  title: jsx(Fragment, {
    children: "Testing"
  })
}, {
  depth: 2,
  url: "#building-from-source",
  title: jsx(Fragment, {
    children: "Building from Source"
  })
}, {
  depth: 2,
  url: "#cross-platform-support",
  title: jsx(Fragment, {
    children: "Cross-Platform Support"
  })
}, {
  depth: 2,
  url: "#contributing",
  title: jsx(Fragment, {
    children: "Contributing"
  })
}, {
  depth: 2,
  url: "#related-documentation",
  title: jsx(Fragment, {
    children: "Related Documentation"
  })
}];
function _createMdxContent$6(props) {
  const _components = {
    a: "a",
    code: "code",
    h2: "h2",
    h3: "h3",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  }, {Card, Cards, Mermaid} = _components;
  if (!Card) _missingMdxReference$5("Card");
  if (!Cards) _missingMdxReference$5("Cards");
  if (!Mermaid) _missingMdxReference$5("Mermaid");
  return jsxs(Fragment, {
    children: [jsx(_components.p, {
      children: "TUIOS is built on the Bubble Tea v2 framework following the Model-View-Update (MVU) pattern."
    }), "\n", jsx(_components.h2, {
      id: "tech-stack",
      children: "Tech Stack"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: jsx(_components.a, {
            href: "https://github.com/charmbracelet/bubbletea",
            children: "Bubble Tea v2"
          })
        }), " - Event-driven TUI framework"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: jsx(_components.a, {
            href: "https://github.com/charmbracelet/lipgloss",
            children: "Lipgloss v2"
          })
        }), " - Terminal styling with caching"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: jsx(_components.a, {
            href: "https://github.com/aymanbagabas/go-pty",
            children: "go-pty"
          })
        }), " - Cross-platform PTY interface"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: jsx(_components.a, {
            href: "https://github.com/charmbracelet/wish",
            children: "Wish v2"
          })
        }), " - SSH server framework"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: jsx(_components.a, {
            href: "https://github.com/spf13/cobra",
            children: "Cobra"
          })
        }), " - CLI framework"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Vendored VT emulator"
        }), " - Custom ANSI/VT100 terminal emulator"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "core-components",
      children: "Core Components"
    }), "\n", jsx(_components.h3, {
      id: "window-manager-apposgo",
      children: "Window Manager (app/os.go)"
    }), "\n", jsxs(_components.p, {
      children: ["The central ", jsx(_components.code, {
        children: "OS"
      }), " struct manages:"]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Window lifecycle (create, focus, close)"
      }), "\n", jsx(_components.li, {
        children: "9 workspaces with independent layouts"
      }), "\n", jsx(_components.li, {
        children: "Tiling mode with master-stack algorithm"
      }), "\n", jsx(_components.li, {
        children: "Mouse interaction state (dragging, resizing)"
      }), "\n", jsx(_components.li, {
        children: "Keybind registry for customization"
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "terminal-emulation-vt",
      children: "Terminal Emulation (vt/)"
    }), "\n", jsx(_components.p, {
      children: "Custom ANSI/VT100 emulator:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Full CSI, OSC, ESC sequence support"
      }), "\n", jsx(_components.li, {
        children: "10,000 line scrollback buffer"
      }), "\n", jsx(_components.li, {
        children: "Bidirectional Unicode support"
      }), "\n", jsx(_components.li, {
        children: "SGR (color/style) attribute handling"
      }), "\n", jsx(_components.li, {
        children: "Alternative screen buffer (for vim, less, etc.)"
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "rendering-engine-apprendergo",
      children: "Rendering Engine (app/render.go)"
    }), "\n", jsx(_components.p, {
      children: "Layer-based composition:"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Window layers"
        }), " - Terminal content with borders"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Overlay layers"
        }), " - Help, logs, cache stats"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Dockbar"
        }), " - Window list and workspace indicator"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Mouse cursor"
        }), " - Selection and interaction feedback"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Optimizations:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Viewport culling (skip off-screen windows)"
      }), "\n", jsx(_components.li, {
        children: "Style caching with LRU eviction"
      }), "\n", jsx(_components.li, {
        children: "Adaptive refresh rates (60Hz focused, 30Hz background)"
      }), "\n", jsx(_components.li, {
        children: "Frame skipping when no changes detected"
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "input-system-input",
      children: "Input System (input/)"
    }), "\n", jsx(_components.p, {
      children: "Modal routing:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Window Management Mode"
        }), " - Navigate, create, tile"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Terminal Mode"
        }), " - Input forwarded to PTY"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Copy Mode"
        }), " - Vim-style scrollback navigation"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Prefix Mode"
        }), " - Tmux-style leader key commands"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "100+ configurable keybindings across modes."
    }), "\n", jsx(_components.h3, {
      id: "configuration-config",
      children: "Configuration (config/)"
    }), "\n", jsx(_components.p, {
      children: "TOML-based configuration:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Keybinding customization per section"
      }), "\n", jsx(_components.li, {
        children: "Appearance options (borders, dockbar, scrollback)"
      }), "\n", jsx(_components.li, {
        children: "Platform-specific defaults (macOS Option key)"
      }), "\n", jsx(_components.li, {
        children: "Validation and auto-migration"
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "performance-optimizations",
      children: "Performance Optimizations"
    }), "\n", jsx(_components.h3, {
      id: "style-caching",
      children: "Style Caching"
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Two-tier caching strategy:"
      })
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Full render cache"
        }), " - Complete styled output (hash-based lookup)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Optimized render cache"
        }), " - Partial updates for minor changes"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Benefits:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "40-60% allocation reduction"
      }), "\n", jsx(_components.li, {
        children: "LRU eviction (configurable size)"
      }), "\n", jsx(_components.li, {
        children: "Automatic invalidation on content changes"
      }), "\n"]
    }), "\n", jsxs(_components.p, {
      children: ["See cache stats with ", jsx(_components.code, {
        children: "Ctrl+B D c"
      }), "."]
    }), "\n", jsx(_components.h3, {
      id: "viewport-culling",
      children: "Viewport Culling"
    }), "\n", jsx(_components.p, {
      children: "Only render visible windows:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Off-screen windows skipped"
      }), "\n", jsx(_components.li, {
        children: "Minimized windows excluded"
      }), "\n", jsx(_components.li, {
        children: "Significant CPU savings with many windows"
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "adaptive-refresh",
      children: "Adaptive Refresh"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "60 FPS"
        }), " - Focused window in terminal mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "30 FPS"
        }), " - Background windows"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Frame skipping"
        }), " - When no changes detected"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "memory-pooling",
      children: "Memory Pooling"
    }), "\n", jsx(_components.p, {
      children: "Reusable buffers for:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "String builders"
      }), "\n", jsx(_components.li, {
        children: "Style objects"
      }), "\n", jsx(_components.li, {
        children: "Screen buffers"
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "ssh-server-architecture",
      children: "SSH Server Architecture"
    }), "\n", jsx(_components.p, {
      children: "Built on Wish v2 (SSH framework):"
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Per-connection isolation:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Each SSH session gets its own OS instance"
      }), "\n", jsx(_components.li, {
        children: "Independent workspace and window state"
      }), "\n", jsx(_components.li, {
        children: "No shared memory between sessions"
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Security:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Auto-generated host keys"
      }), "\n", jsx(_components.li, {
        children: "Public key authentication support"
      }), "\n", jsx(_components.li, {
        children: "No password auth by default"
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Usage:"
      })
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ssh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --host"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 0.0.0.0"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --port"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 2222"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "ssh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -p"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 2222"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " user@hostname"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "tape-scripting-system",
      children: "Tape Scripting System"
    }), "\n", jsx(_components.p, {
      children: "Domain-specific language for automation:"
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Pipeline:"
      })
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Lexer"
        }), " (tape/lexer.go) - Tokenization"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Parser"
        }), " (tape/parser.go) - AST generation"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Executor"
        }), " (tape/executor.go) - Command execution"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Player"
        }), " (tape/player.go) - Playback engine with timing"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Commands:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Mode switching (WindowManagementMode, TerminalMode)"
      }), "\n", jsx(_components.li, {
        children: "Window operations (NewWindow, CloseWindow, RenameWindow)"
      }), "\n", jsx(_components.li, {
        children: "Workspace management (SwitchWorkspace, MoveToWorkspace)"
      }), "\n", jsx(_components.li, {
        children: "Keyboard input (Type, Enter, Ctrl+X combinations)"
      }), "\n", jsx(_components.li, {
        children: "Timing (Sleep, WaitUntilRegex)"
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "theme-system",
      children: "Theme System"
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "300+ built-in themes"
      }), " using ", jsx(_components.a, {
        href: "https://github.com/lrstanley/bubbletint",
        children: "bubbletint"
      }), ":"]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "ANSI 16-color palette mapping"
      }), "\n", jsx(_components.li, {
        children: "SGR sequence translation"
      }), "\n", jsx(_components.li, {
        children: "Runtime theme switching"
      }), "\n", jsx(_components.li, {
        children: "Terminal color profile detection"
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Usage:"
      })
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --theme"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " dracula"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --list-themes"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --preview-theme"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " nord"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "development-patterns",
      children: "Development Patterns"
    }), "\n", jsx(_components.h3, {
      id: "bubble-tea-mvu",
      children: "Bubble Tea MVU"
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Model"
      }), " - ", jsx(_components.code, {
        children: "app.OS"
      }), " struct holds all state"]
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "View"
      }), " - ", jsx(_components.code, {
        children: "render.go"
      }), " generates terminal output"]
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Update"
      }), " - ", jsx(_components.code, {
        children: "update.go"
      }), " handles messages:"]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "tea.KeyMsg"
        }), " - Keyboard input"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "tea.MouseMsg"
        }), " - Mouse events"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "tea.WindowSizeMsg"
        }), " - Terminal resize"]
      }), "\n", jsx(_components.li, {
        children: "Custom messages (window exit, PTY output)"
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "message-flow",
      children: "Message Flow"
    }), "\n", jsx(Mermaid, {
      chart: "graph TD\n    A[User Input] --> B[Bubble Tea Event]\n    B --> C[input.HandleInput]\n    C --> D{Modal Router}\n    D -->|Window Mode| E[Window Management]\n    D -->|Terminal Mode| F[PTY.Write]\n    D -->|Copy Mode| G[Selection/Navigation]\n    E --> H[OS.Update]\n    F --> H\n    G --> H\n    H --> I[Render View]"
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Flow Explanation:"
      })
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "User Input"
        }), " - Keyboard or mouse event occurs"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Bubble Tea"
        }), " - Event system captures input"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: jsx(_components.code, {
            children: "input.HandleInput()"
          })
        }), " - Central router receives event"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Modal Router"
        }), " - Determines mode and routes to handler"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: jsx(_components.code, {
            children: "OS.Update()"
          })
        }), " - Handler modifies application state"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Render"
        }), " - Screen updates based on new state"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "window-lifecycle",
      children: "Window Lifecycle"
    }), "\n", jsx(Mermaid, {
      chart: "flowchart LR\n    A[NewWindow] --> B[CreatePTY]\n    B --> C[StartShell]\n    C --> D[Monitor Output]\n    D --> E[Update Buffer]\n    E --> F[Render View]\n    F --> G{Exit?}\n    G -->|Yes| H[Cleanup]\n    G -->|No| D"
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Lifecycle Stages:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Creation"
        }), " - PTY spawned, shell launched"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Monitor"
        }), " - Background goroutine reads output"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Update"
        }), " - Terminal emulator processes ANSI sequences"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Render"
        }), " - Screen displays content"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Cleanup"
        }), " - On exit, PTY closed, resources freed"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "testing",
      children: "Testing"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Run all tests"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "go"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " test"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ./..."
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Run with race detection"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "go"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " test"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -race"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ./..."
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Specific package"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "go"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " test"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ./internal/config/..."
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "go"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " test"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ./internal/tape/..."
            })]
          })]
        })
      })
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Test coverage:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Configuration validation"
      }), "\n", jsx(_components.li, {
        children: "Tape parsing and execution"
      }), "\n", jsx(_components.li, {
        children: "VT emulator sequences"
      }), "\n", jsx(_components.li, {
        children: "Style cache behavior"
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "building-from-source",
      children: "Building from Source"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "git"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " clone"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " https://github.com/gaurav-gosain/tuios.git"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "cd"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tuios"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "go"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " build"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -o"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ./cmd/tuios"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "./tuios"
            })
          })]
        })
      })
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Requirements:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Go 1.24+"
      }), "\n", jsx(_components.li, {
        children: "C compiler (for PTY support)"
      }), "\n", jsx(_components.li, {
        children: "Nerd Font (for icons)"
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "cross-platform-support",
      children: "Cross-Platform Support"
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "PTY implementation:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: ["Unix: ", jsx(_components.code, {
          children: "terminal/pty_unix.go"
        }), " (uses ", jsx(_components.code, {
          children: "creack/pty"
        }), ")"]
      }), "\n", jsxs(_components.li, {
        children: ["Windows: ", jsx(_components.code, {
          children: "terminal/pty_windows.go"
        }), " (uses ConPTY)"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Window sizing:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: ["Unix: ", jsx(_components.code, {
          children: "terminal/window_unix.go"
        }), " (TIOCGWINSZ ioctl)"]
      }), "\n", jsxs(_components.li, {
        children: ["Windows: ", jsx(_components.code, {
          children: "terminal/window_windows.go"
        }), " (Windows Console API)"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "System info:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: ["macOS: ", jsx(_components.code, {
          children: "system/sysinfo_darwin.go"
        }), " (sysctl)"]
      }), "\n", jsxs(_components.li, {
        children: ["Linux: ", jsx(_components.code, {
          children: "system/sysinfo_linux.go"
        }), " (/proc, cgroups)"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "contributing",
      children: "Contributing"
    }), "\n", jsxs(_components.p, {
      children: ["See ", jsx(_components.a, {
        href: "https://github.com/Gaurav-Gosain/tuios/blob/main/docs/CONTRIBUTING.md",
        children: "CONTRIBUTING.md"
      }), " in the main repository."]
    }), "\n", jsx(_components.h2, {
      id: "related-documentation",
      children: "Related Documentation"
    }), "\n", jsxs(Cards, {
      children: [jsx(Card, {
        title: "Configuration",
        href: "/docs/configuration",
        description: "Customize TUIOS settings"
      }), jsx(Card, {
        title: "Tape Scripting",
        href: "/docs/tape-scripting",
        description: "Automate with tape files"
      }), jsx(Card, {
        title: "CLI Reference",
        href: "/docs/cli-reference",
        description: "Command-line options"
      })]
    })]
  });
}
function MDXContent$6(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$6, {
      ...props
    })
  }) : _createMdxContent$6(props);
}
function _missingMdxReference$5(id, component) {
  throw new Error("Expected " + ("component" ) + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
}

const __vite_glob_1_0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: MDXContent$6,
  frontmatter: frontmatter$6,
  structuredData: structuredData$6,
  toc: toc$6
}, Symbol.toStringTag, { value: 'Module' }));

let frontmatter$5 = {
  "title": "CLI Reference",
  "description": "Complete command-line reference for TUIOS",
  "icon": "Terminal"
};
let structuredData$5 = {
  "contents": [{
    "heading": undefined,
    "content": "Complete command-line interface reference for TUIOS."
  }, {
    "heading": "installation",
    "content": "See Getting Started for installation instructions."
  }, {
    "heading": "--theme",
    "content": "Set the color theme."
  }, {
    "heading": "--list-themes",
    "content": "List all available themes (300+)."
  }, {
    "heading": "--preview-theme",
    "content": "Preview a theme's colors."
  }, {
    "heading": "--preview-theme",
    "content": "Combine with fzf for interactive selection:"
  }, {
    "heading": "--debug",
    "content": "Enable debug logging."
  }, {
    "heading": "--ascii-only",
    "content": "Use ASCII characters instead of Nerd Font icons."
  }, {
    "heading": "--show-keys",
    "content": "Show pressed keys overlay (for demos and recordings)."
  }, {
    "heading": "--border-style",
    "content": "Set window border style."
  }, {
    "heading": "--border-style",
    "content": "Values: rounded, normal, thick, double, hidden, block, ascii, outer-half-block, inner-half-block"
  }, {
    "heading": "--dockbar-position",
    "content": "Set dockbar position."
  }, {
    "heading": "--dockbar-position",
    "content": "Values: bottom, top, hidden"
  }, {
    "heading": "--hide-window-buttons",
    "content": "Hide window control buttons."
  }, {
    "heading": "--scrollback-lines",
    "content": "Set scrollback buffer size (100-1000000)."
  }, {
    "heading": "--cpuprofile",
    "content": "Write CPU profile to file (for development)."
  }, {
    "heading": "ssh",
    "content": "Run TUIOS as an SSH server."
  }, {
    "heading": "ssh",
    "content": "Flags:"
  }, {
    "heading": "ssh",
    "content": "--port - SSH server port (default: 2222)"
  }, {
    "heading": "ssh",
    "content": "--host - SSH server host (default: localhost)"
  }, {
    "heading": "ssh",
    "content": "--key-path - Path to SSH host key (auto-generated if not specified)"
  }, {
    "heading": "ssh",
    "content": "Examples:"
  }, {
    "heading": "config",
    "content": "Manage TUIOS configuration."
  }, {
    "heading": "config-path",
    "content": "Print configuration file path."
  }, {
    "heading": "config-edit",
    "content": "Edit configuration in $EDITOR."
  }, {
    "heading": "config-reset",
    "content": "Reset configuration to defaults."
  }, {
    "heading": "keybinds",
    "content": "View keybinding configuration."
  }, {
    "heading": "keybinds-list",
    "content": "List all keybindings."
  }, {
    "heading": "keybinds-list-custom",
    "content": "List only customized keybindings."
  }, {
    "heading": "tape",
    "content": "Manage and run tape automation scripts."
  }, {
    "heading": "tape-play",
    "content": "Run a tape file in interactive mode."
  }, {
    "heading": "tape-play",
    "content": "Flags:"
  }, {
    "heading": "tape-play",
    "content": "-v, --visible - Show TUI during playback (default: true)"
  }, {
    "heading": "tape-validate",
    "content": "Validate tape file syntax."
  }, {
    "heading": "tape-list",
    "content": "List all saved tape recordings."
  }, {
    "heading": "tape-dir",
    "content": "Show tape recordings directory path."
  }, {
    "heading": "tape-show",
    "content": "Display contents of a tape file."
  }, {
    "heading": "tape-delete",
    "content": "Delete a tape recording."
  }, {
    "heading": "completion",
    "content": "Generate shell completion scripts."
  }, {
    "heading": "completion",
    "content": "Examples:"
  }, {
    "heading": "tuios_debug_internal",
    "content": "Enable internal debug logging (same as --debug flag)."
  }, {
    "heading": "editor--visual",
    "content": "Set editor for tuios config edit."
  }, {
    "heading": "xdg_config_home",
    "content": "Override config directory location."
  }, {
    "heading": "colorterm",
    "content": "Enable true color support (usually set automatically)."
  }, {
    "heading": "exit-codes",
    "content": "0 - Success"
  }, {
    "heading": "exit-codes",
    "content": "1 - Error (command failed, invalid arguments, etc.)"
  }],
  "headings": [{
    "id": "installation",
    "content": "Installation"
  }, {
    "id": "basic-usage",
    "content": "Basic Usage"
  }, {
    "id": "global-flags",
    "content": "Global Flags"
  }, {
    "id": "--theme",
    "content": "--theme"
  }, {
    "id": "--list-themes",
    "content": "--list-themes"
  }, {
    "id": "--preview-theme",
    "content": "--preview-theme"
  }, {
    "id": "--debug",
    "content": "--debug"
  }, {
    "id": "--ascii-only",
    "content": "--ascii-only"
  }, {
    "id": "--show-keys",
    "content": "--show-keys"
  }, {
    "id": "--border-style",
    "content": "--border-style"
  }, {
    "id": "--dockbar-position",
    "content": "--dockbar-position"
  }, {
    "id": "--hide-window-buttons",
    "content": "--hide-window-buttons"
  }, {
    "id": "--scrollback-lines",
    "content": "--scrollback-lines"
  }, {
    "id": "--cpuprofile",
    "content": "--cpuprofile"
  }, {
    "id": "commands",
    "content": "Commands"
  }, {
    "id": "ssh",
    "content": "ssh"
  }, {
    "id": "config",
    "content": "config"
  }, {
    "id": "config-path",
    "content": "config path"
  }, {
    "id": "config-edit",
    "content": "config edit"
  }, {
    "id": "config-reset",
    "content": "config reset"
  }, {
    "id": "keybinds",
    "content": "keybinds"
  }, {
    "id": "keybinds-list",
    "content": "keybinds list"
  }, {
    "id": "keybinds-list-custom",
    "content": "keybinds list-custom"
  }, {
    "id": "tape",
    "content": "tape"
  }, {
    "id": "tape-play",
    "content": "tape play"
  }, {
    "id": "tape-validate",
    "content": "tape validate"
  }, {
    "id": "tape-list",
    "content": "tape list"
  }, {
    "id": "tape-dir",
    "content": "tape dir"
  }, {
    "id": "tape-show",
    "content": "tape show"
  }, {
    "id": "tape-delete",
    "content": "tape delete"
  }, {
    "id": "completion",
    "content": "completion"
  }, {
    "id": "environment-variables",
    "content": "Environment Variables"
  }, {
    "id": "tuios_debug_internal",
    "content": "TUIOS_DEBUG_INTERNAL"
  }, {
    "id": "editor--visual",
    "content": "EDITOR / VISUAL"
  }, {
    "id": "xdg_config_home",
    "content": "XDG_CONFIG_HOME"
  }, {
    "id": "colorterm",
    "content": "COLORTERM"
  }, {
    "id": "exit-codes",
    "content": "Exit Codes"
  }, {
    "id": "examples",
    "content": "Examples"
  }, {
    "id": "run-with-custom-theme-and-border",
    "content": "Run with custom theme and border"
  }, {
    "id": "start-ssh-server-for-remote-access",
    "content": "Start SSH server for remote access"
  }, {
    "id": "run-tape-automation",
    "content": "Run tape automation"
  }, {
    "id": "edit-configuration",
    "content": "Edit configuration"
  }, {
    "id": "list-custom-keybindings",
    "content": "List custom keybindings"
  }, {
    "id": "related-documentation",
    "content": "Related Documentation"
  }]
};
const toc$5 = [{
  depth: 2,
  url: "#installation",
  title: jsx(Fragment, {
    children: "Installation"
  })
}, {
  depth: 2,
  url: "#basic-usage",
  title: jsx(Fragment, {
    children: "Basic Usage"
  })
}, {
  depth: 2,
  url: "#global-flags",
  title: jsx(Fragment, {
    children: "Global Flags"
  })
}, {
  depth: 3,
  url: "#--theme",
  title: jsx(Fragment, {
    children: "--theme"
  })
}, {
  depth: 3,
  url: "#--list-themes",
  title: jsx(Fragment, {
    children: "--list-themes"
  })
}, {
  depth: 3,
  url: "#--preview-theme",
  title: jsx(Fragment, {
    children: "--preview-theme"
  })
}, {
  depth: 3,
  url: "#--debug",
  title: jsx(Fragment, {
    children: "--debug"
  })
}, {
  depth: 3,
  url: "#--ascii-only",
  title: jsx(Fragment, {
    children: "--ascii-only"
  })
}, {
  depth: 3,
  url: "#--show-keys",
  title: jsx(Fragment, {
    children: "--show-keys"
  })
}, {
  depth: 3,
  url: "#--border-style",
  title: jsx(Fragment, {
    children: "--border-style"
  })
}, {
  depth: 3,
  url: "#--dockbar-position",
  title: jsx(Fragment, {
    children: "--dockbar-position"
  })
}, {
  depth: 3,
  url: "#--hide-window-buttons",
  title: jsx(Fragment, {
    children: "--hide-window-buttons"
  })
}, {
  depth: 3,
  url: "#--scrollback-lines",
  title: jsx(Fragment, {
    children: "--scrollback-lines"
  })
}, {
  depth: 3,
  url: "#--cpuprofile",
  title: jsx(Fragment, {
    children: "--cpuprofile"
  })
}, {
  depth: 2,
  url: "#commands",
  title: jsx(Fragment, {
    children: "Commands"
  })
}, {
  depth: 3,
  url: "#ssh",
  title: jsx(Fragment, {
    children: "ssh"
  })
}, {
  depth: 3,
  url: "#config",
  title: jsx(Fragment, {
    children: "config"
  })
}, {
  depth: 4,
  url: "#config-path",
  title: jsx(Fragment, {
    children: "config path"
  })
}, {
  depth: 4,
  url: "#config-edit",
  title: jsx(Fragment, {
    children: "config edit"
  })
}, {
  depth: 4,
  url: "#config-reset",
  title: jsx(Fragment, {
    children: "config reset"
  })
}, {
  depth: 3,
  url: "#keybinds",
  title: jsx(Fragment, {
    children: "keybinds"
  })
}, {
  depth: 4,
  url: "#keybinds-list",
  title: jsx(Fragment, {
    children: "keybinds list"
  })
}, {
  depth: 4,
  url: "#keybinds-list-custom",
  title: jsx(Fragment, {
    children: "keybinds list-custom"
  })
}, {
  depth: 3,
  url: "#tape",
  title: jsx(Fragment, {
    children: "tape"
  })
}, {
  depth: 4,
  url: "#tape-play",
  title: jsx(Fragment, {
    children: "tape play"
  })
}, {
  depth: 4,
  url: "#tape-validate",
  title: jsx(Fragment, {
    children: "tape validate"
  })
}, {
  depth: 4,
  url: "#tape-list",
  title: jsx(Fragment, {
    children: "tape list"
  })
}, {
  depth: 4,
  url: "#tape-dir",
  title: jsx(Fragment, {
    children: "tape dir"
  })
}, {
  depth: 4,
  url: "#tape-show",
  title: jsx(Fragment, {
    children: "tape show"
  })
}, {
  depth: 4,
  url: "#tape-delete",
  title: jsx(Fragment, {
    children: "tape delete"
  })
}, {
  depth: 3,
  url: "#completion",
  title: jsx(Fragment, {
    children: "completion"
  })
}, {
  depth: 2,
  url: "#environment-variables",
  title: jsx(Fragment, {
    children: "Environment Variables"
  })
}, {
  depth: 3,
  url: "#tuios_debug_internal",
  title: jsx(Fragment, {
    children: "TUIOS_DEBUG_INTERNAL"
  })
}, {
  depth: 3,
  url: "#editor--visual",
  title: jsx(Fragment, {
    children: "EDITOR / VISUAL"
  })
}, {
  depth: 3,
  url: "#xdg_config_home",
  title: jsx(Fragment, {
    children: "XDG_CONFIG_HOME"
  })
}, {
  depth: 3,
  url: "#colorterm",
  title: jsx(Fragment, {
    children: "COLORTERM"
  })
}, {
  depth: 2,
  url: "#exit-codes",
  title: jsx(Fragment, {
    children: "Exit Codes"
  })
}, {
  depth: 2,
  url: "#examples",
  title: jsx(Fragment, {
    children: "Examples"
  })
}, {
  depth: 3,
  url: "#run-with-custom-theme-and-border",
  title: jsx(Fragment, {
    children: "Run with custom theme and border"
  })
}, {
  depth: 3,
  url: "#start-ssh-server-for-remote-access",
  title: jsx(Fragment, {
    children: "Start SSH server for remote access"
  })
}, {
  depth: 3,
  url: "#run-tape-automation",
  title: jsx(Fragment, {
    children: "Run tape automation"
  })
}, {
  depth: 3,
  url: "#edit-configuration",
  title: jsx(Fragment, {
    children: "Edit configuration"
  })
}, {
  depth: 3,
  url: "#list-custom-keybindings",
  title: jsx(Fragment, {
    children: "List custom keybindings"
  })
}, {
  depth: 2,
  url: "#related-documentation",
  title: jsx(Fragment, {
    children: "Related Documentation"
  })
}];
function _createMdxContent$5(props) {
  const _components = {
    a: "a",
    code: "code",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    li: "li",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  }, {Card, Cards} = _components;
  if (!Card) _missingMdxReference$4("Card");
  if (!Cards) _missingMdxReference$4("Cards");
  return jsxs(Fragment, {
    children: [jsx(_components.p, {
      children: "Complete command-line interface reference for TUIOS."
    }), "\n", jsx(_components.h2, {
      id: "installation",
      children: "Installation"
    }), "\n", jsxs(_components.p, {
      children: ["See ", jsx(_components.a, {
        href: "/docs/getting-started",
        children: "Getting Started"
      }), " for installation instructions."]
    }), "\n", jsx(_components.h2, {
      id: "basic-usage",
      children: "Basic Usage"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " [flags]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " [command] [flags]"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "global-flags",
      children: "Global Flags"
    }), "\n", jsx(_components.h3, {
      id: "--theme",
      children: "--theme"
    }), "\n", jsx(_components.p, {
      children: "Set the color theme."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --theme"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " dracula"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --theme"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " nord"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --theme"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tokyonight"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "--list-themes",
      children: "--list-themes"
    }), "\n", jsx(_components.p, {
      children: "List all available themes (300+)."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --list-themes"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "--preview-theme",
      children: "--preview-theme"
    }), "\n", jsx(_components.p, {
      children: "Preview a theme's colors."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --preview-theme"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " dracula"
            })]
          })
        })
      })
    }), "\n", jsx(_components.p, {
      children: "Combine with fzf for interactive selection:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --theme"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " $("
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --list-themes"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " |"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: " fzf"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --preview"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 'tuios --preview-theme {}'"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ")"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "--debug",
      children: "--debug"
    }), "\n", jsx(_components.p, {
      children: "Enable debug logging."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --debug"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "--ascii-only",
      children: "--ascii-only"
    }), "\n", jsx(_components.p, {
      children: "Use ASCII characters instead of Nerd Font icons."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --ascii-only"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "--show-keys",
      children: "--show-keys"
    }), "\n", jsx(_components.p, {
      children: "Show pressed keys overlay (for demos and recordings)."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --show-keys"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "--border-style",
      children: "--border-style"
    }), "\n", jsx(_components.p, {
      children: "Set window border style."
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Values:"
      }), " ", jsx(_components.code, {
        children: "rounded"
      }), ", ", jsx(_components.code, {
        children: "normal"
      }), ", ", jsx(_components.code, {
        children: "thick"
      }), ", ", jsx(_components.code, {
        children: "double"
      }), ", ", jsx(_components.code, {
        children: "hidden"
      }), ", ", jsx(_components.code, {
        children: "block"
      }), ", ", jsx(_components.code, {
        children: "ascii"
      }), ", ", jsx(_components.code, {
        children: "outer-half-block"
      }), ", ", jsx(_components.code, {
        children: "inner-half-block"
      })]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --border-style"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " thick"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --border-style"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " hidden"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "--dockbar-position",
      children: "--dockbar-position"
    }), "\n", jsx(_components.p, {
      children: "Set dockbar position."
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Values:"
      }), " ", jsx(_components.code, {
        children: "bottom"
      }), ", ", jsx(_components.code, {
        children: "top"
      }), ", ", jsx(_components.code, {
        children: "hidden"
      })]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --dockbar-position"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " top"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --dockbar-position"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " hidden"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "--hide-window-buttons",
      children: "--hide-window-buttons"
    }), "\n", jsx(_components.p, {
      children: "Hide window control buttons."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --hide-window-buttons"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "--scrollback-lines",
      children: "--scrollback-lines"
    }), "\n", jsx(_components.p, {
      children: "Set scrollback buffer size (100-1000000)."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --scrollback-lines"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 20000"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "--cpuprofile",
      children: "--cpuprofile"
    }), "\n", jsx(_components.p, {
      children: "Write CPU profile to file (for development)."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --cpuprofile"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " cpu.prof"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "commands",
      children: "Commands"
    }), "\n", jsx(_components.h3, {
      id: "ssh",
      children: "ssh"
    }), "\n", jsx(_components.p, {
      children: "Run TUIOS as an SSH server."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ssh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " [flags]"
            })]
          })
        })
      })
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Flags:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "--port"
        }), " - SSH server port (default: 2222)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "--host"
        }), " - SSH server host (default: localhost)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "--key-path"
        }), " - Path to SSH host key (auto-generated if not specified)"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Examples:"
      })
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Start on default port"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ssh"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Custom port"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ssh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --port"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 8022"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Listen on all interfaces"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ssh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --host"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 0.0.0.0"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --port"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 2222"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Connect from another machine"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "ssh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -p"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 2222"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " user@hostname"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "config",
      children: "config"
    }), "\n", jsx(_components.p, {
      children: "Manage TUIOS configuration."
    }), "\n", jsx(_components.h4, {
      id: "config-path",
      children: "config path"
    }), "\n", jsx(_components.p, {
      children: "Print configuration file path."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " path"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h4, {
      id: "config-edit",
      children: "config edit"
    }), "\n", jsx(_components.p, {
      children: "Edit configuration in $EDITOR."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " edit"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h4, {
      id: "config-reset",
      children: "config reset"
    }), "\n", jsx(_components.p, {
      children: "Reset configuration to defaults."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " reset"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "keybinds",
      children: "keybinds"
    }), "\n", jsx(_components.p, {
      children: "View keybinding configuration."
    }), "\n", jsx(_components.h4, {
      id: "keybinds-list",
      children: "keybinds list"
    }), "\n", jsx(_components.p, {
      children: "List all keybindings."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " keybinds"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " list"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h4, {
      id: "keybinds-list-custom",
      children: "keybinds list-custom"
    }), "\n", jsx(_components.p, {
      children: "List only customized keybindings."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " keybinds"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " list-custom"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "tape",
      children: "tape"
    }), "\n", jsx(_components.p, {
      children: "Manage and run tape automation scripts."
    }), "\n", jsx(_components.h4, {
      id: "tape-play",
      children: "tape play"
    }), "\n", jsx(_components.p, {
      children: "Run a tape file in interactive mode."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tape"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " play"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " <"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "file.tap"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "e"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: ">"
            })]
          })
        })
      })
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Flags:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "-v"
        }), ", ", jsx(_components.code, {
          children: "--visible"
        }), " - Show TUI during playback (default: true)"]
      }), "\n"]
    }), "\n", jsx(_components.h4, {
      id: "tape-validate",
      children: "tape validate"
    }), "\n", jsx(_components.p, {
      children: "Validate tape file syntax."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tape"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " validate"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " <"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "file.tap"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "e"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: ">"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h4, {
      id: "tape-list",
      children: "tape list"
    }), "\n", jsx(_components.p, {
      children: "List all saved tape recordings."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tape"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " list"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h4, {
      id: "tape-dir",
      children: "tape dir"
    }), "\n", jsx(_components.p, {
      children: "Show tape recordings directory path."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tape"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " dir"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h4, {
      id: "tape-show",
      children: "tape show"
    }), "\n", jsx(_components.p, {
      children: "Display contents of a tape file."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tape"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " show"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " <"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "nam"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "e"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: ">"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h4, {
      id: "tape-delete",
      children: "tape delete"
    }), "\n", jsx(_components.p, {
      children: "Delete a tape recording."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tape"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " delete"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " <"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "nam"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "e"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: ">"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "completion",
      children: "completion"
    }), "\n", jsx(_components.p, {
      children: "Generate shell completion scripts."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " completion"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " [bash"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "|"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "zsh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "|"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "fish"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "|"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "powershell]"
            })]
          })
        })
      })
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Examples:"
      })
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Bash"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " completion"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " bash"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " >"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " /etc/bash_completion.d/tuios"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Zsh"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " completion"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " zsh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " >"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"${"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "fpath"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "[1]}/_tuios\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Fish"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " completion"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " fish"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " >"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ~/.config/fish/completions/tuios.fish"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# PowerShell"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " completion"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " powershell"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " >"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tuios.ps1"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "environment-variables",
      children: "Environment Variables"
    }), "\n", jsx(_components.h3, {
      id: "tuios_debug_internal",
      children: "TUIOS_DEBUG_INTERNAL"
    }), "\n", jsx(_components.p, {
      children: "Enable internal debug logging (same as --debug flag)."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "export"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " TUIOS_DEBUG_INTERNAL"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "="
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "1"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "editor--visual",
      children: "EDITOR / VISUAL"
    }), "\n", jsxs(_components.p, {
      children: ["Set editor for ", jsx(_components.code, {
        children: "tuios config edit"
      }), "."]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "export"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " EDITOR"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "="
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "vim"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " edit"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "xdg_config_home",
      children: "XDG_CONFIG_HOME"
    }), "\n", jsx(_components.p, {
      children: "Override config directory location."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "export"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " XDG_CONFIG_HOME"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "=~"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "/.custom_config"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " path"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "colorterm",
      children: "COLORTERM"
    }), "\n", jsx(_components.p, {
      children: "Enable true color support (usually set automatically)."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "export"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " COLORTERM"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "="
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "truecolor"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "exit-codes",
      children: "Exit Codes"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "0"
        }), " - Success"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "1"
        }), " - Error (command failed, invalid arguments, etc.)"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "examples",
      children: "Examples"
    }), "\n", jsx(_components.h3, {
      id: "run-with-custom-theme-and-border",
      children: "Run with custom theme and border"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --theme"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " dracula"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --border-style"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " thick"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "start-ssh-server-for-remote-access",
      children: "Start SSH server for remote access"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ssh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --host"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 0.0.0.0"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --port"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 2222"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "run-tape-automation",
      children: "Run tape automation"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tape"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " play"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " examples/demo.tape"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "edit-configuration",
      children: "Edit configuration"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " edit"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "list-custom-keybindings",
      children: "List custom keybindings"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " keybinds"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " list-custom"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "related-documentation",
      children: "Related Documentation"
    }), "\n", jsxs(Cards, {
      children: [jsx(Card, {
        title: "Configuration",
        href: "/docs/configuration",
        description: "Configure TUIOS settings"
      }), jsx(Card, {
        title: "Tape Scripting",
        href: "/docs/tape-scripting",
        description: "Automate workflows with tapes"
      }), jsx(Card, {
        title: "Keybindings",
        href: "/docs/keybindings",
        description: "Keyboard shortcuts reference"
      })]
    })]
  });
}
function MDXContent$5(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$5, {
      ...props
    })
  }) : _createMdxContent$5(props);
}
function _missingMdxReference$4(id, component) {
  throw new Error("Expected " + ("component" ) + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
}

const __vite_glob_1_1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: MDXContent$5,
  frontmatter: frontmatter$5,
  structuredData: structuredData$5,
  toc: toc$5
}, Symbol.toStringTag, { value: 'Module' }));

let frontmatter$4 = {
  "title": "Configuration",
  "description": "Customize TUIOS keybindings and appearance",
  "icon": "Settings"
};
let structuredData$4 = {
  "contents": [{
    "heading": undefined,
    "content": "TUIOS supports user-configurable keybindings and appearance through a TOML configuration file, following the XDG Base Directory specification."
  }, {
    "heading": "configuration-file-location",
    "content": "Default path: ~/.config/tuios/config.toml"
  }, {
    "heading": "configuration-file-location",
    "content": "On first launch, TUIOS automatically creates a default configuration file. The exact location follows the XDG Base Directory specification:"
  }, {
    "heading": "configuration-file-location",
    "content": "Linux/macOS: ~/.config/tuios/config.toml"
  }, {
    "heading": "configuration-file-location",
    "content": "Custom: $XDG_CONFIG_HOME/tuios/config.toml (if XDG_CONFIG_HOME is set)"
  }, {
    "heading": "configuration-structure",
    "content": "The configuration file uses TOML format with the following structure:"
  }, {
    "heading": "minimal-configuration-recommended",
    "content": "You only need to specify what you want to customize. TUIOS automatically fills in missing keybindings with defaults:"
  }, {
    "heading": "minimal-configuration-recommended",
    "content": "Benefits:"
  }, {
    "heading": "minimal-configuration-recommended",
    "content": "Shorter, cleaner configuration"
  }, {
    "heading": "minimal-configuration-recommended",
    "content": "Automatic updates when new features are added"
  }, {
    "heading": "minimal-configuration-recommended",
    "content": "Easy to see what you've customized"
  }, {
    "heading": "minimal-configuration-recommended",
    "content": "Less maintenance required"
  }, {
    "heading": "appearance-configuration",
    "content": "The [appearance] section controls the visual presentation of TUIOS."
  }, {
    "heading": "border_style",
    "content": "Controls the style of window borders."
  }, {
    "heading": "border_style",
    "content": "Valid values:"
  }, {
    "heading": "border_style",
    "content": "\"rounded\" - Rounded corners (default)"
  }, {
    "heading": "border_style",
    "content": "\"normal\" - Standard straight borders"
  }, {
    "heading": "border_style",
    "content": "\"thick\" - Bold/thick borders"
  }, {
    "heading": "border_style",
    "content": "\"double\" - Double-line borders"
  }, {
    "heading": "border_style",
    "content": "\"hidden\" - No borders (automatically hides window buttons)"
  }, {
    "heading": "border_style",
    "content": "\"block\" - Block-style borders"
  }, {
    "heading": "border_style",
    "content": "\"ascii\" - ASCII-only characters for compatibility"
  }, {
    "heading": "border_style",
    "content": "\"outer-half-block\" - Half-block style (outer)"
  }, {
    "heading": "border_style",
    "content": "\"inner-half-block\" - Half-block style (inner)"
  }, {
    "heading": "border_style",
    "content": "CLI override: --border-style <style>"
  }, {
    "heading": "dockbar_position",
    "content": "Controls the position of the dockbar."
  }, {
    "heading": "dockbar_position",
    "content": "Valid values:"
  }, {
    "heading": "dockbar_position",
    "content": "\"bottom\" - Position dockbar at the bottom (default)"
  }, {
    "heading": "dockbar_position",
    "content": "\"top\" - Position dockbar at the top"
  }, {
    "heading": "dockbar_position",
    "content": "\"hidden\" - Hide dockbar"
  }, {
    "heading": "dockbar_position",
    "content": "CLI override: --dockbar-position <position>"
  }, {
    "heading": "hide_window_buttons",
    "content": "Controls whether window control buttons (minimize, maximize, close) are displayed in the title bar."
  }, {
    "heading": "hide_window_buttons",
    "content": "Default: false"
  }, {
    "heading": "hide_window_buttons",
    "content": "CLI override: --hide-window-buttons"
  }, {
    "heading": "scrollback_lines",
    "content": "Controls the number of lines stored in the scrollback buffer for each terminal window."
  }, {
    "heading": "scrollback_lines",
    "content": "Valid values: Integer between 100 and 1,000,000"
  }, {
    "heading": "scrollback_lines",
    "content": "Default: 10000"
  }, {
    "heading": "scrollback_lines",
    "content": "CLI override: --scrollback-lines <number>"
  }, {
    "heading": "leader_key",
    "content": "Controls the prefix key for window management commands (the tmux-style leader key)."
  }, {
    "heading": "leader_key",
    "content": "Default: \"ctrl+b\""
  }, {
    "heading": "leader_key",
    "content": "Examples:"
  }, {
    "heading": "window_management",
    "content": "Window creation, navigation, and control."
  }, {
    "heading": "window_management",
    "content": "Available actions:"
  }, {
    "heading": "window_management",
    "content": "new_window - Create new terminal window"
  }, {
    "heading": "window_management",
    "content": "close_window - Close focused window"
  }, {
    "heading": "window_management",
    "content": "rename_window - Rename focused window"
  }, {
    "heading": "window_management",
    "content": "minimize_window - Minimize focused window"
  }, {
    "heading": "window_management",
    "content": "restore_all - Restore all minimized windows"
  }, {
    "heading": "window_management",
    "content": "next_window - Focus next window"
  }, {
    "heading": "window_management",
    "content": "prev_window - Focus previous window"
  }, {
    "heading": "window_management",
    "content": "select_window_1 through select_window_9 - Select window by number"
  }, {
    "heading": "workspaces",
    "content": "Workspace switching and window movement."
  }, {
    "heading": "workspaces",
    "content": "Available actions:"
  }, {
    "heading": "workspaces",
    "content": "switch_workspace_1 through switch_workspace_9 - Switch to workspace N"
  }, {
    "heading": "workspaces",
    "content": "move_and_follow_1 through move_and_follow_9 - Move window to workspace N and follow"
  }, {
    "heading": "layout",
    "content": "Window positioning and tiling."
  }, {
    "heading": "layout",
    "content": "Available actions:"
  }, {
    "heading": "layout",
    "content": "snap_left, snap_right, snap_fullscreen, unsnap"
  }, {
    "heading": "layout",
    "content": "snap_corner_1 through snap_corner_4 - Snap to corners"
  }, {
    "heading": "layout",
    "content": "toggle_tiling - Toggle automatic tiling mode"
  }, {
    "heading": "layout",
    "content": "swap_left, swap_right, swap_up, swap_down - Swap windows"
  }, {
    "heading": "layout",
    "content": "Resize commands for tiling mode"
  }, {
    "heading": "mode_control",
    "content": "Mode switching and application control."
  }, {
    "heading": "mode_control",
    "content": "Available actions:"
  }, {
    "heading": "mode_control",
    "content": "enter_terminal_mode - Enter terminal mode"
  }, {
    "heading": "mode_control",
    "content": "enter_window_mode - Enter window management mode"
  }, {
    "heading": "mode_control",
    "content": "toggle_help - Toggle help overlay"
  }, {
    "heading": "mode_control",
    "content": "quit - Quit TUIOS"
  }, {
    "heading": "modifier-keys",
    "content": "Supported modifiers:"
  }, {
    "heading": "modifier-keys",
    "content": "ctrl+ - Control key"
  }, {
    "heading": "modifier-keys",
    "content": "alt+ - Alt key"
  }, {
    "heading": "modifier-keys",
    "content": "shift+ - Shift key"
  }, {
    "heading": "modifier-keys",
    "content": "opt+, option+ - Option key (macOS only)"
  }, {
    "heading": "modifier-keys",
    "content": "Not supported:"
  }, {
    "heading": "modifier-keys",
    "content": "cmd+, super+ - Not supported (typically captured by OS)"
  }, {
    "heading": "special-keys",
    "content": "enter, return, esc, escape, tab, space"
  }, {
    "heading": "special-keys",
    "content": "backspace, delete"
  }, {
    "heading": "special-keys",
    "content": "up, down, left, right"
  }, {
    "heading": "special-keys",
    "content": "home, end, pgup, pgdown"
  }, {
    "heading": "special-keys",
    "content": "f1 through f12"
  }, {
    "heading": "multiple-keybindings",
    "content": "Bind multiple keys to the same action:"
  }, {
    "heading": "removing-keybindings",
    "content": "Use an empty array to disable a keybinding:"
  }, {
    "heading": "macos",
    "content": "On macOS, TUIOS supports the Option key."
  }, {
    "heading": "macos",
    "content": "Default workspace switching:"
  }, {
    "heading": "macos",
    "content": "Equivalent notations:"
  }, {
    "heading": "macos",
    "content": "opt+1 - Recommended (Mac-friendly)"
  }, {
    "heading": "macos",
    "content": "option+1 - Also supported"
  }, {
    "heading": "macos",
    "content": "alt+1 - Works but less intuitive for Mac users"
  }, {
    "heading": "linuxother-platforms",
    "content": "Use standard modifiers only:"
  }, {
    "heading": "linuxother-platforms",
    "content": "alt+1, ctrl+1, etc."
  }, {
    "heading": "linuxother-platforms",
    "content": "opt+ and option+ are not valid"
  }, {
    "heading": "configuration-not-loading",
    "content": "Check file location:"
  }, {
    "heading": "configuration-not-loading",
    "content": "Verify TOML syntax"
  }, {
    "heading": "configuration-not-loading",
    "content": "Check startup logs:"
  }, {
    "heading": "invalid-key-syntax",
    "content": "Common errors:"
  }, {
    "heading": "invalid-key-syntax",
    "content": "\"cmd+t\" - cmd/super not supported"
  }, {
    "heading": "invalid-key-syntax",
    "content": "\"opt+1\" on Linux - opt only valid on macOS"
  }, {
    "heading": "invalid-key-syntax",
    "content": "\"ctrl+\" - incomplete combination"
  }, {
    "heading": "applying-changes",
    "content": "Configuration is loaded on startup. To apply changes:"
  }, {
    "heading": "applying-changes",
    "content": "Edit configuration"
  }, {
    "heading": "applying-changes",
    "content": "Quit TUIOS"
  }, {
    "heading": "applying-changes",
    "content": "Restart TUIOS"
  }],
  "headings": [{
    "id": "quick-start",
    "content": "Quick Start"
  }, {
    "id": "find-your-configuration",
    "content": "Find Your Configuration"
  }, {
    "id": "edit-configuration",
    "content": "Edit Configuration"
  }, {
    "id": "view-current-keybindings",
    "content": "View Current Keybindings"
  }, {
    "id": "reset-to-defaults",
    "content": "Reset to Defaults"
  }, {
    "id": "configuration-file-location",
    "content": "Configuration File Location"
  }, {
    "id": "configuration-structure",
    "content": "Configuration Structure"
  }, {
    "id": "minimal-configuration-recommended",
    "content": "Minimal Configuration (Recommended)"
  }, {
    "id": "appearance-configuration",
    "content": "Appearance Configuration"
  }, {
    "id": "border_style",
    "content": "border_style"
  }, {
    "id": "dockbar_position",
    "content": "dockbar_position"
  }, {
    "id": "hide_window_buttons",
    "content": "hide_window_buttons"
  }, {
    "id": "scrollback_lines",
    "content": "scrollback_lines"
  }, {
    "id": "keybindings-configuration",
    "content": "Keybindings Configuration"
  }, {
    "id": "leader_key",
    "content": "leader_key"
  }, {
    "id": "keybinding-sections",
    "content": "Keybinding Sections"
  }, {
    "id": "window_management",
    "content": "window_management"
  }, {
    "id": "workspaces",
    "content": "workspaces"
  }, {
    "id": "layout",
    "content": "layout"
  }, {
    "id": "mode_control",
    "content": "mode_control"
  }, {
    "id": "key-syntax",
    "content": "Key Syntax"
  }, {
    "id": "modifier-keys",
    "content": "Modifier Keys"
  }, {
    "id": "special-keys",
    "content": "Special Keys"
  }, {
    "id": "key-combinations",
    "content": "Key Combinations"
  }, {
    "id": "multiple-keybindings",
    "content": "Multiple Keybindings"
  }, {
    "id": "removing-keybindings",
    "content": "Removing Keybindings"
  }, {
    "id": "platform-specific-configuration",
    "content": "Platform-Specific Configuration"
  }, {
    "id": "macos",
    "content": "macOS"
  }, {
    "id": "linuxother-platforms",
    "content": "Linux/Other Platforms"
  }, {
    "id": "example-configurations",
    "content": "Example Configurations"
  }, {
    "id": "browser-style",
    "content": "Browser-Style"
  }, {
    "id": "vim-style",
    "content": "Vim-Style"
  }, {
    "id": "custom-leader-key",
    "content": "Custom Leader Key"
  }, {
    "id": "troubleshooting",
    "content": "Troubleshooting"
  }, {
    "id": "configuration-not-loading",
    "content": "Configuration Not Loading"
  }, {
    "id": "invalid-key-syntax",
    "content": "Invalid Key Syntax"
  }, {
    "id": "applying-changes",
    "content": "Applying Changes"
  }, {
    "id": "related-documentation",
    "content": "Related Documentation"
  }]
};
const toc$4 = [{
  depth: 2,
  url: "#quick-start",
  title: jsx(Fragment, {
    children: "Quick Start"
  })
}, {
  depth: 3,
  url: "#find-your-configuration",
  title: jsx(Fragment, {
    children: "Find Your Configuration"
  })
}, {
  depth: 3,
  url: "#edit-configuration",
  title: jsx(Fragment, {
    children: "Edit Configuration"
  })
}, {
  depth: 3,
  url: "#view-current-keybindings",
  title: jsx(Fragment, {
    children: "View Current Keybindings"
  })
}, {
  depth: 3,
  url: "#reset-to-defaults",
  title: jsx(Fragment, {
    children: "Reset to Defaults"
  })
}, {
  depth: 2,
  url: "#configuration-file-location",
  title: jsx(Fragment, {
    children: "Configuration File Location"
  })
}, {
  depth: 2,
  url: "#configuration-structure",
  title: jsx(Fragment, {
    children: "Configuration Structure"
  })
}, {
  depth: 3,
  url: "#minimal-configuration-recommended",
  title: jsx(Fragment, {
    children: "Minimal Configuration (Recommended)"
  })
}, {
  depth: 2,
  url: "#appearance-configuration",
  title: jsx(Fragment, {
    children: "Appearance Configuration"
  })
}, {
  depth: 3,
  url: "#border_style",
  title: jsx(Fragment, {
    children: "border_style"
  })
}, {
  depth: 3,
  url: "#dockbar_position",
  title: jsx(Fragment, {
    children: "dockbar_position"
  })
}, {
  depth: 3,
  url: "#hide_window_buttons",
  title: jsx(Fragment, {
    children: "hide_window_buttons"
  })
}, {
  depth: 3,
  url: "#scrollback_lines",
  title: jsx(Fragment, {
    children: "scrollback_lines"
  })
}, {
  depth: 2,
  url: "#keybindings-configuration",
  title: jsx(Fragment, {
    children: "Keybindings Configuration"
  })
}, {
  depth: 3,
  url: "#leader_key",
  title: jsx(Fragment, {
    children: "leader_key"
  })
}, {
  depth: 3,
  url: "#keybinding-sections",
  title: jsx(Fragment, {
    children: "Keybinding Sections"
  })
}, {
  depth: 4,
  url: "#window_management",
  title: jsx(Fragment, {
    children: "window_management"
  })
}, {
  depth: 4,
  url: "#workspaces",
  title: jsx(Fragment, {
    children: "workspaces"
  })
}, {
  depth: 4,
  url: "#layout",
  title: jsx(Fragment, {
    children: "layout"
  })
}, {
  depth: 4,
  url: "#mode_control",
  title: jsx(Fragment, {
    children: "mode_control"
  })
}, {
  depth: 2,
  url: "#key-syntax",
  title: jsx(Fragment, {
    children: "Key Syntax"
  })
}, {
  depth: 3,
  url: "#modifier-keys",
  title: jsx(Fragment, {
    children: "Modifier Keys"
  })
}, {
  depth: 3,
  url: "#special-keys",
  title: jsx(Fragment, {
    children: "Special Keys"
  })
}, {
  depth: 3,
  url: "#key-combinations",
  title: jsx(Fragment, {
    children: "Key Combinations"
  })
}, {
  depth: 3,
  url: "#multiple-keybindings",
  title: jsx(Fragment, {
    children: "Multiple Keybindings"
  })
}, {
  depth: 3,
  url: "#removing-keybindings",
  title: jsx(Fragment, {
    children: "Removing Keybindings"
  })
}, {
  depth: 2,
  url: "#platform-specific-configuration",
  title: jsx(Fragment, {
    children: "Platform-Specific Configuration"
  })
}, {
  depth: 3,
  url: "#macos",
  title: jsx(Fragment, {
    children: "macOS"
  })
}, {
  depth: 3,
  url: "#linuxother-platforms",
  title: jsx(Fragment, {
    children: "Linux/Other Platforms"
  })
}, {
  depth: 2,
  url: "#example-configurations",
  title: jsx(Fragment, {
    children: "Example Configurations"
  })
}, {
  depth: 3,
  url: "#browser-style",
  title: jsx(Fragment, {
    children: "Browser-Style"
  })
}, {
  depth: 3,
  url: "#vim-style",
  title: jsx(Fragment, {
    children: "Vim-Style"
  })
}, {
  depth: 3,
  url: "#custom-leader-key",
  title: jsx(Fragment, {
    children: "Custom Leader Key"
  })
}, {
  depth: 2,
  url: "#troubleshooting",
  title: jsx(Fragment, {
    children: "Troubleshooting"
  })
}, {
  depth: 3,
  url: "#configuration-not-loading",
  title: jsx(Fragment, {
    children: "Configuration Not Loading"
  })
}, {
  depth: 3,
  url: "#invalid-key-syntax",
  title: jsx(Fragment, {
    children: "Invalid Key Syntax"
  })
}, {
  depth: 3,
  url: "#applying-changes",
  title: jsx(Fragment, {
    children: "Applying Changes"
  })
}, {
  depth: 2,
  url: "#related-documentation",
  title: jsx(Fragment, {
    children: "Related Documentation"
  })
}];
function _createMdxContent$4(props) {
  const _components = {
    code: "code",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  }, {Card, Cards} = _components;
  if (!Card) _missingMdxReference$3("Card");
  if (!Cards) _missingMdxReference$3("Cards");
  return jsxs(Fragment, {
    children: [jsx(_components.p, {
      children: "TUIOS supports user-configurable keybindings and appearance through a TOML configuration file, following the XDG Base Directory specification."
    }), "\n", jsx(_components.h2, {
      id: "quick-start",
      children: "Quick Start"
    }), "\n", jsx(_components.h3, {
      id: "find-your-configuration",
      children: "Find Your Configuration"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " path"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "edit-configuration",
      children: "Edit Configuration"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " edit"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "view-current-keybindings",
      children: "View Current Keybindings"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# View all keybindings"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " keybinds"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " list"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# View only your customizations"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " keybinds"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " list-custom"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "reset-to-defaults",
      children: "Reset to Defaults"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " reset"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "configuration-file-location",
      children: "Configuration File Location"
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Default path:"
      }), " ", jsx(_components.code, {
        children: "~/.config/tuios/config.toml"
      })]
    }), "\n", jsx(_components.p, {
      children: "On first launch, TUIOS automatically creates a default configuration file. The exact location follows the XDG Base Directory specification:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: ["Linux/macOS: ", jsx(_components.code, {
          children: "~/.config/tuios/config.toml"
        })]
      }), "\n", jsxs(_components.li, {
        children: ["Custom: ", jsx(_components.code, {
          children: "$XDG_CONFIG_HOME/tuios/config.toml"
        }), " (if ", jsx(_components.code, {
          children: "XDG_CONFIG_HOME"
        }), " is set)"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "configuration-structure",
      children: "Configuration Structure"
    }), "\n", jsx(_components.p, {
      children: "The configuration file uses TOML format with the following structure:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "keybindings"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "leader_key = "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+b\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "keybindings"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "."
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "window_management"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "new_window = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"n\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "close_window = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"w\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ", "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"x\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# ... more keybindings"
            })
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "keybindings"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "."
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "workspaces"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "switch_workspace_1 = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"alt+1\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# ... more workspaces"
            })
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "keybindings"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "."
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "layout"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "snap_left = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"h\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# ... more layouts"
            })
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "appearance"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "border_style = "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"rounded\""
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "dockbar_position = "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"bottom\""
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "hide_window_buttons = "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "false"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "scrollback_lines = "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "10000"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "minimal-configuration-recommended",
      children: "Minimal Configuration (Recommended)"
    }), "\n", jsx(_components.p, {
      children: "You only need to specify what you want to customize. TUIOS automatically fills in missing keybindings with defaults:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# ~/.config/tuios/config.toml"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Only customize what you need!"
            })
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "keybindings"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "."
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "window_management"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "new_window = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+t\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "close_window = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+w\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Everything else uses defaults automatically"
            })
          })]
        })
      })
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Benefits:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Shorter, cleaner configuration"
      }), "\n", jsx(_components.li, {
        children: "Automatic updates when new features are added"
      }), "\n", jsx(_components.li, {
        children: "Easy to see what you've customized"
      }), "\n", jsx(_components.li, {
        children: "Less maintenance required"
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "appearance-configuration",
      children: "Appearance Configuration"
    }), "\n", jsxs(_components.p, {
      children: ["The ", jsx(_components.code, {
        children: "[appearance]"
      }), " section controls the visual presentation of TUIOS."]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "appearance"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "border_style = "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"rounded\""
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "dockbar_position = "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"bottom\""
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "hide_window_buttons = "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "false"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "scrollback_lines = "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "10000"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "border_style",
      children: "border_style"
    }), "\n", jsx(_components.p, {
      children: "Controls the style of window borders."
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Valid values:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"rounded\""
        }), " - Rounded corners (default)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"normal\""
        }), " - Standard straight borders"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"thick\""
        }), " - Bold/thick borders"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"double\""
        }), " - Double-line borders"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"hidden\""
        }), " - No borders (automatically hides window buttons)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"block\""
        }), " - Block-style borders"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"ascii\""
        }), " - ASCII-only characters for compatibility"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"outer-half-block\""
        }), " - Half-block style (outer)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"inner-half-block\""
        }), " - Half-block style (inner)"]
      }), "\n"]
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "CLI override:"
      }), " ", jsx(_components.code, {
        children: "--border-style <style>"
      })]
    }), "\n", jsx(_components.h3, {
      id: "dockbar_position",
      children: "dockbar_position"
    }), "\n", jsx(_components.p, {
      children: "Controls the position of the dockbar."
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Valid values:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"bottom\""
        }), " - Position dockbar at the bottom (default)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"top\""
        }), " - Position dockbar at the top"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"hidden\""
        }), " - Hide dockbar"]
      }), "\n"]
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "CLI override:"
      }), " ", jsx(_components.code, {
        children: "--dockbar-position <position>"
      })]
    }), "\n", jsx(_components.h3, {
      id: "hide_window_buttons",
      children: "hide_window_buttons"
    }), "\n", jsx(_components.p, {
      children: "Controls whether window control buttons (minimize, maximize, close) are displayed in the title bar."
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Default:"
      }), " ", jsx(_components.code, {
        children: "false"
      })]
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "CLI override:"
      }), " ", jsx(_components.code, {
        children: "--hide-window-buttons"
      })]
    }), "\n", jsx(_components.h3, {
      id: "scrollback_lines",
      children: "scrollback_lines"
    }), "\n", jsx(_components.p, {
      children: "Controls the number of lines stored in the scrollback buffer for each terminal window."
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Valid values:"
      }), " Integer between 100 and 1,000,000"]
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Default:"
      }), " ", jsx(_components.code, {
        children: "10000"
      })]
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "CLI override:"
      }), " ", jsx(_components.code, {
        children: "--scrollback-lines <number>"
      })]
    }), "\n", jsx(_components.h2, {
      id: "keybindings-configuration",
      children: "Keybindings Configuration"
    }), "\n", jsx(_components.h3, {
      id: "leader_key",
      children: "leader_key"
    }), "\n", jsx(_components.p, {
      children: "Controls the prefix key for window management commands (the tmux-style leader key)."
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Default:"
      }), " ", jsx(_components.code, {
        children: "\"ctrl+b\""
      })]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Examples:"
      })
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "keybindings"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Use Ctrl+A instead of Ctrl+B (like GNU Screen)"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "leader_key = "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+a\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Use Alt+Space"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "leader_key = "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"alt+space\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Use Ctrl+Space"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "leader_key = "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+space\""
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "keybinding-sections",
      children: "Keybinding Sections"
    }), "\n", jsx(_components.h4, {
      id: "window_management",
      children: "window_management"
    }), "\n", jsx(_components.p, {
      children: "Window creation, navigation, and control."
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Available actions:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "new_window"
        }), " - Create new terminal window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "close_window"
        }), " - Close focused window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "rename_window"
        }), " - Rename focused window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "minimize_window"
        }), " - Minimize focused window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "restore_all"
        }), " - Restore all minimized windows"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "next_window"
        }), " - Focus next window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "prev_window"
        }), " - Focus previous window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "select_window_1"
        }), " through ", jsx(_components.code, {
          children: "select_window_9"
        }), " - Select window by number"]
      }), "\n"]
    }), "\n", jsx(_components.h4, {
      id: "workspaces",
      children: "workspaces"
    }), "\n", jsx(_components.p, {
      children: "Workspace switching and window movement."
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Available actions:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "switch_workspace_1"
        }), " through ", jsx(_components.code, {
          children: "switch_workspace_9"
        }), " - Switch to workspace N"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "move_and_follow_1"
        }), " through ", jsx(_components.code, {
          children: "move_and_follow_9"
        }), " - Move window to workspace N and follow"]
      }), "\n"]
    }), "\n", jsx(_components.h4, {
      id: "layout",
      children: "layout"
    }), "\n", jsx(_components.p, {
      children: "Window positioning and tiling."
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Available actions:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "snap_left"
        }), ", ", jsx(_components.code, {
          children: "snap_right"
        }), ", ", jsx(_components.code, {
          children: "snap_fullscreen"
        }), ", ", jsx(_components.code, {
          children: "unsnap"
        })]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "snap_corner_1"
        }), " through ", jsx(_components.code, {
          children: "snap_corner_4"
        }), " - Snap to corners"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "toggle_tiling"
        }), " - Toggle automatic tiling mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "swap_left"
        }), ", ", jsx(_components.code, {
          children: "swap_right"
        }), ", ", jsx(_components.code, {
          children: "swap_up"
        }), ", ", jsx(_components.code, {
          children: "swap_down"
        }), " - Swap windows"]
      }), "\n", jsx(_components.li, {
        children: "Resize commands for tiling mode"
      }), "\n"]
    }), "\n", jsx(_components.h4, {
      id: "mode_control",
      children: "mode_control"
    }), "\n", jsx(_components.p, {
      children: "Mode switching and application control."
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Available actions:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "enter_terminal_mode"
        }), " - Enter terminal mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "enter_window_mode"
        }), " - Enter window management mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "toggle_help"
        }), " - Toggle help overlay"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "quit"
        }), " - Quit TUIOS"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "key-syntax",
      children: "Key Syntax"
    }), "\n", jsx(_components.h3, {
      id: "modifier-keys",
      children: "Modifier Keys"
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Supported modifiers:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "ctrl+"
        }), " - Control key"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "alt+"
        }), " - Alt key"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "shift+"
        }), " - Shift key"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "opt+"
        }), ", ", jsx(_components.code, {
          children: "option+"
        }), " - Option key (macOS only)"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Not supported:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "cmd+"
        }), ", ", jsx(_components.code, {
          children: "super+"
        }), " - Not supported (typically captured by OS)"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "special-keys",
      children: "Special Keys"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "enter"
        }), ", ", jsx(_components.code, {
          children: "return"
        }), ", ", jsx(_components.code, {
          children: "esc"
        }), ", ", jsx(_components.code, {
          children: "escape"
        }), ", ", jsx(_components.code, {
          children: "tab"
        }), ", ", jsx(_components.code, {
          children: "space"
        })]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "backspace"
        }), ", ", jsx(_components.code, {
          children: "delete"
        })]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "up"
        }), ", ", jsx(_components.code, {
          children: "down"
        }), ", ", jsx(_components.code, {
          children: "left"
        }), ", ", jsx(_components.code, {
          children: "right"
        })]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "home"
        }), ", ", jsx(_components.code, {
          children: "end"
        }), ", ", jsx(_components.code, {
          children: "pgup"
        }), ", ", jsx(_components.code, {
          children: "pgdown"
        })]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "f1"
        }), " through ", jsx(_components.code, {
          children: "f12"
        })]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "key-combinations",
      children: "Key Combinations"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#B31D28",
                "--shiki-light-font-style": "italic",
                "--shiki-dark": "#FDAEB7",
                "--shiki-dark-font-style": "italic"
              },
              children: "\"ctrl+shift+t\"  "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Control + Shift + T"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#B31D28",
                "--shiki-light-font-style": "italic",
                "--shiki-dark": "#FDAEB7",
                "--shiki-dark-font-style": "italic"
              },
              children: "\"alt+enter\"     "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Alt + Enter"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#B31D28",
                "--shiki-light-font-style": "italic",
                "--shiki-dark": "#FDAEB7",
                "--shiki-dark-font-style": "italic"
              },
              children: "\"shift+tab\"     "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Shift + Tab"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#B31D28",
                "--shiki-light-font-style": "italic",
                "--shiki-dark": "#FDAEB7",
                "--shiki-dark-font-style": "italic"
              },
              children: "\"opt+1\"         "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Option + 1 (macOS only)"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "multiple-keybindings",
      children: "Multiple Keybindings"
    }), "\n", jsx(_components.p, {
      children: "Bind multiple keys to the same action:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "new_window = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"n\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ", "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+n\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ", "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+t\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "removing-keybindings",
      children: "Removing Keybindings"
    }), "\n", jsx(_components.p, {
      children: "Use an empty array to disable a keybinding:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "close_window = []  "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Disables this action"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "platform-specific-configuration",
      children: "Platform-Specific Configuration"
    }), "\n", jsx(_components.h3, {
      id: "macos",
      children: "macOS"
    }), "\n", jsx(_components.p, {
      children: "On macOS, TUIOS supports the Option key."
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Default workspace switching:"
      })
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "keybindings"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "."
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "workspaces"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "switch_workspace_1 = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"opt+1\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "switch_workspace_2 = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"opt+2\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# ... etc"
            })
          })]
        })
      })
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Equivalent notations:"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "opt+1"
        }), " - Recommended (Mac-friendly)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "option+1"
        }), " - Also supported"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "alt+1"
        }), " - Works but less intuitive for Mac users"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "linuxother-platforms",
      children: "Linux/Other Platforms"
    }), "\n", jsx(_components.p, {
      children: "Use standard modifiers only:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "alt+1"
        }), ", ", jsx(_components.code, {
          children: "ctrl+1"
        }), ", etc."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "opt+"
        }), " and ", jsx(_components.code, {
          children: "option+"
        }), " are not valid"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "example-configurations",
      children: "Example Configurations"
    }), "\n", jsx(_components.h3, {
      id: "browser-style",
      children: "Browser-Style"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "keybindings"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "."
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "window_management"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "new_window = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+t\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "close_window = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+w\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "next_window = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+tab\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "prev_window = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+shift+tab\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "vim-style",
      children: "Vim-Style"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "keybindings"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "."
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "mode_control"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "enter_terminal_mode = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"i\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ", "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"a\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "enter_window_mode = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"esc\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "keybindings"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "."
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "window_management"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "new_window = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+t\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "close_window = ["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+w\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "custom-leader-key",
      children: "Custom Leader Key"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "["
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "keybindings"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "]"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Use Ctrl+A like GNU Screen"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "leader_key = "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\"ctrl+a\""
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "troubleshooting",
      children: "Troubleshooting"
    }), "\n", jsx(_components.h3, {
      id: "configuration-not-loading",
      children: "Configuration Not Loading"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsx(_components.li, {
        children: "Check file location:"
      }), "\n"]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " path"
            })]
          })
        })
      })
    }), "\n", jsxs(_components.ol, {
      start: "2",
      children: ["\n", jsx(_components.li, {
        children: "Verify TOML syntax"
      }), "\n", jsx(_components.li, {
        children: "Check startup logs:"
      }), "\n"]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --debug"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "invalid-key-syntax",
      children: "Invalid Key Syntax"
    }), "\n", jsx(_components.p, {
      children: "Common errors:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"cmd+t\""
        }), " - cmd/super not supported"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"opt+1\""
        }), " on Linux - opt only valid on macOS"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "\"ctrl+\""
        }), " - incomplete combination"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "applying-changes",
      children: "Applying Changes"
    }), "\n", jsx(_components.p, {
      children: "Configuration is loaded on startup. To apply changes:"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsx(_components.li, {
        children: "Edit configuration"
      }), "\n", jsx(_components.li, {
        children: "Quit TUIOS"
      }), "\n", jsx(_components.li, {
        children: "Restart TUIOS"
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "related-documentation",
      children: "Related Documentation"
    }), "\n", jsxs(Cards, {
      children: [jsx(Card, {
        title: "Keybindings Reference",
        href: "/docs/keybindings",
        description: "Complete keyboard shortcut reference"
      }), jsx(Card, {
        title: "CLI Reference",
        href: "/docs/cli-reference",
        description: "Command-line options and flags"
      })]
    })]
  });
}
function MDXContent$4(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$4, {
      ...props
    })
  }) : _createMdxContent$4(props);
}
function _missingMdxReference$3(id, component) {
  throw new Error("Expected " + ("component" ) + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
}

const __vite_glob_1_2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: MDXContent$4,
  frontmatter: frontmatter$4,
  structuredData: structuredData$4,
  toc: toc$4
}, Symbol.toStringTag, { value: 'Module' }));

function Steps({ children }) {
    return jsx("div", { className: "fd-steps", children: children });
}
function Step({ children }) {
    return jsx("div", { className: "fd-step", children: children });
}

let frontmatter$3 = {
  "title": "Getting Started",
  "description": "Install TUIOS and learn the basics",
  "icon": "Rocket"
};
let structuredData$3 = {
  "contents": [{
    "heading": "getting-started-with-tuios",
    "content": "This guide will help you install TUIOS and learn the essential operations."
  }, {
    "heading": "getting-started-with-tuios",
    "content": "title: Requirements"
  }, {
    "heading": "getting-started-with-tuios",
    "content": "type: info"
  }, {
    "heading": "getting-started-with-tuios",
    "content": "A terminal with true color support (most modern terminals)"
  }, {
    "heading": "getting-started-with-tuios",
    "content": "Go 1.24+ (if building from source)"
  }, {
    "heading": "quick-install-script",
    "content": "Linux/macOS:"
  }, {
    "heading": "alternative-methods",
    "content": "Download pre-built binaries"
  }, {
    "heading": "first-launch",
    "content": "Simply run:"
  }, {
    "heading": "first-launch",
    "content": "title: No windows yet?"
  }, {
    "heading": "first-launch",
    "content": "type: info"
  }, {
    "heading": "first-launch",
    "content": "You'll start in Window Management Mode with no windows. This is normal - TUIOS lets you create windows as needed."
  }, {
    "heading": "understanding-modes",
    "content": "TUIOS has two primary modes:"
  }, {
    "heading": "1-window-management-mode",
    "content": "The mode you start in. This is where you:"
  }, {
    "heading": "1-window-management-mode",
    "content": "Navigate between windows"
  }, {
    "heading": "1-window-management-mode",
    "content": "Create/close/rename windows"
  }, {
    "heading": "1-window-management-mode",
    "content": "Switch workspaces"
  }, {
    "heading": "1-window-management-mode",
    "content": "Tile windows"
  }, {
    "heading": "1-window-management-mode",
    "content": "Use mouse to drag/resize"
  }, {
    "heading": "1-window-management-mode",
    "content": "Visual Indicator: Windows have colored borders and you see the dockbar at bottom."
  }, {
    "heading": "2-terminal-mode",
    "content": "Where you interact with the terminal inside a window. Your keypresses go directly to the shell/application."
  }, {
    "heading": "2-terminal-mode",
    "content": "Visual Indicator: The active window is fully focused, keyboard input is captured."
  }, {
    "heading": "2-terminal-mode",
    "content": "title: Mode Switching"
  }, {
    "heading": "2-terminal-mode",
    "content": "type: tip"
  }, {
    "heading": "2-terminal-mode",
    "content": "Press i or Enter to enter Terminal Mode"
  }, {
    "heading": "2-terminal-mode",
    "content": "Press Esc or CtrlB d to return to Window Management Mode"
  }, {
    "heading": "creating-your-first-window",
    "content": "From Window Management Mode:"
  }, {
    "heading": "creating-your-first-window",
    "content": "Press n to create a new window"
  }, {
    "heading": "creating-your-first-window",
    "content": "Or from any mode:"
  }, {
    "heading": "creating-your-first-window",
    "content": "Press CtrlB, then c"
  }, {
    "heading": "window-navigation",
    "content": "In Window Management Mode:"
  }, {
    "heading": "window-navigation",
    "content": "hjkl - Move focus (vim-style)"
  }, {
    "heading": "window-navigation",
    "content": "Tab - Next window"
  }, {
    "heading": "window-navigation",
    "content": "ShiftTab - Previous window"
  }, {
    "heading": "window-navigation",
    "content": "Or click with your mouse!"
  }, {
    "heading": "window-management",
    "content": "From any mode (using CtrlB prefix):"
  }, {
    "heading": "window-management",
    "content": "CtrlB c - Create new window"
  }, {
    "heading": "window-management",
    "content": "CtrlB x - Close focused window"
  }, {
    "heading": "window-management",
    "content": "CtrlB r - Rename focused window"
  }, {
    "heading": "window-management",
    "content": "CtrlB m - Minimize focused window"
  }, {
    "heading": "workspaces",
    "content": "TUIOS provides 9 workspaces (like virtual desktops):"
  }, {
    "heading": "workspaces",
    "content": "CtrlB 1-9 - Switch to workspace 1-9"
  }, {
    "heading": "workspaces",
    "content": "CtrlB Shift1-9 - Move window to workspace and follow"
  }, {
    "heading": "tiling",
    "content": "t - Toggle automatic tiling mode"
  }, {
    "heading": "tiling",
    "content": "CtrlB f - Fullscreen focused window"
  }, {
    "heading": "tiling",
    "content": "CtrlB h - Snap window left (50% width)"
  }, {
    "heading": "tiling",
    "content": "CtrlB l - Snap window right (50% width)"
  }, {
    "heading": "copy-mode-scrollback",
    "content": "Access 10,000 lines of scrollback with vim-style navigation:"
  }, {
    "heading": "copy-mode-scrollback",
    "content": "CtrlB [ - Enter copy mode"
  }, {
    "heading": "copy-mode-scrollback",
    "content": "hjkl - Move cursor"
  }, {
    "heading": "copy-mode-scrollback",
    "content": "/ - Search forward"
  }, {
    "heading": "copy-mode-scrollback",
    "content": "v - Start visual selection"
  }, {
    "heading": "copy-mode-scrollback",
    "content": "y - Copy selection to clipboard"
  }, {
    "heading": "copy-mode-scrollback",
    "content": "Esc - Exit copy mode"
  }, {
    "heading": "copy-mode-scrollback",
    "content": "title: More keybindings"
  }, {
    "heading": "copy-mode-scrollback",
    "content": "type: info"
  }, {
    "heading": "copy-mode-scrollback",
    "content": "See the Keybindings page for the complete reference."
  }, {
    "heading": "help--quit",
    "content": "CtrlB ? - Toggle help overlay"
  }, {
    "heading": "help--quit",
    "content": "CtrlB q - Quit TUIOS"
  }, {
    "heading": "example-workflow",
    "content": "Let's create a development setup:"
  }, {
    "heading": "launch-tuios",
    "content": "You start in Window Management Mode with no windows."
  }, {
    "heading": "create-first-window",
    "content": "Press n"
  }, {
    "heading": "create-first-window",
    "content": "A new window appears with your shell."
  }, {
    "heading": "enter-terminal-mode",
    "content": "Press i or Enter"
  }, {
    "heading": "enter-terminal-mode",
    "content": "Now you can type commands."
  }, {
    "heading": "run-a-command",
    "content": "Work normally in the terminal."
  }, {
    "heading": "return-to-management-mode",
    "content": "Press Esc"
  }, {
    "heading": "return-to-management-mode",
    "content": "Back to Window Management Mode."
  }, {
    "heading": "create-more-windows",
    "content": "Press n twice more."
  }, {
    "heading": "create-more-windows",
    "content": "You now have 3 windows!"
  }, {
    "heading": "enable-tiling",
    "content": "Press t"
  }, {
    "heading": "enable-tiling",
    "content": "Windows automatically arrange in a grid."
  }, {
    "heading": "switch-workspaces",
    "content": "Press CtrlB 2"
  }, {
    "heading": "switch-workspaces",
    "content": "Move to empty workspace 2."
  }, {
    "heading": "create-windows-here-too",
    "content": "Press n a few times."
  }, {
    "heading": "create-windows-here-too",
    "content": "Each workspace is independent!"
  }, {
    "heading": "navigate-between-windows",
    "content": "Press Tab to cycle windows"
  }, {
    "heading": "navigate-between-windows",
    "content": "Press CtrlB 1 to go back to workspace 1"
  }, {
    "heading": "navigate-between-windows",
    "content": "Click windows with your mouse"
  }, {
    "heading": "command-line-options",
    "content": "TUIOS supports many flags:"
  }, {
    "heading": "ssh-server-mode",
    "content": "Run TUIOS as an SSH server for remote access:"
  }, {
    "heading": "ssh-server-mode",
    "content": "Connect from another machine:"
  }, {
    "heading": "ssh-server-mode",
    "content": "Each SSH connection gets its own isolated TUIOS session!"
  }, {
    "heading": "configuration",
    "content": "TUIOS stores its configuration in a TOML file:"
  }, {
    "heading": "configuration",
    "content": "See the Configuration guide for details."
  }, {
    "heading": "shell-completions",
    "content": "Generate shell completions for your shell:"
  }],
  "headings": [{
    "id": "getting-started-with-tuios",
    "content": "Getting Started with TUIOS"
  }, {
    "id": "installation",
    "content": "Installation"
  }, {
    "id": "package-managers",
    "content": "Package Managers"
  }, {
    "id": "homebrew-macoslinux",
    "content": "Homebrew (macOS/Linux)"
  }, {
    "id": "arch-linux-aur",
    "content": "Arch Linux (AUR)"
  }, {
    "id": "nix",
    "content": "Nix"
  }, {
    "id": "quick-install-script",
    "content": "Quick Install Script"
  }, {
    "id": "alternative-methods",
    "content": "Alternative Methods"
  }, {
    "id": "first-launch",
    "content": "First Launch"
  }, {
    "id": "understanding-modes",
    "content": "Understanding Modes"
  }, {
    "id": "1-window-management-mode",
    "content": "1. Window Management Mode"
  }, {
    "id": "2-terminal-mode",
    "content": "2. Terminal Mode"
  }, {
    "id": "essential-keybindings",
    "content": "Essential Keybindings"
  }, {
    "id": "creating-your-first-window",
    "content": "Creating Your First Window"
  }, {
    "id": "window-navigation",
    "content": "Window Navigation"
  }, {
    "id": "window-management",
    "content": "Window Management"
  }, {
    "id": "workspaces",
    "content": "Workspaces"
  }, {
    "id": "tiling",
    "content": "Tiling"
  }, {
    "id": "copy-mode-scrollback",
    "content": "Copy Mode (Scrollback)"
  }, {
    "id": "help--quit",
    "content": "Help & Quit"
  }, {
    "id": "example-workflow",
    "content": "Example Workflow"
  }, {
    "id": "launch-tuios",
    "content": "Launch TUIOS"
  }, {
    "id": "create-first-window",
    "content": "Create first window"
  }, {
    "id": "enter-terminal-mode",
    "content": "Enter terminal mode"
  }, {
    "id": "run-a-command",
    "content": "Run a command"
  }, {
    "id": "return-to-management-mode",
    "content": "Return to management mode"
  }, {
    "id": "create-more-windows",
    "content": "Create more windows"
  }, {
    "id": "enable-tiling",
    "content": "Enable tiling"
  }, {
    "id": "switch-workspaces",
    "content": "Switch workspaces"
  }, {
    "id": "create-windows-here-too",
    "content": "Create windows here too"
  }, {
    "id": "navigate-between-windows",
    "content": "Navigate between windows"
  }, {
    "id": "command-line-options",
    "content": "Command Line Options"
  }, {
    "id": "ssh-server-mode",
    "content": "SSH Server Mode"
  }, {
    "id": "configuration",
    "content": "Configuration"
  }, {
    "id": "shell-completions",
    "content": "Shell Completions"
  }, {
    "id": "next-steps",
    "content": "Next Steps"
  }]
};
const toc$3 = [{
  depth: 1,
  url: "#getting-started-with-tuios",
  title: jsx(Fragment, {
    children: "Getting Started with TUIOS"
  })
}, {
  depth: 2,
  url: "#installation",
  title: jsx(Fragment, {
    children: "Installation"
  })
}, {
  depth: 3,
  url: "#package-managers",
  title: jsx(Fragment, {
    children: "Package Managers"
  })
}, {
  depth: 4,
  url: "#homebrew-macoslinux",
  title: jsx(Fragment, {
    children: "Homebrew (macOS/Linux)"
  })
}, {
  depth: 4,
  url: "#arch-linux-aur",
  title: jsx(Fragment, {
    children: "Arch Linux (AUR)"
  })
}, {
  depth: 4,
  url: "#nix",
  title: jsx(Fragment, {
    children: "Nix"
  })
}, {
  depth: 3,
  url: "#quick-install-script",
  title: jsx(Fragment, {
    children: "Quick Install Script"
  })
}, {
  depth: 3,
  url: "#alternative-methods",
  title: jsx(Fragment, {
    children: "Alternative Methods"
  })
}, {
  depth: 2,
  url: "#first-launch",
  title: jsx(Fragment, {
    children: "First Launch"
  })
}, {
  depth: 2,
  url: "#understanding-modes",
  title: jsx(Fragment, {
    children: "Understanding Modes"
  })
}, {
  depth: 3,
  url: "#1-window-management-mode",
  title: jsx(Fragment, {
    children: "1. Window Management Mode"
  })
}, {
  depth: 3,
  url: "#2-terminal-mode",
  title: jsx(Fragment, {
    children: "2. Terminal Mode"
  })
}, {
  depth: 2,
  url: "#essential-keybindings",
  title: jsx(Fragment, {
    children: "Essential Keybindings"
  })
}, {
  depth: 3,
  url: "#creating-your-first-window",
  title: jsx(Fragment, {
    children: "Creating Your First Window"
  })
}, {
  depth: 3,
  url: "#window-navigation",
  title: jsx(Fragment, {
    children: "Window Navigation"
  })
}, {
  depth: 3,
  url: "#window-management",
  title: jsx(Fragment, {
    children: "Window Management"
  })
}, {
  depth: 3,
  url: "#workspaces",
  title: jsx(Fragment, {
    children: "Workspaces"
  })
}, {
  depth: 3,
  url: "#tiling",
  title: jsx(Fragment, {
    children: "Tiling"
  })
}, {
  depth: 3,
  url: "#copy-mode-scrollback",
  title: jsx(Fragment, {
    children: "Copy Mode (Scrollback)"
  })
}, {
  depth: 3,
  url: "#help--quit",
  title: jsx(Fragment, {
    children: "Help & Quit"
  })
}, {
  depth: 2,
  url: "#example-workflow",
  title: jsx(Fragment, {
    children: "Example Workflow"
  })
}, {
  depth: 3,
  url: "#launch-tuios",
  title: jsx(Fragment, {
    children: "Launch TUIOS"
  })
}, {
  depth: 3,
  url: "#create-first-window",
  title: jsx(Fragment, {
    children: "Create first window"
  })
}, {
  depth: 3,
  url: "#enter-terminal-mode",
  title: jsx(Fragment, {
    children: "Enter terminal mode"
  })
}, {
  depth: 3,
  url: "#run-a-command",
  title: jsx(Fragment, {
    children: "Run a command"
  })
}, {
  depth: 3,
  url: "#return-to-management-mode",
  title: jsx(Fragment, {
    children: "Return to management mode"
  })
}, {
  depth: 3,
  url: "#create-more-windows",
  title: jsx(Fragment, {
    children: "Create more windows"
  })
}, {
  depth: 3,
  url: "#enable-tiling",
  title: jsx(Fragment, {
    children: "Enable tiling"
  })
}, {
  depth: 3,
  url: "#switch-workspaces",
  title: jsx(Fragment, {
    children: "Switch workspaces"
  })
}, {
  depth: 3,
  url: "#create-windows-here-too",
  title: jsx(Fragment, {
    children: "Create windows here too"
  })
}, {
  depth: 3,
  url: "#navigate-between-windows",
  title: jsx(Fragment, {
    children: "Navigate between windows"
  })
}, {
  depth: 2,
  url: "#command-line-options",
  title: jsx(Fragment, {
    children: "Command Line Options"
  })
}, {
  depth: 2,
  url: "#ssh-server-mode",
  title: jsx(Fragment, {
    children: "SSH Server Mode"
  })
}, {
  depth: 2,
  url: "#configuration",
  title: jsx(Fragment, {
    children: "Configuration"
  })
}, {
  depth: 2,
  url: "#shell-completions",
  title: jsx(Fragment, {
    children: "Shell Completions"
  })
}, {
  depth: 2,
  url: "#next-steps",
  title: jsx(Fragment, {
    children: "Next Steps"
  })
}];
function _createMdxContent$3(props) {
  const _components = {
    a: "a",
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    li: "li",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  }, {Card, Cards} = _components;
  if (!Card) _missingMdxReference$2("Card");
  if (!Cards) _missingMdxReference$2("Cards");
  return jsxs(Fragment, {
    children: [jsx(_components.h1, {
      id: "getting-started-with-tuios",
      children: "Getting Started with TUIOS"
    }), "\n", jsx(_components.p, {
      children: "This guide will help you install TUIOS and learn the essential operations."
    }), "\n", jsx(Callout, {
      title: "Requirements",
      type: "info",
      children: jsxs(_components.ul, {
        children: ["\n", jsx(_components.li, {
          children: "A terminal with true color support (most modern terminals)"
        }), "\n", jsx(_components.li, {
          children: "Go 1.24+ (if building from source)"
        }), "\n"]
      })
    }), "\n", jsx(_components.h2, {
      id: "installation",
      children: "Installation"
    }), "\n", jsx(_components.h3, {
      id: "package-managers",
      children: "Package Managers"
    }), "\n", jsxs(Steps, {
      children: [jsxs(Step, {
        children: [jsx(_components.h4, {
          id: "homebrew-macoslinux",
          children: "Homebrew (macOS/Linux)"
        }), jsx(Fragment, {
          children: jsx(_components.pre, {
            className: "shiki shiki-themes github-light github-dark",
            style: {
              "--shiki-light": "#24292e",
              "--shiki-dark": "#e1e4e8",
              "--shiki-light-bg": "#fff",
              "--shiki-dark-bg": "#24292e"
            },
            tabIndex: "0",
            icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
            children: jsx(_components.code, {
              children: jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "brew"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " install"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " tuios"
                })]
              })
            })
          })
        })]
      }), jsxs(Step, {
        children: [jsx(_components.h4, {
          id: "arch-linux-aur",
          children: "Arch Linux (AUR)"
        }), jsx(Fragment, {
          children: jsx(_components.pre, {
            className: "shiki shiki-themes github-light github-dark",
            style: {
              "--shiki-light": "#24292e",
              "--shiki-dark": "#e1e4e8",
              "--shiki-light-bg": "#fff",
              "--shiki-dark-bg": "#24292e"
            },
            tabIndex: "0",
            icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
            children: jsxs(_components.code, {
              children: [jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6A737D",
                    "--shiki-dark": "#6A737D"
                  },
                  children: "# Using yay"
                })
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "yay"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#005CC5",
                    "--shiki-dark": "#79B8FF"
                  },
                  children: " -S"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " tuios-bin"
                })]
              }), "\n", jsx(_components.span, {
                className: "line"
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6A737D",
                    "--shiki-dark": "#6A737D"
                  },
                  children: "# Using paru  "
                })
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "paru"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#005CC5",
                    "--shiki-dark": "#79B8FF"
                  },
                  children: " -S"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " tuios-bin"
                })]
              })]
            })
          })
        })]
      }), jsxs(Step, {
        children: [jsx(_components.h4, {
          id: "nix",
          children: "Nix"
        }), jsx(Fragment, {
          children: jsx(_components.pre, {
            className: "shiki shiki-themes github-light github-dark",
            style: {
              "--shiki-light": "#24292e",
              "--shiki-dark": "#e1e4e8",
              "--shiki-light-bg": "#fff",
              "--shiki-dark-bg": "#24292e"
            },
            tabIndex: "0",
            icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
            children: jsxs(_components.code, {
              children: [jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6A737D",
                    "--shiki-dark": "#6A737D"
                  },
                  children: "# Run directly"
                })
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "nix"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " run"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " github:Gaurav-Gosain/tuios#tuios"
                })]
              }), "\n", jsx(_components.span, {
                className: "line"
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6A737D",
                    "--shiki-dark": "#6A737D"
                  },
                  children: "# Or add to your configuration"
                })
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "nix-shell"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#005CC5",
                    "--shiki-dark": "#79B8FF"
                  },
                  children: " -p"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " tuios"
                })]
              })]
            })
          })
        })]
      })]
    }), "\n", jsx(_components.h3, {
      id: "quick-install-script",
      children: "Quick Install Script"
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Linux/macOS:"
      })
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "curl"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -fsSL"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " https://raw.githubusercontent.com/Gaurav-Gosain/tuios/main/install.sh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " |"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: " bash"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "alternative-methods",
      children: "Alternative Methods"
    }), "\n", jsxs(Cards, {
      children: [jsx(Card, {
        title: "GitHub Releases",
        href: "https://github.com/Gaurav-Gosain/tuios/releases",
        children: jsx(_components.p, {
          children: "Download pre-built binaries"
        })
      }), jsx(Card, {
        title: "Go Install",
        children: jsx(Fragment, {
          children: jsx(_components.pre, {
            className: "shiki shiki-themes github-light github-dark",
            style: {
              "--shiki-light": "#24292e",
              "--shiki-dark": "#e1e4e8",
              "--shiki-light-bg": "#fff",
              "--shiki-dark-bg": "#24292e"
            },
            tabIndex: "0",
            icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
            children: jsx(_components.code, {
              children: jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "go"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " install"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " github.com/Gaurav-Gosain/tuios/cmd/tuios@latest"
                })]
              })
            })
          })
        })
      }), jsx(Card, {
        title: "Docker",
        children: jsx(Fragment, {
          children: jsx(_components.pre, {
            className: "shiki shiki-themes github-light github-dark",
            style: {
              "--shiki-light": "#24292e",
              "--shiki-dark": "#e1e4e8",
              "--shiki-light-bg": "#fff",
              "--shiki-dark-bg": "#24292e"
            },
            tabIndex: "0",
            icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
            children: jsx(_components.code, {
              children: jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "docker"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " run"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#005CC5",
                    "--shiki-dark": "#79B8FF"
                  },
                  children: " -it"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#005CC5",
                    "--shiki-dark": "#79B8FF"
                  },
                  children: " --rm"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " ghcr.io/gaurav-gosain/tuios:latest"
                })]
              })
            })
          })
        })
      }), jsx(Card, {
        title: "Build from Source",
        children: jsx(Fragment, {
          children: jsx(_components.pre, {
            className: "shiki shiki-themes github-light github-dark",
            style: {
              "--shiki-light": "#24292e",
              "--shiki-dark": "#e1e4e8",
              "--shiki-light-bg": "#fff",
              "--shiki-dark-bg": "#24292e"
            },
            tabIndex: "0",
            icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
            children: jsxs(_components.code, {
              children: [jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "git"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " clone"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " https://github.com/gaurav-gosain/tuios.git"
                })]
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#005CC5",
                    "--shiki-dark": "#79B8FF"
                  },
                  children: "cd"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " tuios"
                })]
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "go"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " build"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#005CC5",
                    "--shiki-dark": "#79B8FF"
                  },
                  children: " -o"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " tuios"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " ./cmd/tuios"
                })]
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "./tuios"
                })
              })]
            })
          })
        })
      })]
    }), "\n", jsx(_components.h2, {
      id: "first-launch",
      children: "First Launch"
    }), "\n", jsx(_components.p, {
      children: "Simply run:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            })
          })
        })
      })
    }), "\n", jsx(Callout, {
      title: "No windows yet?",
      type: "info",
      children: jsxs(_components.p, {
        children: ["You'll start in ", jsx(_components.strong, {
          children: "Window Management Mode"
        }), " with no windows. This is normal - TUIOS lets you create windows as needed."]
      })
    }), "\n", jsx(_components.h2, {
      id: "understanding-modes",
      children: "Understanding Modes"
    }), "\n", jsxs(_components.p, {
      children: ["TUIOS has ", jsx(_components.strong, {
        children: "two primary modes"
      }), ":"]
    }), "\n", jsx(_components.h3, {
      id: "1-window-management-mode",
      children: "1. Window Management Mode"
    }), "\n", jsx(_components.p, {
      children: "The mode you start in. This is where you:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Navigate between windows"
      }), "\n", jsx(_components.li, {
        children: "Create/close/rename windows"
      }), "\n", jsx(_components.li, {
        children: "Switch workspaces"
      }), "\n", jsx(_components.li, {
        children: "Tile windows"
      }), "\n", jsx(_components.li, {
        children: "Use mouse to drag/resize"
      }), "\n"]
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Visual Indicator"
      }), ": Windows have colored borders and you see the dockbar at bottom."]
    }), "\n", jsx(_components.h3, {
      id: "2-terminal-mode",
      children: "2. Terminal Mode"
    }), "\n", jsx(_components.p, {
      children: "Where you interact with the terminal inside a window. Your keypresses go directly to the shell/application."
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Visual Indicator"
      }), ": The active window is fully focused, keyboard input is captured."]
    }), "\n", jsx(Callout, {
      title: "Mode Switching",
      type: "tip",
      children: jsxs(_components.ul, {
        children: ["\n", jsxs(_components.li, {
          children: ["Press ", jsx("kbd", {
            children: "i"
          }), " or ", jsx("kbd", {
            children: "Enter"
          }), " to enter ", jsx(_components.strong, {
            children: "Terminal Mode"
          })]
        }), "\n", jsxs(_components.li, {
          children: ["Press ", jsx("kbd", {
            children: "Esc"
          }), " or ", jsx("kbd", {
            children: "Ctrl"
          }), jsx("kbd", {
            children: "B"
          }), " ", jsx("kbd", {
            children: "d"
          }), " to return to ", jsx(_components.strong, {
            children: "Window Management Mode"
          })]
        }), "\n"]
      })
    }), "\n", jsx(_components.h2, {
      id: "essential-keybindings",
      children: "Essential Keybindings"
    }), "\n", jsx(_components.h3, {
      id: "creating-your-first-window",
      children: "Creating Your First Window"
    }), "\n", jsx(_components.p, {
      children: "From Window Management Mode:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: ["Press ", jsx("kbd", {
          children: "n"
        }), " to create a new window"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "Or from any mode:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: ["Press ", jsx("kbd", {
          children: "Ctrl"
        }), jsx("kbd", {
          children: "B"
        }), ", then ", jsx("kbd", {
          children: "c"
        })]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "window-navigation",
      children: "Window Navigation"
    }), "\n", jsx(_components.p, {
      children: "In Window Management Mode:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "h"
        }), jsx("kbd", {
          children: "j"
        }), jsx("kbd", {
          children: "k"
        }), jsx("kbd", {
          children: "l"
        }), " - Move focus (vim-style)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Tab"
        }), " - Next window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Shift"
        }), jsx("kbd", {
          children: "Tab"
        }), " - Previous window"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "Or click with your mouse!"
    }), "\n", jsx(_components.h3, {
      id: "window-management",
      children: "Window Management"
    }), "\n", jsxs(_components.p, {
      children: ["From any mode (using ", jsx("kbd", {
        children: "Ctrl"
      }), jsx("kbd", {
        children: "B"
      }), " prefix):"]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "c"
        }), " - Create new window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "x"
        }), " - Close focused window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "r"
        }), " - Rename focused window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "m"
        }), " - Minimize focused window"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "workspaces",
      children: "Workspaces"
    }), "\n", jsxs(_components.p, {
      children: ["TUIOS provides ", jsx(_components.strong, {
        children: "9 workspaces"
      }), " (like virtual desktops):"]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "1"
        }), "-", jsx("kbd", {
          children: "9"
        }), " - Switch to workspace 1-9"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "Shift"
        }), jsx("kbd", {
          children: "1"
        }), "-", jsx("kbd", {
          children: "9"
        }), " - Move window to workspace and follow"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "tiling",
      children: "Tiling"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "t"
        }), " - Toggle automatic tiling mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "f"
        }), " - Fullscreen focused window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "h"
        }), " - Snap window left (50% width)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "l"
        }), " - Snap window right (50% width)"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "copy-mode-scrollback",
      children: "Copy Mode (Scrollback)"
    }), "\n", jsx(_components.p, {
      children: "Access 10,000 lines of scrollback with vim-style navigation:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "["
        }), " - Enter copy mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "h"
        }), jsx("kbd", {
          children: "j"
        }), jsx("kbd", {
          children: "k"
        }), jsx("kbd", {
          children: "l"
        }), " - Move cursor"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "/"
        }), " - Search forward"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "v"
        }), " - Start visual selection"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "y"
        }), " - Copy selection to clipboard"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Esc"
        }), " - Exit copy mode"]
      }), "\n"]
    }), "\n", jsx(Callout, {
      title: "More keybindings",
      type: "info",
      children: jsxs(_components.p, {
        children: ["See the ", jsx(_components.a, {
          href: "/docs/keybindings",
          children: "Keybindings"
        }), " page for the complete reference."]
      })
    }), "\n", jsx(_components.h3, {
      id: "help--quit",
      children: "Help & Quit"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "?"
        }), " - Toggle help overlay"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "q"
        }), " - Quit TUIOS"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "example-workflow",
      children: "Example Workflow"
    }), "\n", jsx(_components.p, {
      children: "Let's create a development setup:"
    }), "\n", jsxs(Steps, {
      children: [jsxs(Step, {
        children: [jsx(_components.h3, {
          id: "launch-tuios",
          children: "Launch TUIOS"
        }), jsx(Fragment, {
          children: jsx(_components.pre, {
            className: "shiki shiki-themes github-light github-dark",
            style: {
              "--shiki-light": "#24292e",
              "--shiki-dark": "#e1e4e8",
              "--shiki-light-bg": "#fff",
              "--shiki-dark-bg": "#24292e"
            },
            tabIndex: "0",
            icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
            children: jsx(_components.code, {
              children: jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "tuios"
                })
              })
            })
          })
        }), jsx(_components.p, {
          children: "You start in Window Management Mode with no windows."
        })]
      }), jsxs(Step, {
        children: [jsx(_components.h3, {
          id: "create-first-window",
          children: "Create first window"
        }), jsxs(_components.p, {
          children: ["Press ", jsx("kbd", {
            children: "n"
          })]
        }), jsx(_components.p, {
          children: "A new window appears with your shell."
        })]
      }), jsxs(Step, {
        children: [jsx(_components.h3, {
          id: "enter-terminal-mode",
          children: "Enter terminal mode"
        }), jsxs(_components.p, {
          children: ["Press ", jsx("kbd", {
            children: "i"
          }), " or ", jsx("kbd", {
            children: "Enter"
          })]
        }), jsx(_components.p, {
          children: "Now you can type commands."
        })]
      }), jsxs(Step, {
        children: [jsx(_components.h3, {
          id: "run-a-command",
          children: "Run a command"
        }), jsx(Fragment, {
          children: jsx(_components.pre, {
            className: "shiki shiki-themes github-light github-dark",
            style: {
              "--shiki-light": "#24292e",
              "--shiki-dark": "#e1e4e8",
              "--shiki-light-bg": "#fff",
              "--shiki-dark-bg": "#24292e"
            },
            tabIndex: "0",
            icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
            children: jsxs(_components.code, {
              children: [jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "ls"
                })
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "vim"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " myfile.go"
                })]
              })]
            })
          })
        }), jsx(_components.p, {
          children: "Work normally in the terminal."
        })]
      }), jsxs(Step, {
        children: [jsx(_components.h3, {
          id: "return-to-management-mode",
          children: "Return to management mode"
        }), jsxs(_components.p, {
          children: ["Press ", jsx("kbd", {
            children: "Esc"
          })]
        }), jsx(_components.p, {
          children: "Back to Window Management Mode."
        })]
      }), jsxs(Step, {
        children: [jsx(_components.h3, {
          id: "create-more-windows",
          children: "Create more windows"
        }), jsxs(_components.p, {
          children: ["Press ", jsx("kbd", {
            children: "n"
          }), " twice more."]
        }), jsx(_components.p, {
          children: "You now have 3 windows!"
        })]
      }), jsxs(Step, {
        children: [jsx(_components.h3, {
          id: "enable-tiling",
          children: "Enable tiling"
        }), jsxs(_components.p, {
          children: ["Press ", jsx("kbd", {
            children: "t"
          })]
        }), jsx(_components.p, {
          children: "Windows automatically arrange in a grid."
        })]
      }), jsxs(Step, {
        children: [jsx(_components.h3, {
          id: "switch-workspaces",
          children: "Switch workspaces"
        }), jsxs(_components.p, {
          children: ["Press ", jsx("kbd", {
            children: "Ctrl"
          }), jsx("kbd", {
            children: "B"
          }), " ", jsx("kbd", {
            children: "2"
          })]
        }), jsx(_components.p, {
          children: "Move to empty workspace 2."
        })]
      }), jsxs(Step, {
        children: [jsx(_components.h3, {
          id: "create-windows-here-too",
          children: "Create windows here too"
        }), jsxs(_components.p, {
          children: ["Press ", jsx("kbd", {
            children: "n"
          }), " a few times."]
        }), jsx(_components.p, {
          children: "Each workspace is independent!"
        })]
      }), jsxs(Step, {
        children: [jsx(_components.h3, {
          id: "navigate-between-windows",
          children: "Navigate between windows"
        }), jsxs(_components.ul, {
          children: ["\n", jsxs(_components.li, {
            children: ["Press ", jsx("kbd", {
              children: "Tab"
            }), " to cycle windows"]
          }), "\n", jsxs(_components.li, {
            children: ["Press ", jsx("kbd", {
              children: "Ctrl"
            }), jsx("kbd", {
              children: "B"
            }), " ", jsx("kbd", {
              children: "1"
            }), " to go back to workspace 1"]
          }), "\n", jsx(_components.li, {
            children: "Click windows with your mouse"
          }), "\n"]
        })]
      })]
    }), "\n", jsx(_components.h2, {
      id: "command-line-options",
      children: "Command Line Options"
    }), "\n", jsx(_components.p, {
      children: "TUIOS supports many flags:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Run with a specific theme"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --theme"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " dracula"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# List all available themes (300+)"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --list-themes"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Preview a theme's colors"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --preview-theme"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " nord"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Enable debug mode"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --debug"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Use ASCII-only (no Nerd Font icons)"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --ascii-only"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Show pressed keys overlay (for demos)"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --show-keys"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Custom border style"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --border-style"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " thick"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Custom dockbar position"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --dockbar-position"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " top"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "ssh-server-mode",
      children: "SSH Server Mode"
    }), "\n", jsx(_components.p, {
      children: "Run TUIOS as an SSH server for remote access:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Start on default port (2222)"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ssh"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Custom port"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ssh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --port"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 8022"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Listen on all interfaces"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ssh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --host"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 0.0.0.0"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --port"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 2222"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.p, {
      children: "Connect from another machine:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "ssh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -p"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 2222"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " user@hostname"
            })]
          })
        })
      })
    }), "\n", jsx(_components.p, {
      children: "Each SSH connection gets its own isolated TUIOS session!"
    }), "\n", jsx(_components.h2, {
      id: "configuration",
      children: "Configuration"
    }), "\n", jsx(_components.p, {
      children: "TUIOS stores its configuration in a TOML file:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Edit configuration"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " edit"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Print config file path"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " path"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Reset to defaults"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " reset"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# List all keybindings"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " keybinds"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " list"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# List only custom keybindings"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " keybinds"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " list-custom"
            })]
          })]
        })
      })
    }), "\n", jsxs(_components.p, {
      children: ["See the ", jsx(_components.a, {
        href: "/docs/configuration",
        children: "Configuration"
      }), " guide for details."]
    }), "\n", jsx(_components.h2, {
      id: "shell-completions",
      children: "Shell Completions"
    }), "\n", jsx(_components.p, {
      children: "Generate shell completions for your shell:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Bash"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " completion"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " bash"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " >"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " /etc/bash_completion.d/tuios"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Zsh"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " completion"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " zsh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " >"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"${"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "fpath"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "[1]}/_tuios\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Fish"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " completion"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " fish"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " >"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ~/.config/fish/completions/tuios.fish"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# PowerShell"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " completion"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " powershell"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: " >"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tuios.ps1"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "next-steps",
      children: "Next Steps"
    }), "\n", jsxs(Cards, {
      children: [jsx(Card, {
        title: "Keybindings Reference",
        href: "/docs/keybindings",
        description: "Learn all keyboard shortcuts"
      }), jsx(Card, {
        title: "Configuration Guide",
        href: "/docs/configuration",
        description: "Customize TUIOS to your liking"
      }), jsx(Card, {
        title: "Tape Scripting",
        href: "/docs/tape-scripting",
        description: "Automate workflows with tape files"
      }), jsx(Card, {
        title: "CLI Reference",
        href: "/docs/cli-reference",
        description: "Complete command-line reference"
      })]
    })]
  });
}
function MDXContent$3(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$3, {
      ...props
    })
  }) : _createMdxContent$3(props);
}
function _missingMdxReference$2(id, component) {
  throw new Error("Expected " + ("component" ) + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
}

const __vite_glob_1_3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: MDXContent$3,
  frontmatter: frontmatter$3,
  structuredData: structuredData$3,
  toc: toc$3
}, Symbol.toStringTag, { value: 'Module' }));

let frontmatter$2 = {
  "title": "Welcome",
  "description": "Terminal UI Operating System - A modern terminal-based window manager",
  "icon": "Home"
};
let structuredData$2 = {
  "contents": [{
    "heading": "welcome-to-tuios",
    "content": "TUIOS (Terminal UI Operating System) is a terminal-based window manager that brings modern window management to your terminal."
  }, {
    "heading": "welcome-to-tuios",
    "content": "title: Quick Navigation"
  }, {
    "heading": "welcome-to-tuios",
    "content": "type: info"
  }, {
    "heading": "welcome-to-tuios",
    "content": "New to TUIOS? Start with Getting Started to install and learn the basics."
  }, {
    "heading": "what-is-tuios",
    "content": "Think of TUIOS as a tiling window manager for your terminal. Instead of managing GUI windows, you manage terminal sessions with:"
  }, {
    "heading": "what-is-tuios",
    "content": "Modal Interface - Vim-inspired modes for window management and terminal interaction"
  }, {
    "heading": "what-is-tuios",
    "content": "9 Workspaces - Virtual desktops for organizing your terminal windows"
  }, {
    "heading": "what-is-tuios",
    "content": "Automatic Tiling - Smart layouts that adapt as you create/close windows"
  }, {
    "heading": "what-is-tuios",
    "content": "Vim Copy Mode - Navigate 10,000 lines of scrollback with vim motions"
  }, {
    "heading": "what-is-tuios",
    "content": "Theming - 300+ built-in color themes"
  }, {
    "heading": "what-is-tuios",
    "content": "SSH Server - Remote access with per-connection isolation"
  }, {
    "heading": "why-tuios",
    "content": "Problem: Switching between multiple terminal windows/tabs is cumbersome. You lose context, forget which terminal had what, and can't see everything at once."
  }, {
    "heading": "why-tuios",
    "content": "Solution: TUIOS puts all your terminals in one view with:"
  }, {
    "heading": "why-tuios",
    "content": "Split screen without tmux complexity"
  }, {
    "heading": "why-tuios",
    "content": "Vim-like navigation (no mouse needed)"
  }, {
    "heading": "why-tuios",
    "content": "Workspace organization (development, monitoring, testing)"
  }, {
    "heading": "why-tuios",
    "content": "Scriptable automation with tape files"
  }, {
    "heading": "architecture",
    "content": "Built with Go 1.24+ using the Charm stack:"
  }, {
    "heading": "architecture",
    "content": "Bubble Tea v2 - Event-driven TUI framework"
  }, {
    "heading": "architecture",
    "content": "Lipgloss v2 - Terminal styling with caching"
  }, {
    "heading": "architecture",
    "content": "Custom VT emulator - Full ANSI/VT100 support"
  }, {
    "heading": "architecture",
    "content": "go-pty - Cross-platform PTY interface"
  }, {
    "heading": "two-modes",
    "content": "Window Management Mode (default)"
  }, {
    "heading": "two-modes",
    "content": "Navigate between windows"
  }, {
    "heading": "two-modes",
    "content": "Create, close, rename windows"
  }, {
    "heading": "two-modes",
    "content": "Switch workspaces"
  }, {
    "heading": "two-modes",
    "content": "Tile layouts"
  }, {
    "heading": "two-modes",
    "content": "Terminal Mode"
  }, {
    "heading": "two-modes",
    "content": "Send input to terminal"
  }, {
    "heading": "two-modes",
    "content": "Run commands"
  }, {
    "heading": "two-modes",
    "content": "Interact with applications"
  }, {
    "heading": "two-modes",
    "content": "Press i to enter Terminal Mode, Esc to return to Window Management."
  }, {
    "heading": "9-workspaces",
    "content": "Like virtual desktops, but for terminal windows:"
  }, {
    "heading": "9-workspaces",
    "content": "Alt+1-9 - Switch workspace"
  }, {
    "heading": "9-workspaces",
    "content": "Alt+Shift+1-9 - Move window to workspace"
  }, {
    "heading": "9-workspaces",
    "content": "Each workspace remembers its layout and focused window."
  }, {
    "heading": "tiling-modes",
    "content": "Manual - Snap windows to positions (left, right, fullscreen, corners)"
  }, {
    "heading": "tiling-modes",
    "content": "Automatic - Grid-based tiling that adapts as you add/remove windows"
  }, {
    "heading": "tiling-modes",
    "content": "Press t to toggle tiling mode."
  }, {
    "heading": "copy-mode",
    "content": "Access scrollback with vim motions:"
  }, {
    "heading": "copy-mode",
    "content": "Ctrl+B [ - Enter copy mode"
  }, {
    "heading": "copy-mode",
    "content": "hjkl - Navigate"
  }, {
    "heading": "copy-mode",
    "content": "/ - Search forward"
  }, {
    "heading": "copy-mode",
    "content": "v - Visual selection"
  }, {
    "heading": "copy-mode",
    "content": "y - Copy to clipboard"
  }, {
    "heading": "copy-mode",
    "content": "Navigate 10,000 lines of history per window."
  }, {
    "heading": "community--support",
    "content": "GitHub: Gaurav-Gosain/tuios"
  }, {
    "heading": "community--support",
    "content": "Issues: Report bugs and request features"
  }, {
    "heading": "community--support",
    "content": "Discussions: Ask questions and share workflows"
  }, {
    "heading": "community--support",
    "content": "License: MIT - Free and open source"
  }, {
    "heading": "community--support",
    "content": "title: Ready to start?"
  }, {
    "heading": "community--support",
    "content": "type: tip"
  }, {
    "heading": "community--support",
    "content": "Head to Getting Started to install TUIOS and try it yourself!"
  }],
  "headings": [{
    "id": "welcome-to-tuios",
    "content": "Welcome to TUIOS"
  }, {
    "id": "what-is-tuios",
    "content": "What is TUIOS?"
  }, {
    "id": "why-tuios",
    "content": "Why TUIOS?"
  }, {
    "id": "quick-example",
    "content": "Quick Example"
  }, {
    "id": "architecture",
    "content": "Architecture"
  }, {
    "id": "use-cases",
    "content": "Use Cases"
  }, {
    "id": "development-workflows",
    "content": "Development Workflows"
  }, {
    "id": "system-monitoring",
    "content": "System Monitoring"
  }, {
    "id": "ssh-sessions",
    "content": "SSH Sessions"
  }, {
    "id": "core-features-explained",
    "content": "Core Features Explained"
  }, {
    "id": "two-modes",
    "content": "Two Modes"
  }, {
    "id": "9-workspaces",
    "content": "9 Workspaces"
  }, {
    "id": "tiling-modes",
    "content": "Tiling Modes"
  }, {
    "id": "copy-mode",
    "content": "Copy Mode"
  }, {
    "id": "documentation-overview",
    "content": "Documentation Overview"
  }, {
    "id": "community--support",
    "content": "Community & Support"
  }]
};
const toc$2 = [{
  depth: 1,
  url: "#welcome-to-tuios",
  title: jsx(Fragment, {
    children: "Welcome to TUIOS"
  })
}, {
  depth: 2,
  url: "#what-is-tuios",
  title: jsx(Fragment, {
    children: "What is TUIOS?"
  })
}, {
  depth: 2,
  url: "#why-tuios",
  title: jsx(Fragment, {
    children: "Why TUIOS?"
  })
}, {
  depth: 2,
  url: "#quick-example",
  title: jsx(Fragment, {
    children: "Quick Example"
  })
}, {
  depth: 2,
  url: "#architecture",
  title: jsx(Fragment, {
    children: "Architecture"
  })
}, {
  depth: 2,
  url: "#use-cases",
  title: jsx(Fragment, {
    children: "Use Cases"
  })
}, {
  depth: 3,
  url: "#development-workflows",
  title: jsx(Fragment, {
    children: "Development Workflows"
  })
}, {
  depth: 3,
  url: "#system-monitoring",
  title: jsx(Fragment, {
    children: "System Monitoring"
  })
}, {
  depth: 3,
  url: "#ssh-sessions",
  title: jsx(Fragment, {
    children: "SSH Sessions"
  })
}, {
  depth: 2,
  url: "#core-features-explained",
  title: jsx(Fragment, {
    children: "Core Features Explained"
  })
}, {
  depth: 3,
  url: "#two-modes",
  title: jsx(Fragment, {
    children: "Two Modes"
  })
}, {
  depth: 3,
  url: "#9-workspaces",
  title: jsx(Fragment, {
    children: "9 Workspaces"
  })
}, {
  depth: 3,
  url: "#tiling-modes",
  title: jsx(Fragment, {
    children: "Tiling Modes"
  })
}, {
  depth: 3,
  url: "#copy-mode",
  title: jsx(Fragment, {
    children: "Copy Mode"
  })
}, {
  depth: 2,
  url: "#documentation-overview",
  title: jsx(Fragment, {
    children: "Documentation Overview"
  })
}, {
  depth: 2,
  url: "#community--support",
  title: jsx(Fragment, {
    children: "Community & Support"
  })
}];
function _createMdxContent$2(props) {
  const _components = {
    a: "a",
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    li: "li",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  }, {Card, Cards} = _components;
  if (!Card) _missingMdxReference$1("Card");
  if (!Cards) _missingMdxReference$1("Cards");
  return jsxs(Fragment, {
    children: [jsx(_components.h1, {
      id: "welcome-to-tuios",
      children: "Welcome to TUIOS"
    }), "\n", jsxs(_components.p, {
      children: ["TUIOS (Terminal UI Operating System) is a ", jsx(_components.strong, {
        children: "terminal-based window manager"
      }), " that brings modern window management to your terminal."]
    }), "\n", jsx(Callout, {
      title: "Quick Navigation",
      type: "info",
      children: jsxs(_components.p, {
        children: ["New to TUIOS? Start with ", jsx(_components.a, {
          href: "/docs/getting-started",
          children: "Getting Started"
        }), " to install and learn the basics."]
      })
    }), "\n", jsx(_components.h2, {
      id: "what-is-tuios",
      children: "What is TUIOS?"
    }), "\n", jsxs(_components.p, {
      children: ["Think of TUIOS as a ", jsx(_components.strong, {
        children: "tiling window manager for your terminal"
      }), ". Instead of managing GUI windows, you manage terminal sessions with:"]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Modal Interface"
        }), " - Vim-inspired modes for window management and terminal interaction"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "9 Workspaces"
        }), " - Virtual desktops for organizing your terminal windows"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Automatic Tiling"
        }), " - Smart layouts that adapt as you create/close windows"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Vim Copy Mode"
        }), " - Navigate 10,000 lines of scrollback with vim motions"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Theming"
        }), " - 300+ built-in color themes"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "SSH Server"
        }), " - Remote access with per-connection isolation"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "why-tuios",
      children: "Why TUIOS?"
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Problem"
      }), ": Switching between multiple terminal windows/tabs is cumbersome. You lose context, forget which terminal had what, and can't see everything at once."]
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Solution"
      }), ": TUIOS puts all your terminals in one view with:"]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Split screen without tmux complexity"
      }), "\n", jsx(_components.li, {
        children: "Vim-like navigation (no mouse needed)"
      }), "\n", jsx(_components.li, {
        children: "Workspace organization (development, monitoring, testing)"
      }), "\n", jsx(_components.li, {
        children: "Scriptable automation with tape files"
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "quick-example",
      children: "Quick Example"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Create 3 windows in a tiled layout"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Press 'n' to create window 1"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Press 'n' to create window 2"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Press 't' to enable tiling"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Press 'i' to enter terminal mode"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "architecture",
      children: "Architecture"
    }), "\n", jsxs(_components.p, {
      children: ["Built with ", jsx(_components.strong, {
        children: "Go 1.24+"
      }), " using the ", jsx(_components.a, {
        href: "https://charm.sh",
        children: "Charm stack"
      }), ":"]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Bubble Tea v2"
        }), " - Event-driven TUI framework"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Lipgloss v2"
        }), " - Terminal styling with caching"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Custom VT emulator"
        }), " - Full ANSI/VT100 support"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "go-pty"
        }), " - Cross-platform PTY interface"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "use-cases",
      children: "Use Cases"
    }), "\n", jsx(_components.h3, {
      id: "development-workflows",
      children: "Development Workflows"
    }), "\n", jsxs("div", {
      className: "grid grid-cols-2 gap-3 my-6 max-w-2xl",
      children: [jsx("div", {
        className: "border-2 border-fd-primary/50 rounded-lg p-4 bg-fd-muted/30 flex items-center justify-center min-h-[120px]",
        children: jsxs("div", {
          className: "text-center",
          children: [jsx("div", {
            className: "text-lg font-semibold text-fd-primary mb-1",
            children: "Editor (vim)"
          }), jsx("div", {
            className: "text-xs text-fd-muted-foreground",
            children: "main.go"
          })]
        })
      }), jsx("div", {
        className: "border-2 border-fd-border rounded-lg p-4 bg-fd-muted/30 flex items-center justify-center min-h-[120px]",
        children: jsxs("div", {
          className: "text-center",
          children: [jsx("div", {
            className: "text-lg font-semibold",
            children: "git status"
          }), jsx("div", {
            className: "text-xs text-fd-muted-foreground",
            children: "branch: main"
          })]
        })
      }), jsx("div", {
        className: "border-2 border-fd-border rounded-lg p-4 bg-fd-muted/30 flex items-center justify-center min-h-[120px]",
        children: jsxs("div", {
          className: "text-center",
          children: [jsx("div", {
            className: "text-lg font-semibold",
            children: "Test runner"
          }), jsx("div", {
            className: "text-xs text-fd-muted-foreground",
            children: "watching..."
          })]
        })
      }), jsx("div", {
        className: "border-2 border-fd-border rounded-lg p-4 bg-fd-muted/30 flex items-center justify-center min-h-[120px]",
        children: jsxs("div", {
          className: "text-center",
          children: [jsx("div", {
            className: "text-lg font-semibold",
            children: "Server logs"
          }), jsx("div", {
            className: "text-xs text-fd-muted-foreground",
            children: ":8080"
          })]
        })
      })]
    }), "\n", jsx(_components.h3, {
      id: "system-monitoring",
      children: "System Monitoring"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "Workspace 1: Development (editor, tests, git)"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "Workspace 2: Monitoring (htop, logs, metrics)"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "Workspace 3: Databases (psql, redis-cli)"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "ssh-sessions",
      children: "SSH Sessions"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Start TUIOS SSH server"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ssh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --host"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 0.0.0.0"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --port"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 2222"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Connect remotely"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "ssh"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -p"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 2222"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " user@server"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Each connection gets isolated TUIOS session"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "core-features-explained",
      children: "Core Features Explained"
    }), "\n", jsx(_components.h3, {
      id: "two-modes",
      children: "Two Modes"
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Window Management Mode"
      }), " (default)"]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Navigate between windows"
      }), "\n", jsx(_components.li, {
        children: "Create, close, rename windows"
      }), "\n", jsx(_components.li, {
        children: "Switch workspaces"
      }), "\n", jsx(_components.li, {
        children: "Tile layouts"
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Terminal Mode"
      })
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Send input to terminal"
      }), "\n", jsx(_components.li, {
        children: "Run commands"
      }), "\n", jsx(_components.li, {
        children: "Interact with applications"
      }), "\n"]
    }), "\n", jsxs(_components.p, {
      children: ["Press ", jsx("kbd", {
        children: "i"
      }), " to enter Terminal Mode, ", jsx("kbd", {
        children: "Esc"
      }), " to return to Window Management."]
    }), "\n", jsx(_components.h3, {
      id: "9-workspaces",
      children: "9 Workspaces"
    }), "\n", jsx(_components.p, {
      children: "Like virtual desktops, but for terminal windows:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Alt"
        }), "+", jsx("kbd", {
          children: "1-9"
        }), " - Switch workspace"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Alt"
        }), "+", jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "1-9"
        }), " - Move window to workspace"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "Each workspace remembers its layout and focused window."
    }), "\n", jsx(_components.h3, {
      id: "tiling-modes",
      children: "Tiling Modes"
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Manual"
      }), " - Snap windows to positions (left, right, fullscreen, corners)"]
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Automatic"
      }), " - Grid-based tiling that adapts as you add/remove windows"]
    }), "\n", jsxs(_components.p, {
      children: ["Press ", jsx("kbd", {
        children: "t"
      }), " to toggle tiling mode."]
    }), "\n", jsx(_components.h3, {
      id: "copy-mode",
      children: "Copy Mode"
    }), "\n", jsx(_components.p, {
      children: "Access scrollback with vim motions:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "["
        }), " - Enter copy mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "h"
        }), jsx("kbd", {
          children: "j"
        }), jsx("kbd", {
          children: "k"
        }), jsx("kbd", {
          children: "l"
        }), " - Navigate"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "/"
        }), " - Search forward"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "v"
        }), " - Visual selection"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "y"
        }), " - Copy to clipboard"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "Navigate 10,000 lines of history per window."
    }), "\n", jsx(_components.h2, {
      id: "documentation-overview",
      children: "Documentation Overview"
    }), "\n", jsxs(Cards, {
      children: [jsx(Card, {
        title: "Getting Started",
        href: "/docs/getting-started",
        description: "Install TUIOS and learn the essential operations"
      }), jsx(Card, {
        title: "Keybindings",
        href: "/docs/keybindings",
        description: "Complete keyboard shortcuts reference"
      }), jsx(Card, {
        title: "Configuration",
        href: "/docs/configuration",
        description: "Customize keybindings and appearance"
      }), jsx(Card, {
        title: "Tape Scripting",
        href: "/docs/tape-scripting",
        description: "Automate workflows with tape files"
      }), jsx(Card, {
        title: "CLI Reference",
        href: "/docs/cli-reference",
        description: "Command-line options and usage"
      }), jsx(Card, {
        title: "Architecture",
        href: "/docs/architecture",
        description: "Technical design and internals"
      })]
    }), "\n", jsx(_components.h2, {
      id: "community--support",
      children: "Community & Support"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "GitHub"
        }), ": ", jsx(_components.a, {
          href: "https://github.com/Gaurav-Gosain/tuios",
          children: "Gaurav-Gosain/tuios"
        })]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Issues"
        }), ": Report bugs and request features"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Discussions"
        }), ": Ask questions and share workflows"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "License"
        }), ": MIT - Free and open source"]
      }), "\n"]
    }), "\n", jsx(Callout, {
      title: "Ready to start?",
      type: "tip",
      children: jsxs(_components.p, {
        children: ["Head to ", jsx(_components.a, {
          href: "/docs/getting-started",
          children: "Getting Started"
        }), " to install TUIOS and try it yourself!"]
      })
    })]
  });
}
function MDXContent$2(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$2, {
      ...props
    })
  }) : _createMdxContent$2(props);
}
function _missingMdxReference$1(id, component) {
  throw new Error("Expected " + ("component" ) + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
}

const __vite_glob_1_4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: MDXContent$2,
  frontmatter: frontmatter$2,
  structuredData: structuredData$2,
  toc: toc$2
}, Symbol.toStringTag, { value: 'Module' }));

let frontmatter$1 = {
  "title": "Keybindings",
  "description": "Complete keyboard shortcut reference for TUIOS",
  "icon": "Keyboard"
};
let structuredData$1 = {
  "contents": [{
    "heading": "keybindings-reference",
    "content": "Complete keyboard shortcut reference for TUIOS. All keybindings are customizable through the configuration file."
  }, {
    "heading": "keybindings-reference",
    "content": "title: Quick Tip"
  }, {
    "heading": "keybindings-reference",
    "content": "type: tip"
  }, {
    "heading": "keybindings-reference",
    "content": "Press Ctrl+B then ? from anywhere in TUIOS to see the help overlay!"
  }, {
    "heading": "modes",
    "content": "TUIOS has two main modes:"
  }, {
    "heading": "modes",
    "content": "Window Management Mode - Navigate and manage windows (default on startup)"
  }, {
    "heading": "modes",
    "content": "Terminal Mode - Input goes directly to the focused terminal"
  }, {
    "heading": "mode-switching",
    "content": "i or Enter - Enter Terminal Mode"
  }, {
    "heading": "mode-switching",
    "content": "Ctrl+B then d or Esc - Return to Window Management Mode (from Terminal Mode)"
  }, {
    "heading": "mode-switching",
    "content": "? (Window Mode) or Ctrl+B then ? (universal) - Toggle help overlay"
  }, {
    "heading": "mode-switching",
    "content": "q (Window Mode) or Ctrl+B then q (universal) - Quit TUIOS"
  }, {
    "heading": "window-management",
    "content": "n - Create new window"
  }, {
    "heading": "window-management",
    "content": "w or x - Close focused window"
  }, {
    "heading": "window-management",
    "content": "r - Rename focused window"
  }, {
    "heading": "window-management",
    "content": "m - Minimize focused window"
  }, {
    "heading": "window-management",
    "content": "Shift+M - Restore all minimized windows"
  }, {
    "heading": "window-management",
    "content": "Tab - Focus next window"
  }, {
    "heading": "window-management",
    "content": "Shift+Tab - Focus previous window"
  }, {
    "heading": "window-management",
    "content": "1-9 - Select window by number"
  }, {
    "heading": "window-management",
    "content": "Shift+1-9 or !@#$%^&*( - Restore minimized window by number"
  }, {
    "heading": "workspaces",
    "content": "TUIOS supports 9 workspaces for organizing windows."
  }, {
    "heading": "workspaces",
    "content": "Alt+1 through Alt+9 - Switch to workspace 1-9"
  }, {
    "heading": "workspaces",
    "content": "Alt+Shift+1 through Alt+Shift+9 - Move window to workspace and follow"
  }, {
    "heading": "workspaces",
    "content": "title: macOS Users"
  }, {
    "heading": "workspaces",
    "content": "type: info"
  }, {
    "heading": "workspaces",
    "content": "Use Option+1 through Option+9 (automatically configured by default)"
  }, {
    "heading": "manual-snapping-non-tiling-mode",
    "content": "h - Snap window to left half"
  }, {
    "heading": "manual-snapping-non-tiling-mode",
    "content": "l - Snap window to right half"
  }, {
    "heading": "manual-snapping-non-tiling-mode",
    "content": "f - Fullscreen window"
  }, {
    "heading": "manual-snapping-non-tiling-mode",
    "content": "u - Unsnap/restore window"
  }, {
    "heading": "manual-snapping-non-tiling-mode",
    "content": "1 - Snap to top-left corner"
  }, {
    "heading": "manual-snapping-non-tiling-mode",
    "content": "2 - Snap to top-right corner"
  }, {
    "heading": "manual-snapping-non-tiling-mode",
    "content": "3 - Snap to bottom-left corner"
  }, {
    "heading": "manual-snapping-non-tiling-mode",
    "content": "4 - Snap to bottom-right corner"
  }, {
    "heading": "tiling-mode",
    "content": "t - Toggle automatic tiling mode"
  }, {
    "heading": "tiling-mode",
    "content": "Shift+H or Ctrl+Left - Swap with window to the left"
  }, {
    "heading": "tiling-mode",
    "content": "Shift+L or Ctrl+Right - Swap with window to the right"
  }, {
    "heading": "tiling-mode",
    "content": "Shift+K or Ctrl+Up - Swap with window above"
  }, {
    "heading": "tiling-mode",
    "content": "Shift+J or Ctrl+Down - Swap with window below"
  }, {
    "heading": "tiling-mode",
    "content": "< or Shift+, - Decrease master window width (from right edge)"
  }, {
    "heading": "tiling-mode",
    "content": "> or Shift+. - Increase master window width (from right edge)"
  }, {
    "heading": "tiling-mode",
    "content": "{ or Shift+[ - Decrease focused window height (from bottom edge)"
  }, {
    "heading": "tiling-mode",
    "content": "} or Shift+] - Increase focused window height (from bottom edge)"
  }, {
    "heading": "copy-mode",
    "content": "Enter copy mode with Ctrl+B then [ to navigate scrollback and select text using vim-style commands."
  }, {
    "heading": "copy-mode",
    "content": "title: Vim Users"
  }, {
    "heading": "copy-mode",
    "content": "type: tip"
  }, {
    "heading": "copy-mode",
    "content": "Copy mode supports 50+ vim motions including word movements, paragraph jumps, and search!"
  }, {
    "heading": "basic-navigation",
    "content": "Ctrl+B then [ - Enter copy mode"
  }, {
    "heading": "basic-navigation",
    "content": "h j k l - Move cursor left/down/up/right"
  }, {
    "heading": "basic-navigation",
    "content": "w b e - Word forward / word backward / word end"
  }, {
    "heading": "basic-navigation",
    "content": "0 ^ $ - Start of line / first non-blank / end of line"
  }, {
    "heading": "basic-navigation",
    "content": "gg - Jump to top of scrollback"
  }, {
    "heading": "basic-navigation",
    "content": "G - Jump to bottom (live output)"
  }, {
    "heading": "basic-navigation",
    "content": "{number}G - Jump to line number (e.g., 10G)"
  }, {
    "heading": "basic-navigation",
    "content": "{ } - Jump to previous/next paragraph"
  }, {
    "heading": "basic-navigation",
    "content": "Ctrl+U Ctrl+D - Half page up/down"
  }, {
    "heading": "basic-navigation",
    "content": "Ctrl+B Ctrl+F - Full page up/down"
  }, {
    "heading": "basic-navigation",
    "content": "i - Return to terminal mode"
  }, {
    "heading": "basic-navigation",
    "content": "q or Esc - Exit copy mode"
  }, {
    "heading": "count-prefix",
    "content": "Prefix any motion with a number to repeat it:"
  }, {
    "heading": "count-prefix",
    "content": "10j - Move down 10 lines"
  }, {
    "heading": "count-prefix",
    "content": "5w - Move forward 5 words"
  }, {
    "heading": "count-prefix",
    "content": "3{ - Jump up 3 paragraphs"
  }, {
    "heading": "character-search",
    "content": "f{char} - Find next occurrence of char on line"
  }, {
    "heading": "character-search",
    "content": "F{char} - Find previous occurrence of char on line"
  }, {
    "heading": "character-search",
    "content": "t{char} - Move cursor before next char"
  }, {
    "heading": "character-search",
    "content": "T{char} - Move cursor after previous char"
  }, {
    "heading": "character-search",
    "content": "; - Repeat last character search"
  }, {
    "heading": "character-search",
    "content": ", - Repeat last search (opposite direction)"
  }, {
    "heading": "search",
    "content": "/ - Search forward"
  }, {
    "heading": "search",
    "content": "? - Search backward"
  }, {
    "heading": "search",
    "content": "n - Next match"
  }, {
    "heading": "search",
    "content": "N - Previous match"
  }, {
    "heading": "search",
    "content": "Ctrl+L - Clear search highlights"
  }, {
    "heading": "visual-selection",
    "content": "v - Enter visual character mode"
  }, {
    "heading": "visual-selection",
    "content": "V - Enter visual line mode"
  }, {
    "heading": "visual-selection",
    "content": "y or c - Yank (copy) selection to clipboard"
  }, {
    "heading": "visual-selection",
    "content": "Esc or q - Exit visual mode"
  }, {
    "heading": "prefix-commands",
    "content": "Press Ctrl+B, release, then press the command key (tmux-style)."
  }, {
    "heading": "prefix-commands",
    "content": "title: Leader Key"
  }, {
    "heading": "prefix-commands",
    "content": "type: info"
  }, {
    "heading": "prefix-commands",
    "content": "The leader key (Ctrl+B by default) is configurable. See Configuration Guide for details."
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then c - Create new window"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then x - Close current window"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then , or r - Rename window"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then n or Tab - Next window"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then p or Shift+Tab - Previous window"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then 0-9 - Jump to window"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then Space - Toggle tiling mode"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then z - Fullscreen current window"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then w - Enter workspace prefix menu"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then m - Enter minimize prefix menu"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then t - Enter window prefix menu"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then D - Enter debug prefix menu"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then [ - Enter copy mode"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then d or Esc - Detach (exit terminal mode)"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then q - Quit TUIOS"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then ? - Toggle help"
  }, {
    "heading": "main-prefix-ctrlb",
    "content": "Ctrl+B then Ctrl+B - Send literal Ctrl+B to terminal"
  }, {
    "heading": "workspace-prefix-ctrlb-then-w",
    "content": "Ctrl+B then w then 1-9 - Switch to workspace"
  }, {
    "heading": "workspace-prefix-ctrlb-then-w",
    "content": "Ctrl+B then w then Shift+1-9 - Move window to workspace and follow"
  }, {
    "heading": "workspace-prefix-ctrlb-then-w",
    "content": "Ctrl+B then w then Esc - Cancel"
  }, {
    "heading": "debug-prefix-ctrlb-then-d",
    "content": "Access debug and development tools:"
  }, {
    "heading": "debug-prefix-ctrlb-then-d",
    "content": "Ctrl+B then D then l - Toggle log viewer"
  }, {
    "heading": "debug-prefix-ctrlb-then-d",
    "content": "Ctrl+B then D then c - Toggle cache statistics"
  }, {
    "heading": "debug-prefix-ctrlb-then-d",
    "content": "Ctrl+B then D then k - Toggle showkeys overlay"
  }, {
    "heading": "debug-prefix-ctrlb-then-d",
    "content": "Ctrl+B then D then Esc - Cancel"
  }, {
    "heading": "mouse-controls",
    "content": "Left Click - Focus window"
  }, {
    "heading": "mouse-controls",
    "content": "Left Drag - Move window (non-tiling) or swap windows (tiling)"
  }, {
    "heading": "mouse-controls",
    "content": "Right Drag - Resize window (non-tiling only)"
  }, {
    "heading": "mouse-controls",
    "content": "Title Bar Buttons - Minimize, maximize, or close window"
  }, {
    "heading": "mouse-controls",
    "content": "Click Dock Item - Restore minimized window"
  }, {
    "heading": "mouse-controls",
    "content": "Copy Mode Click - Move cursor to position"
  }, {
    "heading": "mouse-controls",
    "content": "Copy Mode Drag - Select text (enters visual mode)"
  }, {
    "heading": "customization",
    "content": "All keybindings can be customized in the configuration file. See the Configuration Guide for details."
  }, {
    "heading": "macos",
    "content": "Default workspace switching uses Option key:"
  }, {
    "heading": "macos",
    "content": "Option+1 through Option+9 - Switch workspace"
  }, {
    "heading": "macos",
    "content": "Option+Shift+1 through Option+Shift+9 - Move window to workspace"
  }, {
    "heading": "macos",
    "content": "You can still type Option key unicode characters (¡™£¢∞§¶•ª) in Terminal Mode."
  }, {
    "heading": "linux",
    "content": "Uses standard Alt key for workspace switching:"
  }, {
    "heading": "linux",
    "content": "Alt+1 through Alt+9"
  }, {
    "heading": "linux",
    "content": "Alt+Shift+1 through Alt+Shift+9"
  }],
  "headings": [{
    "id": "keybindings-reference",
    "content": "Keybindings Reference"
  }, {
    "id": "modes",
    "content": "Modes"
  }, {
    "id": "mode-switching",
    "content": "Mode Switching"
  }, {
    "id": "window-management",
    "content": "Window Management"
  }, {
    "id": "workspaces",
    "content": "Workspaces"
  }, {
    "id": "window-layout",
    "content": "Window Layout"
  }, {
    "id": "manual-snapping-non-tiling-mode",
    "content": "Manual Snapping (Non-Tiling Mode)"
  }, {
    "id": "tiling-mode",
    "content": "Tiling Mode"
  }, {
    "id": "copy-mode",
    "content": "Copy Mode"
  }, {
    "id": "basic-navigation",
    "content": "Basic Navigation"
  }, {
    "id": "count-prefix",
    "content": "Count Prefix"
  }, {
    "id": "character-search",
    "content": "Character Search"
  }, {
    "id": "search",
    "content": "Search"
  }, {
    "id": "visual-selection",
    "content": "Visual Selection"
  }, {
    "id": "prefix-commands",
    "content": "Prefix Commands"
  }, {
    "id": "main-prefix-ctrlb",
    "content": "Main Prefix (Ctrl+B)"
  }, {
    "id": "workspace-prefix-ctrlb-then-w",
    "content": "Workspace Prefix (Ctrl+B then w)"
  }, {
    "id": "debug-prefix-ctrlb-then-d",
    "content": "Debug Prefix (Ctrl+B then D)"
  }, {
    "id": "mouse-controls",
    "content": "Mouse Controls"
  }, {
    "id": "customization",
    "content": "Customization"
  }, {
    "id": "quick-customization",
    "content": "Quick Customization"
  }, {
    "id": "platform-specific-notes",
    "content": "Platform-Specific Notes"
  }, {
    "id": "macos",
    "content": "macOS"
  }, {
    "id": "linux",
    "content": "Linux"
  }, {
    "id": "related-documentation",
    "content": "Related Documentation"
  }]
};
const toc$1 = [{
  depth: 1,
  url: "#keybindings-reference",
  title: jsx(Fragment, {
    children: "Keybindings Reference"
  })
}, {
  depth: 2,
  url: "#modes",
  title: jsx(Fragment, {
    children: "Modes"
  })
}, {
  depth: 3,
  url: "#mode-switching",
  title: jsx(Fragment, {
    children: "Mode Switching"
  })
}, {
  depth: 2,
  url: "#window-management",
  title: jsx(Fragment, {
    children: "Window Management"
  })
}, {
  depth: 2,
  url: "#workspaces",
  title: jsx(Fragment, {
    children: "Workspaces"
  })
}, {
  depth: 2,
  url: "#window-layout",
  title: jsx(Fragment, {
    children: "Window Layout"
  })
}, {
  depth: 3,
  url: "#manual-snapping-non-tiling-mode",
  title: jsx(Fragment, {
    children: "Manual Snapping (Non-Tiling Mode)"
  })
}, {
  depth: 3,
  url: "#tiling-mode",
  title: jsx(Fragment, {
    children: "Tiling Mode"
  })
}, {
  depth: 2,
  url: "#copy-mode",
  title: jsx(Fragment, {
    children: "Copy Mode"
  })
}, {
  depth: 3,
  url: "#basic-navigation",
  title: jsx(Fragment, {
    children: "Basic Navigation"
  })
}, {
  depth: 3,
  url: "#count-prefix",
  title: jsx(Fragment, {
    children: "Count Prefix"
  })
}, {
  depth: 3,
  url: "#character-search",
  title: jsx(Fragment, {
    children: "Character Search"
  })
}, {
  depth: 3,
  url: "#search",
  title: jsx(Fragment, {
    children: "Search"
  })
}, {
  depth: 3,
  url: "#visual-selection",
  title: jsx(Fragment, {
    children: "Visual Selection"
  })
}, {
  depth: 2,
  url: "#prefix-commands",
  title: jsx(Fragment, {
    children: "Prefix Commands"
  })
}, {
  depth: 3,
  url: "#main-prefix-ctrlb",
  title: jsxs(Fragment, {
    children: ["Main Prefix (", jsx("kbd", {
      children: "Ctrl"
    }), "+", jsx("kbd", {
      children: "B"
    }), ")"]
  })
}, {
  depth: 3,
  url: "#workspace-prefix-ctrlb-then-w",
  title: jsxs(Fragment, {
    children: ["Workspace Prefix (", jsx("kbd", {
      children: "Ctrl"
    }), "+", jsx("kbd", {
      children: "B"
    }), " then ", jsx("kbd", {
      children: "w"
    }), ")"]
  })
}, {
  depth: 3,
  url: "#debug-prefix-ctrlb-then-d",
  title: jsxs(Fragment, {
    children: ["Debug Prefix (", jsx("kbd", {
      children: "Ctrl"
    }), "+", jsx("kbd", {
      children: "B"
    }), " then ", jsx("kbd", {
      children: "D"
    }), ")"]
  })
}, {
  depth: 2,
  url: "#mouse-controls",
  title: jsx(Fragment, {
    children: "Mouse Controls"
  })
}, {
  depth: 2,
  url: "#customization",
  title: jsx(Fragment, {
    children: "Customization"
  })
}, {
  depth: 3,
  url: "#quick-customization",
  title: jsx(Fragment, {
    children: "Quick Customization"
  })
}, {
  depth: 2,
  url: "#platform-specific-notes",
  title: jsx(Fragment, {
    children: "Platform-Specific Notes"
  })
}, {
  depth: 3,
  url: "#macos",
  title: jsx(Fragment, {
    children: "macOS"
  })
}, {
  depth: 3,
  url: "#linux",
  title: jsx(Fragment, {
    children: "Linux"
  })
}, {
  depth: 2,
  url: "#related-documentation",
  title: jsx(Fragment, {
    children: "Related Documentation"
  })
}];
function _createMdxContent$1(props) {
  const _components = {
    a: "a",
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    li: "li",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h1, {
      id: "keybindings-reference",
      children: "Keybindings Reference"
    }), "\n", jsxs(_components.p, {
      children: ["Complete keyboard shortcut reference for TUIOS. All keybindings are customizable through the ", jsx(_components.a, {
        href: "/docs/configuration",
        children: "configuration file"
      }), "."]
    }), "\n", jsx(Callout, {
      title: "Quick Tip",
      type: "tip",
      children: jsxs(_components.p, {
        children: ["Press ", jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "?"
        }), " from anywhere in TUIOS to see the help overlay!"]
      })
    }), "\n", jsx(_components.h2, {
      id: "modes",
      children: "Modes"
    }), "\n", jsx(_components.p, {
      children: "TUIOS has two main modes:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Window Management Mode"
        }), " - Navigate and manage windows (default on startup)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Terminal Mode"
        }), " - Input goes directly to the focused terminal"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "mode-switching",
      children: "Mode Switching"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "i"
        }), " or ", jsx("kbd", {
          children: "Enter"
        }), " - Enter Terminal Mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "d"
        }), " or ", jsx("kbd", {
          children: "Esc"
        }), " - Return to Window Management Mode (from Terminal Mode)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "?"
        }), " (Window Mode) or ", jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "?"
        }), " (universal) - Toggle help overlay"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "q"
        }), " (Window Mode) or ", jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "q"
        }), " (universal) - Quit TUIOS"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "window-management",
      children: "Window Management"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "n"
        }), " - Create new window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "w"
        }), " or ", jsx("kbd", {
          children: "x"
        }), " - Close focused window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "r"
        }), " - Rename focused window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "m"
        }), " - Minimize focused window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "M"
        }), " - Restore all minimized windows"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Tab"
        }), " - Focus next window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "Tab"
        }), " - Focus previous window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "1"
        }), "-", jsx("kbd", {
          children: "9"
        }), " - Select window by number"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "1"
        }), "-", jsx("kbd", {
          children: "9"
        }), " or ", jsx("kbd", {
          children: "!@#$%^&*("
        }), " - Restore minimized window by number"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "workspaces",
      children: "Workspaces"
    }), "\n", jsxs(_components.p, {
      children: ["TUIOS supports ", jsx(_components.strong, {
        children: "9 workspaces"
      }), " for organizing windows."]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Alt"
        }), "+", jsx("kbd", {
          children: "1"
        }), " through ", jsx("kbd", {
          children: "Alt"
        }), "+", jsx("kbd", {
          children: "9"
        }), " - Switch to workspace 1-9"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Alt"
        }), "+", jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "1"
        }), " through ", jsx("kbd", {
          children: "Alt"
        }), "+", jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "9"
        }), " - Move window to workspace and follow"]
      }), "\n"]
    }), "\n", jsx(Callout, {
      title: "macOS Users",
      type: "info",
      children: jsxs(_components.p, {
        children: ["Use ", jsx("kbd", {
          children: "Option"
        }), "+", jsx("kbd", {
          children: "1"
        }), " through ", jsx("kbd", {
          children: "Option"
        }), "+", jsx("kbd", {
          children: "9"
        }), " (automatically configured by default)"]
      })
    }), "\n", jsx(_components.h2, {
      id: "window-layout",
      children: "Window Layout"
    }), "\n", jsx(_components.h3, {
      id: "manual-snapping-non-tiling-mode",
      children: "Manual Snapping (Non-Tiling Mode)"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "h"
        }), " - Snap window to left half"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "l"
        }), " - Snap window to right half"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "f"
        }), " - Fullscreen window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "u"
        }), " - Unsnap/restore window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "1"
        }), " - Snap to top-left corner"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "2"
        }), " - Snap to top-right corner"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "3"
        }), " - Snap to bottom-left corner"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "4"
        }), " - Snap to bottom-right corner"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "tiling-mode",
      children: "Tiling Mode"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "t"
        }), " - Toggle automatic tiling mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "H"
        }), " or ", jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "Left"
        }), " - Swap with window to the left"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "L"
        }), " or ", jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "Right"
        }), " - Swap with window to the right"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "K"
        }), " or ", jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "Up"
        }), " - Swap with window above"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "J"
        }), " or ", jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "Down"
        }), " - Swap with window below"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "<"
        }), " or ", jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: ","
        }), " - Decrease master window width (from right edge)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: ">"
        }), " or ", jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "."
        }), " - Increase master window width (from right edge)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "{"
        }), " or ", jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "["
        }), " - Decrease focused window height (from bottom edge)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "}"
        }), " or ", jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "]"
        }), " - Increase focused window height (from bottom edge)"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "copy-mode",
      children: "Copy Mode"
    }), "\n", jsxs(_components.p, {
      children: ["Enter copy mode with ", jsx("kbd", {
        children: "Ctrl"
      }), "+", jsx("kbd", {
        children: "B"
      }), " then ", jsx("kbd", {
        children: "["
      }), " to navigate scrollback and select text using vim-style commands."]
    }), "\n", jsx(Callout, {
      title: "Vim Users",
      type: "tip",
      children: jsx(_components.p, {
        children: "Copy mode supports 50+ vim motions including word movements, paragraph jumps, and search!"
      })
    }), "\n", jsx(_components.h3, {
      id: "basic-navigation",
      children: "Basic Navigation"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "["
        }), " - Enter copy mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "h"
        }), " ", jsx("kbd", {
          children: "j"
        }), " ", jsx("kbd", {
          children: "k"
        }), " ", jsx("kbd", {
          children: "l"
        }), " - Move cursor left/down/up/right"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "w"
        }), " ", jsx("kbd", {
          children: "b"
        }), " ", jsx("kbd", {
          children: "e"
        }), " - Word forward / word backward / word end"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "0"
        }), " ", jsx("kbd", {
          children: "^"
        }), " ", jsx("kbd", {
          children: "$"
        }), " - Start of line / first non-blank / end of line"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "g"
        }), jsx("kbd", {
          children: "g"
        }), " - Jump to top of scrollback"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "G"
        }), " - Jump to bottom (live output)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "{number}"
        }), jsx("kbd", {
          children: "G"
        }), " - Jump to line number (e.g., 10G)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "{"
        }), " ", jsx("kbd", {
          children: "}"
        }), " - Jump to previous/next paragraph"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "U"
        }), " ", jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "D"
        }), " - Half page up/down"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " ", jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "F"
        }), " - Full page up/down"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "i"
        }), " - Return to terminal mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "q"
        }), " or ", jsx("kbd", {
          children: "Esc"
        }), " - Exit copy mode"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "count-prefix",
      children: "Count Prefix"
    }), "\n", jsx(_components.p, {
      children: "Prefix any motion with a number to repeat it:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "1"
        }), jsx("kbd", {
          children: "0"
        }), jsx("kbd", {
          children: "j"
        }), " - Move down 10 lines"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "5"
        }), jsx("kbd", {
          children: "w"
        }), " - Move forward 5 words"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "3"
        }), jsx("kbd", {
          children: "{"
        }), " - Jump up 3 paragraphs"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "character-search",
      children: "Character Search"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "f"
        }), jsx("kbd", {
          children: "{char}"
        }), " - Find next occurrence of char on line"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "F"
        }), jsx("kbd", {
          children: "{char}"
        }), " - Find previous occurrence of char on line"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "t"
        }), jsx("kbd", {
          children: "{char}"
        }), " - Move cursor before next char"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "T"
        }), jsx("kbd", {
          children: "{char}"
        }), " - Move cursor after previous char"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: ";"
        }), " - Repeat last character search"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: ","
        }), " - Repeat last search (opposite direction)"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "search",
      children: "Search"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "/"
        }), " - Search forward"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "?"
        }), " - Search backward"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "n"
        }), " - Next match"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "N"
        }), " - Previous match"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "L"
        }), " - Clear search highlights"]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "visual-selection",
      children: "Visual Selection"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "v"
        }), " - Enter visual character mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "V"
        }), " - Enter visual line mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "y"
        }), " or ", jsx("kbd", {
          children: "c"
        }), " - Yank (copy) selection to clipboard"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Esc"
        }), " or ", jsx("kbd", {
          children: "q"
        }), " - Exit visual mode"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "prefix-commands",
      children: "Prefix Commands"
    }), "\n", jsxs(_components.p, {
      children: ["Press ", jsx("kbd", {
        children: "Ctrl"
      }), "+", jsx("kbd", {
        children: "B"
      }), ", release, then press the command key (tmux-style)."]
    }), "\n", jsx(Callout, {
      title: "Leader Key",
      type: "info",
      children: jsxs(_components.p, {
        children: ["The leader key (", jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " by default) is configurable. See ", jsx(_components.a, {
          href: "/docs/configuration",
          children: "Configuration Guide"
        }), " for details."]
      })
    }), "\n", jsxs(_components.h3, {
      id: "main-prefix-ctrlb",
      children: ["Main Prefix (", jsx("kbd", {
        children: "Ctrl"
      }), "+", jsx("kbd", {
        children: "B"
      }), ")"]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "c"
        }), " - Create new window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "x"
        }), " - Close current window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: ","
        }), " or ", jsx("kbd", {
          children: "r"
        }), " - Rename window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "n"
        }), " or ", jsx("kbd", {
          children: "Tab"
        }), " - Next window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "p"
        }), " or ", jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "Tab"
        }), " - Previous window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "0"
        }), "-", jsx("kbd", {
          children: "9"
        }), " - Jump to window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "Space"
        }), " - Toggle tiling mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "z"
        }), " - Fullscreen current window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "w"
        }), " - Enter workspace prefix menu"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "m"
        }), " - Enter minimize prefix menu"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "t"
        }), " - Enter window prefix menu"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "D"
        }), " - Enter debug prefix menu"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "["
        }), " - Enter copy mode"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "d"
        }), " or ", jsx("kbd", {
          children: "Esc"
        }), " - Detach (exit terminal mode)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "q"
        }), " - Quit TUIOS"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "?"
        }), " - Toggle help"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " - Send literal Ctrl+B to terminal"]
      }), "\n"]
    }), "\n", jsxs(_components.h3, {
      id: "workspace-prefix-ctrlb-then-w",
      children: ["Workspace Prefix (", jsx("kbd", {
        children: "Ctrl"
      }), "+", jsx("kbd", {
        children: "B"
      }), " then ", jsx("kbd", {
        children: "w"
      }), ")"]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "w"
        }), " then ", jsx("kbd", {
          children: "1"
        }), "-", jsx("kbd", {
          children: "9"
        }), " - Switch to workspace"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "w"
        }), " then ", jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "1"
        }), "-", jsx("kbd", {
          children: "9"
        }), " - Move window to workspace and follow"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "w"
        }), " then ", jsx("kbd", {
          children: "Esc"
        }), " - Cancel"]
      }), "\n"]
    }), "\n", jsxs(_components.h3, {
      id: "debug-prefix-ctrlb-then-d",
      children: ["Debug Prefix (", jsx("kbd", {
        children: "Ctrl"
      }), "+", jsx("kbd", {
        children: "B"
      }), " then ", jsx("kbd", {
        children: "D"
      }), ")"]
    }), "\n", jsx(_components.p, {
      children: "Access debug and development tools:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "D"
        }), " then ", jsx("kbd", {
          children: "l"
        }), " - Toggle log viewer"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "D"
        }), " then ", jsx("kbd", {
          children: "c"
        }), " - Toggle cache statistics"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "D"
        }), " then ", jsx("kbd", {
          children: "k"
        }), " - Toggle showkeys overlay"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Ctrl"
        }), "+", jsx("kbd", {
          children: "B"
        }), " then ", jsx("kbd", {
          children: "D"
        }), " then ", jsx("kbd", {
          children: "Esc"
        }), " - Cancel"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "mouse-controls",
      children: "Mouse Controls"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Left Click"
        }), " - Focus window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Left Drag"
        }), " - Move window (non-tiling) or swap windows (tiling)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Right Drag"
        }), " - Resize window (non-tiling only)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Title Bar Buttons"
        }), " - Minimize, maximize, or close window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Click Dock Item"
        }), " - Restore minimized window"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Copy Mode Click"
        }), " - Move cursor to position"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Copy Mode Drag"
        }), " - Select text (enters visual mode)"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "customization",
      children: "Customization"
    }), "\n", jsxs(_components.p, {
      children: ["All keybindings can be customized in the configuration file. See the ", jsx(_components.a, {
        href: "/docs/configuration",
        children: "Configuration Guide"
      }), " for details."]
    }), "\n", jsx(_components.h3, {
      id: "quick-customization",
      children: "Quick Customization"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Edit your keybindings"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " edit"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# View current configuration"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " keybinds"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " list"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# View only your customizations"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " keybinds"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " list-custom"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "platform-specific-notes",
      children: "Platform-Specific Notes"
    }), "\n", jsx(_components.h3, {
      id: "macos",
      children: "macOS"
    }), "\n", jsx(_components.p, {
      children: "Default workspace switching uses Option key:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Option"
        }), "+", jsx("kbd", {
          children: "1"
        }), " through ", jsx("kbd", {
          children: "Option"
        }), "+", jsx("kbd", {
          children: "9"
        }), " - Switch workspace"]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Option"
        }), "+", jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "1"
        }), " through ", jsx("kbd", {
          children: "Option"
        }), "+", jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "9"
        }), " - Move window to workspace"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "You can still type Option key unicode characters (¡™£¢∞§¶•ª) in Terminal Mode."
    }), "\n", jsx(_components.h3, {
      id: "linux",
      children: "Linux"
    }), "\n", jsx(_components.p, {
      children: "Uses standard Alt key for workspace switching:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Alt"
        }), "+", jsx("kbd", {
          children: "1"
        }), " through ", jsx("kbd", {
          children: "Alt"
        }), "+", jsx("kbd", {
          children: "9"
        })]
      }), "\n", jsxs(_components.li, {
        children: [jsx("kbd", {
          children: "Alt"
        }), "+", jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "1"
        }), " through ", jsx("kbd", {
          children: "Alt"
        }), "+", jsx("kbd", {
          children: "Shift"
        }), "+", jsx("kbd", {
          children: "9"
        })]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "related-documentation",
      children: "Related Documentation"
    }), "\n", jsxs(Cards, {
      children: [jsx(Card, {
        title: "Configuration Guide",
        href: "/docs/configuration",
        description: "Customize keybindings and settings"
      }), jsx(Card, {
        title: "CLI Reference",
        href: "/docs/cli-reference",
        description: "Command-line options and usage"
      })]
    })]
  });
}
function MDXContent$1(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$1, {
      ...props
    })
  }) : _createMdxContent$1(props);
}

const __vite_glob_1_5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: MDXContent$1,
  frontmatter: frontmatter$1,
  structuredData: structuredData$1,
  toc: toc$1
}, Symbol.toStringTag, { value: 'Module' }));

let frontmatter = {
  "title": "Tape Scripting",
  "description": "Automate TUIOS workflows with tape files",
  "icon": "FileCode"
};
let structuredData = {
  "contents": [{
    "heading": "tape-scripting",
    "content": "TUIOS Tape is a domain-specific language (DSL) for automating terminal window management workflows. Tape scripts allow you to record, replay, and test complex TUIOS interactions programmatically."
  }, {
    "heading": "tape-scripting",
    "content": "title: Perfect for..."
  }, {
    "heading": "tape-scripting",
    "content": "type: info"
  }, {
    "heading": "tape-scripting",
    "content": "Recording and replaying terminal workflows"
  }, {
    "heading": "tape-scripting",
    "content": "Automated testing"
  }, {
    "heading": "tape-scripting",
    "content": "Demo recording"
  }, {
    "heading": "tape-scripting",
    "content": "CI/CD automation"
  }, {
    "heading": "tape-scripting",
    "content": "Documenting workflows"
  }, {
    "heading": "comments",
    "content": "Lines starting with # are comments:"
  }, {
    "heading": "commands",
    "content": "Commands are case-sensitive:"
  }, {
    "heading": "mode-management",
    "content": "title: Important"
  }, {
    "heading": "mode-management",
    "content": "type: warn"
  }, {
    "heading": "mode-management",
    "content": "TUIOS has two modes: Window Management Mode and Terminal Mode. Always switch modes explicitly before mode-specific commands!"
  }, {
    "heading": "windowmanagementmode",
    "content": "Switch to window management mode for managing windows."
  }, {
    "heading": "terminalmode",
    "content": "Switch to terminal mode to send input to the focused window."
  }, {
    "heading": "terminalmode",
    "content": "Example workflow:"
  }, {
    "heading": "newwindow",
    "content": "Create a new terminal window."
  }, {
    "heading": "closewindow",
    "content": "Close the currently focused window."
  }, {
    "heading": "nextwindow--prevwindow",
    "content": "Navigate between windows."
  }, {
    "heading": "renamewindow",
    "content": "Rename the focused window."
  }, {
    "heading": "minimizewindow--restorewindow",
    "content": "Minimize and restore windows."
  }, {
    "heading": "toggletiling",
    "content": "Toggle tiling mode."
  }, {
    "heading": "enabletiling--disabletiling",
    "content": "Explicitly control tiling mode."
  }, {
    "heading": "snap-commands",
    "content": "Snap windows to positions."
  }, {
    "heading": "workspace-management",
    "content": "TUIOS supports 9 workspaces (1-9)."
  }, {
    "heading": "switchworkspace",
    "content": "Switch to a workspace."
  }, {
    "heading": "movetoworkspace",
    "content": "Move window to workspace."
  }, {
    "heading": "moveandfollowworkspace",
    "content": "Move and follow."
  }, {
    "heading": "keyboard-input",
    "content": "title: Terminal Mode Required"
  }, {
    "heading": "keyboard-input",
    "content": "type: warn"
  }, {
    "heading": "keyboard-input",
    "content": "Keyboard commands only work in Terminal Mode!"
  }, {
    "heading": "type",
    "content": "Type text into terminal."
  }, {
    "heading": "sleep",
    "content": "Pause execution."
  }, {
    "heading": "waituntilregex",
    "content": "Wait for terminal output to match a pattern."
  }, {
    "heading": "recording-tapes",
    "content": "You can record your interactions:"
  }, {
    "heading": "recording-tapes",
    "content": "Press Ctrl+B T r to start recording"
  }, {
    "heading": "recording-tapes",
    "content": "Perform your workflow normally"
  }, {
    "heading": "recording-tapes",
    "content": "Press Ctrl+B T s to stop recording"
  }, {
    "heading": "recording-tapes",
    "content": "Tape is saved to ~/.local/share/tuios/tapes/"
  }, {
    "heading": "recording-tapes",
    "content": "View your recordings:"
  }, {
    "heading": "best-practices",
    "content": "title: Always Add Delays"
  }, {
    "heading": "best-practices",
    "content": "type: tip"
  }, {
    "heading": "best-practices",
    "content": "Give TUIOS time to process animations and state changes"
  }, {
    "heading": "best-practices",
    "content": "title: Explicit Mode Switching"
  }, {
    "heading": "best-practices",
    "content": "type: tip"
  }, {
    "heading": "best-practices",
    "content": "Always switch modes explicitly before mode-specific actions"
  }, {
    "heading": "best-practices",
    "content": "title: Use Comments"
  }, {
    "heading": "best-practices",
    "content": "type: tip"
  }, {
    "heading": "best-practices",
    "content": "Document complex workflows"
  }],
  "headings": [{
    "id": "tape-scripting",
    "content": "Tape Scripting"
  }, {
    "id": "running-tape-scripts",
    "content": "Running Tape Scripts"
  }, {
    "id": "basic-syntax",
    "content": "Basic Syntax"
  }, {
    "id": "comments",
    "content": "Comments"
  }, {
    "id": "commands",
    "content": "Commands"
  }, {
    "id": "string-literals",
    "content": "String Literals"
  }, {
    "id": "durations",
    "content": "Durations"
  }, {
    "id": "mode-management",
    "content": "Mode Management"
  }, {
    "id": "windowmanagementmode",
    "content": "WindowManagementMode"
  }, {
    "id": "terminalmode",
    "content": "TerminalMode"
  }, {
    "id": "window-operations",
    "content": "Window Operations"
  }, {
    "id": "newwindow",
    "content": "NewWindow"
  }, {
    "id": "closewindow",
    "content": "CloseWindow"
  }, {
    "id": "nextwindow--prevwindow",
    "content": "NextWindow / PrevWindow"
  }, {
    "id": "renamewindow",
    "content": "RenameWindow"
  }, {
    "id": "minimizewindow--restorewindow",
    "content": "MinimizeWindow / RestoreWindow"
  }, {
    "id": "tiling-and-layout",
    "content": "Tiling and Layout"
  }, {
    "id": "toggletiling",
    "content": "ToggleTiling"
  }, {
    "id": "enabletiling--disabletiling",
    "content": "EnableTiling / DisableTiling"
  }, {
    "id": "snap-commands",
    "content": "Snap Commands"
  }, {
    "id": "workspace-management",
    "content": "Workspace Management"
  }, {
    "id": "switchworkspace",
    "content": "SwitchWorkspace"
  }, {
    "id": "movetoworkspace",
    "content": "MoveToWorkspace"
  }, {
    "id": "moveandfollowworkspace",
    "content": "MoveAndFollowWorkspace"
  }, {
    "id": "keyboard-input",
    "content": "Keyboard Input"
  }, {
    "id": "type",
    "content": "Type"
  }, {
    "id": "basic-keys",
    "content": "Basic Keys"
  }, {
    "id": "navigation-keys",
    "content": "Navigation Keys"
  }, {
    "id": "key-combinations",
    "content": "Key Combinations"
  }, {
    "id": "timing",
    "content": "Timing"
  }, {
    "id": "sleep",
    "content": "Sleep"
  }, {
    "id": "waituntilregex",
    "content": "WaitUntilRegex"
  }, {
    "id": "example-scripts",
    "content": "Example Scripts"
  }, {
    "id": "basic-workflow",
    "content": "Basic Workflow"
  }, {
    "id": "multi-workspace-setup",
    "content": "Multi-Workspace Setup"
  }, {
    "id": "tiling-demo",
    "content": "Tiling Demo"
  }, {
    "id": "development-environment-setup",
    "content": "Development Environment Setup"
  }, {
    "id": "recording-tapes",
    "content": "Recording Tapes"
  }, {
    "id": "best-practices",
    "content": "Best Practices"
  }, {
    "id": "related-documentation",
    "content": "Related Documentation"
  }]
};
const toc = [{
  depth: 1,
  url: "#tape-scripting",
  title: jsx(Fragment, {
    children: "Tape Scripting"
  })
}, {
  depth: 2,
  url: "#running-tape-scripts",
  title: jsx(Fragment, {
    children: "Running Tape Scripts"
  })
}, {
  depth: 2,
  url: "#basic-syntax",
  title: jsx(Fragment, {
    children: "Basic Syntax"
  })
}, {
  depth: 3,
  url: "#comments",
  title: jsx(Fragment, {
    children: "Comments"
  })
}, {
  depth: 3,
  url: "#commands",
  title: jsx(Fragment, {
    children: "Commands"
  })
}, {
  depth: 3,
  url: "#string-literals",
  title: jsx(Fragment, {
    children: "String Literals"
  })
}, {
  depth: 3,
  url: "#durations",
  title: jsx(Fragment, {
    children: "Durations"
  })
}, {
  depth: 2,
  url: "#mode-management",
  title: jsx(Fragment, {
    children: "Mode Management"
  })
}, {
  depth: 3,
  url: "#windowmanagementmode",
  title: jsx(Fragment, {
    children: "WindowManagementMode"
  })
}, {
  depth: 3,
  url: "#terminalmode",
  title: jsx(Fragment, {
    children: "TerminalMode"
  })
}, {
  depth: 2,
  url: "#window-operations",
  title: jsx(Fragment, {
    children: "Window Operations"
  })
}, {
  depth: 3,
  url: "#newwindow",
  title: jsx(Fragment, {
    children: "NewWindow"
  })
}, {
  depth: 3,
  url: "#closewindow",
  title: jsx(Fragment, {
    children: "CloseWindow"
  })
}, {
  depth: 3,
  url: "#nextwindow--prevwindow",
  title: jsx(Fragment, {
    children: "NextWindow / PrevWindow"
  })
}, {
  depth: 3,
  url: "#renamewindow",
  title: jsx(Fragment, {
    children: "RenameWindow"
  })
}, {
  depth: 3,
  url: "#minimizewindow--restorewindow",
  title: jsx(Fragment, {
    children: "MinimizeWindow / RestoreWindow"
  })
}, {
  depth: 2,
  url: "#tiling-and-layout",
  title: jsx(Fragment, {
    children: "Tiling and Layout"
  })
}, {
  depth: 3,
  url: "#toggletiling",
  title: jsx(Fragment, {
    children: "ToggleTiling"
  })
}, {
  depth: 3,
  url: "#enabletiling--disabletiling",
  title: jsx(Fragment, {
    children: "EnableTiling / DisableTiling"
  })
}, {
  depth: 3,
  url: "#snap-commands",
  title: jsx(Fragment, {
    children: "Snap Commands"
  })
}, {
  depth: 2,
  url: "#workspace-management",
  title: jsx(Fragment, {
    children: "Workspace Management"
  })
}, {
  depth: 3,
  url: "#switchworkspace",
  title: jsx(Fragment, {
    children: "SwitchWorkspace"
  })
}, {
  depth: 3,
  url: "#movetoworkspace",
  title: jsx(Fragment, {
    children: "MoveToWorkspace"
  })
}, {
  depth: 3,
  url: "#moveandfollowworkspace",
  title: jsx(Fragment, {
    children: "MoveAndFollowWorkspace"
  })
}, {
  depth: 2,
  url: "#keyboard-input",
  title: jsx(Fragment, {
    children: "Keyboard Input"
  })
}, {
  depth: 3,
  url: "#type",
  title: jsx(Fragment, {
    children: "Type"
  })
}, {
  depth: 3,
  url: "#basic-keys",
  title: jsx(Fragment, {
    children: "Basic Keys"
  })
}, {
  depth: 3,
  url: "#navigation-keys",
  title: jsx(Fragment, {
    children: "Navigation Keys"
  })
}, {
  depth: 3,
  url: "#key-combinations",
  title: jsx(Fragment, {
    children: "Key Combinations"
  })
}, {
  depth: 2,
  url: "#timing",
  title: jsx(Fragment, {
    children: "Timing"
  })
}, {
  depth: 3,
  url: "#sleep",
  title: jsx(Fragment, {
    children: "Sleep"
  })
}, {
  depth: 3,
  url: "#waituntilregex",
  title: jsx(Fragment, {
    children: "WaitUntilRegex"
  })
}, {
  depth: 2,
  url: "#example-scripts",
  title: jsx(Fragment, {
    children: "Example Scripts"
  })
}, {
  depth: 3,
  url: "#basic-workflow",
  title: jsx(Fragment, {
    children: "Basic Workflow"
  })
}, {
  depth: 3,
  url: "#multi-workspace-setup",
  title: jsx(Fragment, {
    children: "Multi-Workspace Setup"
  })
}, {
  depth: 3,
  url: "#tiling-demo",
  title: jsx(Fragment, {
    children: "Tiling Demo"
  })
}, {
  depth: 3,
  url: "#development-environment-setup",
  title: jsx(Fragment, {
    children: "Development Environment Setup"
  })
}, {
  depth: 2,
  url: "#recording-tapes",
  title: jsx(Fragment, {
    children: "Recording Tapes"
  })
}, {
  depth: 2,
  url: "#best-practices",
  title: jsx(Fragment, {
    children: "Best Practices"
  })
}, {
  depth: 2,
  url: "#related-documentation",
  title: jsx(Fragment, {
    children: "Related Documentation"
  })
}];
function _createMdxContent(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    li: "li",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  }, {Card, Cards} = _components;
  if (!Card) _missingMdxReference("Card");
  if (!Cards) _missingMdxReference("Cards");
  return jsxs(Fragment, {
    children: [jsx(_components.h1, {
      id: "tape-scripting",
      children: "Tape Scripting"
    }), "\n", jsx(_components.p, {
      children: "TUIOS Tape is a domain-specific language (DSL) for automating terminal window management workflows. Tape scripts allow you to record, replay, and test complex TUIOS interactions programmatically."
    }), "\n", jsx(Callout, {
      title: "Perfect for...",
      type: "info",
      children: jsxs(_components.ul, {
        children: ["\n", jsx(_components.li, {
          children: "Recording and replaying terminal workflows"
        }), "\n", jsx(_components.li, {
          children: "Automated testing"
        }), "\n", jsx(_components.li, {
          children: "Demo recording"
        }), "\n", jsx(_components.li, {
          children: "CI/CD automation"
        }), "\n", jsx(_components.li, {
          children: "Documenting workflows"
        }), "\n"]
      })
    }), "\n", jsx(_components.h2, {
      id: "running-tape-scripts",
      children: "Running Tape Scripts"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Interactive mode (visible TUI) - watch automation happen"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tape"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " play"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " demo.tape"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Validate syntax"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tape"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " validate"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " demo.tape"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# List saved recordings"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tape"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " list"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Show a tape file"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tape"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " show"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " my-recording"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "basic-syntax",
      children: "Basic Syntax"
    }), "\n", jsx(_components.h3, {
      id: "comments",
      children: "Comments"
    }), "\n", jsxs(_components.p, {
      children: ["Lines starting with ", jsx(_components.code, {
        children: "#"
      }), " are comments:"]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# This is a comment"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "  # Create a window"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "commands",
      children: "Commands"
    }), "\n", jsx(_components.p, {
      children: "Commands are case-sensitive:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 500ms"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "TerminalMode"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"echo hello\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Enter"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "string-literals",
      children: "String Literals"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"hello world\""
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 'hello world'"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " `"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "hello"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " world`"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "durations",
      children: "Durations"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 500ms"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "     # Milliseconds"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 2s"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "        # Seconds"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 1.5s"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "      # Decimal seconds"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "mode-management",
      children: "Mode Management"
    }), "\n", jsx(Callout, {
      title: "Important",
      type: "warn",
      children: jsxs(_components.p, {
        children: ["TUIOS has two modes: ", jsx(_components.strong, {
          children: "Window Management Mode"
        }), " and ", jsx(_components.strong, {
          children: "Terminal Mode"
        }), ". Always switch modes explicitly before mode-specific commands!"]
      })
    }), "\n", jsx(_components.h3, {
      id: "windowmanagementmode",
      children: "WindowManagementMode"
    }), "\n", jsx(_components.p, {
      children: "Switch to window management mode for managing windows."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "WindowManagementMode"
            })
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "terminalmode",
      children: "TerminalMode"
    }), "\n", jsx(_components.p, {
      children: "Switch to terminal mode to send input to the focused window."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "TerminalMode"
            })
          })
        })
      })
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Example workflow:"
      })
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "WindowManagementMode"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "TerminalMode"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"ls -la\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Enter"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "WindowManagementMode"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "window-operations",
      children: "Window Operations"
    }), "\n", jsx(_components.h3, {
      id: "newwindow",
      children: "NewWindow"
    }), "\n", jsx(_components.p, {
      children: "Create a new terminal window."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 500ms"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "  # Give time for creation"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "closewindow",
      children: "CloseWindow"
    }), "\n", jsx(_components.p, {
      children: "Close the currently focused window."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "CloseWindow"
            })
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "nextwindow--prevwindow",
      children: "NextWindow / PrevWindow"
    }), "\n", jsx(_components.p, {
      children: "Navigate between windows."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NextWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 200ms"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "renamewindow",
      children: "RenameWindow"
    }), "\n", jsx(_components.p, {
      children: "Rename the focused window."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "RenameWindow"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"My Terminal\""
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "minimizewindow--restorewindow",
      children: "MinimizeWindow / RestoreWindow"
    }), "\n", jsx(_components.p, {
      children: "Minimize and restore windows."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "MinimizeWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 300ms"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "RestoreWindow"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "tiling-and-layout",
      children: "Tiling and Layout"
    }), "\n", jsx(_components.h3, {
      id: "toggletiling",
      children: "ToggleTiling"
    }), "\n", jsx(_components.p, {
      children: "Toggle tiling mode."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "ToggleTiling"
            })
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "enabletiling--disabletiling",
      children: "EnableTiling / DisableTiling"
    }), "\n", jsx(_components.p, {
      children: "Explicitly control tiling mode."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "EnableTiling"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 300ms"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "snap-commands",
      children: "Snap Commands"
    }), "\n", jsx(_components.p, {
      children: "Snap windows to positions."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "SnapLeft"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "SnapRight"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "SnapFullscreen"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "workspace-management",
      children: "Workspace Management"
    }), "\n", jsx(_components.p, {
      children: "TUIOS supports 9 workspaces (1-9)."
    }), "\n", jsx(_components.h3, {
      id: "switchworkspace",
      children: "SwitchWorkspace"
    }), "\n", jsx(_components.p, {
      children: "Switch to a workspace."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "SwitchWorkspace"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 2"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 400ms"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "movetoworkspace",
      children: "MoveToWorkspace"
    }), "\n", jsx(_components.p, {
      children: "Move window to workspace."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "MoveToWorkspace"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 3"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "moveandfollowworkspace",
      children: "MoveAndFollowWorkspace"
    }), "\n", jsx(_components.p, {
      children: "Move and follow."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "MoveAndFollowWorkspace"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 2"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "keyboard-input",
      children: "Keyboard Input"
    }), "\n", jsx(Callout, {
      title: "Terminal Mode Required",
      type: "warn",
      children: jsxs(_components.p, {
        children: ["Keyboard commands only work in ", jsx(_components.strong, {
          children: "Terminal Mode"
        }), "!"]
      })
    }), "\n", jsx(_components.h3, {
      id: "type",
      children: "Type"
    }), "\n", jsx(_components.p, {
      children: "Type text into terminal."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "TerminalMode"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"echo 'Hello, World!'\""
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "basic-keys",
      children: "Basic Keys"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Enter"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Space"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Tab"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Backspace"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Delete"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Escape"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "navigation-keys",
      children: "Navigation Keys"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Up"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Down"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Left"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Right"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Home"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "End"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "key-combinations",
      children: "Key Combinations"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Ctrl+c"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Ctrl+b"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Alt+1"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Shift+Tab"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Ctrl+Alt+t"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "timing",
      children: "Timing"
    }), "\n", jsx(_components.h3, {
      id: "sleep",
      children: "Sleep"
    }), "\n", jsx(_components.p, {
      children: "Pause execution."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 500ms"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 1s"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "waituntilregex",
      children: "WaitUntilRegex"
    }), "\n", jsx(_components.p, {
      children: "Wait for terminal output to match a pattern."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "TerminalMode"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"ls -la\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Enter"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "WaitUntilRegex"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "\\$"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "\""
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 3000"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "  # Wait for prompt"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "example-scripts",
      children: "Example Scripts"
    }), "\n", jsx(_components.h3, {
      id: "basic-workflow",
      children: "Basic Workflow"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Create a new window and run commands"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "WindowManagementMode"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 500ms"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "TerminalMode"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"ls -la\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Enter"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 1s"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"echo 'Done'\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Enter"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "multi-workspace-setup",
      children: "Multi-Workspace Setup"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Setup workspace 1 - development"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "WindowManagementMode"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 500ms"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "TerminalMode"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"cd ~/project\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Enter"
            })
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Switch to workspace 2 - monitoring"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "WindowManagementMode"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "SwitchWorkspace"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 2"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 400ms"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 500ms"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "TerminalMode"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"htop\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Enter"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "tiling-demo",
      children: "Tiling Demo"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Create tiled layout"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "WindowManagementMode"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "EnableTiling"
            })
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 500ms"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 500ms"
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 500ms"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Navigate and type in each"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "TerminalMode"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"echo 'Window 1'\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Enter"
            })
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "WindowManagementMode"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NextWindow"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "TerminalMode"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"echo 'Window 2'\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Enter"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "development-environment-setup",
      children: "Development Environment Setup"
    }), "\n", jsxs(Steps, {
      children: [jsx(Step, {
        children: jsx(Fragment, {
          children: jsx(_components.pre, {
            className: "shiki shiki-themes github-light github-dark",
            style: {
              "--shiki-light": "#24292e",
              "--shiki-dark": "#e1e4e8",
              "--shiki-light-bg": "#fff",
              "--shiki-dark-bg": "#24292e"
            },
            tabIndex: "0",
            icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
            children: jsxs(_components.code, {
              children: [jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6A737D",
                    "--shiki-dark": "#6A737D"
                  },
                  children: "# Create development workspace"
                })
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "WindowManagementMode"
                })
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "EnableTiling"
                })
              })]
            })
          })
        })
      }), jsx(Step, {
        children: jsx(Fragment, {
          children: jsx(_components.pre, {
            className: "shiki shiki-themes github-light github-dark",
            style: {
              "--shiki-light": "#24292e",
              "--shiki-dark": "#e1e4e8",
              "--shiki-light-bg": "#fff",
              "--shiki-dark-bg": "#24292e"
            },
            tabIndex: "0",
            icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
            children: jsxs(_components.code, {
              children: [jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6A737D",
                    "--shiki-dark": "#6A737D"
                  },
                  children: "# Window 1: Editor"
                })
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "NewWindow"
                })
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "Sleep"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " 500ms"
                })]
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "TerminalMode"
                })
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "Type"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " \"nvim .\""
                })]
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "Enter"
                })
              })]
            })
          })
        })
      }), jsx(Step, {
        children: jsx(Fragment, {
          children: jsx(_components.pre, {
            className: "shiki shiki-themes github-light github-dark",
            style: {
              "--shiki-light": "#24292e",
              "--shiki-dark": "#e1e4e8",
              "--shiki-light-bg": "#fff",
              "--shiki-dark-bg": "#24292e"
            },
            tabIndex: "0",
            icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
            children: jsxs(_components.code, {
              children: [jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6A737D",
                    "--shiki-dark": "#6A737D"
                  },
                  children: "# Window 2: Server"
                })
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "WindowManagementMode"
                })
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "NewWindow"
                })
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "Sleep"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " 500ms"
                })]
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "TerminalMode"
                })
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "Type"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " \"npm run dev\""
                })]
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "Enter"
                })
              })]
            })
          })
        })
      }), jsx(Step, {
        children: jsx(Fragment, {
          children: jsx(_components.pre, {
            className: "shiki shiki-themes github-light github-dark",
            style: {
              "--shiki-light": "#24292e",
              "--shiki-dark": "#e1e4e8",
              "--shiki-light-bg": "#fff",
              "--shiki-dark-bg": "#24292e"
            },
            tabIndex: "0",
            icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
            children: jsxs(_components.code, {
              children: [jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6A737D",
                    "--shiki-dark": "#6A737D"
                  },
                  children: "# Window 3: Tests"
                })
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "WindowManagementMode"
                })
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "NewWindow"
                })
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "Sleep"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " 500ms"
                })]
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "TerminalMode"
                })
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "Type"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " \"npm test -- --watch\""
                })]
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "Enter"
                })
              })]
            })
          })
        })
      }), jsx(Step, {
        children: jsx(Fragment, {
          children: jsx(_components.pre, {
            className: "shiki shiki-themes github-light github-dark",
            style: {
              "--shiki-light": "#24292e",
              "--shiki-dark": "#e1e4e8",
              "--shiki-light-bg": "#fff",
              "--shiki-dark-bg": "#24292e"
            },
            tabIndex: "0",
            icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
            children: jsxs(_components.code, {
              children: [jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6A737D",
                    "--shiki-dark": "#6A737D"
                  },
                  children: "# Window 4: Git"
                })
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "WindowManagementMode"
                })
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "NewWindow"
                })
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "Sleep"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " 500ms"
                })]
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "TerminalMode"
                })
              }), "\n", jsxs(_components.span, {
                className: "line",
                children: [jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "Type"
                }), jsx(_components.span, {
                  style: {
                    "--shiki-light": "#032F62",
                    "--shiki-dark": "#9ECBFF"
                  },
                  children: " \"git status\""
                })]
              }), "\n", jsx(_components.span, {
                className: "line",
                children: jsx(_components.span, {
                  style: {
                    "--shiki-light": "#6F42C1",
                    "--shiki-dark": "#B392F0"
                  },
                  children: "Enter"
                })
              })]
            })
          })
        })
      })]
    }), "\n", jsx(_components.h2, {
      id: "recording-tapes",
      children: "Recording Tapes"
    }), "\n", jsx(_components.p, {
      children: "You can record your interactions:"
    }), "\n", jsxs(Steps, {
      children: [jsx(Step, {
        children: jsxs(_components.p, {
          children: ["Press ", jsx("kbd", {
            children: "Ctrl+B"
          }), " ", jsx("kbd", {
            children: "T"
          }), " ", jsx("kbd", {
            children: "r"
          }), " to ", jsx(_components.strong, {
            children: "start recording"
          })]
        })
      }), jsx(Step, {
        children: jsx(_components.p, {
          children: "Perform your workflow normally"
        })
      }), jsx(Step, {
        children: jsxs(_components.p, {
          children: ["Press ", jsx("kbd", {
            children: "Ctrl+B"
          }), " ", jsx("kbd", {
            children: "T"
          }), " ", jsx("kbd", {
            children: "s"
          }), " to ", jsx(_components.strong, {
            children: "stop recording"
          })]
        })
      }), jsx(Step, {
        children: jsxs(_components.p, {
          children: ["Tape is saved to ", jsx(_components.code, {
            children: "~/.local/share/tuios/tapes/"
          })]
        })
      })]
    }), "\n", jsx(_components.p, {
      children: "View your recordings:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tape"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " list"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tuios"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tape"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " show"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " my-recording"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "best-practices",
      children: "Best Practices"
    }), "\n", jsx(Callout, {
      title: "Always Add Delays",
      type: "tip",
      children: jsx(_components.p, {
        children: "Give TUIOS time to process animations and state changes"
      })
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 500ms"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "  # Wait for creation (GOOD)"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# No sleep - next command might execute too soon (BAD)"
            })
          })]
        })
      })
    }), "\n", jsx(Callout, {
      title: "Explicit Mode Switching",
      type: "tip",
      children: jsx(_components.p, {
        children: "Always switch modes explicitly before mode-specific actions"
      })
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# GOOD"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "WindowManagementMode"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "TerminalMode"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"ls\""
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# BAD (mode might be wrong)"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Type"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " \"ls\""
            })]
          })]
        })
      })
    }), "\n", jsx(Callout, {
      title: "Use Comments",
      type: "tip",
      children: jsx(_components.p, {
        children: "Document complex workflows"
      })
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Setup development environment"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "WindowManagementMode"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "EnableTiling"
            })
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Create editor window"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 500ms"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Create terminal window"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "NewWindow"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "Sleep"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " 500ms"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "related-documentation",
      children: "Related Documentation"
    }), "\n", jsxs(Cards, {
      children: [jsx(Card, {
        title: "CLI Reference",
        href: "/docs/cli-reference",
        description: "Tape command-line usage"
      }), jsx(Card, {
        title: "Keybindings",
        href: "/docs/keybindings",
        description: "Keybindings for manual control"
      })]
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}
function _missingMdxReference(id, component) {
  throw new Error("Expected " + ("component" ) + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
}

const __vite_glob_1_6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: MDXContent,
  frontmatter,
  structuredData,
  toc
}, Symbol.toStringTag, { value: 'Module' }));

const create = server({ "doc": { "passthroughs": ["extractedReferences"] } });
const docs = await create.docs("docs", "content/docs", /* #__PURE__ */ Object.assign({"./meta.json": __vite_glob_0_0






}), /* #__PURE__ */ Object.assign({"./architecture.mdx": __vite_glob_1_0,"./cli-reference.mdx": __vite_glob_1_1,"./configuration.mdx": __vite_glob_1_2,"./getting-started.mdx": __vite_glob_1_3,"./index.mdx": __vite_glob_1_4,"./keybindings.mdx": __vite_glob_1_5,"./tape-scripting.mdx": __vite_glob_1_6





}));

// src/source/plugins/icon.ts
function iconPlugin(resolveIcon) {
  function replaceIcon(node) {
    if (node.icon === void 0 || typeof node.icon === "string")
      node.icon = resolveIcon(node.icon);
    return node;
  }
  return {
    name: "fumadocs:icon",
    transformPageTree: {
      file: replaceIcon,
      folder: replaceIcon,
      separator: replaceIcon
    }
  };
}

// src/source/path.ts
var path_exports = {};
__export(path_exports, {
  basename: () => basename,
  dirname: () => dirname,
  extname: () => extname,
  joinPath: () => joinPath,
  slash: () => slash,
  splitPath: () => splitPath
});
function basename(path, ext) {
  const idx = path.lastIndexOf("/");
  return path.substring(
    idx === -1 ? 0 : idx + 1,
    ext ? path.length - ext.length : path.length
  );
}
function extname(path) {
  const dotIdx = path.lastIndexOf(".");
  if (dotIdx !== -1) {
    return path.substring(dotIdx);
  }
  return "";
}
function dirname(path) {
  return path.split("/").slice(0, -1).join("/");
}
function splitPath(path) {
  return path.split("/").filter((p) => p.length > 0);
}
function joinPath(...paths) {
  const out = [];
  const parsed = paths.flatMap(splitPath);
  for (const seg of parsed) {
    switch (seg) {
      case "..":
        out.pop();
        break;
      case ".":
        break;
      default:
        out.push(seg);
    }
  }
  return out.join("/");
}
function slash(path) {
  const isExtendedLengthPath = path.startsWith("\\\\?\\");
  if (isExtendedLengthPath) {
    return path;
  }
  return path.replaceAll("\\", "/");
}

// src/source/storage/file-system.ts
var FileSystem = class {
  constructor(inherit) {
    this.files = /* @__PURE__ */ new Map();
    this.folders = /* @__PURE__ */ new Map();
    if (inherit) {
      for (const [k, v] of inherit.folders) {
        this.folders.set(k, v);
      }
      for (const [k, v] of inherit.files) {
        this.files.set(k, v);
      }
    } else {
      this.folders.set("", []);
    }
  }
  read(path) {
    return this.files.get(path);
  }
  /**
   * get the direct children of folder (in virtual file path)
   */
  readDir(path) {
    return this.folders.get(path);
  }
  write(path, file) {
    if (!this.files.has(path)) {
      const dir = dirname(path);
      this.makeDir(dir);
      this.readDir(dir)?.push(path);
    }
    this.files.set(path, file);
  }
  /**
   * Delete files at specified path.
   *
   * @param path - the target path.
   * @param [recursive=false] - if set to `true`, it will also delete directories.
   */
  delete(path, recursive = false) {
    if (this.files.delete(path)) return true;
    if (recursive) {
      const folder = this.folders.get(path);
      if (!folder) return false;
      this.folders.delete(path);
      for (const child of folder) {
        this.delete(child);
      }
      return true;
    }
    return false;
  }
  getFiles() {
    return Array.from(this.files.keys());
  }
  makeDir(path) {
    const segments = splitPath(path);
    for (let i = 0; i < segments.length; i++) {
      const segment = segments.slice(0, i + 1).join("/");
      if (this.folders.has(segment)) continue;
      this.folders.set(segment, []);
      this.folders.get(dirname(segment)).push(segment);
    }
  }
};

// src/source/storage/content.ts
function isLocaleValid(locale) {
  return locale.length > 0 && !/\d+/.test(locale);
}
var parsers = {
  dir(path) {
    const [locale, ...segs] = path.split("/");
    if (locale && segs.length > 0 && isLocaleValid(locale))
      return [segs.join("/"), locale];
    return [path];
  },
  dot(path) {
    const dir = dirname(path);
    const base = basename(path);
    const parts = base.split(".");
    if (parts.length < 3) return [path];
    const [locale] = parts.splice(parts.length - 2, 1);
    if (!isLocaleValid(locale)) return [path];
    return [joinPath(dir, parts.join(".")), locale];
  },
  none(path) {
    return [path];
  }
};
function buildContentStorage(loaderConfig, defaultLanguage) {
  const {
    source,
    plugins = [],
    i18n = {
      defaultLanguage,
      parser: "none",
      languages: [defaultLanguage]
    }
  } = loaderConfig;
  const parser = parsers[i18n.parser ?? "dot"];
  const storages = {};
  const normalized = /* @__PURE__ */ new Map();
  for (const inputFile of source.files) {
    let file;
    if (inputFile.type === "page") {
      file = {
        format: "page",
        path: normalizePath(inputFile.path),
        // will be generated by the slugs plugin if unspecified
        slugs: inputFile.slugs,
        data: inputFile.data,
        absolutePath: inputFile.absolutePath
      };
    } else {
      file = {
        format: "meta",
        path: normalizePath(inputFile.path),
        absolutePath: inputFile.absolutePath,
        data: inputFile.data
      };
    }
    const [pathWithoutLocale, locale = i18n.defaultLanguage] = parser(
      file.path
    );
    const list = normalized.get(locale) ?? [];
    list.push({
      pathWithoutLocale,
      file
    });
    normalized.set(locale, list);
  }
  const fallbackLang = i18n.fallbackLanguage !== null ? i18n.fallbackLanguage ?? i18n.defaultLanguage : null;
  function scan(lang) {
    if (storages[lang]) return;
    let storage;
    if (fallbackLang && fallbackLang !== lang) {
      scan(fallbackLang);
      storage = new FileSystem(storages[fallbackLang]);
    } else {
      storage = new FileSystem();
    }
    for (const { pathWithoutLocale, file } of normalized.get(lang) ?? []) {
      storage.write(pathWithoutLocale, file);
    }
    const context = {
      storage
    };
    for (const plugin of plugins) {
      plugin.transformStorage?.(context);
    }
    storages[lang] = storage;
  }
  for (const lang of i18n.languages) scan(lang);
  return storages;
}
function normalizePath(path) {
  const segments = splitPath(slash(path));
  if (segments[0] === "." || segments[0] === "..")
    throw new Error("It must not start with './' or '../'");
  return segments.join("/");
}

// src/source/page-tree/transformer-fallback.ts
function transformerFallback() {
  const addedFiles = /* @__PURE__ */ new Set();
  return {
    root(root) {
      const isolatedStorage = new FileSystem();
      for (const file of this.storage.getFiles()) {
        if (addedFiles.has(file)) continue;
        const content = this.storage.read(file);
        if (content) isolatedStorage.write(file, content);
      }
      if (isolatedStorage.getFiles().length === 0) return root;
      root.fallback = this.builder.build(isolatedStorage, {
        ...this.options,
        id: `fallback-${root.$id ?? ""}`,
        generateFallback: false
      });
      addedFiles.clear();
      return root;
    },
    file(node, file) {
      if (file) addedFiles.add(file);
      return node;
    },
    folder(node, _dir, metaPath) {
      if (metaPath) addedFiles.add(metaPath);
      return node;
    }
  };
}

// src/source/page-tree/builder.ts
var group = /^\((?<name>.+)\)$/;
var link = /^(?<external>external:)?(?:\[(?<icon>[^\]]+)])?\[(?<name>[^\]]+)]\((?<url>[^)]+)\)$/;
var separator = /^---(?:\[(?<icon>[^\]]+)])?(?<name>.+)---|^---$/;
var rest = "...";
var restReversed = "z...a";
var extractPrefix = "...";
var excludePrefix = "!";
function createPageTreeBuilder(loaderConfig) {
  const { plugins = [], url, pageTree: defaultOptions = {} } = loaderConfig;
  return {
    build(storage, options = defaultOptions) {
      const key = "";
      return this.buildI18n({ [key]: storage }, options)[key];
    },
    buildI18n(storages, options = defaultOptions) {
      let nextId = 0;
      const out = {};
      const transformers = [];
      if (options.transformers) {
        transformers.push(...options.transformers);
      }
      for (const plugin of plugins) {
        if (plugin.transformPageTree)
          transformers.push(plugin.transformPageTree);
      }
      if (options.generateFallback ?? true) {
        transformers.push(transformerFallback());
      }
      for (const [locale, storage] of Object.entries(storages)) {
        let rootId = locale.length === 0 ? "root" : locale;
        if (options.id) rootId = `${options.id}-${rootId}`;
        out[locale] = createPageTreeBuilderUtils({
          rootId,
          transformers,
          builder: this,
          options,
          getUrl: url,
          locale,
          storage,
          storages,
          generateNodeId() {
            return "_" + nextId++;
          }
        }).root();
      }
      return out;
    }
  };
}
function createFlattenPathResolver(storage) {
  const map2 = /* @__PURE__ */ new Map();
  const files = storage.getFiles();
  for (const file of files) {
    const content = storage.read(file);
    const flattenPath = file.substring(0, file.length - extname(file).length);
    map2.set(flattenPath + "." + content.format, file);
  }
  return (name, format) => {
    return map2.get(name + "." + format) ?? name;
  };
}
function createPageTreeBuilderUtils(ctx) {
  const resolveFlattenPath = createFlattenPathResolver(ctx.storage);
  const visitedPaths = /* @__PURE__ */ new Set();
  function nextNodeId(localId = ctx.generateNodeId()) {
    return `${ctx.rootId}:${localId}`;
  }
  return {
    buildPaths(paths, reversed = false) {
      const items = [];
      const folders = [];
      const sortedPaths = paths.sort(
        (a, b) => a.localeCompare(b) * (reversed ? -1 : 1)
      );
      for (const path of sortedPaths) {
        const fileNode = this.file(path);
        if (fileNode) {
          if (basename(path, extname(path)) === "index")
            items.unshift(fileNode);
          else items.push(fileNode);
          continue;
        }
        const dirNode = this.folder(path, false);
        if (dirNode) folders.push(dirNode);
      }
      return [...items, ...folders];
    },
    resolveFolderItem(folderPath, item) {
      if (item === rest || item === restReversed) return item;
      let match = separator.exec(item);
      if (match?.groups) {
        let node = {
          $id: nextNodeId(),
          type: "separator",
          icon: match.groups.icon,
          name: match.groups.name
        };
        for (const transformer of ctx.transformers) {
          if (!transformer.separator) continue;
          node = transformer.separator.call(ctx, node);
        }
        return [node];
      }
      match = link.exec(item);
      if (match?.groups) {
        const { icon, url, name, external } = match.groups;
        let node = {
          $id: nextNodeId(),
          type: "page",
          icon,
          name,
          url,
          external: external ? true : void 0
        };
        for (const transformer of ctx.transformers) {
          if (!transformer.file) continue;
          node = transformer.file.call(ctx, node);
        }
        return [node];
      }
      const isExcept = item.startsWith(excludePrefix);
      const isExtract = !isExcept && item.startsWith(extractPrefix);
      let filename = item;
      if (isExcept) {
        filename = item.slice(excludePrefix.length);
      } else if (isExtract) {
        filename = item.slice(extractPrefix.length);
      }
      const path = resolveFlattenPath(joinPath(folderPath, filename), "page");
      if (isExcept) {
        visitedPaths.add(path);
        return [];
      }
      const dirNode = this.folder(path, false);
      if (dirNode) {
        return isExtract ? dirNode.children : [dirNode];
      }
      const fileNode = this.file(path);
      return fileNode ? [fileNode] : [];
    },
    folder(folderPath, isGlobalRoot) {
      const { storage, options, transformers } = ctx;
      const files = storage.readDir(folderPath);
      if (!files) return;
      const metaPath = resolveFlattenPath(joinPath(folderPath, "meta"), "meta");
      const indexPath = resolveFlattenPath(
        joinPath(folderPath, "index"),
        "page"
      );
      let meta = storage.read(metaPath);
      if (meta?.format !== "meta") {
        meta = void 0;
      }
      const isRoot = meta?.data.root ?? isGlobalRoot;
      let index;
      let children;
      if (meta && meta.data.pages) {
        const resolved = meta.data.pages.flatMap((item) => this.resolveFolderItem(folderPath, item));
        if (!isRoot && !visitedPaths.has(indexPath)) {
          index = this.file(indexPath);
        }
        for (let i = 0; i < resolved.length; i++) {
          const item = resolved[i];
          if (item !== rest && item !== restReversed) continue;
          const items = this.buildPaths(
            files.filter((file) => !visitedPaths.has(file)),
            item === restReversed
          );
          resolved.splice(i, 1, ...items);
          break;
        }
        children = resolved;
      } else {
        if (!isRoot && !visitedPaths.has(indexPath)) {
          index = this.file(indexPath);
        }
        children = this.buildPaths(
          files.filter((file) => !visitedPaths.has(file))
        );
      }
      let name = meta?.data.title ?? index?.name;
      if (!name) {
        const folderName = basename(folderPath);
        name = pathToName(group.exec(folderName)?.[1] ?? folderName);
      }
      let node = {
        type: "folder",
        name,
        icon: meta?.data.icon ?? index?.icon,
        root: meta?.data.root,
        defaultOpen: meta?.data.defaultOpen,
        description: meta?.data.description,
        index,
        children,
        $id: nextNodeId(folderPath),
        $ref: !options.noRef && meta ? {
          metaFile: metaPath
        } : void 0
      };
      visitedPaths.add(folderPath);
      for (const transformer of transformers) {
        if (!transformer.folder) continue;
        node = transformer.folder.call(ctx, node, folderPath, metaPath);
      }
      return node;
    },
    file(path) {
      const { options, getUrl, storage, locale, transformers } = ctx;
      const page = storage.read(path);
      if (page?.format !== "page") return;
      const { title, description, icon } = page.data;
      let item = {
        $id: nextNodeId(path),
        type: "page",
        name: title ?? pathToName(basename(path, extname(path))),
        description,
        icon,
        url: getUrl(page.slugs, locale),
        $ref: !options.noRef ? {
          file: path
        } : void 0
      };
      visitedPaths.add(path);
      for (const transformer of transformers) {
        if (!transformer.file) continue;
        item = transformer.file.call(ctx, item, path);
      }
      return item;
    },
    root() {
      const folder = this.folder("", true);
      let root = {
        $id: ctx.rootId,
        name: folder.name || "Docs",
        children: folder.children
      };
      for (const transformer of ctx.transformers) {
        if (!transformer.root) continue;
        root = transformer.root.call(ctx, root);
      }
      return root;
    }
  };
}
function pathToName(name) {
  const result = [];
  for (const c of name) {
    if (result.length === 0) result.push(c.toLocaleUpperCase());
    else if (c === "-") result.push(" ");
    else result.push(c);
  }
  return result.join("");
}

// src/source/plugins/index.ts
var priorityMap = {
  pre: 1,
  default: 0,
  post: -1
};
function buildPlugins(plugins, sort = true) {
  const flatten = [];
  for (const plugin of plugins) {
    if (Array.isArray(plugin)) flatten.push(...buildPlugins(plugin, false));
    else if (plugin) flatten.push(plugin);
  }
  if (sort)
    return flatten.sort(
      (a, b) => priorityMap[b.enforce ?? "default"] - priorityMap[a.enforce ?? "default"]
    );
  return flatten;
}

// src/source/plugins/slugs.ts
function slugsPlugin(slugsFn) {
  function isIndex(file) {
    return basename(file, extname(file)) === "index";
  }
  return {
    name: "fumadocs:slugs",
    transformStorage({ storage }) {
      const indexFiles = /* @__PURE__ */ new Set();
      const taken = /* @__PURE__ */ new Set();
      const autoIndex = slugsFn === void 0;
      for (const path of storage.getFiles()) {
        const file = storage.read(path);
        if (!file || file.format !== "page" || file.slugs) continue;
        if (isIndex(path) && autoIndex) {
          indexFiles.add(path);
          continue;
        }
        file.slugs = slugsFn ? slugsFn({ path }) : getSlugs(path);
        const key = file.slugs.join("/");
        if (taken.has(key)) throw new Error("Duplicated slugs");
        taken.add(key);
      }
      for (const path of indexFiles) {
        const file = storage.read(path);
        if (file?.format !== "page") continue;
        file.slugs = getSlugs(path);
        if (taken.has(file.slugs.join("/"))) file.slugs.push("index");
      }
    }
  };
}
var GroupRegex = /^\(.+\)$/;
function getSlugs(file) {
  const dir = dirname(file);
  const name = basename(file, extname(file));
  const slugs = [];
  for (const seg of dir.split("/")) {
    if (seg.length > 0 && !GroupRegex.test(seg)) slugs.push(encodeURI(seg));
  }
  if (GroupRegex.test(name))
    throw new Error(`Cannot use folder group in file names: ${file}`);
  if (name !== "index") {
    slugs.push(encodeURI(name));
  }
  return slugs;
}

// src/source/loader.ts
function indexPages(storages, { url }) {
  const result = {
    // (locale.slugs -> page)
    pages: /* @__PURE__ */ new Map(),
    // (locale.path -> page)
    pathToMeta: /* @__PURE__ */ new Map(),
    // (locale.path -> meta)
    pathToPage: /* @__PURE__ */ new Map()
  };
  for (const [lang, storage] of Object.entries(storages)) {
    for (const filePath of storage.getFiles()) {
      const item = storage.read(filePath);
      const path = `${lang}.${filePath}`;
      if (item.format === "meta") {
        result.pathToMeta.set(path, {
          path: item.path,
          absolutePath: item.absolutePath,
          data: item.data
        });
        continue;
      }
      const page = {
        absolutePath: item.absolutePath,
        path: item.path,
        url: url(item.slugs, lang),
        slugs: item.slugs,
        data: item.data,
        locale: lang
      };
      result.pathToPage.set(path, page);
      result.pages.set(`${lang}.${page.slugs.join("/")}`, page);
    }
  }
  return result;
}
function createGetUrl(baseUrl, i18n) {
  const baseSlugs = baseUrl.split("/");
  return (slugs, locale) => {
    const hideLocale = i18n?.hideLocale ?? "never";
    let urlLocale;
    if (hideLocale === "never") {
      urlLocale = locale;
    } else if (hideLocale === "default-locale" && locale !== i18n?.defaultLanguage) {
      urlLocale = locale;
    }
    const paths = [...baseSlugs, ...slugs];
    if (urlLocale) paths.unshift(urlLocale);
    return `/${paths.filter((v) => v.length > 0).join("/")}`;
  };
}
function loader(...args) {
  const resolved = args.length === 2 ? resolveConfig(args[0], args[1]) : resolveConfig(args[0].source, args[0]);
  return createOutput(resolved);
}
function resolveConfig(source, { slugs, icon, plugins = [], baseUrl, url, ...base }) {
  let config = {
    ...base,
    url: url ? (...args) => normalizeUrl(url(...args)) : createGetUrl(baseUrl, base.i18n),
    source,
    plugins: buildPlugins([
      slugsPlugin(slugs),
      icon && iconPlugin(icon),
      ...typeof plugins === "function" ? plugins({
        typedPlugin: (plugin) => plugin
      }) : plugins
    ])
  };
  for (const plugin of config.plugins ?? []) {
    const result = plugin.config?.(config);
    if (result) config = result;
  }
  return config;
}
function createOutput(loaderConfig) {
  const { i18n } = loaderConfig;
  const defaultLanguage = i18n?.defaultLanguage ?? "";
  const storages = buildContentStorage(loaderConfig, defaultLanguage);
  const walker = indexPages(storages, loaderConfig);
  const builder = createPageTreeBuilder(loaderConfig);
  let pageTree;
  return {
    _i18n: i18n,
    get pageTree() {
      pageTree ??= builder.buildI18n(storages);
      return i18n ? pageTree : pageTree[defaultLanguage];
    },
    set pageTree(v) {
      if (i18n) {
        pageTree = v;
      } else {
        pageTree = {
          [defaultLanguage]: v
        };
      }
    },
    getPageByHref(href, { dir = "", language = defaultLanguage } = {}) {
      const [value, hash] = href.split("#", 2);
      let target;
      if (value.startsWith(".") && (value.endsWith(".md") || value.endsWith(".mdx"))) {
        const path = joinPath(dir, value);
        target = walker.pathToPage.get(`${language}.${path}`);
      } else {
        target = this.getPages(language).find((item) => item.url === value);
      }
      if (target)
        return {
          page: target,
          hash
        };
    },
    getPages(language) {
      const pages = [];
      for (const [key, value] of walker.pages.entries()) {
        if (language === void 0 || key.startsWith(`${language}.`)) {
          pages.push(value);
        }
      }
      return pages;
    },
    getLanguages() {
      const list = [];
      if (!i18n) return list;
      for (const language of i18n.languages) {
        list.push({
          language,
          pages: this.getPages(language)
        });
      }
      return list;
    },
    // the slugs plugin generates encoded slugs by default.
    // we can assume page slugs are always URI encoded.
    getPage(slugs = [], language = defaultLanguage) {
      let page = walker.pages.get(`${language}.${slugs.join("/")}`);
      if (page) return page;
      page = walker.pages.get(`${language}.${slugs.map(decodeURI).join("/")}`);
      if (page) return page;
    },
    getNodeMeta(node, language = defaultLanguage) {
      const ref = node.$ref?.metaFile;
      if (!ref) return;
      return walker.pathToMeta.get(`${language}.${ref}`);
    },
    getNodePage(node, language = defaultLanguage) {
      const ref = node.$ref?.file;
      if (!ref) return;
      return walker.pathToPage.get(`${language}.${ref}`);
    },
    getPageTree(locale) {
      if (i18n) {
        return this.pageTree[locale ?? defaultLanguage];
      }
      return this.pageTree;
    },
    // @ts-expect-error -- ignore this
    generateParams(slug, lang) {
      if (i18n) {
        return this.getLanguages().flatMap(
          (entry) => entry.pages.map((page) => ({
            [slug ?? "slug"]: page.slugs,
            [lang ?? "lang"]: entry.language
          }))
        );
      }
      return this.getPages().map((page) => ({
        [slug ?? "slug"]: page.slugs
      }));
    }
  };
}

const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "/docs",
  icon(icon) {
    if (!icon) {
      return;
    }
    if (icon in icons) return icons[icon];
  }
});

export { Check as $, SidebarContent as A, Base as B, ChevronDown as C, DocsPage as D, mergeRefs$1 as E, FrameworkProvider as F, Sidebar as G, SidebarDrawerOverlay as H, I18nContext as I, SidebarDrawerContent as J, KeyCombo as K, Link2 as L, Mermaid as M, useFolderDepth as N, SidebarFolderContent as O, SidebarFolderLink as P, SidebarFolderTrigger as Q, SidebarSeparator as R, SearchToggle as S, ThemeToggle as T, SidebarItem as U, useSidebar as V, isTabActive as W, Popover as X, PopoverTrigger as Y, ChevronsUpDown as Z, PopoverContent as _, LargeSearchToggle as a, TreeContextProvider as a0, LayoutContextProvider as a1, LayoutBody as a2, LayoutHeader as a3, LayoutTabs as a4, useOnChange as a5, useI18n as a6, Search as a7, I18nLabel as a8, ChevronRight as a9, Hash as aa, __toESM as ab, __commonJS as ac, LanguageToggle as b, Languages as c, buttonVariants as d, LanguageToggleText as e, LinkItem as f, SearchProvider as g, useRouter as h, usePathname as i, defaultTranslations as j, browserCollections as k, DocsTitle as l, DocsDescription as m, DocsBody as n, KeySeq as o, Key as p, KeybindList as q, resolveLinkItems as r, source as s, defaultMdxComponents as t, useIsScrollTop as u, findPath as v, basename as w, extname as x, useTreeContext as y, useTreePath as z };
