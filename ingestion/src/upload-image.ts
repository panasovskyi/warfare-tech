import { buildImageMarkdown, IMAGE_PLACEHOLDERS } from './article/body-rules';
import { uploadImage } from './cloudinary/cloudinary';

const USAGE =
  'Usage: npm run upload-image -- <https address | file path> [--alt="description"] [--caption="caption. Photo: author"]';

const optionOf = (args: string[], name: string): string =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? '';

// Puts a picture into Cloudinary and prints the line to paste into the draft, between two
// paragraphs. The text itself is not changed here: you decide where the picture goes.
const main = async () => {
  const args = process.argv.slice(2);
  const [source] = args.filter((arg) => !arg.startsWith('--'));

  if (!source) {
    throw new Error(USAGE);
  }

  const alt = optionOf(args, 'alt');
  const caption = optionOf(args, 'caption');
  const address = await uploadImage(source);

  console.log('Paste this line into the draft as a paragraph of its own (blank line before and after):');
  console.log();
  console.log(buildImageMarkdown(address, alt, caption));
  console.log();

  if (!alt || !caption) {
    console.warn(
      `WARNING: no ${[!alt && '--alt', !caption && '--caption'].filter(Boolean).join(' or ')} given, so the line has "${IMAGE_PLACEHOLDERS.alt}" / "${IMAGE_PLACEHOLDERS.caption}": replace them, the draft will not publish until you do`,
    );
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
