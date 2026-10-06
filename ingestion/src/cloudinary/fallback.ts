// The branded picture for articles that have no photo of their own. The source is
// assets/fallback.svg; `npm run upload-fallback` puts it under this public id.
export const FALLBACK_PUBLIC_ID = 'warfare-tech/fallback';

// .png on purpose: the SVG is rasterized by Cloudinary, because next/image refuses remote SVG.
// No version in the URL: re-uploading the file replaces the picture everywhere.
export const getFallbackPictureUrl = (cloudName: string): string =>
  `https://res.cloudinary.com/${cloudName}/image/upload/${FALLBACK_PUBLIC_ID}.png`;
