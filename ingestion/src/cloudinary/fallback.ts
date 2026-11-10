// Фірмова картинка для статей без власного фото. Джерело — assets/fallback.svg;
// `npm run upload-fallback` кладе її в Cloudinary під цим публічним id.
export const FALLBACK_PUBLIC_ID = 'warfare-tech/fallback';

// Саме .png: SVG розтеризує Cloudinary, бо next/image не приймає віддалений SVG.
// Без версії в адресі: повторне завантаження файла замінює картинку скрізь.
export const getFallbackPictureUrl = (cloudName: string): string =>
  `https://res.cloudinary.com/${cloudName}/image/upload/${FALLBACK_PUBLIC_ID}.png`;
