import { jsx, jsxs, Fragment as Fragment$1 } from 'react/jsx-runtime';
import { useMemo, Fragment, useRef, useState } from 'react';
import { y as useTreeContext, z as useTreePath, B as Base, A as SidebarContent$1, E as mergeRefs, G as Sidebar$1, d as buttonVariants, S as SearchToggle, H as SidebarDrawerOverlay, J as SidebarDrawerContent, N as useFolderDepth, O as SidebarFolderContent$1, P as SidebarFolderLink$1, Q as SidebarFolderTrigger$1, R as SidebarSeparator$1, U as SidebarItem$1, V as useSidebar, i as usePathname, W as isTabActive, X as Popover, Y as PopoverTrigger, Z as ChevronsUpDown, _ as PopoverContent, L as Link2, $ as Check, r as resolveLinkItems, a0 as TreeContextProvider, a1 as LayoutContextProvider, a2 as LayoutBody, a3 as LayoutHeader, a4 as LayoutTabs, a as LargeSearchToggle, b as LanguageToggle, c as Languages, f as LinkItem, T as ThemeToggle, e as LanguageToggleText } from './source-z941Y2wC.js';
import { twMerge } from 'tailwind-merge';
import { cva } from 'class-variance-authority';

function createPageTreeRenderer({ SidebarFolder, SidebarFolderContent, SidebarFolderLink, SidebarFolderTrigger, SidebarSeparator, SidebarItem, }) {
    function PageTreeFolder({ item, children, }) {
        const path = useTreePath();
        return (jsxs(SidebarFolder, { defaultOpen: (value) => (item.defaultOpen ?? value) || path.includes(item), children: [item.index ? (jsxs(SidebarFolderLink, { href: item.index.url, external: item.index.external, children: [item.icon, item.name] })) : (jsxs(SidebarFolderTrigger, { children: [item.icon, item.name] })), jsx(SidebarFolderContent, { children: children })] }));
    }
    /**
     * Render sidebar items from page tree
     */
    return function SidebarPageTree(components) {
        const { root } = useTreeContext();
        const { Separator, Item, Folder = PageTreeFolder } = components;
        return useMemo(() => {
            function renderSidebarList(items) {
                return items.map((item, i) => {
                    if (item.type === 'separator') {
                        if (Separator)
                            return jsx(Separator, { item: item }, i);
                        return (jsxs(SidebarSeparator, { children: [item.icon, item.name] }, i));
                    }
                    if (item.type === 'folder') {
                        return (jsx(Folder, { item: item, children: renderSidebarList(item.children) }, i));
                    }
                    if (Item)
                        return jsx(Item, { item: item }, item.url);
                    return (jsx(SidebarItem, { href: item.url, external: item.external, icon: item.icon, children: item.name }, item.url));
                });
            }
            return (jsx(Fragment, { children: renderSidebarList(root.children) }, root.$id));
        }, [Folder, Item, Separator, root]);
    };
}

function createLinkItemRenderer({ SidebarFolder, SidebarFolderContent, SidebarFolderLink, SidebarFolderTrigger, SidebarItem, }) {
    /**
     * Render sidebar items from page tree
     */
    return function SidebarLinkItem({ item, ...props }) {
        if (item.type === 'custom')
            return jsx("div", { ...props, children: item.children });
        if (item.type === 'menu')
            return (jsxs(SidebarFolder, { ...props, children: [item.url ? (jsxs(SidebarFolderLink, { href: item.url, external: item.external, children: [item.icon, item.text] })) : (jsxs(SidebarFolderTrigger, { children: [item.icon, item.text] })), jsx(SidebarFolderContent, { children: item.items.map((child, i) => (jsx(SidebarLinkItem, { item: child }, i))) })] }));
        return (jsx(SidebarItem, { href: item.url, icon: item.icon, external: item.external, ...props, children: item.text }));
    };
}

