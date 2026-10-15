import Link from 'next/link';
import styles from './Footer.module.scss';
import { Logo } from '@/components/layout/Logo/Logo';
import { NEWS_SECTIONS } from '@/features/article/article.constants';

const entries = Object.entries(NEWS_SECTIONS);
const items = entries.map(([key, value]) => ({
  id: key,
  label: value.label,
  link: `/news/${key}`,
}));

const FOOTER_NAV = [
  {
    section: 'Sections',
    sectionItems: items.filter(item => item.id !== 'ukraine'),
  },
  {
    section: 'Company',
    sectionItems: [
      { id: 1, label: 'About', link: '/about', },
      { id: 2, label: 'Advertise', link: '/advertise', },
      { id: 3, label: 'Contact', link: '/contact', },
      { id: 4, label: 'Careers', link: '/careers', },
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
          {FOOTER_NAV.map(({ section, sectionItems }) => (
            <div key={section} className={styles.nav__section}>
              <h2 className={styles.nav__sectionTitle}>{section}</h2>
              <ul className={styles.nav__list}>
                {sectionItems.map((item) => (
                  <li key={item.id}>
                    <Link href={item.link} className={styles.nav__link}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.footer__legal}>
          <p>© {new Date().getFullYear()} Warfare Tech. All rights reserved.</p>
          <p>
            The appearance of U.S. Department of War (DoW) visual information
            does not imply or constitute DoW endorsement.
          </p>
        </div>
      </div>
    </footer>
  );
};
