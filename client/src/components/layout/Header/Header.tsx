import Link from 'next/link';
import styles from './Header.module.scss';
import { Logo } from '@/components/layout/Logo/Logo';

// тут можна робити всі букви великими
// TODO: пункти брати з NEWS_SECTIONS (article.constants) — мапа вже є: навігація,
// футер і сторінки /news/[section] з одного джерела
const HEADER_NAV = [
  {id: 1, label: 'Air', link: '/news/air'},
  {id: 2, label: 'Land', link: '/news/land'},
  {id: 3, label: 'Naval', link: '/news/naval'},
  {id: 4, label: 'Space', link: '/news/space'},
  {id: 5, label: 'Cyber', link: '/news/cyber'},
  {id: 6, label: 'UAV', link: '/news/uav'},
];

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.header__container}`}>
        <Link href="/" className={styles.logotype}>
          <Logo />
        </Link>

        {/*
          TODO: у меню бракує News, Ukraine і Longreads (є в макеті). Активний пункт —
          usePathname у маленькому клієнтському компоненті, на посиланні aria-current='page'.
          Кнопки Search і Subscribe — пізніше
        */}
        <nav className={styles.nav} aria-label='Main'>
          <ul className={styles.nav__list}>
            {HEADER_NAV.map(item => (
              <li key={item.id} className={styles.nav__item}>
                <Link href={item.link} className={styles.nav__link}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}