const itemVariants = cva('relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none [&_svg]:size-4 [&_svg]:shrink-0', {
    variants: {
        variant: {
            link: 'data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors',
        },
        highlight: {
            true: "data-[active=true]:before:content-[''] data-[active=true]:before:bg-fd-primary data-[active=true]:before:absolute data-[active=true]:before:w-px data-[active=true]:before:inset-y-2.5 data-[active=true]:before:start-2.5",
        },
    },
});
function getItemOffset(depth) {
    return `calc(${2 + 3 * depth} * var(--spacing))`;
}
const { SidebarProvider: Sidebar, SidebarFolder, SidebarCollapseTrigger, SidebarViewport, SidebarTrigger, } = Base;
function SidebarContent({ ref: refProp, className, children, ...props }) {
    const ref = useRef(null);
    return (jsx(SidebarContent$1, { children: ({ collapsed, hovered, ref: asideRef, ...rest }) => (jsxs(Fragment$1, { children: [jsxs("div", { "data-sidebar-placeholder": "", className: "sticky top-(--fd-docs-row-1) z-20 [grid-area:sidebar] pointer-events-none *:pointer-events-auto h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] md:layout:[--fd-sidebar-width:268px] max-md:hidden", children: [collapsed && (jsx("div", { className: "absolute start-0 inset-y-0 w-4", ...rest })), jsx("aside", { id: "nd-sidebar", ref: mergeRefs(ref, refProp, asideRef), "data-collapsed": collapsed, "data-hovered": collapsed && hovered, className: twMerge('absolute flex flex-col w-full start-0 inset-y-0 items-end bg-fd-card text-sm border-e duration-250 *:w-(--fd-sidebar-width)', collapsed && [
                                'inset-y-2 rounded-xl transition-transform border w-(--fd-sidebar-width)',
                                hovered
                                    ? 'shadow-lg translate-x-2 rtl:-translate-x-2'
                                    : '-translate-x-(--fd-sidebar-width) rtl:translate-x-full',
                            ], ref.current &&
                                (ref.current.getAttribute('data-collapsed') === 'true') !==
                                    collapsed &&
                                'transition-[width,inset-block,translate,background-color]', className), ...props, ...rest, children: children })] }), jsxs("div", { "data-sidebar-panel": "", className: twMerge('fixed flex top-[calc(--spacing(4)+var(--fd-toc-popover-height))] start-4 shadow-lg transition-opacity rounded-xl p-0.5 border bg-fd-muted text-fd-muted-foreground z-10', (!collapsed || hovered) && 'pointer-events-none opacity-0'), children: [jsx(SidebarCollapseTrigger, { className: twMerge(buttonVariants({
                                color: 'ghost',
                                size: 'icon-sm',
                                className: 'rounded-lg',
                            })), children: jsx(Sidebar$1, {}) }), jsx(SearchToggle, { className: "rounded-lg", hideIfDisabled: true })] })] })) }));
}
function SidebarDrawer({ children, className, ...props }) {
    return (jsxs(Fragment$1, { children: [jsx(SidebarDrawerOverlay, { className: "fixed z-40 inset-0 backdrop-blur-xs data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out" }), jsx(SidebarDrawerContent, { className: twMerge('fixed text-[0.9375rem] flex flex-col shadow-lg border-s end-0 inset-y-0 w-[85%] max-w-[380px] z-40 bg-fd-background data-[state=open]:animate-fd-sidebar-in data-[state=closed]:animate-fd-sidebar-out', className), ...props, children: children })] }));
}
function SidebarSeparator({ className, style, children, ...props }) {
    const depth = useFolderDepth();
    return (jsx(SidebarSeparator$1, { className: twMerge('[&_svg]:size-4 [&_svg]:shrink-0', className), style: {
            paddingInlineStart: getItemOffset(depth),
            ...style,
        }, ...props, children: children }));
}
function SidebarItem({ className, style, children, ...props }) {
    const depth = useFolderDepth();
    return (jsx(SidebarItem$1, { className: twMerge(itemVariants({ variant: 'link', highlight: depth >= 1 }), className), style: {
            paddingInlineStart: getItemOffset(depth),
            ...style,
        }, ...props, children: children }));
}
function SidebarFolderTrigger({ className, style, ...props }) {
    const depth = useFolderDepth();
    return (jsx(SidebarFolderTrigger$1, { className: twMerge(itemVariants(), 'w-full', className), style: {
            paddingInlineStart: getItemOffset(depth - 1),
            ...style,
        }, ...props, children: props.children }));
}
function SidebarFolderLink({ className, style, ...props }) {
    const depth = useFolderDepth();
    return (jsx(SidebarFolderLink$1, { className: twMerge(itemVariants({ variant: 'link', highlight: depth > 1 }), 'w-full', className), style: {
            paddingInlineStart: getItemOffset(depth - 1),
            ...style,
        }, ...props, children: props.children }));
}
function SidebarFolderContent({ className, children, ...props }) {
    const depth = useFolderDepth();
    return (jsx(SidebarFolderContent$1, { className: twMerge('relative', depth === 1 &&
            "before:content-[''] before:absolute before:w-px before:inset-y-1 before:bg-fd-border before:start-2.5", className), ...props, children: children }));
}
const SidebarPageTree = createPageTreeRenderer({
    SidebarFolder,
    SidebarFolderContent,
    SidebarFolderLink,
    SidebarFolderTrigger,
    SidebarItem,
    SidebarSeparator,
});
const SidebarLinkItem = createLinkItemRenderer({
    SidebarFolder,
    SidebarFolderContent,
    SidebarFolderLink,
    SidebarFolderTrigger,
    SidebarItem,
});

