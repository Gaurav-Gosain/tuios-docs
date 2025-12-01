import { c as createContentHighlighter } from './router-yBWKifsJ.js';
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

// src/search/client/algolia.ts
function groupResults(hits) {
  const grouped = [];
  const scannedUrls = /* @__PURE__ */ new Set();
  for (const hit of hits) {
    if (!scannedUrls.has(hit.url)) {
      scannedUrls.add(hit.url);
      grouped.push({
        id: hit.url,
        type: "page",
        breadcrumbs: hit.breadcrumbs,
        url: hit.url,
        content: hit.title
      });
    }
    grouped.push({
      id: hit.objectID,
      type: hit.content === hit.section ? "heading" : "text",
      url: hit.section_id ? `${hit.url}#${hit.section_id}` : hit.url,
      content: hit.content
    });
  }
  return grouped;
}
async function searchDocs(query, { indexName, onSearch, client, locale, tag }) {
  if (query.trim().length === 0) return [];
  const result = onSearch ? await onSearch(query, tag, locale) : await client.searchForHits({
    requests: [
      {
        type: "default",
        indexName,
        query,
        distinct: 5,
        hitsPerPage: 10,
        filters: tag ? `tag:${tag}` : void 0
      }
    ]
  });
  const highlighter = createContentHighlighter(query);
  return groupResults(result.results[0].hits).flatMap((hit) => {
    if (hit.type === "page") {
      return {
        ...hit,
        contentWithHighlights: hit.contentWithHighlights ?? highlighter.highlight(hit.content)
      };
    }
    return [];
  });
}

export { groupResults, searchDocs };
