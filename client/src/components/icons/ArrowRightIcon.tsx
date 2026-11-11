import { IconBase, type IconProps } from '@/components/icons/IconBase';

export const ArrowRightIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d='M4 12h16' />
    <path d='M14 6l6 6-6 6' />
  </IconBase>
);
