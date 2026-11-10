import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryConfig } from '../config/cloudinary.config';

// SDK налаштовується при кожному використанні, з перевірених змінних середовища:
// жодного глобального ефекту при імпорті
export const getCloudinary = (): typeof cloudinary => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
};
