import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Корабель на хвилях, вигляд збоку: корпус, дві надбудови, щогла з вимпелом.
// Вимпел — в один бік: щогла з поперечкою читалася б як хрест
export const NavalIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d='M2 14.5h20l-2.5 4.5h-15z' />
    <path d='M6.5 14.5v-3h9v3M9 11.5v-3h4.5v3M11.25 8.5V3.5M11.25 4.25h2.5' />
    <path d='M2 21.75c1.25 0 1.25-1 2.5-1s1.25 1 2.5 1 1.25-1 2.5-1 1.25 1 2.5 1 1.25-1 2.5-1 1.25 1 2.5 1 1.25-1 2.5-1 1.25 1 2.5 1' />
  </IconBase>
);
