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

type NewsSection = {
  label: string;
  filter: Pick<GetArticlesParams, 'subcategory' | 'isWarInUkraine'>;
};

export const NEWS_SECTIONS = {
  air: { label: 'Air', filter: { subcategory: ArticleSubcategory.AIR } },
  land: { label: 'Land', filter: { subcategory: ArticleSubcategory.LAND } },
  naval: { label: 'Naval', filter: { subcategory: ArticleSubcategory.NAVAL } },
  space: { label: 'Space', filter: { subcategory: ArticleSubcategory.SPACE } },
  cyber: { label: 'Cyber', filter: { subcategory: ArticleSubcategory.CYBER } },
  uav: { label: 'UAV', filter: { subcategory: ArticleSubcategory.UAV } },
  ukraine: { label: 'War in Ukraine', filter: { isWarInUkraine: true } },
} as const satisfies Record<string, NewsSection>;

export type NewsSectionKey = keyof typeof NEWS_SECTIONS;

export type SubcategoryKey = Exclude<NewsSectionKey, 'ukraine'>;

export const SECTION_ICONS = {
  air: AirIcon,
  land: LandIcon,
  naval: NavalIcon,
  space: SpaceIcon,
  cyber: CyberIcon,
  uav: UavIcon,
} satisfies Record<SubcategoryKey, React.FC<IconProps>>;