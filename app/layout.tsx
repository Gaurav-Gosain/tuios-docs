import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { Metadata } from 'next';
import { feedAlternates } from '@/lib/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: {
    template: `%s | ${site.name}`,
    default: site.title,
  },
  description: site.description,
  metadataBase: new URL(site.url),
  applicationName: site.name,
  authors: [{ name: site.author.name, url: site.author.url }],
  creator: site.author.name,
  alternates: {
    types: feedAlternates,
  },
  openGraph: {
    title: site.title,
    description:
      'Panes, tiling and nine workspaces inside the terminal you already use, with sessions that keep running when you detach.',
    url: '/',
    siteName: site.name,
    type: 'website',
    images: site.image,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description:
      'Panes, tiling and nine workspaces inside the terminal you already use, with sessions that keep running when you detach.',
    images: site.image,
  },
  icons: {
    icon: '/tuios-icon.png',
    apple: '/tuios-icon.png',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          search={{
            options: {
              type: 'static',
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
