import styles from './Avatar.module.scss';
import { getInitials } from '@/lib/text';

type Props = {
  // Повне ім'я: з нього рахуються ініціали
  name: string;
  size?: 's' | 'm' | 'l';
  // Клас від батька — наприклад, інше тло на панелі
  className?: string;
};

// Коло з ініціалами. Декоративне (aria-hidden): ім'я завжди стоїть поруч,
// тож скрінрідеру ініціали нічого не додають. Згодом тут же — фото автора
// з ініціалами як запасним варіантом
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
