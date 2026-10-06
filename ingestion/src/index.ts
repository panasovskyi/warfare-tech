import { readFile } from 'node:fs/promises';
import { buildArticle, isPlaceholderPicture } from './article/article';
import { validateArticle } from './article/article.schema';
import { normalizeSourceLink } from './article/source-link';
import { getMainPicture } from './cloudinary/cloudinary';
import { getPublishingConfig } from './config/publishing.config';
import { DRAFTS_DIR, saveDraft } from './drafts/drafts';
import { findDraftsBySourceLink } from './drafts/find-drafts';
import { extractArticle } from './fetching/extract-article';
import { fetchPage } from './fetching/fetch-page';
import { findPublishedBySourceLink, type PublishedMatch } from './publishing/duplicates';
import { rewrite } from './rewriting/rewriting';
import { resolveSource } from './rewriting/sources';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const USAGE = `Usage:
  npm start -- <article url> [publication date YYYY-MM-DD] [--image=<picture url>|page] [--credit="Photo author"] [--force]
  npm start -- <article url> <path to a text file> [publication date YYYY-MM-DD] [--image=<picture url>] [--credit="Photo author"] [--force]`;

const reasonOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

// TODO: пакетна обробка: список посилань або RSS замість однієї адреси за запуск (перевірка
// дублів уже є; кожна стаття — окремий платний виклик, тож потрібен ліміт на запуск)
// TODO: автотести: перевірки (checks, overlap, body-rules, читання й заміна у файлі чернетки)
// поки були лише одноразовими скриптами
const main = async () => {
  const args = process.argv.slice(2);
  const imageOption = args
    .find((arg) => arg.startsWith('--image='))
    ?.slice('--image='.length);
  const creditOption =
    args
      .find((arg) => arg.startsWith('--credit='))
      ?.slice('--credit='.length)
      .trim() || undefined;
  const isForced = args.includes('--force');
  const [rawLink, second, third] = args.filter((arg) => !arg.startsWith('--'));

  if (!rawLink) {
    throw new Error(USAGE);
  }

  // A date (or nothing) in the second place means there is no text file: the page is fetched
  const isFetching = !second || DATE_PATTERN.test(second);
  const textPath = isFetching ? undefined : second;
  const dateOption = isFetching ? second : third;

  let sourceLink: string;

  try {
    sourceLink = normalizeSourceLink(rawLink);
  } catch {
    throw new Error(`Not a valid article address: ${rawLink}`);
  }

  if (sourceLink !== rawLink) {
    console.log(`Link cleaned (no tracking, no fragment): ${sourceLink}`);
  }

  // First, before reading anything or calling the model: unknown sources stop here
  const source = resolveSource(sourceLink);

  const warnings: string[] = [];

  // Before the paid call: the same article twice is the most expensive mistake
  if (!isForced) {
    const [existingDraft] = await findDraftsBySourceLink(DRAFTS_DIR, sourceLink);

    if (existingDraft) {
      throw new Error(
        `There is already a draft for this link: ${existingDraft.path}${existingDraft.publishedAs ? ` (published as "${existingDraft.publishedAs}")` : ''}. Add --force to create another one`,
      );
    }

    let published: PublishedMatch | null = null;

    try {
      published = await findPublishedBySourceLink(getPublishingConfig(), sourceLink);
    } catch (error) {
      warnings.push(`Could not check the site for duplicates: ${reasonOf(error)}`);
    }

    if (published) {
      throw new Error(
        `This article is already on the site: ${published.slug} ("${published.title}"). Add --force to create a draft anyway`,
      );
    }
  }

  let sourceText: string;
  let pageDate: string | undefined;
  let pageImage: string | undefined;

  if (textPath) {
    sourceText = await readFile(textPath, 'utf-8');
  } else {
    const page = await fetchPage(sourceLink);
    const extracted = extractArticle(page.html, page.finalUrl);

    sourceText = extracted.text;
    pageDate = extracted.publishedAt;
    pageImage = extracted.imageUrl;

    console.log(
      `Fetched: ${page.finalUrl} | "${extracted.title}" | ${sourceText.length} chars`,
    );
  }

  const publishedAt = dateOption ?? pageDate;

  if (publishedAt && !dateOption) {
    console.log(`Publication date: ${publishedAt} (taken from the page)`);
  }

  if (!publishedAt) {
    console.warn(
      `No publication date ${isFetching ? 'on the page and none given' : 'given'}: relative dates from the source cannot be made absolute${isFetching ? ' (pass it as the second argument)' : ''}`,
    );
  }

  // Before the model: it is cheap, and a broken Cloudinary setup should show up
  // now, not after a paid reply. A failed picture never stops the run.
  // The page's own picture is used only when asked for (--image=page): re-hosting
  // someone else's photo is a decision, not a default.
  let mainPicture: string | undefined;
  const pictureUrl = imageOption === 'page' ? pageImage : imageOption;

  if (imageOption === 'page' && !pageImage) {
    warnings.push(
      '--image=page needs a fetched page that has a picture: the placeholder is used instead',
    );
  } else if (pictureUrl) {
    try {
      mainPicture = await getMainPicture(pictureUrl);
    } catch (error) {
      warnings.push(
        `The picture was not uploaded, the placeholder is used instead: ${reasonOf(error)}`,
      );
    }
  } else {
    warnings.push(
      `No --image given: the placeholder picture is used${pageImage ? ` (the page has one: ${pageImage}; add --image=page to upload it)` : ''}`,
    );
  }

  // The credit belongs to a real picture: the placeholder is ours and needs none
  if (creditOption && !mainPicture) {
    warnings.push(
      '--credit is ignored: no picture was attached (the placeholder needs no credit)',
    );
  }

  const result = await rewrite({ sourceText, sourceName: source, publishedAt });
  const article = buildArticle(result.article, {
    source,
    sourceLink,
    mainPicture,
    photoCredit: mainPicture ? creditOption : undefined,
  });
  const problems = validateArticle(article);

  warnings.push(...result.warnings);

  if (result.article.subcategory && !article.subcategory) {
    warnings.push(
      `The model chose an unknown subcategory "${result.article.subcategory}": pick one by hand`,
    );
  }

  const { draftPath, sourcePath, ukrainianPath } = await saveDraft({
    article,
    problems,
    warnings,
    overlap: result.overlap,
    intermediate: result.intermediate,
    model: result.model,
    usage: result.usage,
    sourceText,
    publishedAt,
  });

  console.log(`Draft: ${draftPath}`);
  console.log(`Source text: ${sourcePath}`);

  if (ukrainianPath) {
    console.log(`Ukrainian rewrite: ${ukrainianPath}`);
  }

  console.log(
    `model: ${result.model} | tokens in/out: ${result.usage.inputTokens}/${result.usage.outputTokens}`,
  );
  console.log(
    `Section: ${article.isWarInUkraine ? 'War in Ukraine' : article.subcategory}`,
  );
  console.log(
    `Picture: ${isPlaceholderPicture(article.mainPicture) ? 'placeholder' : article.mainPicture}`,
  );

  if (mainPicture) {
    console.log(
      article.photoCredit
        ? `Photo credit: ${article.photoCredit}`
        : 'Photo credit: none yet, fill the photoCredit line in the draft',
    );
  }
  console.log(
    `Overlap${ukrainianPath ? ' (Ukrainian rewrite vs the source)' : ''}: ${result.overlap.summary}`,
  );
  console.log(
    `Highlighted in the ${ukrainianPath ? 'Ukrainian rewrite' : 'draft'}: ${result.overlap.ranges.length} fragment(s)`,
  );

  for (const problem of problems) {
    console.warn(`PROBLEM (the server would reject): ${problem}`);
  }

  for (const warning of warnings) {
    console.warn(`WARNING: ${warning}`);
  }
};

main().catch((error) => {
  console.error(reasonOf(error));
  process.exitCode = 1;
});
