import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Супутник із сонячними панелями і сигналом, нахилений на 45°
export const SpaceIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g transform='rotate(45 12 12)'>
      <rect x='9.5' y='10' width='5' height='5' rx='1' />
      <rect x='2.5' y='10.5' width='5' height='4' rx='0.5' />
      <rect x='16.5' y='10.5' width='5' height='4' rx='0.5' />
      <path d='M7.5 12.5h2M14.5 12.5h2M12 10V7.5' />
      <path d='M10 5.5a3 3 0 0 1 4 0M8.5 3.5a5 5 0 0 1 7 0' />
    </g>
  </IconBase>
);
