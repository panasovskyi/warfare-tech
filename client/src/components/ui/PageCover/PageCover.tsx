import Image from 'next/image';
import styles from './PageCover.module.scss';

type Props = {
  // Фото обкладинки (необов'язкове): без нього обкладинка лише кольору
  cover?: {
    // Шлях у public/, за договором public/covers/<ім'я>.jpg
    src: string;
    // CSS object-position: яку частину кадру лишити, коли екран вужчий і краї обрізаються
    position: string;
    // Автор для підпису "Photo: …" у куті; без нього підпису нема
    credit?: string;
  };
  // Ключ розділу: за data-section глобальні стилі дають колір розділу (--section-color).
  // Без ключа обкладинка темна (так для /news)
  section?: string;
  children: React.ReactNode;
};

// Обкладинка сторінки на всю ширину: фон на самому header, вміст у .container всередині.
// Текст завжди світлий (як на фото), тому фон завжди темний або кольорів розділів. З фото:
// воно напівпрозоре поверх кольору, поверх нього градієнт під текст
export const PageCover: React.FC<Props> = ({ cover, section, children }) => (
  <header
    className={
      cover ? `${styles.cover} ${styles['cover--withPhoto']}` : styles.cover
    }
    data-section={section}
  >
    {cover && (
      <>
        {/* Фото займає не всю ширину, а праву частину (72%): так воно менше збільшене, а
            предмет зсунутий праворуч, лівий край згасає в колір обкладинки (на телефоні — вся
            ширина). Обгортка потрібна, бо fill ставить Image inline-стилі на всю ширину, і їх
            не перекрити класом. alt порожній: фото декоративне, зміст дає заголовок. preload:
            найбільший елемент першого екрана. sizes: ширина обгортки, 72vw (100vw на телефоні,
            від $bp-md — 768px) */}
        <div className={styles.cover__photo}>
          <Image
            src={cover.src}
            alt=''
            fill
            preload
            sizes='(min-width: 768px) 72vw, 100vw'
            className={styles.cover__image}
            style={{ objectPosition: cover.position }}
          />
        </div>
        <div className={styles.cover__shade} />
      </>
    )}

    <div className={`container ${styles.cover__inner}`}>{children}</div>

    {cover?.credit && (
      <p className={styles.cover__credit}>Photo: {cover.credit}</p>
    )}
  </header>
);
