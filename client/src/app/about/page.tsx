import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from '@/components/ui/ExternalLink/ExternalLink';
import { TextPage } from '@/components/ui/TextPage/TextPage';
import { GITHUB_REPO_URL } from '@/lib/links';

const DESCRIPTION =
  'Warfare Tech is a military technology news site built by one developer as a portfolio project. It is not a newsroom, and this page explains how the articles are made.';

export const metadata: Metadata = {
  title: 'About',
  description: DESCRIPTION,
};

export default function AboutPage() {
  return (
    <TextPage title='About Warfare Tech' lead={DESCRIPTION}>
      <section aria-labelledby='about-site'>
        <h2 id='about-site'>What this site is</h2>
        <p>
          Warfare Tech covers military technology: air, land, naval, space,
          cyber and unmanned systems, plus the war in Ukraine. It is a
          non-commercial project with no advertising, no paywall and no
          editorial staff. Its purpose is to show a complete news product, from
          the API and the website to the pipeline that prepares the articles.
        </p>
      </section>

      <section aria-labelledby='about-articles'>
        <h2 id='about-articles'>How the articles are written</h2>
        <p>
          The articles are not original reporting. Each one is a rewrite of a
          single story published by a defense news outlet, a manufacturer or a
          government agency. The sources come from a short fixed list, and the
          steps are always the same:
        </p>
        <ol>
          <li>A source story is chosen by hand.</li>
          <li>
            An AI model (Claude by Anthropic) rewrites it in English as a short
            news piece. Its instructions are to use only the facts in the
            source, to keep names and numbers unchanged and to put everything in
            its own words.
          </li>
          <li>
            Automated checks compare the draft with the source and mark passages
            that repeat its wording.
          </li>
          <li>
            A person reads and edits every draft before it goes live. Nothing is
            published automatically.
          </li>
        </ol>
        <p>
          Every article names its source and links to the original at the bottom
          of the page. The byline “WT Editorial Team” stands for this process,
          not for a team of reporters. The reporting belongs to the sources, so
          for the full story follow the link to the original.
        </p>
      </section>

      <section aria-labelledby='about-photos'>
        <h2 id='about-photos'>Photos</h2>
        <p>
          Photos are chosen by hand, mostly from official and press sources:
          U.S. military imagery, armed forces and defense ministries, and
          manufacturers’ press materials. Each photo is credited on the article
          page. The section covers are U.S. military photos from DVIDS.
        </p>
      </section>

      <section aria-labelledby='about-stack'>
        <h2 id='about-stack'>How it is built</h2>
        <p>The project has three parts, all written in TypeScript:</p>
        <ul>
          <li>
            <strong>Website.</strong> Next.js with server components and
            incremental static regeneration.
          </li>
          <li>
            <strong>API.</strong> NestJS with Prisma and PostgreSQL.
          </li>
          <li>
            <strong>Ingestion.</strong> A command-line tool that fetches a
            source story, rewrites it through the Claude API, runs the checks
            and saves a Markdown draft for review.
          </li>
        </ul>
        <p>
          The source code is in the{' '}
          <ExternalLink href={GITHUB_REPO_URL}>
            project repository on GitHub
          </ExternalLink>
          .
        </p>
      </section>

      <section aria-labelledby='about-corrections'>
        <h2 id='about-corrections'>Corrections and removal requests</h2>
        <p>
          If you spot a mistake, or you represent a source or a rights holder
          and want an article or a photo changed or removed, see the{' '}
          <Link href='/contact'>Contact page</Link>.
        </p>
      </section>
    </TextPage>
  );
}
