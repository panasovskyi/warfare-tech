import type { Metadata } from 'next';
import { PageMessage } from '@/components/ui/PageMessage/PageMessage';

export const metadata: Metadata = {
  title: 'Contact',
  robots: { index: false },
};

export default function ContactPage() {
  return (
    <PageMessage
      title='Contact page is under development'
      description='We are still working on this page. Please check back soon.'
      primaryAction={{ label: 'Back to the homepage', href: '/' }}
      secondaryAction={{ label: 'Browse all news', href: '/news' }}
    />
  );
}
