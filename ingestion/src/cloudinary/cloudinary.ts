import { downloadImage, readLocalImage } from './image-download';
import { uploadBufferToCloudinary } from './image-upload';

// Takes a picture from an https address or a file on this computer, stores it in our
// Cloudinary and returns the new address. When there is no picture, the caller keeps
// the placeholder from article.ts.
export const uploadImage = async (source: string): Promise<string> => {
  const buffer = /^https?:\/\//i.test(source)
    ? await downloadImage(source)
    : await readLocalImage(source);

  return uploadBufferToCloudinary(buffer);
};

export const getMainPicture = uploadImage;
