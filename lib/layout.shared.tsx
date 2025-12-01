import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <img src="/tuios-icon.png" alt="TUIOS" width={24} height={24} />
          <span className="font-semibold">TUIOS</span>
        </>
      ),
    },
    githubUrl: 'https://github.com/Gaurav-Gosain/tuios',
    links: [
      {
        text: 'Documentation',
        url: '/docs',
        active: 'nested-url',
      },
    ],
  };
}
