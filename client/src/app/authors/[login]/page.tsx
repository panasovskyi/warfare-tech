import type { Metadata } from 'next';
import { PageMessage } from '@/components/ui/PageMessage/PageMessage';

export const metadata: Metadata = {
  title: 'Author page',
  robots: { index: false },
};

export default function AuthorPage() {
  return (
    <PageMessage
      title='Author page is under development'
      description='We are still working on author profiles. Please check back soon.'
      primaryAction={{ label: 'Back to the homepage', href: '/' }}
      secondaryAction={{ label: 'Browse all news', href: '/news' }}
    />
  );
}
