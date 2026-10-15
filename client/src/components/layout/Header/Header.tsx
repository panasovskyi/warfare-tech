import Link from 'next/link';
import styles from './Header.module.scss';
import { Logo } from '@/components/layout/Logo/Logo';
import { NavLink } from '@/components/ui/NavLink/NavLink';
import { ThemeToggle } from '@/components/ui/ThemeToggle/ThemeToggle';
import { NEWS_SECTIONS } from '@/features/article/article.constants';

const entries = Object.entries(NEWS_SECTIONS);
const items = entries.map(([key, value]) => ({
  id: key,
  label: value.label,
  link: `/news/${key}`,
}));

const HEADER_NAV = [
  {
    id: 'news',
    label: 'All',
    link: '/news',
  },
  ...items,
];

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.header__container}`}>
        <Link href='/' className={styles.logotype}>
          <Logo />
        </Link>

        <nav className={styles.nav} aria-label='Main'>
          <ul className={styles.nav__list}>
            {HEADER_NAV.map((item) => (
              <li key={item.id} className={styles.nav__item}>
                <NavLink href={item.link} className={styles.nav__link}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <ThemeToggle className={styles.themeToggle} />
      </div>
    </header>
  );
};
