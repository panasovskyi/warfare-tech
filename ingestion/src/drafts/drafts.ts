import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ArticleDraft } from '../article/article.schema';
import type { GenerateResult } from '../llm/llm.client';
import { highlightMatches, type OverlapReport } from '../rewriting/overlap';
import { findHighestDraftNumber } from './find-drafts';

export const DRAFTS_DIR = path.join(process.cwd(), 'drafts');
// Сюди переїжджає опублікована чернетка разом з усіма супутніми файлами
export const PUBLISHED_DIR = path.join(process.cwd(), 'published');

export type DraftInput = {
  article: ArticleDraft;
  // Порушення правил сервера: публікація відмовить, доки їх не виправлено
  problems: string[];
  // Підказки щодо якості: варто глянути, але вони нічого не блокують
  warnings: string[];
  overlap: OverlapReport;
  // Лише для українського джерела: український рерайт, з якого зроблено англійську статтю.
  // Збіги з джерелом стосуються саме його, тому жирні виділення йдуть у його власний файл.
  intermediate?: { title: string; description: string; body: string };
  model: string;
  usage: GenerateResult['usage'];
  publishedAt?: string;
};

export type SavedDraft = {
  draftPath: string;
  ukrainianPath?: string;
};

// Ім'я, набране руками: «1», «1.md» чи «1.uk» — це файл у теці drafts,
// усе, де є тека (drafts/1.md, абсолютний шлях), береться як є
export const resolveDraftPath = (arg: string): string => {
  if (/[\\/]/.test(arg)) {
    return arg;
  }

  return path.join(DRAFTS_DIR, arg.toLowerCase().endsWith('.md') ? arg : `${arg}.md`);
};

// Список для шапки YAML: кожен елемент у лапках, з нового рядка
const toYamlList = (key: string, items: string[]): string =>
  `${key}:\n${items.map((item) => `  - ${JSON.stringify(item)}`).join('\n')}`;

// Збирає текст чернетки: поля статті, потім нотатки для перегляду (вони не публікуються), потім текст
const buildDraft = (
  {
    article,
    problems,
    warnings,
    overlap,
    intermediate,
    model,
    usage,
    publishedAt,
  }: DraftInput,
  ukrainianFileName?: string,
): string => {
  // JSON.stringify дає коректний YAML-рядок у лапках: двокрапки й лапки не заважають
  const metadata = [
    `title: ${JSON.stringify(article.title)}`,
    `description: ${JSON.stringify(article.description)}`,
    `type: ${article.type}`,
    `subcategory: ${article.subcategory ?? 'null'}`,
    `isWarInUkraine: ${article.isWarInUkraine}`,
    `isFeatured: ${article.isFeatured}`,
    `tags: ${JSON.stringify(article.tags)}`,
    `mainPicture: ${JSON.stringify(article.mainPicture)}`,
    `photoCredit: ${JSON.stringify(article.photoCredit ?? '')}`,
    `photoAlt: ${JSON.stringify(article.photoAlt ?? '')}`,
    `source: ${JSON.stringify(article.source)}`,
    `sourceLink: ${JSON.stringify(article.sourceLink)}`,
    '# Review notes below are not published',
    `model: ${model}`,
    `tokens: ${usage.inputTokens}/${usage.outputTokens}`,
    `overlap: ${JSON.stringify(`${intermediate ? 'Ukrainian rewrite vs the source: ' : ''}${overlap.summary}`)}`,
  ];

  if (intermediate && ukrainianFileName) {
    metadata.push(
      `ukrainianRewrite: ${JSON.stringify(`${ukrainianFileName}: the Ukrainian rewrite this text was translated from, with the passages that repeat the source in **bold**`)}`,
    );
  } else if (overlap.ranges.length > 0) {
    metadata.push(
      `highlights: ${JSON.stringify(`${overlap.ranges.length} fragment(s) in **bold** repeat the source: rephrase them (the ** marks left in the text are removed on publishing)`)}`,
    );
  }

  if (publishedAt) {
    metadata.push(`sourcePublishedAt: ${JSON.stringify(publishedAt)}`);
  }

  if (problems.length > 0) {
    metadata.push(toYamlList('problems', problems));
  }

  if (warnings.length > 0) {
    metadata.push(toYamlList('warnings', warnings));
  }

  // Діапазони описують український текст, коли він є: на англійський текст їх не накладаємо
  const body = intermediate
    ? article.body
    : highlightMatches(article.body, overlap.ranges);

  return `---\n${metadata.join('\n')}\n---\n\n${body}\n`;
};

// Файл української версії (N.uk.md): рерайт з виділеними жирним збігами з джерелом
const buildUkrainianDraft = ({
  intermediate,
  overlap,
}: Pick<DraftInput, 'intermediate' | 'overlap'>): string => {
  const rewrite = intermediate ?? { title: '', description: '', body: '' };

  return `---\ntitle: ${JSON.stringify(rewrite.title)}\ndescription: ${JSON.stringify(rewrite.description)}\noverlap: ${JSON.stringify(overlap.summary)}\n---\n\n${highlightMatches(rewrite.body, overlap.ranges)}\n`;
};

// Зберігає чернетку під наступним вільним номером (і N.uk.md для українського джерела)
export const saveDraft = async (input: DraftInput): Promise<SavedDraft> => {
  await mkdir(DRAFTS_DIR, { recursive: true });

  // Номер береться після найбільшого серед drafts/ і published/, тому не повторюється
  let number = (await findHighestDraftNumber([DRAFTS_DIR, PUBLISHED_DIR])) + 1;

  // 'wx' ніколи не перезаписує чернетку, яку ти вже правив руками: зайнятий номер — беремо наступний
  for (;;) {
    const draftPath = path.join(DRAFTS_DIR, `${number}.md`);
    const ukrainianName = `${number}.uk.md`;

    try {
      await writeFile(draftPath, buildDraft(input, ukrainianName), { flag: 'wx' });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        number += 1;

        continue;
      }

      throw error;
    }

    if (!input.intermediate) {
      return { draftPath };
    }

    const ukrainianPath = path.join(DRAFTS_DIR, ukrainianName);

    await writeFile(ukrainianPath, buildUkrainianDraft(input), { flag: 'wx' });

    return { draftPath, ukrainianPath };
  }
};
