import styles from './Logo.module.scss';

type Props = {
  // Лише знак, без назви. Тоді в батьківського посилання має бути aria-label
  markOnly?: boolean;
};

// Логотип Warfare Tech: плитка кольору акценту з "wt" і назва поруч.
// Літери намальовані лініями, а не шрифтом: знак не залежить від завантаження Manrope,
// і той самий SVG годиться для favicon. Розмір — від font-size батька (знак 1.35em)
export const Logo: React.FC<Props> = ({ markOnly = false }) => (
  <span className={styles.logo}>
    <svg
      viewBox='0 0 32 32'
      className={styles.logo__mark}
      aria-hidden='true'
      focusable='false'
    >
      <rect width='32' height='32' rx='8' className={styles.logo__tile} />
      <path
        d='M5.5 13 8.5 23 12 16 15.5 23 18.5 13'
        className={styles.logo__letters}
      />
      <path
        d='M23 9v11.5a2.5 2.5 0 0 0 2.5 2.5H27M20.5 13H27'
        className={styles.logo__letters}
      />
    </svg>
    {!markOnly && <span className={styles.logo__name}>Warfare Tech</span>}
  </span>
);