const defaultTransform = (option, node) => {
    if (!node.icon)
        return option;
    return {
        ...option,
        icon: (jsx("div", { className: "size-full [&_svg]:size-full max-md:p-1.5 max-md:rounded-md max-md:border max-md:bg-fd-secondary", children: node.icon })),
    };
};
function getSidebarTabs(tree, { transform = defaultTransform } = {}) {
    const results = [];
    function scanOptions(node, unlisted) {
        if ('root' in node && node.root) {
            const urls = getFolderUrls(node);
            if (urls.size > 0) {
                const option = {
                    url: urls.values().next().value ?? '',
                    title: node.name,
                    icon: node.icon,
                    unlisted,
                    description: node.description,
                    urls,
                };
                const mapped = transform ? transform(option, node) : option;
                if (mapped)
                    results.push(mapped);
            }
        }
        for (const child of node.children) {
            if (child.type === 'folder')
                scanOptions(child, unlisted);
        }
    }
    scanOptions(tree);
    if (tree.fallback)
        scanOptions(tree.fallback, true);
    return results;
}
function getFolderUrls(folder, output = new Set()) {
    if (folder.index)
        output.add(folder.index.url);
    for (const child of folder.children) {
        if (child.type === 'page' && !child.external)
            output.add(child.url);
        if (child.type === 'folder')
            getFolderUrls(child, output);
    }
    return output;
}

