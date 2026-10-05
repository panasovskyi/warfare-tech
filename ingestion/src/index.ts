import { readFile } from 'node:fs/promises';
import { buildArticle } from './article/article';
import { validateArticle } from './article/article.schema';
import { saveDraft } from './drafts/drafts';
import { rewrite } from './rewriting/rewriting';
import { resolveSource } from './rewriting/sources';

// TODO: нормалізувати sourceLink (https, без utm і фрагмента) — стане в пригоді для пошуку дублів
const main = async () => {
  const [sourceLink, textPath, publishedAt] = process.argv.slice(2);

  if (!sourceLink || !textPath) {
    throw new Error(
      'Usage: npm run start -- <article url> <path to a text file with the article> [publication date YYYY-MM-DD]',
    );
  }

  // First, before reading anything or calling the model: unknown sources stop here
  const source = resolveSource(sourceLink);
  const sourceText = await readFile(textPath, 'utf-8');

  if (!publishedAt) {
    console.warn(
      'No publication date given: relative dates from the source cannot be made absolute',
    );
  }

  const result = await rewrite({ sourceText, sourceName: source, publishedAt });
  const article = buildArticle(result.article, { source, sourceLink });
  const problems = validateArticle(article);

  const warnings = [...result.warnings];

  if (result.article.subcategory && !article.subcategory) {
    warnings.push(
      `The model chose an unknown subcategory "${result.article.subcategory}": pick one by hand`,
    );
  }

  const { draftPath, sourcePath } = await saveDraft({
    article,
    problems,
    warnings,
    overlap: result.overlap,
    model: result.model,
    usage: result.usage,
    sourceText,
    publishedAt,
  });

  console.log(`Draft: ${draftPath}`);
  console.log(`Source text: ${sourcePath}`);
  console.log(
    `model: ${result.model} | tokens in/out: ${result.usage.inputTokens}/${result.usage.outputTokens}`,
  );
  console.log(
    `Section: ${article.isWarInUkraine ? 'War in Ukraine' : article.subcategory}`,
  );
  console.log(`Overlap: ${result.overlap.summary}`);
  console.log(
    `Highlighted in the draft: ${result.overlap.ranges.length} fragment(s)`,
  );

  for (const problem of problems) {
    console.warn(`PROBLEM (the server would reject): ${problem}`);
  }

  for (const warning of warnings) {
    console.warn(`WARNING: ${warning}`);
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
