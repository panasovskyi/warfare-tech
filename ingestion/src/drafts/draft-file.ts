import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'yaml';
import type { ArticleDraft } from '../article/article.schema';
import {
  addPublishedMarks,
  splitDraft,
  toArticleDraft,
} from './draft-file.schema';

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

  return toArticleDraft(data, body);
};

export const markPublished = async (
  path: string,
  slug: string,
): Promise<void> => {
  const text = await readFile(path, 'utf-8');

  await writeFile(path, addPublishedMarks(text, slug));
};
