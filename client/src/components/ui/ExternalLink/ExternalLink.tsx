type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

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
