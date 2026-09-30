import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement>;

// Спільна обгортка для іконок: сітка 24×24, лінії кольору тексту (currentColor),
// розмір 1em — іконка масштабується разом із font-size батька.
// aria-hidden: іконки декоративні, сенс передає текст поруч. Для кнопки лише з іконкою
// aria-label ставиться на саму кнопку. Будь-який атрибут можна перевизначити пропсом.
export const IconBase: React.FC<IconProps> = ({ children, ...props }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    width='1em'
    height='1em'
    fill='none'
    stroke='currentColor'
    strokeWidth={1.75}
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    focusable='false'
    {...props}
  >
    {children}
  </svg>
);
