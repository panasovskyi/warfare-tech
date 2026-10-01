import { formatRelativeTime } from '@/lib/date';

type Props = {
  // Дата у форматі ISO, як приходить з API
  dateTime: string;
  className?: string;
};

// Відносний час ("3 hours ago") у <time> з машинною датою в dateTime.
// Рахується на сервері, тож застаріває разом із кешем сторінки (revalidate).
// Для новин прийнятно; якщо стане ні — робити клієнтський компонент тут,
// решта коду не зміниться
export const RelativeTime: React.FC<Props> = ({ dateTime, className }) => (
  <time dateTime={dateTime} className={className}>
    {formatRelativeTime(dateTime)}
  </time>
);
