import {
  ArticleSubcategory,
  type GetArticlesParams,
} from '@/features/article/article.types';
import type { IconProps } from '@/components/icons/IconBase';
import { AirIcon } from '@/components/icons/AirIcon';
import { UavIcon } from '@/components/icons/UavIcon';
import { CyberIcon } from '@/components/icons/CyberIcon';
import { SpaceIcon } from '@/components/icons/SpaceIcon';
import { NavalIcon } from '@/components/icons/NavalIcon';
import { LandIcon } from '@/components/icons/LandIcon';

type NewsSectionCover = {
  src: string;
  position: string;
  credit?: string;
};

export type NewsSection = {
  label: string;
  description: string;
  cover?: NewsSectionCover;
  filter: Pick<GetArticlesParams, 'subcategory' | 'isWarInUkraine'>;
};

export const NEWS_SECTIONS = {
  air: {
    label: 'Air',
    description:
      'Fighter jets, bombers, transports and the engines, sensors and weapons that keep them flying.',
    cover: {
      src: '/covers/air.jpg',
      position: '80% 80%',
      credit: 'Katie Archibald / DVIDS',
    },
    filter: { subcategory: ArticleSubcategory.AIR },
  },
  land: {
    label: 'Land',
    description:
      'Tanks, artillery, armoured vehicles and the soldier systems that decide the ground fight.',
    cover: {
      src: '/covers/land.jpg',
      position: '80% 75%',
      credit: 'Senior Airman Beaux Hebert / DVIDS',
    },
    filter: { subcategory: ArticleSubcategory.LAND },
  },
  naval: {
    label: 'Naval',
    description:
      'Warships, submarines, naval drones and the technology shaping power at sea.',
    cover: {
      src: '/covers/naval.jpg',
      position: '80% 60%',
      credit: 'Petty Officer 2nd Class Michael Shen / DVIDS',
    },
    filter: { subcategory: ArticleSubcategory.NAVAL },
  },
  space: {
    label: 'Space',
    description:
      'Military satellites, launch systems and the race to control orbit.',
    cover: {
      src: '/covers/space.jpg',
      position: '50% 52%',
      credit: 'Senior Airman Alyssa Bankston / DVIDS',
    },
    filter: { subcategory: ArticleSubcategory.SPACE },
  },
  cyber: {
    label: 'Cyber',
    description:
      'Cyber operations, electronic warfare and the systems that defend networks and command.',
    cover: {
      src: '/covers/cyber.jpg',
      position: '50% 39%',
      credit: 'Master Sgt. Jacob Osborne / DVIDS',
    },
    filter: { subcategory: ArticleSubcategory.CYBER },
  },
  uav: {
    label: 'UAV',
    description:
      'Combat and reconnaissance drones, loitering munitions and the counter-drone systems built to stop them.',
    cover: {
      src: '/covers/uav.jpg',
      position: '50% 43%',
      credit: 'Bryce Bennett / DVIDS',
    },
    filter: { subcategory: ArticleSubcategory.UAV },
  },
  ukraine: {
    label: 'War in Ukraine',
    description:
      'Ongoing coverage of the war in Ukraine: the weapons, tactics and technology shaping the fighting.',
    cover: {
      src: '/covers/ukraine.jpg',
      position: '70% 66%',
      credit: 'Spc. Christian Carrillo / DVIDS',
    },
    filter: { isWarInUkraine: true },
  },
} as const satisfies Record<string, NewsSection>;

export const NEWS_PAGE_COVER: NonNullable<NewsSection['cover']> = {
  src: '/covers/news.jpg',
  position: '80% 25%',
  credit: 'Staff Sgt. Michael Hunnisett / DVIDS',
};

export type NewsSectionKey = keyof typeof NEWS_SECTIONS;

export const isNewsSectionKey = (value: string): value is NewsSectionKey =>
  Object.hasOwn(NEWS_SECTIONS, value);

export type SubcategoryKey = Exclude<NewsSectionKey, 'ukraine'>;

export const SECTION_ICONS = {
  air: AirIcon,
  land: LandIcon,
  naval: NavalIcon,
  space: SpaceIcon,
  cyber: CyberIcon,
  uav: UavIcon,
} satisfies Record<SubcategoryKey, React.FC<IconProps>>;