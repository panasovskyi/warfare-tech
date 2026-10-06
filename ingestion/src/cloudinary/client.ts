import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryConfig } from '../config/cloudinary.config';

// The SDK is configured on each use, from the validated env: no global side effect at import
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
