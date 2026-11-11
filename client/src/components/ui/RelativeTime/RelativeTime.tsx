import { formatRelativeTime } from '@/lib/date';

type Props = {
  dateTime: string;
  className?: string;
};

export const RelativeTime: React.FC<Props> = ({ dateTime, className }) => {
  const text = formatRelativeTime(dateTime);

  if (!text) return null;

  return (
    <time dateTime={dateTime} className={className}>
      {text}
    </time>
  );
};
