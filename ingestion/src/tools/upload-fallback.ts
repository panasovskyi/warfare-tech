import path from 'node:path';
import { getCloudinary } from '../cloudinary/client';
import {
  FALLBACK_PUBLIC_ID,
  getFallbackPictureUrl,
} from '../cloudinary/fallback';
import { getCloudinaryConfig } from '../config/cloudinary.config';

// Run it again after editing assets/fallback.svg: the old picture is replaced
const main = async () => {
  const file = path.join(process.cwd(), 'assets', 'fallback.svg');

  await getCloudinary().uploader.upload(file, {
    public_id: FALLBACK_PUBLIC_ID,
    resource_type: 'image',
    overwrite: true,
    invalidate: true,
  });

  const url = getFallbackPictureUrl(getCloudinaryConfig().cloudName);
  const response = await fetch(url, { method: 'HEAD' });

  console.log(`Uploaded: ${FALLBACK_PUBLIC_ID}`);
  console.log(
    `${url} -> HTTP ${response.status} ${response.headers.get('content-type')}`,
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
