import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from '@/components/ui/ExternalLink/ExternalLink';
import { TextPage } from '@/components/ui/TextPage/TextPage';
import {
  GITHUB_ISSUES_URL,
  GITHUB_PROFILE_URL,
  GITHUB_REPO_URL,
} from '@/lib/links';

const DESCRIPTION =
  'Warfare Tech is a one-person portfolio project, so there is no newsroom inbox. The way to reach its developer is GitHub.';

export const metadata: Metadata = {
  title: 'Contact',
  description: DESCRIPTION,
};

export default function ContactPage() {
  return (
    <TextPage title='Contact' lead={DESCRIPTION}>
      <section aria-labelledby='contact-corrections'>
        <h2 id='contact-corrections'>Corrections and removal requests</h2>
        <p>
          If you spot a factual error, or you represent a publication or a
          rights holder and want an article or a photo changed or removed,{' '}
          <ExternalLink href={GITHUB_ISSUES_URL}>
            open an issue in the project repository
          </ExternalLink>{' '}
          and include a link to the page in question.
        </p>
      </section>

      <section aria-labelledby='contact-project'>
        <h2 id='contact-project'>The project</h2>
        <ul>
          <li>
            Source code:{' '}
            <ExternalLink href={GITHUB_REPO_URL}>
              github.com/panasovskyi/warfare-tech
            </ExternalLink>
          </li>
          <li>
            Developer:{' '}
            <ExternalLink href={GITHUB_PROFILE_URL}>
              github.com/panasovskyi
            </ExternalLink>
          </li>
          <li>
            How the site works: <Link href='/about'>About Warfare Tech</Link>
          </li>
        </ul>
      </section>
    </TextPage>
  );
}
