import { jsx, jsxs, Fragment as Fragment$1 } from 'react/jsx-runtime';
import { a5 as useOnChange, a6 as useI18n, a7 as Search, d as buttonVariants, h as useRouter, a8 as I18nLabel, a9 as ChevronRight, aa as Hash } from './source-z941Y2wC.js';
import { useState, useRef, useEffect, createContext, useMemo, useEffectEvent, Fragment, useContext, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import { Dialog, DialogOverlay, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { cva } from 'class-variance-authority';
import scrollIntoView from 'scroll-into-view-if-needed';
import 'fumadocs-mdx/runtime/browser';
import '@radix-ui/react-popover';
import 'next-themes';
import '@radix-ui/react-collapsible';
import '@radix-ui/react-scroll-area';
import '@radix-ui/react-presence';
import '@radix-ui/react-tabs';
import 'fumadocs-mdx/runtime/server';
import 'lucide-static';

function useDebounce(value, delayMs = 1e3) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    if (delayMs === 0) return;
    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);
    return () => clearTimeout(handler);
  }, [delayMs, value]);
  if (delayMs === 0) return value;
  return debouncedValue;
}

// src/search/client.ts
function isDifferentDeep(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return b.length !== a.length || a.some((v, i) => isDifferentDeep(v, b[i]));
  }
  if (typeof a === "object" && a && typeof b === "object" && b) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    return aKeys.length !== bKeys.length || aKeys.some(
      (key) => isDifferentDeep(a[key], b[key])
    );
  }
  return a !== b;
}
function useDocsSearch(clientOptions) {
  const { delayMs = 100, allowEmpty = false, ...client } = clientOptions;
  const [search, setSearch] = useState("");
  const [results, setResults] = useState("empty");
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const debouncedValue = useDebounce(search, delayMs);
  const onStart = useRef(void 0);
  useOnChange(
    [client, debouncedValue],
    () => {
      if (onStart.current) {
        onStart.current();
        onStart.current = void 0;
      }
      setIsLoading(true);
      let interrupt = false;
      onStart.current = () => {
        interrupt = true;
      };
      async function run() {
        if (debouncedValue.length === 0 && !allowEmpty) return "empty";
        if (client.type === "fetch") {
          const { fetchDocs } = await import('./fetch-2XFMBLBA-TYFzgtkH.js');
          return fetchDocs(debouncedValue, client);
        }
        if (client.type === "algolia") {
          const { searchDocs } = await import('./algolia-IZEDLPHE-BYGInAeU.js');
          return searchDocs(debouncedValue, client);
        }
        if (client.type === "orama-cloud") {
          const { searchDocs } = await import('./orama-cloud-UZAPMPFV-BkQgX_ge.js');
          return searchDocs(debouncedValue, client);
        }
        if (client.type === "static") {
          const { search: search2 } = await import('./static-A2YJ5TXV-BuUKYdUu.js');
          return search2(debouncedValue, client);
        }
        if (client.type === "mixedbread") {
          const { search: search2 } = await import('./mixedbread-RAHDVXGJ-B4Y7fp1v.js');
          return search2(debouncedValue, client);
        }
        throw new Error("unknown search client");
      }
      void run().then((res) => {
        if (interrupt) return;
        setError(void 0);
        setResults(res);
      }).catch((err) => {
        setError(err);
      }).finally(() => {
        setIsLoading(false);
      });
    },
    isDifferentDeep
  );
  return { search, setSearch, query: { isLoading, data: results, error } };
}

