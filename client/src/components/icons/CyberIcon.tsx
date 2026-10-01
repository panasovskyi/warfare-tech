import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Мікросхема: корпус, кристал, по три виводи з кожного боку
export const CyberIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <rect x='6' y='6' width='12' height='12' rx='2' />
    <rect x='9.5' y='9.5' width='5' height='5' rx='1' />
    <path d='M9 2.5V6M12 2.5V6M15 2.5V6M9 18v3.5M12 18v3.5M15 18v3.5M2.5 9H6M2.5 12H6M2.5 15H6M18 9h3.5M18 12h3.5M18 15h3.5' />
  </IconBase>
);
