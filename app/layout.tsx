import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | TUIOS',
    default: 'TUIOS: a window manager for your terminal',
  },
  description:
    'TUIOS is a terminal window manager with vim-style keys, tiling, nine workspaces, and sessions that keep running when you detach.',
  metadataBase: new URL('https://tuios.gaurav.zip'),
  openGraph: {
    title: 'TUIOS: a window manager for your terminal',
    description:
      'Panes, tiling and nine workspaces inside the terminal you already use, with sessions that keep running when you detach.',
    url: 'https://tuios.gaurav.zip',
    siteName: 'TUIOS',
    type: 'website',
    images: '/og/site/image.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TUIOS: a window manager for your terminal',
    description:
      'Panes, tiling and nine workspaces inside the terminal you already use, with sessions that keep running when you detach.',
    images: '/og/site/image.png',
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
