import { isPlaceholderPicture } from './article/article';
import { validateArticle } from './article/article.schema';
import { getPublishingConfig } from './config/publishing.config';
import { markPublished, readDraft } from './drafts/draft-file';
import { findCyrillicFields } from './drafts/draft-file.schema';
import { mainDraftOf } from './drafts/find-drafts';
import { login } from './publishing/auth';
import {
  findPublishedBySourceLink,
  type PublishedMatch,
} from './publishing/duplicates';
import { publishArticle } from './publishing/publishing';

const main = async () => {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isForced = args.includes('--force');
  const [draftPath] = args.filter((arg) => !arg.startsWith('--'));

  if (!draftPath) {
    throw new Error(
      'Usage: npm run publish-draft -- <path to a draft .md> [--dry-run] [--force]',
    );
  }

  // The copies next to a draft look like drafts but are not: publishing one would put an old text on the site
  const mainDraft = mainDraftOf(draftPath);

  if (mainDraft) {
    throw new Error(
      `${draftPath} is a copy kept next to a draft (the Ukrainian version or the text before a translation), not a draft itself. Publish ${mainDraft} instead`,
    );
  }

  const { article, publishedAs } = await readDraft(draftPath);

  if (publishedAs) {
    throw new Error(
      `This draft is already published as "${publishedAs}". Delete its publishedAs and publishedOn lines to publish it again on purpose`,
    );
  }

  // The file was edited by hand, so the rules run again here, before anything is sent
  const problems = [
    ...findCyrillicFields(article).map(
      (field) => `${field}: contains Cyrillic text, translate it to English first`,
    ),
    ...validateArticle(article),
  ];

  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`PROBLEM: ${problem}`);
    }

    throw new Error(`Not published: ${problems.length} problem(s) to fix in the file`);
  }

  const section = article.isWarInUkraine ? 'War in Ukraine' : article.subcategory;

  console.log(
    `Ready: "${article.title}" | ${section} | ${article.tags.length} tags | body ${article.body.length} chars`,
  );

  // Not blocking: a picture of our own may need no credit, but it is easy to forget one
  if (article.photoCredit) {
    console.log(`Photo credit: ${article.photoCredit}`);
  } else if (!isPlaceholderPicture(article.mainPicture)) {
    console.warn(
      'WARNING: the main picture has no photoCredit: fill the line in the draft, unless the picture is your own',
    );
  }

  // Another draft of the same article may already be live: the site is the judge
  let duplicate: PublishedMatch | null = null;

  if (!isForced) {
    try {
      duplicate = await findPublishedBySourceLink(
        getPublishingConfig(),
        article.sourceLink,
      );
    } catch (error) {
      if (!isDryRun) {
        throw error;
      }

      const reason = error instanceof Error ? error.message : String(error);

      console.warn(`WARNING: the duplicate check was skipped: ${reason}`);
    }
  }

  if (duplicate) {
    throw new Error(
      `This article is already on the site: ${duplicate.slug} ("${duplicate.title}"). Add --force to publish it anyway`,
    );
  }

  if (isDryRun) {
    console.log('Dry run: nothing was sent');

    return;
  }

  const publishing = getPublishingConfig();
  const token = await login(publishing);
  const published = await publishArticle(publishing, token, article);

  console.log(`Published: ${published.slug}`);

  try {
    await markPublished(draftPath, published.slug);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);

    console.warn(
      `WARNING: the article is live as "${published.slug}", but the file could not be marked (${reason}). Add publishedAs: "${published.slug}" to it by hand, or it can be published twice`,
    );
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
