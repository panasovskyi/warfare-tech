import { access, readFile, writeFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { splitDraft, stripHighlights } from './drafts/draft-file.schema';
import { DRAFTS_DIR, resolveDraftPath } from './drafts/drafts';
import { findNewestDraft, mainDraftOf } from './drafts/find-drafts';
import { checkDraft } from './rewriting/checks';
import {
  applyTranslations,
  collectCyrillicItems,
  replaceArticleText,
  type DraftParts,
} from './translation/draft-translation';
import { translateArticle, translateItems } from './translation/translate';

const USAGE =
  'Usage: npm run translate [-- <draft: 1 or 1.md, its Ukrainian version: 1.uk or 1.uk.md, or a path>] (no argument: the newest draft)';

// Закінчення імені файла української версії
const UKRAINIAN_SUFFIX = /\.uk\.md$/;

// Значення з YAML як рядок; усе інше стає порожнім рядком
const asText = (value: unknown): string =>
  typeof value === 'string' ? value : '';

// Теги з YAML: масив або рядок через кому
const asTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  return typeof value === 'string'
    ? value.split(',').map((tag) => tag.trim())
    : [];
};

// Чи існує файл
const fileExists = (path: string): Promise<boolean> =>
  access(path).then(
    () => true,
    () => false,
  );

// Текст помилки для виводу в консоль
const reasonOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

