import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Літак, вигляд згори
export const AirIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d='M12 2.5c.9 0 1.5.9 1.5 2v5l7 4v1.8l-7-2V18l2.2 1.6V21L12 20l-3.7 1v-1.4l2.2-1.6v-4.7l-7 2v-1.8l7-4v-5c0-1.1.6-2 1.5-2z' />
  </IconBase>
);
