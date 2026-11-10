import { downloadImage, readLocalImage } from './image-download';
import { uploadBufferToCloudinary } from './image-upload';

// Бере фото за https-адресою або з файла на цьому комп'ютері, кладе в наш Cloudinary
// і повертає нову адресу. Коли фото нема, виклик лишає заглушку з article.ts.
export const uploadImage = async (source: string): Promise<string> => {
  const buffer = /^https?:\/\//i.test(source)
    ? await downloadImage(source)
    : await readLocalImage(source);

  return uploadBufferToCloudinary(buffer);
};

// Те саме під назвою, зрозумілішою там, де йдеться про головне фото статті
export const getMainPicture = uploadImage;
