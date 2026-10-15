import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Сонце: перемикач теми показує його в темній темі (дія — увімкнути світлу)
export const SunIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <circle cx='12' cy='12' r='4.25' />
    <path d='M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2' />
    <path d='M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4' />
  </IconBase>
);
