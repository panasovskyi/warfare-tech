import { mkdir, readdir, rename, stat } from 'node:fs/promises';
import path from 'node:path';
import { LOCAL_IMAGE_EXTENSIONS } from './image-download';

// The owner drops a downloaded photo here instead of typing its path
export const PHOTOS_DIR = path.join(process.cwd(), 'photos');
// A photo that has been uploaded moves here, so the next article never picks it up again
const USED_DIR = path.join(PHOTOS_DIR, 'used');

export const findNewestPhoto = async (): Promise<string | undefined> => {
  let names: string[];

  try {
    names = await readdir(PHOTOS_DIR);
  } catch {
    return undefined;
  }

  let newest: { path: string; modifiedAt: number } | undefined;

  for (const name of names) {
    if (!LOCAL_IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase())) {
      continue;
    }

    const filePath = path.join(PHOTOS_DIR, name);
    const info = await stat(filePath);

    if (info.isFile() && (!newest || info.mtimeMs > newest.modifiedAt)) {
      newest = { path: filePath, modifiedAt: info.mtimeMs };
    }
  }

  return newest?.path;
};

export const moveToUsed = async (filePath: string): Promise<string> => {
  await mkdir(USED_DIR, { recursive: true });

  const target = path.join(USED_DIR, `${Date.now()}-${path.basename(filePath)}`);

  await rename(filePath, target);

  return target;
};
