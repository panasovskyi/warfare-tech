import { getCloudinary } from './client';

const UPLOAD_FOLDER = 'warfare-tech';
// The original is never shown at full size: cap the width before storing it
const MAX_WIDTH = 1600;

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
