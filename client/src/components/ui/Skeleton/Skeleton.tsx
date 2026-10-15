import styles from './Skeleton.module.scss';

type Props = {
  // Форма й розмір із готового набору: пропорції й токени ті самі, що в справжніх карток
  variant:
    | 'heading'
    | 'title'
    | 'line'
    | 'lineShort'
    | 'photo'
    | 'thumb'
    | 'chip'
    | 'block';
  // Лише для розташування від батька (ширина, відступ)
  className?: string;
};

// Сірий блок на місці вмісту, що ще вантажиться (loading.tsx). Декоративний, тож aria-hidden
export const Skeleton: React.FC<Props> = ({ variant, className }) => {
  const classes = [styles.skeleton, styles[`skeleton--${variant}`], className]
    .filter(Boolean)
    .join(' ');

  return <div aria-hidden='true' className={classes} />;
};
