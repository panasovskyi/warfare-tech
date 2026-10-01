import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Танк, вигляд збоку: гусениця з котками, корпус, башта з люком і гармата
export const LandIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <rect x='2' y='14.5' width='20' height='6' rx='3' />
    <circle cx='6.5' cy='17.5' r='1.1' />
    <circle cx='12' cy='17.5' r='1.1' />
    <circle cx='17.5' cy='17.5' r='1.1' />
    <path d='M4 14.5 5.5 11h13l1.5 3.5' />
    <path d='M8 11V9.5A1.5 1.5 0 0 1 9.5 8h5A1.5 1.5 0 0 1 16 9.5V11' />
    <path d='M16 9.5h6M11 8V6.5h2V8' />
  </IconBase>
);
