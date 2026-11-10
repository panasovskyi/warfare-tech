import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { sourceLinkKey } from '../article/source-link';

export type FoundDraft = {
  path: string;
  // Заповнене, якщо чернетку вже опубліковано
  publishedAs?: string;
};

// Український рерайт і копії до перекладу — не самостійні чернетки
const AUXILIARY = /\.(uk|pre-translation(-\d+)?)\.md$/;

// Для файла, що лише лежить поруч із чернеткою (її українська версія чи текст до
// перекладу), — чернетка, якій він належить; для самої чернетки — undefined
export const mainDraftOf = (filePath: string): string | undefined =>
  AUXILIARY.test(filePath) ? filePath.replace(AUXILIARY, '.md') : undefined;

// Значення одного рядка шапки («ключ: значення») без лапок
const valueOf = (front: string, key: string): string | undefined =>
  new RegExp(`^${key}:[ \\t]*"?([^"\\r\\n]*)"?[ \\t]*$`, 'm').exec(front)?.[1]?.trim() ||
  undefined;

// Ключ адреси статті або undefined, якщо адреса зіпсована
export const keyOf = (link: string): string | undefined => {
  try {
    return sourceLinkKey(link);
  } catch {
    return undefined;
  }
};

// Чернетки називаються 1.md, 2.md, …; старі починаються з дати й часу створення
const NUMBERED = /^(\d+)\.md$/;

// Номери чернеток у теці (файли виду 1.md); немає теки — порожній список
const numbersIn = async (dir: string): Promise<number[]> => {
  try {
    return (await readdir(dir)).flatMap((name) => {
      const number = NUMBERED.exec(name)?.[1];

      return number ? [Number(number)] : [];
    });
  } catch {
    return [];
  }
};

// Найбільший номер чернетки у всіх теках: опубліковані чернетки переїжджають, але їхні номери
// лишаються зайнятими, тож нова чернетка ніколи не отримає вже використаний номер
export const findHighestDraftNumber = async (dirs: string[]): Promise<number> =>
  Math.max(0, ...(await Promise.all(dirs.map(numbersIn))).flat());

// Найновіша чернетка: з найбільшим номером (нумеровані завжди новіші за старі, з датою
// в імені), а без нумерованих — з найпізнішою датою в імені
export const findNewestDraft = async (dir: string): Promise<string | undefined> => {
  const highest = await findHighestDraftNumber([dir]);

  if (highest > 0) {
    return path.join(dir, `${highest}.md`);
  }

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

// Чернетки тієї самої статті, знайдені за адресою джерела в їхній шапці
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
