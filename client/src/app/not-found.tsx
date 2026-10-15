import type { Metadata } from 'next';
import { PageMessage } from '@/components/ui/PageMessage/PageMessage';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <PageMessage
      title='Page not found'
      description='The page you are looking for does not exist or has been moved.'
      primaryAction={{ label: 'Back to the homepage', href: '/' }}
      secondaryAction={{ label: 'Browse all news', href: '/news' }}
    />
  );
}