function SidebarTabTrigger({ options, placeholder, ...props }) {
    const [open, setOpen] = useState(false);
    const { closeOnRedirect } = useSidebar();
    const pathname = usePathname();
    const selected = useMemo(() => {
        return options.findLast((item) => isTabActive(item, pathname));
    }, [options, pathname]);
    const onClick = () => {
        closeOnRedirect.current = false;
        setOpen(false);
    };
    const item = selected ? (jsxs(Fragment$1, { children: [jsx("div", { className: "size-9 shrink-0 empty:hidden md:size-5", children: selected.icon }), jsxs("div", { children: [jsx("p", { className: "text-sm font-medium", children: selected.title }), jsx("p", { className: "text-sm text-fd-muted-foreground empty:hidden md:hidden", children: selected.description })] })] })) : (placeholder);
    return (jsxs(Popover, { open: open, onOpenChange: setOpen, children: [item && (jsxs(PopoverTrigger, { ...props, className: twMerge('flex items-center gap-2 rounded-lg p-2 border bg-fd-secondary/50 text-start text-fd-secondary-foreground transition-colors hover:bg-fd-accent data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground', props.className), children: [item, jsx(ChevronsUpDown, { className: "shrink-0 ms-auto size-4 text-fd-muted-foreground" })] })), jsx(PopoverContent, { className: "flex flex-col gap-1 w-(--radix-popover-trigger-width) p-1 fd-scroll-container", children: options.map((item) => {
                    const isActive = selected && item.url === selected.url;
                    if (!isActive && item.unlisted)
                        return;
                    return (jsxs(Link2, { href: item.url, onClick: onClick, ...item.props, className: twMerge('flex items-center gap-2 rounded-lg p-1.5 hover:bg-fd-accent hover:text-fd-accent-foreground', item.props?.className), children: [jsx("div", { className: "shrink-0 size-9 md:mt-1 md:mb-auto md:size-5 empty:hidden", children: item.icon }), jsxs("div", { children: [jsx("p", { className: "text-sm font-medium", children: item.title }), jsx("p", { className: "text-[0.8125rem] text-fd-muted-foreground empty:hidden", children: item.description })] }), jsx(Check, { className: twMerge('shrink-0 ms-auto size-3.5 text-fd-primary', !isActive && 'invisible') })] }, item.url));
                }) })] }));
}

