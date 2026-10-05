import type { IconProps } from '@/components/icons/IconBase';
import { UkraineFlagIcon } from '@/components/icons/UkraineFlagIcon';
import {
  SECTION_ICONS,
  type SubcategoryKey,
} from '@/features/article/article.constants';

type Props = IconProps & {
  section: string;
};

export const SectionIcon: React.FC<Props> = ({ section, ...iconProps }) => {
  if (section === 'ukraine') return <UkraineFlagIcon {...iconProps} />;

  if (section in SECTION_ICONS) {
    const Icon = SECTION_ICONS[section as SubcategoryKey];

    return <Icon {...iconProps} />;
  }

  return null;
};
