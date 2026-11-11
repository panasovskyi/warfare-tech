import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { LOCAL_IMAGE_EXTENSIONS } from './image-download';

export const PHOTOS_DIR = path.join(process.cwd(), 'photos');

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

export const deletePhoto = (filePath: string): Promise<void> => unlink(filePath);
