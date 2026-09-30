import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Танк, вигляд збоку
export const LandIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <rect x='2.5' y='14.5' width='19' height='5.5' rx='2.75' />
    <circle cx='7' cy='17.25' r='1' />
    <circle cx='12' cy='17.25' r='1' />
    <circle cx='17' cy='17.25' r='1' />
    <path d='M4.5 14.5 6 11.5h12l1.5 3' />
    <path d='M8.5 11.5v-2A1.5 1.5 0 0 1 10 8h4a1.5 1.5 0 0 1 1.5 1.5v2' />
    <path d='M15.5 9.5h6' />
  </IconBase>
);
