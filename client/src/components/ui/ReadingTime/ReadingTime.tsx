type Props = {
  minutes: number;
  className?: string;
};

export const ReadingTime: React.FC<Props> = ({ minutes, className }) => (
  <span className={className}>{minutes} min read</span>
);
