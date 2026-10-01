import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Супутник із сонячними панелями й сигналом, нахилений на 45°
export const SpaceIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g transform='rotate(45 12 12)'>
      <rect x='9.5' y='9.5' width='5' height='5' rx='1' />
      <rect x='1.5' y='10' width='6' height='4' rx='0.5' />
      <rect x='16.5' y='10' width='6' height='4' rx='0.5' />
      <path d='M4.5 10v4M19.5 10v4M7.5 12h2M14.5 12h2M12 9.5V7' />
      <path d='M9.75 5.25a3.2 3.2 0 0 1 4.5 0M8 3.25a5.7 5.7 0 0 1 8 0' />
    </g>
  </IconBase>
);
