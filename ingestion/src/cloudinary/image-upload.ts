import { getCloudinary } from './client';

// Тека в Cloudinary, куди потрапляють усі наші фото
const UPLOAD_FOLDER = 'warfare-tech';
// Оригінал ніколи не показується в повному розмірі: обмежуємо ширину ще до збереження
const MAX_WIDTH = 1600;

// Завантажує фото з пам'яті в Cloudinary і повертає https-адресу вже нашого фото
export const uploadBufferToCloudinary = (
  fileBuffer: Buffer,
): Promise<string> => {
  const cloudinary = getCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: UPLOAD_FOLDER,
        resource_type: 'image',
        transformation: [{ width: MAX_WIDTH, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }

        if (!result) {
          return reject(new Error('Cloudinary upload returned nothing'));
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(fileBuffer);
  });
};
