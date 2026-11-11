import styles from './Skeleton.module.scss';

type Props = {
  variant:
    | 'heading'
    | 'title'
    | 'line'
    | 'lineShort'
    | 'photo'
    | 'thumb'
    | 'chip'
    | 'block';
  className?: string;
};

export const Skeleton: React.FC<Props> = ({ variant, className }) => {
  const classes = [styles.skeleton, styles[`skeleton--${variant}`], className]
    .filter(Boolean)
    .join(' ');

  return <div aria-hidden='true' className={classes} />;
};
