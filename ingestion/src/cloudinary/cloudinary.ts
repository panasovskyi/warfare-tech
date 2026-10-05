import "./config.js";
import { downloadImage } from "./image-download.js";
import { uploadBufferToCloudinary } from "./image-upload.js";

const FALLBACK_IMAGE_URL =
  "https://res.cloudinary.com/tjpyazwe/image/upload/v1790068741/fallback.svg";

export async function getMainPicture(imageUrl: string | null): Promise<string> {
  if (!imageUrl) {
    return FALLBACK_IMAGE_URL;
  }

  const buffer = await downloadImage(imageUrl);
  return uploadBufferToCloudinary(buffer);
}
