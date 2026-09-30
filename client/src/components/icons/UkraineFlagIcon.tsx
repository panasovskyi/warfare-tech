import { IconBase, type IconProps } from '@/components/icons/IconBase';

// Прапор має власні кольори (однакові в обох темах), тому без currentColor і контуру.
// Пропорції 3:2 — ширина 1.5em при висоті 1em
export const UkraineFlagIcon: React.FC<IconProps> = (props) => (
  <IconBase viewBox='0 0 24 16' width='1.5em' stroke='none' {...props}>
    <path d='M2 0h20a2 2 0 0 1 2 2v6H0V2a2 2 0 0 1 2-2z' fill='#0057b7' />
    <path d='M0 8h24v6a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z' fill='#ffd700' />
  </IconBase>
);
