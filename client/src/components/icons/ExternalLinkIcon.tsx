import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Посилання на сторонній ресурс: стрілка виходить із рамки. Для джерела статті
export const ExternalLinkIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d='M14 4h6v6M20 4l-9 9' />
    <path d='M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10' />
  </IconBase>
);
