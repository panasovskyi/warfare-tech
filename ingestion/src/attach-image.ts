import { readFile, writeFile } from 'node:fs/promises';
import { getMainPicture } from './cloudinary/cloudinary';
import {
  findNewestPhoto,
  moveToUsed,
  PHOTOS_DIR,
} from './cloudinary/photos-folder';
import { readDraft } from './drafts/draft-file';
import {
  dropPictureWarnings,
  setMainPicture,
  setPhotoCredit,
} from './drafts/draft-file.schema';
import { DRAFTS_DIR } from './drafts/drafts';
import { findNewestDraft, mainDraftOf } from './drafts/find-drafts';
import { extractArticle } from './fetching/extract-article';
import { fetchPage } from './fetching/fetch-page';

const USAGE = `Usage:
  npm run attach-image                                  (the newest draft + the newest photo in ${PHOTOS_DIR})
  npm run attach-image -- <picture file | url | page>   (the newest draft)
  npm run attach-image -- <path to a draft .md>         (the newest photo in the folder)
  npm run attach-image -- <path to a draft .md> <picture file | url | page>
Add --credit="Airbus" to any of them to fill photoCredit (the author shown under the photo).`;

// Puts a picture into a draft that is already written and edited: no model call,
// nothing else in the file changes
const main = async () => {
  const args = process.argv.slice(2);
  const credit =
    args
      .find((arg) => arg.startsWith('--credit='))
      ?.slice('--credit='.length)
      .trim() || undefined;
  const [first, second, extra] = args.filter((arg) => !arg.startsWith('--'));

  if (extra) {
    throw new Error(USAGE);
  }

  // A lone argument is a draft when it ends with .md, otherwise it is the picture
  const isFirstDraft = Boolean(second) || first?.toLowerCase().endsWith('.md');
  const draftArg = isFirstDraft ? first : undefined;
  let imageArg = second ?? (isFirstDraft ? undefined : first);

  const draftPath = draftArg ?? (await findNewestDraft(DRAFTS_DIR));

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

  await writeFile(
    draftPath,
    credit ? setPhotoCredit(withPicture, credit) : withPicture,
  );

  console.log(`Picture attached: ${picture}`);

  if (credit) {
    console.log(`Photo credit: ${credit}`);
  }

  // The picture is already attached, so a failed move is only worth a warning
  if (photoFromFolder) {
    try {
      await moveToUsed(photoFromFolder);
      console.log('The photo was moved to photos/used');
    } catch (error) {
      console.warn(
        `WARNING: could not move the photo out of the folder (${error instanceof Error ? error.message : String(error)}): delete it by hand, or the next article would pick it up`,
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
