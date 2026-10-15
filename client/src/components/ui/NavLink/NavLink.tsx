'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  href: string;
  children: React.ReactNode;
  // Вигляд задає батько, в тому числі активного пункту — за [aria-current='page']
  className?: string;
};

// Посилання меню, що знає, чи веде воно на поточну сторінку: ставить aria-current='page'
// (його читає скрінрідер, за ним же стилі підсвічують пункт). Збіг лише повний, бо "/news"
// ("All") не має світитись на "/news/air". Клієнтський компонент, бо адресу читає
// usePathname; він рендериться в HTML на сервері, а при переході між сторінками
// перемальовується в браузері без повторного завантаження
export const NavLink: React.FC<Props> = ({ href, children, className }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const linkRef = useRef<HTMLAnchorElement>(null);

  // На вузькому екрані меню прокручується вбік, і активний пункт може лежати за краєм.
  // Прокручуємо лише найближчий nav (його scrollLeft), а не scrollIntoView: той міг би ще й
  // посунути саму сторінку вгору, якщо меню зараз поза екраном (наприклад, після "Назад")
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
