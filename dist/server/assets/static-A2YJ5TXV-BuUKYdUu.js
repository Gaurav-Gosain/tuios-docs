import { s as searchSimple, a as searchAdvanced } from './router-yBWKifsJ.js';
import { create, load } from '@orama/orama';
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

var cache = /* @__PURE__ */ new Map();
async function loadDB({
  from = "/api/search",
  initOrama = (locale) => create({ schema: { _: "string" }, language: locale })
}) {
  const cacheKey = from;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  async function init() {
    const res = await fetch(from);
    if (!res.ok)
      throw new Error(
        `failed to fetch exported search indexes from ${from}, make sure the search database is exported and available for client.`
      );
    const data = await res.json();
    const dbs = /* @__PURE__ */ new Map();
    if (data.type === "i18n") {
      await Promise.all(
        Object.entries(data.data).map(async ([k, v]) => {
          const db2 = await initOrama(k);
          load(db2, v);
          dbs.set(k, {
            type: v.type,
            db: db2
          });
        })
      );
      return dbs;
    }
    const db = await initOrama();
    load(db, data);
    dbs.set("", {
      type: data.type,
      db
    });
    return dbs;
  }
  const result = init();
  cache.set(cacheKey, result);
  return result;
}
async function search(query, options) {
  const { tag, locale } = options;
  const db = (await loadDB(options)).get(locale ?? "");
  if (!db) return [];
  if (db.type === "simple")
    return searchSimple(db, query);
  return searchAdvanced(db.db, query, tag);
}

export { search };
