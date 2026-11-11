import { downloadImage, readLocalImage } from './image-download';
import { uploadBufferToCloudinary } from './image-upload';

export const uploadImage = async (source: string): Promise<string> => {
  const buffer = /^https?:\/\//i.test(source)
    ? await downloadImage(source)
    : await readLocalImage(source);

  return uploadBufferToCloudinary(buffer);
};

export const getMainPicture = uploadImage;
