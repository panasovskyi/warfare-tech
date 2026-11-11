'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export const NavLink: React.FC<Props> = ({ href, children, className }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const link = linkRef.current;
    const nav = link?.closest('nav');

    if (!isActive || !link || !nav) return;

    const linkRect = link.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();

    nav.scrollLeft +=
      linkRect.left - navRect.left - (navRect.width - linkRect.width) / 2;
  }, [isActive]);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={className}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
};
