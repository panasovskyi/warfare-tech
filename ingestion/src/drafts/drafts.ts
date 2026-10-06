import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import slugify from 'slugify';
import type { ArticleDraft } from '../article/article.schema';
import type { GenerateResult } from '../llm/llm.client';
import { highlightMatches, type OverlapReport } from '../rewriting/overlap';

export const DRAFTS_DIR = path.join(process.cwd(), 'drafts');
const MAX_SLUG_LENGTH = 60;

export type DraftInput = {
  article: ArticleDraft;
  // Rules the server would reject: publishing refuses the file until they are fixed
  problems: string[];
  // Quality hints: worth a look, never blocking
  warnings: string[];
  overlap: OverlapReport;
  // Only for a Ukrainian source: the Ukrainian rewrite the English article comes from.
  // The overlap belongs to it, so the bold highlights go into its own file.
  intermediate?: { title: string; description: string; body: string };
  model: string;
  usage: GenerateResult['usage'];
  sourceText: string;
  publishedAt?: string;
};

export type SavedDraft = {
  draftPath: string;
  sourcePath: string;
  ukrainianPath?: string;
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
    `photoCredit: ${JSON.stringify(article.photoCredit ?? '')}`,
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

  // The ranges describe the Ukrainian text when there is one: never put them on the English body
  const body = intermediate
    ? article.body
    : highlightMatches(article.body, overlap.ranges);

  return `---\n${metadata.join('\n')}\n---\n\n${body}\n`;
};

const buildUkrainianDraft = ({
  intermediate,
  overlap,
}: Pick<DraftInput, 'intermediate' | 'overlap'>): string => {
  const rewrite = intermediate ?? { title: '', description: '', body: '' };

  return `---\ntitle: ${JSON.stringify(rewrite.title)}\ndescription: ${JSON.stringify(rewrite.description)}\noverlap: ${JSON.stringify(overlap.summary)}\n---\n\n${highlightMatches(rewrite.body, overlap.ranges)}\n`;
};

export const saveDraft = async (input: DraftInput): Promise<SavedDraft> => {
  await mkdir(DRAFTS_DIR, { recursive: true });

  const name = buildFileName(input.article.title);
  const draftPath = path.join(DRAFTS_DIR, `${name}.md`);
  const sourcePath = path.join(DRAFTS_DIR, `${name}.source.txt`);
  const ukrainianName = `${name}.uk.md`;

  await writeFile(draftPath, buildDraft(input, ukrainianName), { flag: 'wx' });
  await writeFile(sourcePath, `${input.sourceText.trim()}\n`, { flag: 'wx' });

  if (!input.intermediate) {
    return { draftPath, sourcePath };
  }

  const ukrainianPath = path.join(DRAFTS_DIR, ukrainianName);

  await writeFile(ukrainianPath, buildUkrainianDraft(input), { flag: 'wx' });

  return { draftPath, sourcePath, ukrainianPath };
};
