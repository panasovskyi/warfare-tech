import { isPlaceholderPicture } from './article/article';
import { validateArticle } from './article/article.schema';
import { getPublishingConfig } from './config/publishing.config';
import { markPublished, moveToPublished, readDraft } from './drafts/draft-file';
import { findCyrillicFields } from './drafts/draft-file.schema';
import { PUBLISHED_DIR, resolveDraftPath } from './drafts/drafts';
import { mainDraftOf } from './drafts/find-drafts';
import { login } from './publishing/auth';
import { confirm } from './publishing/confirm';
import {
  findPublishedBySourceLink,
  type PublishedMatch,
} from './publishing/duplicates';
import { publishArticle } from './publishing/publishing';

const main = async () => {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isForced = args.includes('--force');
  const [draftArg] = args.filter((arg) => !arg.startsWith('--'));

  if (!draftArg) {
    throw new Error(
      'Usage: npm run pub -- <draft: 1, 1.md or a path> [--dry-run] [--force]',
    );
  }

  const draftPath = resolveDraftPath(draftArg);

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

  let pictureWarning: string | null = null;

  if (isPlaceholderPicture(article.mainPicture)) {
    pictureWarning = 'the article has no photo: the placeholder will be shown';
  } else if (article.photoCredit) {
    console.log(`Photo credit: ${article.photoCredit}`);
  } else {
    pictureWarning =
      'the main picture has no photoCredit: fill the line in the draft, unless the picture is your own';
  }

  if (pictureWarning) {
    console.warn(`WARNING: ${pictureWarning}`);
  }

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

  if (pictureWarning && !(await confirm('Publish anyway?'))) {
    console.log('Not published');

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

    return;
  }

  try {
    await moveToPublished(draftPath);

    console.log(`Draft moved to ${PUBLISHED_DIR}`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);

    console.warn(
      `WARNING: the article is live and the file is marked, but it could not be moved to ${PUBLISHED_DIR} (${reason}): move it by hand`,
    );
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
