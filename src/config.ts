import type { Site, SocialObjects } from './types';

export const SITE: Site = {
  website: 'https://blog-swiswi.vercel.app/', // replace this with your deployed domain
  author: 'swi',
  profile: '',
  desc: '',
  title: 'Swi',
  lightAndDarkMode: true,
  postPerIndex: 5,
  postPerPage: 8,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  editPost: {
    url: 'https://github.com/devswi/blog/tree/main/src/content/blog',
    text: 'Suggest Changes',
    appendFilePath: true,
  },
};

export const LOCALE = {
  lang: 'en', // html lang code. Set this empty and default will be "en"
  langTag: ['en-EN'], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: 'Github',
    href: 'https://github.com/devswi',
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: 'X',
    href: 'https://x.com/swmagicswift',
    linkTitle: `${SITE.title} on X`,
    active: true,
  },
  {
    name: 'Mail',
    href: 'mailto:stayfocusjs@gmail.com',
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
  {
    name: 'YouTube',
    href: 'https://github.com/satnaing/astro-paper',
    linkTitle: `${SITE.title} on YouTube`,
    active: false,
  },
  {
    name: 'TikTok',
    href: 'https://github.com/satnaing/astro-paper',
    linkTitle: `${SITE.title} on TikTok`,
    active: false,
  },
  {
    name: 'CodePen',
    href: 'https://github.com/satnaing/astro-paper',
    linkTitle: `${SITE.title} on CodePen`,
    active: false,
  },
  {
    name: 'Discord',
    href: 'https://github.com/satnaing/astro-paper',
    linkTitle: `${SITE.title} on Discord`,
    active: false,
  },
  {
    name: 'GitLab',
    href: 'https://github.com/satnaing/astro-paper',
    linkTitle: `${SITE.title} on GitLab`,
    active: false,
  },
  {
    name: 'Reddit',
    href: 'https://github.com/satnaing/astro-paper',
    linkTitle: `${SITE.title} on Reddit`,
    active: false,
  },
  {
    name: 'Skype',
    href: 'https://github.com/satnaing/astro-paper',
    linkTitle: `${SITE.title} on Skype`,
    active: false,
  },
  {
    name: 'Steam',
    href: 'https://github.com/satnaing/astro-paper',
    linkTitle: `${SITE.title} on Steam`,
    active: false,
  },
  {
    name: 'Telegram',
    href: 'https://github.com/satnaing/astro-paper',
    linkTitle: `${SITE.title} on Telegram`,
    active: false,
  },
  {
    name: 'Mastodon',
    href: 'https://github.com/satnaing/astro-paper',
    linkTitle: `${SITE.title} on Mastodon`,
    active: false,
  },
];
