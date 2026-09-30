import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Корабель на хвилях, вигляд збоку
export const NavalIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d='M3 15h18l-2.5 4h-13z' />
    <path d='M7.5 15v-3h7v3M9.5 12V9.5h3V12M11 9.5V6' />
    <path d='M2 21.5c1.25 0 1.25-1 2.5-1s1.25 1 2.5 1 1.25-1 2.5-1 1.25 1 2.5 1 1.25-1 2.5-1 1.25 1 2.5 1 1.25-1 2.5-1 1.25 1 2.5 1' />
  </IconBase>
);
