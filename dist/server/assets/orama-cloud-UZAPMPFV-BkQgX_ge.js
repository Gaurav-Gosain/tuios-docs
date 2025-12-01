import { c as createContentHighlighter, r as removeUndefined } from './router-yBWKifsJ.js';
import '@tanstack/react-router';
import 'react/jsx-runtime';
import 'tailwind-merge';
import 'react';
import 'class-variance-authority';
import './source-z941Y2wC.js';
import 'fumadocs-mdx/runtime/browser';
import '@radix-ui/react-popover';
import 'next-themes';
import '@radix-ui/react-collapsible';
import 'scroll-into-view-if-needed';
import '@radix-ui/react-scroll-area';
import '@radix-ui/react-presence';
import '@radix-ui/react-tabs';
import 'fumadocs-mdx/runtime/server';
import 'lucide-static';
import '@radix-ui/react-navigation-menu';
import '@radix-ui/react-direction';
import 'feed';
import '../server.js';
import '@tanstack/history';
import '@tanstack/router-core/ssr/client';
import '@tanstack/router-core';
import 'node:async_hooks';
import '@tanstack/router-core/ssr/server';
import 'h3-v2';
import 'tiny-invariant';
import 'seroval';
import '@tanstack/react-router/ssr/server';
import '@orama/orama';

// src/search/client/orama-cloud.ts
async function searchDocs(query, options) {
  const highlighter = createContentHighlighter(query);
  const list = [];
  const { index = "default", client, params: extraParams, tag } = options;
  if (index === "crawler") {
    const result2 = await client.search({
      datasources: [],
      ...extraParams,
      term: query,
      where: {
        category: tag ? {
          eq: tag.slice(0, 1).toUpperCase() + tag.slice(1)
        } : void 0,
        ...extraParams?.where
      },
      limit: 10
    });
    if (!result2) return list;
    for (const hit of result2.hits) {
      const doc = hit.document;
      list.push(
        {
          id: hit.id,
          type: "page",
          content: doc.title,
          contentWithHighlights: highlighter.highlight(doc.title),
          url: doc.path
        },
        {
          id: "page" + hit.id,
          type: "text",
          content: doc.content,
          contentWithHighlights: highlighter.highlight(doc.content),
          url: doc.path
        }
      );
    }
    return list;
  }
  const params = {
    datasources: [],
    ...extraParams,
    term: query,
    where: removeUndefined({
      tag,
      ...extraParams?.where
    }),
    groupBy: {
      properties: ["page_id"],
      max_results: 7,
      ...extraParams?.groupBy
    }
  };
  const result = await client.search(params);
  if (!result || !result.groups) return list;
  for (const item of result.groups) {
    let addedHead = false;
    for (const hit of item.result) {
      const doc = hit.document;
      if (!addedHead) {
        list.push({
          id: doc.page_id,
          type: "page",
          content: doc.title,
          breadcrumbs: doc.breadcrumbs,
          contentWithHighlights: highlighter.highlight(doc.title),
          url: doc.url
        });
        addedHead = true;
      }
      list.push({
        id: doc.id,
        content: doc.content,
        contentWithHighlights: highlighter.highlight(doc.content),
        type: doc.content === doc.section ? "heading" : "text",
        url: doc.section_id ? `${doc.url}#${doc.section_id}` : doc.url
      });
    }
  }
  return list;
}

export { searchDocs };
