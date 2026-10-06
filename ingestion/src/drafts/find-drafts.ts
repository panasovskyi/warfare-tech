import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { sourceLinkKey } from '../article/source-link';

export type FoundDraft = {
  path: string;
  // Set when the draft was already published
  publishedAs?: string;
};

// The Ukrainian rewrite and the copies kept before a translation are not drafts of their own
const AUXILIARY = /\.(uk|pre-translation(-\d+)?)\.md$/;

// For a file that only lies next to a draft (its Ukrainian version, or the text kept before
// a translation) the draft it belongs to; undefined for a draft itself
export const mainDraftOf = (filePath: string): string | undefined =>
  AUXILIARY.test(filePath) ? filePath.replace(AUXILIARY, '.md') : undefined;

const valueOf = (front: string, key: string): string | undefined =>
  new RegExp(`^${key}:[ \\t]*"?([^"\\r\\n]*)"?[ \\t]*$`, 'm').exec(front)?.[1]?.trim() ||
  undefined;

export const keyOf = (link: string): string | undefined => {
  try {
    return sourceLinkKey(link);
  } catch {
    return undefined;
  }
};

// The most recently created draft: file names start with the date and time of creation
export const findNewestDraft = async (dir: string): Promise<string | undefined> => {
  let names: string[];

  try {
    names = await readdir(dir);
  } catch {
    return undefined;
  }

  const [newest] = names
    .filter((name) => name.endsWith('.md') && !AUXILIARY.test(name))
    .sort()
    .reverse();

  return newest && path.join(dir, newest);
};

// Drafts of the same article, found by the source link in their front matter
export const findDraftsBySourceLink = async (
  dir: string,
  link: string,
): Promise<FoundDraft[]> => {
  const wanted = keyOf(link);

  if (!wanted) {
    return [];
  }

  let names: string[];

  try {
    names = await readdir(dir);
  } catch {
    return [];
  }

  const found: FoundDraft[] = [];

  for (const name of names) {
    if (!name.endsWith('.md') || AUXILIARY.test(name)) {
      continue;
    }

    const text = await readFile(path.join(dir, name), 'utf-8');
    const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? '';
    const draftLink = valueOf(front, 'sourceLink');

    if (draftLink && keyOf(draftLink) === wanted) {
      found.push({
        path: path.join(dir, name),
        publishedAs: valueOf(front, 'publishedAs'),
      });
    }
  }

  return found;
};
