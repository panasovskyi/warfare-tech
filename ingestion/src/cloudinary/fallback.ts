export const FALLBACK_PUBLIC_ID = 'warfare-tech/fallback';

export const getFallbackPictureUrl = (cloudName: string): string =>
  `https://res.cloudinary.com/${cloudName}/image/upload/${FALLBACK_PUBLIC_ID}.png`;
