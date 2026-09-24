import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BrandLockup } from '@/components/brand';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <BrandLockup size={26} />,
    },
    githubUrl: 'https://github.com/Gaurav-Gosain/tuios',
    links: [
      {
        text: 'Documentation',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'Learn',
        url: '/learn',
        active: 'nested-url',
      },
      {
        text: 'Blog',
        url: '/blog',
        active: 'nested-url',
      },
      {
        text: 'Releases',
        url: '/releases',
        active: 'nested-url',
      },
    ],
  };
}
