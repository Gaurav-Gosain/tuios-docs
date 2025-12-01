import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | TUIOS',
    default: 'TUIOS - Terminal UI Operating System',
  },
  description: 'Terminal UI Operating System - A modern terminal-based window manager',
  metadataBase: new URL('https://tuios.gaurav.zip'),
  openGraph: {
    title: 'TUIOS - Terminal UI Operating System',
    description: 'A modern terminal-based window manager with vim-style navigation, 9 workspaces, and automatic tiling',
    url: 'https://tuios.gaurav.zip',
    siteName: 'TUIOS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TUIOS - Terminal UI Operating System',
    description: 'A modern terminal-based window manager with vim-style navigation, 9 workspaces, and automatic tiling',
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
