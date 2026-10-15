import type { Metadata } from 'next';
import { PageMessage } from '@/components/ui/PageMessage/PageMessage';

export const metadata: Metadata = {
  title: 'About',
  robots: { index: false },
};

export default function AboutPage() {
  return (
    <PageMessage
      title='About page is under development'
      description='We are still working on this page. Please check back soon.'
      primaryAction={{ label: 'Back to the homepage', href: '/' }}
      secondaryAction={{ label: 'Browse all news', href: '/news' }}
    />
  );
}
