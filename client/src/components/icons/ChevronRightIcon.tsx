import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Шеврон для пагінації. Ліворуч — та сама іконка, віддзеркалена в CSS: transform: scaleX(-1)
export const ChevronRightIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d='M9 6l6 6-6 6' />
  </IconBase>
);
