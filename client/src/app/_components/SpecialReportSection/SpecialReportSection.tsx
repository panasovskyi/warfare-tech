import styles from './SpecialReportSection.module.scss';

// Заглушка: секція в page.tsx не підключена, дані й картки ще не зроблені (див. BACKLOG.md)
export const SpecialReportSection = () => {
  return (
    <section className={styles.special} aria-labelledby='special-report-title'>
      <h2 id='special-report-title' className={styles.special__title}>
        Special Report: The Year Drone Warfare Changed
      </h2>

      <ul className={styles.special__content}>
        <li className={styles.special__item}>
          <div className={styles.article__imageWrapper}>
            {/* тут буде IMage */}
          </div>
          <h3 className={styles.article__title}>
            How Strike Drone Tactics Evolved This Year
          </h3>
          {/**
           * <ArticleCardCompact />
           */}
        </li>
        <li className={styles.special__item}>
          <div className={styles.article__imageWrapper}>
            {/* тут буде IMage */}
          </div>
          <h3 className={styles.article__title}>
            Counter-Drone Tech: A Field Guide
          </h3>
          {/**
           * <ArticleCardCompact />
           */}
        </li>
        <li className={styles.special__item}>
          <div className={styles.article__imageWrapper}>
            {/* тут буде IMage */}
          </div>
          <h3 className={styles.article__title}>
            Who is Actually Building All These FPV Drones
          </h3>
          {/**
           * <ArticleCardCompact />
           */}
        </li>
      </ul>
    </section>
  );
};
