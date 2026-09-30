import Link from 'next/link';
import styles from './Footer.module.scss';
import { Logo } from '@/components/layout/Logo/Logo';

// TODO: список розділів той самий, що в Header — брати з мапи розділів (article.constants),
// коли вона повернеться
const FOOTER_NAV = [
  {
    section: 'Sections',
    items: [
      { id: 1, label: 'Air', link: '/news/air', external: false },
      { id: 2, label: 'Land', link: '/news/land', external: false },
      { id: 3, label: 'Naval', link: '/news/naval', external: false },
      { id: 4, label: 'Space', link: '/news/space', external: false },
      { id: 5, label: 'Cyber', link: '/news/cyber', external: false },
      { id: 6, label: 'UAV', link: '/news/uav', external: false },
    ],
  },

  {
    section: 'Company',
    items: [
      { id: 1, label: 'about', link: '/', external: false },
      { id: 2, label: 'advertise', link: '/', external: false },
      { id: 3, label: 'contact', link: '/', external: false },
      { id: 4, label: 'careers', link: '/', external: false },
    ],
  },

  // TODO: соцмережі — не навігація сайту, їх варто винести з nav в окремий список.
  // Для target="_blank" — rel="noopener noreferrer". У зовнішніх <a> немає класу nav__link,
  // тож їхні стилі розійдуться з внутрішніми посиланнями
  {
    section: 'Socials',
    items: [
      { id: 1, label: 'Twitter', link: '/', external: true },
      { id: 2, label: 'Facebook', link: '/', external: true },
      { id: 3, label: 'YouTube', link: '/', external: true },
      { id: 4, label: 'Telegram', link: '/', external: true },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footer__container}`}>
        <div className={styles.footer__info}>
          <Link href='/' className={styles.logotype}>
            <Logo />
          </Link>
          <p className={styles.footer__description}>
            Independent coverage of defense technology and security.
          </p>
        </div>

        <nav className={styles.nav} aria-label='Footer'>
          {FOOTER_NAV.map(({ section, items }) => (
            <div key={section} className={styles.nav__section}>
              <h2 className={styles.nav__sectionTitle}>{section}</h2>
              <ul className={styles.nav__list}>
                {items.map((item) => (
                  <li key={item.id} className={styles.nav__item}>
                    {/** потім буде  a target blank */}
                    {item.external ? (
                      <a href={item.link}>{item.label}</a>
                    ) : (
                      <Link href={item.link} className={styles.nav__link}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p className={styles.footer__rights}>
          © {new Date().getFullYear()} Warfare Tech. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