const Context = createContext(null);
const ListContext = createContext(null);
const TagsListContext = createContext(null);
function SearchDialog({ open, onOpenChange, search, onSearchChange, isLoading = false, children, }) {
    const [active, setActive] = useState(null);
    return (jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: jsx(Context.Provider, { value: useMemo(() => ({
                open,
                onOpenChange,
                search,
                onSearchChange,
                active,
                setActive,
                isLoading,
            }), [active, isLoading, onOpenChange, onSearchChange, open, search]), children: children }) }));
}
function SearchDialogHeader(props) {
    return (jsx("div", { ...props, className: twMerge('flex flex-row items-center gap-2 p-3', props.className) }));
}
function SearchDialogInput(props) {
    const { text } = useI18n();
    const { search, onSearchChange } = useSearch();
    return (jsx("input", { ...props, value: search, onChange: (e) => onSearchChange(e.target.value), placeholder: text.search, className: "w-0 flex-1 bg-transparent text-lg placeholder:text-fd-muted-foreground focus-visible:outline-none" }));
}
function SearchDialogClose({ children = 'ESC', className, ...props }) {
    const { onOpenChange } = useSearch();
    return (jsx("button", { type: "button", onClick: () => onOpenChange(false), className: twMerge(buttonVariants({
            color: 'outline',
            size: 'sm',
            className: 'font-mono text-fd-muted-foreground',
        }), className), ...props, children: children }));
}
function SearchDialogFooter(props) {
    return (jsx("div", { ...props, className: twMerge('bg-fd-secondary/50 p-3 empty:hidden', props.className) }));
}
function SearchDialogOverlay(props) {
    return (jsx(DialogOverlay, { ...props, className: twMerge('fixed inset-0 z-50 backdrop-blur-xs bg-fd-overlay data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out', props.className) }));
}
function SearchDialogContent({ children, ...props }) {
    const { text } = useI18n();
    return (jsxs(DialogContent, { "aria-describedby": undefined, ...props, className: twMerge('fixed left-1/2 top-4 md:top-[calc(50%-250px)] z-50 w-[calc(100%-1rem)] max-w-screen-sm -translate-x-1/2 rounded-xl border bg-fd-popover text-fd-popover-foreground shadow-2xl shadow-black/50 overflow-hidden data-[state=closed]:animate-fd-dialog-out data-[state=open]:animate-fd-dialog-in', '*:border-b *:has-[+:last-child[data-empty=true]]:border-b-0 *:data-[empty=true]:border-b-0 *:last:border-b-0', props.className), children: [jsx(DialogTitle, { className: "hidden", children: text.search }), children] }));
}
function SearchDialogList({ items = null, Empty = () => (jsx("div", { className: "py-12 text-center text-sm text-fd-muted-foreground", children: jsx(I18nLabel, { label: "searchNoResult" }) })), Item = (props) => jsx(SearchDialogListItem, { ...props }), ...props }) {
    const ref = useRef(null);
    const [active, setActive] = useState(() => items && items.length > 0 ? items[0].id : null);
    const { onOpenChange } = useSearch();
    const router = useRouter();
    const onOpen = (item) => {
        if (item.type === 'action') {
            item.onSelect();
        }
        else if (item.external) {
            window.open(item.url, '_blank')?.focus();
        }
        else {
            router.push(item.url);
        }
        onOpenChange(false);
    };
    const onKey = useEffectEvent((e) => {
        if (!items || e.isComposing)
            return;
        if (e.key === 'ArrowDown' || e.key == 'ArrowUp') {
            let idx = items.findIndex((item) => item.id === active);
            if (idx === -1)
                idx = 0;
            else if (e.key === 'ArrowDown')
                idx++;
            else
                idx--;
            setActive(items.at(idx % items.length)?.id ?? null);
            e.preventDefault();
        }
        if (e.key === 'Enter') {
            const selected = items.find((item) => item.id === active);
            if (selected)
                onOpen(selected);
            e.preventDefault();
        }
    });
    useEffect(() => {
        const element = ref.current;
        if (!element)
            return;
        const observer = new ResizeObserver(() => {
            const viewport = element.firstElementChild;
            element.style.setProperty('--fd-animated-height', `${viewport.clientHeight}px`);
        });
        const viewport = element.firstElementChild;
        if (viewport)
            observer.observe(viewport);
        window.addEventListener('keydown', onKey);
        return () => {
            observer.disconnect();
            window.removeEventListener('keydown', onKey);
        };
    }, []);
    useOnChange(items, () => {
        if (items && items.length > 0) {
            setActive(items[0].id);
        }
    });
    return (jsx("div", { ...props, ref: ref, "data-empty": items === null, className: twMerge('overflow-hidden h-(--fd-animated-height) transition-[height]', props.className), children: jsx("div", { className: twMerge('w-full flex flex-col overflow-y-auto max-h-[460px] p-1', !items && 'hidden'), children: jsxs(ListContext.Provider, { value: useMemo(() => ({
                    active,
                    setActive,
                }), [active]), children: [items?.length === 0 && Empty(), items?.map((item) => (jsx(Fragment, { children: Item({ item, onClick: () => onOpen(item) }) }, item.id)))] }) }) }));
}
function SearchDialogListItem({ item, className, children, renderHighlights: render = renderHighlights, ...props }) {
    const { active: activeId, setActive } = useSearchList();
    const active = item.id === activeId;
    if (item.type === 'action') {
        children ?? (children = item.node);
    }
    else {
        children ?? (children = jsxs(Fragment$1, { children: [jsx("div", { className: "inline-flex items-center text-fd-muted-foreground text-xs empty:hidden", children: item.breadcrumbs?.map((item, i) => (jsxs(Fragment, { children: [i > 0 && jsx(ChevronRight, { className: "size-4" }), item] }, i))) }), item.type !== 'page' && (jsx("div", { role: "none", className: "absolute start-3 inset-y-0 w-px bg-fd-border" })), jsxs("p", { className: twMerge('min-w-0 truncate', item.type !== 'page' && 'ps-4', item.type === 'page' || item.type === 'heading'
                        ? 'font-medium'
                        : 'text-fd-popover-foreground/80'), children: [item.type === 'heading' && (jsx(Hash, { className: "inline me-1 size-4 text-fd-muted-foreground" })), item.contentWithHighlights
                            ? render(item.contentWithHighlights)
                            : item.content] })] }));
    }
    return (jsx("button", { type: "button", ref: useCallback((element) => {
            if (active && element) {
                scrollIntoView(element, {
                    scrollMode: 'if-needed',
                    block: 'nearest',
                    boundary: element.parentElement,
                });
            }
        }, [active]), "aria-selected": active, className: twMerge('relative select-none px-2.5 py-2 text-start text-sm rounded-lg', active && 'bg-fd-accent text-fd-accent-foreground', className), onPointerMove: () => setActive(item.id), ...props, children: children }));
}
function SearchDialogIcon(props) {
    const { isLoading } = useSearch();
    return (jsx(Search, { ...props, className: twMerge('size-5 text-fd-muted-foreground', isLoading && 'animate-pulse duration-400', props.className) }));
}
const itemVariants = cva('rounded-md border px-2 py-0.5 text-xs font-medium text-fd-muted-foreground transition-colors', {
    variants: {
        active: {
            true: 'bg-fd-accent text-fd-accent-foreground',
        },
    },
});
function TagsList({ tag, onTagChange, allowClear = false, ...props }) {
    return (jsx("div", { ...props, className: twMerge('flex items-center gap-1 flex-wrap', props.className), children: jsx(TagsListContext.Provider, { value: useMemo(() => ({
                value: tag,
                onValueChange: onTagChange,
                allowClear,
            }), [allowClear, onTagChange, tag]), children: props.children }) }));
}
function TagsListItem({ value, className, ...props }) {
    const { onValueChange, value: selectedValue, allowClear } = useTagsList();
    const selected = value === selectedValue;
    return (jsx("button", { type: "button", "data-active": selected, className: twMerge(itemVariants({ active: selected, className })), onClick: () => {
            onValueChange(selected && allowClear ? undefined : value);
        }, tabIndex: -1, ...props, children: props.children }));
}
function renderHighlights(highlights) {
    return highlights.map((node, i) => {
        if (node.styles?.highlight) {
            return (jsx("span", { className: "text-fd-primary underline", children: node.content }, i));
        }
        return jsx(Fragment, { children: node.content }, i);
    });
}
function useSearch() {
    const ctx = useContext(Context);
    if (!ctx)
        throw new Error('Missing <SearchDialog />');
    return ctx;
}
function useTagsList() {
    const ctx = useContext(TagsListContext);
    if (!ctx)
        throw new Error('Missing <TagsList />');
    return ctx;
}
function useSearchList() {
    const ctx = useContext(ListContext);
    if (!ctx)
        throw new Error('Missing <SearchDialogList />');
    return ctx;
}

