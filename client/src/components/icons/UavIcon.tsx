import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Дрон, вигляд спереду: пропелери, стійки моторів, корпус з камерою, шасі.
// Не згори: чотири кола навколо квадрата читаються як символ ⌘
export const UavIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d='M2.5 4.5h7M14.5 4.5h7M6 4.5V7M18 4.5V7M6 7l3 2.5M18 7l-3 2.5' />
    <rect x='8.5' y='8.5' width='7' height='6.5' rx='2' />
    <circle cx='12' cy='11.75' r='1.25' />
    <path d='M10 15l-1.5 4.5M14 15l1.5 4.5M6.5 19.5H10M14 19.5h3.5' />
  </IconBase>
);
