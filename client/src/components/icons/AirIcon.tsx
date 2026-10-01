import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Реактивний літак, вигляд згори: стрілоподібні крила, хвостове оперення
export const AirIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d='M12 2c.8 0 1.3 1.2 1.4 2.5l.2 4.5 7.4 6.5V17l-7-1.5v3l2.5 1.8V22L12 21l-4.5 1v-1.7l2.5-1.8v-3L3 17v-1.5l7.4-6.5.2-4.5C10.7 3.2 11.2 2 12 2z' />
  </IconBase>
);