function DefaultSearchDialog({ defaultTag, tags = [], api, delayMs, type = 'fetch', allowClear = false, links = [], footer, ...props }) {
    const { locale } = useI18n();
    const [tag, setTag] = useState(defaultTag);
    const { search, setSearch, query } = useDocsSearch(type === 'fetch'
        ? {
            type: 'fetch',
            api,
            locale,
            tag,
            delayMs,
        }
        : {
            type: 'static',
            from: api,
            locale,
            tag,
            delayMs,
        });
    const defaultItems = useMemo(() => {
        if (links.length === 0)
            return null;
        return links.map(([name, link]) => ({
            type: 'page',
            id: name,
            content: name,
            url: link,
        }));
    }, [links]);
    useOnChange(defaultTag, (v) => {
        setTag(v);
    });
    return (jsxs(SearchDialog, { search: search, onSearchChange: setSearch, isLoading: query.isLoading, ...props, children: [jsx(SearchDialogOverlay, {}), jsxs(SearchDialogContent, { children: [jsxs(SearchDialogHeader, { children: [jsx(SearchDialogIcon, {}), jsx(SearchDialogInput, {}), jsx(SearchDialogClose, {})] }), jsx(SearchDialogList, { items: query.data !== 'empty' ? query.data : defaultItems })] }), jsxs(SearchDialogFooter, { children: [tags.length > 0 && (jsx(TagsList, { tag: tag, onTagChange: setTag, allowClear: allowClear, children: tags.map((tag) => (jsx(TagsListItem, { value: tag.value, children: tag.name }, tag.value))) })), footer] })] }));
}

export { DefaultSearchDialog as default };
