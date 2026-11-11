import { access, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import nodePath from 'node:path';
import { parse } from 'yaml';
import type { ArticleDraft } from '../article/article.schema';
import {
  addPublishedMarks,
  splitDraft,
  toArticleDraft,
  usesBoldHighlights,
} from './draft-file.schema';
import { PUBLISHED_DIR } from './drafts';

// Читає файл чернетки й повертає статтю та, якщо чернетку вже опубліковано, її slug
export const readDraft = async (
  path: string,
): Promise<{ article: ArticleDraft; publishedAs?: string }> => {
  const text = await readFile(path, 'utf-8');
  const { front, body } = splitDraft(text);

  let data: unknown;

  try {
    data = parse(front);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);

    throw new Error(`Cannot read the front matter: ${reason}`);
  }

  return toArticleDraft(data, body, {
    boldHighlights: usesBoldHighlights(front),
  });
};

// Дописує в шапку publishedAs і publishedOn: так той самий файл не опублікують вдруге
export const markPublished = async (
  path: string,
  slug: string,
): Promise<void> => {
  const text = await readFile(path, 'utf-8');

  await writeFile(path, addPublishedMarks(text, slug));
};

// Чи існує файл
const exists = (path: string): Promise<boolean> =>
  access(path).then(
    () => true,
    () => false,
  );

// Переносить чернетку й усе, що лежить поруч (1.md, 1.uk.md, 1.pre-translation.md…),
// у теку published; нічого там не перезаписується
export const moveToPublished = async (draftPath: string): Promise<string[]> => {
  const dir = nodePath.resolve(nodePath.dirname(draftPath));

  if (dir === nodePath.resolve(PUBLISHED_DIR)) {
    return [];
  }

  const base = nodePath.basename(draftPath, '.md');
  const names = (await readdir(dir)).filter((name) => name.startsWith(`${base}.`));

  await mkdir(PUBLISHED_DIR, { recursive: true });

  for (const name of names) {
    if (await exists(nodePath.join(PUBLISHED_DIR, name))) {
      throw new Error(`${nodePath.join(PUBLISHED_DIR, name)} already exists`);
    }
  }

  for (const name of names) {
    await rename(nodePath.join(dir, name), nodePath.join(PUBLISHED_DIR, name));
  }

  return names;
};