// Зберігає чернетку такою, як вона була, поруч із перекладеною: після закриття файла
// переклад у редакторі вже не скасуєш
const saveBackup = async (draftPath: string, original: string): Promise<string> => {
  const base = draftPath.replace(/\.md$/, '');

  for (let attempt = 1; ; attempt += 1) {
    const path = `${base}.pre-translation${attempt === 1 ? '' : `-${attempt}`}.md`;

    try {
      await writeFile(path, original, { flag: 'wx' });

      return path;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }
};

// Українська версія (<номер>.uk.md) — те, що власник правит для українського джерела:
// вона перекладається цілком і замінює заголовок, опис і текст чернетки
const translateFromUkrainian = async (ukrainianPath: string): Promise<void> => {
  const draftPath = ukrainianPath.replace(UKRAINIAN_SUFFIX, '.md');

  let ukrainian: string;
  let original: string;

  try {
    ukrainian = await readFile(ukrainianPath, 'utf-8');
  } catch {
    throw new Error(`The Ukrainian version was not found: ${ukrainianPath}`);
  }

  try {
    original = await readFile(draftPath, 'utf-8');
  } catch {
    throw new Error(`The draft next to the Ukrainian version was not found: ${draftPath}`);
  }

  const draftData = (parse(splitDraft(original).front) ?? {}) as Record<string, unknown>;

  // Імена файлів — лише числа: заголовок показує, яку статтю перекладаємо
  console.log(`Title: "${asText(draftData.title)}"`);

  if (draftData.publishedAs) {
    throw new Error('This draft is already published: translating it changes nothing on the site');
  }

  const { front, body } = splitDraft(ukrainian);
  const data = (parse(front) ?? {}) as Record<string, unknown>;

  // Зірочки ** виділення збігів не є частиною тексту
  const clean = (text: string): string =>
    stripHighlights(text, { boldHighlights: true }).trim();

  const article = {
    title: clean(asText(data.title)),
    description: clean(asText(data.description)),
    body: clean(body),
  };

  if (!article.title || !article.description || !article.body) {
    throw new Error(
      `${ukrainianPath} needs a title, a description and a text: the front matter has title and description, the text goes below it`,
    );
  }

  const translated = await translateArticle(article);
  const applied = replaceArticleText(original, translated);
  const backupPath = await saveBackup(draftPath, original);

  await writeFile(draftPath, applied.text);

  const paragraphs = translated.body.split(/\n\s*\n/).length;

  console.log(`Translated: ${ukrainianPath}`);
  console.log(`Written into: ${draftPath} (title, description and ${paragraphs} paragraph(s))`);
  console.log(`The draft before the translation: ${backupPath}`);
  console.log(
    `model: ${translated.model} | tokens in/out: ${translated.usage.inputTokens}/${translated.usage.outputTokens}`,
  );

  const warnings = [
    ...translated.warnings.map((warning) => `Translation: ${warning}`),
    ...applied.warnings,
  ];

  // Текст джерела не зберігається: виняток для першої особи (компанія називає себе) тут не діє
  warnings.push(
    ...checkDraft({
      title: translated.title,
      description: translated.description,
      body: translated.body,
      sourceName: asText(draftData.source),
      sourceText: '',
    }),
  );

  for (const warning of warnings) {
    console.warn(`WARNING: ${warning}`);
  }
};

// Українська, вписана прямо в англійську чернетку: перекладаються лише частини з кирилицею
const translateDraft = async (draftPath: string): Promise<void> => {
  const original = await readFile(draftPath, 'utf-8');
  const { front, body } = splitDraft(original);
  const data = (parse(front) ?? {}) as Record<string, unknown>;

  console.log(`Title: "${asText(data.title)}"`);

  if (data.publishedAs) {
    throw new Error('This draft is already published: translating it changes nothing on the site');
  }

  const parts: DraftParts = {
    title: asText(data.title),
    description: asText(data.description),
    tags: asTags(data.tags),
    body,
  };

  const items = collectCyrillicItems(parts);
  const ukrainianPath = draftPath.replace(/\.md$/, '.uk.md');
  const hasUkrainianVersion = await fileExists(ukrainianPath);

  if (items.length === 0) {
    // В англійській чернетці перекладати нічого, але її українську версію могли відредагувати
    if (hasUkrainianVersion) {
      console.log(`No Cyrillic text in the draft: translating its Ukrainian version instead`);

      return translateFromUkrainian(ukrainianPath);
    }

    console.log('No Cyrillic text in the draft: nothing to translate');

    return;
  }

  const result = await translateItems(items);
  const applied = applyTranslations(
    original,
    parts,
    new Map(result.items.map((item) => [item.id, item.text])),
  );

  const backupPath = await saveBackup(draftPath, original);

  await writeFile(draftPath, applied.text);

  console.log(`Translated ${items.length} part(s): ${items.map((item) => item.id).join(', ')}`);
  console.log(`The draft before the translation: ${backupPath}`);
  console.log(
    `model: ${result.model} | tokens in/out: ${result.usage.inputTokens}/${result.usage.outputTokens}`,
  );

  if (hasUkrainianVersion) {
    console.log(
      `Note: ${ukrainianPath} lies next to this draft and was not used: pass it as the path to translate from it`,
    );
  }

  for (const warning of [...result.warnings, ...applied.warnings]) {
    console.warn(`WARNING: ${warning}`);
  }
};

// Вибір чернетки (за аргументом або найновіша) і режиму: переклад з .uk.md чи лише кириличних частин
const main = async () => {
  const [pathArg] = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
  const target = pathArg ? resolveDraftPath(pathArg) : await findNewestDraft(DRAFTS_DIR);

  if (!target) {
    throw new Error(`There are no drafts in ${DRAFTS_DIR}.\n${USAGE}`);
  }

  if (!pathArg) {
    console.log(`Draft: ${target}`);
  }

  if (UKRAINIAN_SUFFIX.test(target)) {
    return translateFromUkrainian(target);
  }

  // Лишається текст, збережений до попереднього перекладу: це не чернетка для роботи
  const mainDraft = mainDraftOf(target);

  if (mainDraft) {
    throw new Error(
      `${target} is a copy kept next to a draft, not a draft itself: use ${mainDraft}`,
    );
  }

  return translateDraft(target);
};

main().catch((error) => {
  console.error(reasonOf(error));
  process.exitCode = 1;
});
