import { jsxs, jsx } from 'react/jsx-runtime';
import { a as createServerRpc, c as createServerFn } from '../server.js';
import { s as source, k as browserCollections, D as DocsPage, l as DocsTitle, m as DocsDescription, n as DocsBody, K as KeyCombo, o as KeySeq, p as Key, q as KeybindList, M as Mermaid, t as defaultMdxComponents } from './source-z941Y2wC.js';
import { notFound, createFileRoute } from '@tanstack/react-router';
import { D as DocsLayout } from './index-rexZWtkn.js';
import { useMemo } from 'react';
import { b as baseOptions } from './layout.shared-Zw_RDWoL.js';
import '@tanstack/history';
import '@tanstack/router-core/ssr/client';
import '@tanstack/router-core';
import 'node:async_hooks';
import '@tanstack/router-core/ssr/server';
import 'h3-v2';
import 'tiny-invariant';
import 'seroval';
import '@tanstack/react-router/ssr/server';
import 'fumadocs-mdx/runtime/browser';
import 'tailwind-merge';
import '@radix-ui/react-popover';
import 'class-variance-authority';
import 'next-themes';
import '@radix-ui/react-collapsible';
import 'scroll-into-view-if-needed';
import '@radix-ui/react-scroll-area';
import '@radix-ui/react-presence';
import '@radix-ui/react-tabs';
import 'fumadocs-mdx/runtime/server';
import 'lucide-static';

const Route = createFileRoute("/docs/$")({
  component: Page,
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
const loader_createServerFn_handler = createServerRpc("3dffc64eabe29fc8f5f4021f5e1cdf4bfea9319ffba3a59848ead9dcd2fa0308", (opts, signal) => {
  return loader.__executeServer(opts, signal);
});
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
function Page() {
  const data = Route.useLoaderData();
  const Content = clientLoader.getComponent(data.path);
  const tree = useMemo(() => transformPageTree(data.tree), [data.tree]);
  return /* @__PURE__ */ jsx(DocsLayout, { ...baseOptions(), tree, containerProps: {
    id: "nd-docs-layout"
  }, children: /* @__PURE__ */ jsx(Content, {}) });
}
function transformPageTree(root) {
  function mapNode(item) {
    if (typeof item.icon === "string") {
      item = {
        ...item,
        icon: /* @__PURE__ */ jsx("span", { dangerouslySetInnerHTML: {
          __html: item.icon
        } })
      };
    }
    if (item.type === "folder") {
      return {
        ...item,
        index: item.index ? mapNode(item.index) : void 0,
        children: item.children.map(mapNode)
      };
    }
    return item;
  }
  return {
    ...root,
    children: root.children.map(mapNode),
    fallback: root.fallback ? transformPageTree(root.fallback) : void 0
  };
}

export { loader_createServerFn_handler };
