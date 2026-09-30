import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Дрон, вигляд спереду: пропелери, стійки моторів, корпус, шасі
export const UavIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d='M2.5 8h6M15.5 8h6' />
    <path d='M5.5 8v3.5H9M18.5 8v3.5H15' />
    <rect x='9' y='10' width='6' height='4.5' rx='1.5' />
    <path d='M10.5 14.5 9 18M13.5 14.5 15 18M7.5 18h3M13.5 18h3' />
  </IconBase>
);
