import styles from './Avatar.module.scss';
import { getInitials } from '@/lib/text';

type Props = {
  name: string;
  size?: 's' | 'm' | 'l' | 'xl';
  className?: string;
};

export const Avatar: React.FC<Props> = ({ name, size = 'm', className }) => {
  const classes = [styles.avatar, styles[`avatar--${size}`], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} aria-hidden='true'>
      {getInitials(name)}
    </div>
  );
};
