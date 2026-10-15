import type { Metadata } from 'next';
import { PageMessage } from '@/components/ui/PageMessage/PageMessage';

export const metadata: Metadata = {
  title: 'News page not found',
};

export default function NewsNotFound() {
  return (
    <PageMessage
      title='News page not found'
      description='We could not find this news section or page. Check the address, or head back to the full list of news.'
      primaryAction={{ label: 'Browse all news', href: '/news' }}
      secondaryAction={{ label: 'Back to the homepage', href: '/' }}
    />
  );
}
