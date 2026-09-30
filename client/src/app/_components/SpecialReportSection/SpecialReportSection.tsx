import styles from './SpecialReportSection.module.scss';

// TODO: дані. В API немає поняття "добірка", тож статті звіту зараз не отримати одним запитом.
// Поки: або приховати блок, або вручну вказати три slug (і назву звіту) в конфігу фронта.
// Згодом, якщо блок лишиться: фільтр стрічки за тегом на сервері або окрема модель Collection.
export const SpecialReportSection = () => {
  return (
    <section className={styles.special} aria-labelledby='special-report-title'>
      <h2 id='special-report-title' className={styles.special__title}>
        Special Report: The Year Drone Warfare Changed
      </h2>

      {/*
        TODO: вміст кожного li замінити на ArticleCardCompact (фото + заголовок), як перша новина
        в SubcategorySection. li лишається, класи article__* тоді зникнуть
      */}
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
