import Image from 'next/image';
import styles from './PageCover.module.scss';

type Props = {
  cover?: {
    src: string;
    position: string;
    credit?: string;
  };
  section?: string;
  children: React.ReactNode;
};

export const PageCover: React.FC<Props> = ({ cover, section, children }) => (
  <header
    className={
      cover ? `${styles.cover} ${styles['cover--withPhoto']}` : styles.cover
    }
    data-section={section}
  >
    {cover && (
      <>
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
