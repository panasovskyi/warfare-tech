import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import slugify from 'slugify';
import type { ArticleDraft } from '../article/article.schema';
import type { GenerateResult } from '../llm/llm.client';
import { highlightMatches, type OverlapReport } from '../rewriting/overlap';

const DRAFTS_DIR = path.join(process.cwd(), 'drafts');
const MAX_SLUG_LENGTH = 60;

export type DraftInput = {
  article: ArticleDraft;
  // Rules the server would reject: publishing refuses the file until they are fixed
  problems: string[];
  // Quality hints: worth a look, never blocking
  warnings: string[];
  overlap: OverlapReport;
  model: string;
  usage: GenerateResult['usage'];
  sourceText: string;
  publishedAt?: string;
};

export type SavedDraft = {
  draftPath: string;
  sourcePath: string;
};

// The timestamp keeps every run in its own file, so a draft you have already
// edited by hand is never overwritten
const buildFileName = (title: string): string => {
  const iso = new Date().toISOString();
  const stamp = `${iso.slice(0, 10)}-${iso.slice(11, 19).replace(/:/g, '')}`;
  const slug = slugify(title, { lower: true, strict: true })
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, '');

  return `${stamp}-${slug || 'article'}`;
};

const toYamlList = (key: string, items: string[]): string =>
  `${key}:\n${items.map((item) => `  - ${JSON.stringify(item)}`).join('\n')}`;

// TODO: на кроці 5 при публікації прибирати ** з body: це лише підсвітка збігів для перегляду
const buildDraft = ({
  article,
  problems,
  warnings,
  overlap,
  model,
  usage,
  publishedAt,
}: DraftInput): string => {
  // JSON.stringify gives a valid quoted YAML string: colons and quotes are safe
  const metadata = [
    `title: ${JSON.stringify(article.title)}`,
    `description: ${JSON.stringify(article.description)}`,
    `category: ${article.category}`,
    `subcategory: ${article.subcategory ?? 'null'}`,
    `isWarInUkraine: ${article.isWarInUkraine}`,
    `isFeatured: ${article.isFeatured}`,
    `tags: ${JSON.stringify(article.tags)}`,
    `mainPicture: ${JSON.stringify(article.mainPicture)}`,
    `source: ${JSON.stringify(article.source)}`,
    `sourceLink: ${JSON.stringify(article.sourceLink)}`,
    '# Review notes below are not published',
    `model: ${model}`,
    `tokens: ${usage.inputTokens}/${usage.outputTokens}`,
    `overlap: ${JSON.stringify(overlap.summary)}`,
  ];

  if (overlap.ranges.length > 0) {
    metadata.push(
      `highlights: ${JSON.stringify(`${overlap.ranges.length} fragment(s) in **bold** repeat the source: rephrase them, then remove the **`)}`,
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

  return `---\n${metadata.join('\n')}\n---\n\n${highlightMatches(article.body, overlap.ranges)}\n`;
};

export const saveDraft = async (input: DraftInput): Promise<SavedDraft> => {
  await mkdir(DRAFTS_DIR, { recursive: true });

  const name = buildFileName(input.article.title);
  const draftPath = path.join(DRAFTS_DIR, `${name}.md`);
  const sourcePath = path.join(DRAFTS_DIR, `${name}.source.txt`);

  await writeFile(draftPath, buildDraft(input), { flag: 'wx' });
  await writeFile(sourcePath, `${input.sourceText.trim()}\n`, { flag: 'wx' });

  return { draftPath, sourcePath };
};
