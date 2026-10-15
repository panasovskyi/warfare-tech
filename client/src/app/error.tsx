'use client';
import { PageMessage } from '@/components/ui/PageMessage/PageMessage';

type Props = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function RootError({ retry }: Props) {
  return (
    <PageMessage
      title='Something went wrong'
      description='We could not load this page. This is usually temporary, so please try again.'
      primaryAction={{ label: 'Try again', onClick: () => retry() }}
    />
  );
}