function DocsLayout({ nav: { transparentMode, ...nav } = {}, sidebar: { tabs: sidebarTabs, enabled: sidebarEnabled = true, defaultOpenLevel, prefetch, ...sidebarProps } = {}, searchToggle = {}, themeSwitch = {}, tabMode = 'auto', i18n = false, children, tree, ...props }) {
    const tabs = useMemo(() => {
        if (Array.isArray(sidebarTabs)) {
            return sidebarTabs;
        }
        if (typeof sidebarTabs === 'object') {
            return getSidebarTabs(tree, sidebarTabs);
        }
        if (sidebarTabs !== false) {
            return getSidebarTabs(tree);
        }
        return [];
    }, [tree, sidebarTabs]);
    const links = resolveLinkItems(props);
    function sidebar() {
        const { footer, banner, collapsible = true, component, components, ...rest } = sidebarProps;
        if (component)
            return component;
        const iconLinks = links.filter((item) => item.type === 'icon');
        const viewport = (jsxs(SidebarViewport, { children: [links
                    .filter((v) => v.type !== 'icon')
                    .map((item, i, list) => (jsx(SidebarLinkItem, { item: item, className: twMerge(i === list.length - 1 && 'mb-4') }, i))), jsx(SidebarPageTree, { ...components })] }));
        return (jsxs(Fragment$1, { children: [jsxs(SidebarContent, { ...rest, children: [jsxs("div", { className: "flex flex-col gap-3 p-4 pb-2", children: [jsxs("div", { className: "flex", children: [jsx(Link2, { href: nav.url ?? '/', className: "inline-flex text-[0.9375rem] items-center gap-2.5 font-medium me-auto", children: nav.title }), nav.children, collapsible && (jsx(SidebarCollapseTrigger, { className: twMerge(buttonVariants({
                                                color: 'ghost',
                                                size: 'icon-sm',
                                                className: 'mb-auto text-fd-muted-foreground',
                                            })), children: jsx(Sidebar$1, {}) }))] }), searchToggle.enabled !== false &&
                                    (searchToggle.components?.lg ?? (jsx(LargeSearchToggle, { hideIfDisabled: true }))), tabs.length > 0 && tabMode === 'auto' && (jsx(SidebarTabTrigger, { options: tabs })), banner] }), viewport, (i18n ||
                            iconLinks.length > 0 ||
                            themeSwitch?.enabled !== false ||
                            footer) && (jsxs("div", { className: "flex flex-col border-t p-4 pt-2 empty:hidden", children: [jsxs("div", { className: "flex text-fd-muted-foreground items-center empty:hidden", children: [i18n && (jsx(LanguageToggle, { children: jsx(Languages, { className: "size-4.5" }) })), iconLinks.map((item, i) => (jsx(LinkItem, { item: item, className: twMerge(buttonVariants({ size: 'icon-sm', color: 'ghost' })), "aria-label": item.label, children: item.icon }, i))), themeSwitch.enabled !== false &&
                                            (themeSwitch.component ?? (jsx(ThemeToggle, { className: "ms-auto p-0", mode: themeSwitch.mode })))] }), footer] }))] }), jsxs(SidebarDrawer, { children: [jsxs("div", { className: "flex flex-col gap-3 p-4 pb-2", children: [jsxs("div", { className: "flex text-fd-muted-foreground items-center gap-1.5", children: [jsx("div", { className: "flex flex-1", children: iconLinks.map((item, i) => (jsx(LinkItem, { item: item, className: twMerge(buttonVariants({
                                                    size: 'icon-sm',
                                                    color: 'ghost',
                                                    className: 'p-2',
                                                })), "aria-label": item.label, children: item.icon }, i))) }), i18n && (jsxs(LanguageToggle, { children: [jsx(Languages, { className: "size-4.5" }), jsx(LanguageToggleText, {})] })), themeSwitch.enabled !== false &&
                                            (themeSwitch.component ?? (jsx(ThemeToggle, { className: "p-0", mode: themeSwitch.mode }))), jsx(SidebarTrigger, { className: twMerge(buttonVariants({
                                                color: 'ghost',
                                                size: 'icon-sm',
                                                className: 'p-2',
                                            })), children: jsx(Sidebar$1, {}) })] }), tabs.length > 0 && jsx(SidebarTabTrigger, { options: tabs }), banner] }), viewport, jsx("div", { className: "flex flex-col border-t p-4 pt-2 empty:hidden", children: footer })] })] }));
    }
    return (jsx(TreeContextProvider, { tree: tree, children: jsx(LayoutContextProvider, { navTransparentMode: transparentMode, children: jsx(Sidebar, { defaultOpenLevel: defaultOpenLevel, prefetch: prefetch, children: jsxs(LayoutBody, { ...props.containerProps, children: [nav.enabled !== false &&
                            (nav.component ?? (jsxs(LayoutHeader, { id: "nd-subnav", className: "[grid-area:header] sticky top-(--fd-docs-row-1) z-30 flex items-center ps-4 pe-2.5 border-b transition-colors backdrop-blur-sm h-(--fd-header-height) md:hidden max-md:layout:[--fd-header-height:--spacing(14)] data-[transparent=false]:bg-fd-background/80", children: [jsx(Link2, { href: nav.url ?? '/', className: "inline-flex items-center gap-2.5 font-semibold", children: nav.title }), jsx("div", { className: "flex-1", children: nav.children }), searchToggle.enabled !== false &&
                                        (searchToggle.components?.sm ?? (jsx(SearchToggle, { className: "p-2", hideIfDisabled: true }))), sidebarEnabled && (jsx(SidebarTrigger, { className: twMerge(buttonVariants({
                                            color: 'ghost',
                                            size: 'icon-sm',
                                            className: 'p-2',
                                        })), children: jsx(Sidebar$1, {}) }))] }))), sidebarEnabled && sidebar(), tabMode === 'top' && tabs.length > 0 && (jsx(LayoutTabs, { options: tabs, className: "z-10 bg-fd-background border-b px-6 pt-3 xl:px-8 max-md:hidden" })), children] }) }) }) }));
}

export { DocsLayout as D };
