type Props = {
  // Хвилини читання, як приходять з API (ціле число, від 1)
  minutes: number;
  // Колір, розмір і положення в рядку задає батько
  className?: string;
};

// Час читання ("4 min read"). Окремо від RelativeTime: це тривалість, а не момент, тож
// без <time> з датою. "min" — скорочення, яке не змінюється за числом: без "1 mins" і без
// помилок на 11, 21 (англійською однина лише для рівно 1, а перевірка останньої цифри її
// плутає), тож множини тут не потрібні
export const ReadingTime: React.FC<Props> = ({ minutes, className }) => (
  <span className={className}>{minutes} min read</span>
);
