import type { Metadata } from 'next';
import { PageMessage } from '@/components/ui/PageMessage/PageMessage';

export const metadata: Metadata = {
  title: 'Advertise',
  robots: { index: false },
};

export default function AdvertisePage() {
  return (
    <PageMessage
      title='Advertise page is under development'
      description='We are still working on this page. Please check back soon.'
      primaryAction={{ label: 'Back to the homepage', href: '/' }}
      secondaryAction={{ label: 'Browse all news', href: '/news' }}
    />
  );
}
