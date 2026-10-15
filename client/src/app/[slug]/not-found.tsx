import type { Metadata } from 'next';
import { PageMessage } from '@/components/ui/PageMessage/PageMessage';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function ArticleNotFound() {
  return (
    <PageMessage
      title='Page not found'
      description='We could not find this page. If you followed a link to an article, it may have been moved or removed.'
      primaryAction={{ label: 'Back to the homepage', href: '/' }}
      secondaryAction={{ label: 'Browse all news', href: '/news' }}
    />
  );
}
