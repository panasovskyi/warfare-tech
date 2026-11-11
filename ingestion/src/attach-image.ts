import { readFile, writeFile } from 'node:fs/promises';
import { getMainPicture } from './cloudinary/cloudinary';
import {
  deletePhoto,
  findNewestPhoto,
  PHOTOS_DIR,
} from './cloudinary/photos-folder';
import { readDraft } from './drafts/draft-file';
import {
  dropPictureWarnings,
  setMainPicture,
  setPhotoAlt,
  setPhotoCredit,
} from './drafts/draft-file.schema';
import { DRAFTS_DIR, resolveDraftPath } from './drafts/drafts';
import { findNewestDraft, mainDraftOf } from './drafts/find-drafts';
import { extractArticle } from './fetching/extract-article';
import { fetchPage } from './fetching/fetch-page';

const USAGE = `Usage:
  npm run image                                  (the newest draft + the newest photo in ${PHOTOS_DIR})
  npm run image -- <picture file | url | page>   (the newest draft)
  npm run image -- <draft: 1, 1.md or a path>    (the newest photo in the folder)
  npm run image -- <draft> <picture file | url | page>
Add --credit="Airbus" to any of them to fill photoCredit (the author shown under the photo)
and --alt="A jet on the runway" to fill photoAlt (the description for screen readers; empty means a decorative picture).`;

const main = async () => {
  const args = process.argv.slice(2);
  const credit =
    args
      .find((arg) => arg.startsWith('--credit='))
      ?.slice('--credit='.length)
      .trim() || undefined;
  const alt =
    args
      .find((arg) => arg.startsWith('--alt='))
      ?.slice('--alt='.length)
      .trim() || undefined;
  const [first, second, extra] = args.filter((arg) => !arg.startsWith('--'));

  if (extra) {
    throw new Error(USAGE);
  }

  const isFirstDraft =
    Boolean(second) || (first !== undefined && /^\d+$|\.md$/i.test(first));
  const draftArg = isFirstDraft ? first : undefined;
  let imageArg = second ?? (isFirstDraft ? undefined : first);

  const draftPath = draftArg
    ? resolveDraftPath(draftArg)
    : await findNewestDraft(DRAFTS_DIR);

  if (!draftPath) {
    throw new Error(`There are no drafts in ${DRAFTS_DIR}`);
  }

  console.log(`Draft: ${draftPath}`);

  const mainDraft = mainDraftOf(draftPath);

  if (mainDraft) {
    throw new Error(
      `${draftPath} is a copy kept next to a draft, not a draft itself: use ${mainDraft}`,
    );
  }

  const { article, publishedAs } = await readDraft(draftPath);

  console.log(`Title: "${article.title}"`);

  if (publishedAs) {
    throw new Error(
      `This draft is already published as "${publishedAs}": a new picture would not reach the site`,
    );
  }

  let photoFromFolder: string | undefined;

  if (!imageArg) {
    photoFromFolder = await findNewestPhoto();

    if (!photoFromFolder) {
      throw new Error(
        `No photo to attach: put it into ${PHOTOS_DIR}, or give its path or address as the last argument`,
      );
    }

    imageArg = photoFromFolder;
    console.log(`Photo from the folder: ${photoFromFolder}`);
  }

  let imageUrl = imageArg;

  if (imageArg === 'page') {
    const page = await fetchPage(article.sourceLink);
    const extracted = extractArticle(page.html, page.finalUrl);

    if (!extracted.imageUrl) {
      throw new Error('The page has no picture: give the picture address instead of "page"');
    }

    imageUrl = extracted.imageUrl;
  }

  const picture = await getMainPicture(imageUrl);
  const original = await readFile(draftPath, 'utf-8');

  const withPicture = dropPictureWarnings(setMainPicture(original, picture));
  const withCredit = credit
    ? setPhotoCredit(withPicture, credit)
    : withPicture;

  await writeFile(draftPath, alt ? setPhotoAlt(withCredit, alt) : withCredit);

  console.log(`Picture attached: ${picture}`);

  if (credit) {
    console.log(`Photo credit: ${credit}`);
  }

  if (alt) {
    console.log(`Photo alt: ${alt}`);
  }

  if (photoFromFolder) {
    try {
      await deletePhoto(photoFromFolder);
      console.log('The photo was deleted from the photos folder');
    } catch (error) {
      console.warn(
        `WARNING: could not delete the photo (${error instanceof Error ? error.message : String(error)}): delete it by hand, or the next article would pick it up`,
      );
    }
  }

  if (!credit) {
    console.log(
      'Do not forget the credit: fill the photoCredit line under mainPicture in the draft (for example "Airbus")',
    );
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
