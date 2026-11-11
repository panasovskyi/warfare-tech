type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

// Посилання на інший сайт у тексті: відкривається в новій вкладці. Про нову вкладку
// скрінрідер дізнається з прихованого тексту (aria-label тут не годиться: він замінив би
// видимий текст посилання). Вигляд задає батько, як для будь-якого посилання в тексті
export const ExternalLink: React.FC<Props> = ({
  href,
  children,
  className,
}) => (
  <a
    href={href}
    className={className}
    target='_blank'
    rel='noopener noreferrer'
  >
    {children}
    <span className='sr-only'> (opens in a new tab)</span>
  </a>
);
