import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Місяць: перемикач теми показує його у світлій темі (дія — увімкнути темну)
export const MoonIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d='M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2z' />
  </IconBase>
);
