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
    // Стрій F-35C, двох F/A-18E/F і B-2 по діагоналі: 80% по вертикалі тримає F-35 над рядками
    // опису (нижче він лягав би під них), а B-2 зверху цілим
    // Автор: https://www.dvidshub.net/portfolio/1727009/katie-archibald
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
    // Авіаносець у правій половині кадру, зліва спокійне море під текст. 60% по вертикалі
    // тримає щоглу острова цілою (з нижчим значенням її верх обрізало б)
    // Автор: https://www.dvidshub.net/portfolio/1945483/michael-shen
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
    // Ракета по центру фото, а не праворуч: фото займає праву частину обкладинки, тож вона
    // лягає на середину справа від тексту, а розмиті пальми обрамляють кадр. Тому 50% по
    // горизонталі (для вузьких екранів): предмет по центру знімка
    // Автор: https://www.dvidshub.net/portfolio/1773942/alyssa-bankston
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
    // Центр кібероперацій: відеостіна з зеленими графами. Сцена широка, предмета в профіль нема,
    // тож 50% по горизонталі; 39% по вертикалі лишає екрани цілими і обрізає вивіску й годинник
    // над ними. На екранах видно логотип і дрібний текст, обличчя впізнаване слабко (профіль)
    // Автор: https://www.dvidshub.net/portfolio/1077261/jacob-osborne
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
    // Дрон-розвідник у крені по центру знімка, тож по горизонталі 50% (для вузьких екранів), а
    // 43% по вертикалі вміщує обидва кінці крил (з більшим значенням верхній обрізало б)
    // Автор: https://www.dvidshub.net/portfolio/1680226/bryce-bennett
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
    // Колона Abrams, головний танк справа (70% по горизонталі тримає його на вузьких екранах), зліва
    // темні сосни під текст. Це НЕ бойовий кадр: схоже на навчальну базу в Німеччині, тож у
    // підписі нічого про фронт (перевір підпис на сторінці фото в DVIDS)
    cover: {
      src: '/covers/ukraine.jpg',
      position: '70% 66%',
      credit: 'Spc. Christian Carrillo / DVIDS',
    },
    filter: { isWarInUkraine: true },
  },
} as const satisfies Record<string, NewsSection>;

// Обкладинка сторінки /news (усі новини), поза розділами. Тип той самий, що в розділів
// Батарея Patriot, пуск у пустелі: техніка в правій частині кадру, зліва порожня пустеля під
// текст. 80% по горизонталі тримає батарею на вузьких екранах, 25% по вертикалі лишає ракету
// з димовим слідом і пускові установки, обрізаючи низ порожнього піску
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