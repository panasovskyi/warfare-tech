import styles from './page.module.scss';
import { HeroSection } from '@/app/_components/HeroSection/HeroSection';
import { WarInUkraineSection } from '@/app/_components/WarInUkraineSection/WarInUkraineSection';
import { SubcategorySection } from '@/app/_components/SubcategorySection/SubcategorySection';
// import { SpecialReportSection } from '@/app/_components/SpecialReportSection/SpecialReportSection';
import { LatestSection } from '@/app/_components/LatestSection/LatestSection';
import { articleApi } from '@/features/article/article.api';
import { ArticleCategory } from '@/features/article/article.types';
import {
  NEWS_SECTIONS,
  type NewsSectionKey,
} from '@/features/article/article.constants';
import { getItemsOrEmpty } from '@/lib/api/pagination';

// Блоки підкатегорій на головній, у порядку показу. З цього списку будуються
// і запити, і секції, тож розійтися вони не можуть
// TODO: у satisfies — SubcategoryKey з article.constants замість Exclude<NewsSectionKey, 'ukraine'>
const HOMEPAGE_SUBCATEGORIES = [
  'air',
  'land',
  'naval',
  'space',
  'cyber',
  'uav',
] as const satisfies readonly Exclude<NewsSectionKey, 'ukraine'>[];

// allSettled не відхиляється, тож без цього запит, що впав, тихо зник би зі сторінки
function logIfRejected(
  name: string,
  result: PromiseSettledResult<unknown> | undefined,
) {
  if (result?.status === 'rejected') {
    console.error(`Homepage request "${name}" failed:`, result.reason);
  }
}

export default async function Home() {
  // TODO: дублі між блоками. Найсвіжіші новини в Latest майже напевно ті самі,
  // що стоять першими в блоках категорій і War in Ukraine.

  // TODO: кешування. У Next 16 fetch за замовчуванням не кешується, тож кожен
  // перегляд головної — 9 запитів до API. Вирішити, як часто оновлювати
  // (use cache / revalidate); тоді й "3 hours ago" застаріватиме на час кешу

  const featuredRequest = articleApi.getArticles({
    category: ArticleCategory.NEWS,
    isFeatured: true,
    limit: 1,
  });
  const ukraineRequest = articleApi.getArticles({
    ...NEWS_SECTIONS.ukraine.filter,
    isFeatured: false,
    limit: 4,
  });
  const latestRequest = articleApi.getArticles({
    category: ArticleCategory.NEWS,
    isFeatured: false,
    limit: 6,
  });
  const subcategoryRequests = HOMEPAGE_SUBCATEGORIES.map((subcategory) =>
    articleApi.getArticles({
      category: ArticleCategory.NEWS,
      ...NEWS_SECTIONS[subcategory].filter,
      isFeatured: false,
      limit: 4,
    }),
  );

  const [mainResults, subcategoryResults] = await Promise.all([
    Promise.allSettled([featuredRequest, ukraineRequest, latestRequest]),
    Promise.allSettled(subcategoryRequests),
  ]);
  const [featuredNews, ukraineNews, latestNews] = mainResults;

  logIfRejected('featured', featuredNews);
  logIfRejected('ukraine', ukraineNews);
  logIfRejected('latest', latestNews);
  HOMEPAGE_SUBCATEGORIES.forEach((subcategory, index) =>
    logIfRejected(subcategory, subcategoryResults[index]),
  );

  // TODO: коли API недоступний, на сторінці лишаються лише дві однакові заглушки
  // (War in Ukraine і Latest). Можливо, краще одне повідомлення на рівні сторінки,
  // якщо впали всі запити
  return (
    <div className={styles.page}>
      {/*
        TODO: h1 сторінки — у HeroSection. Якщо featured-новини немає (запит упав), Hero
        повертає null, і на головній не лишається жодного h1. Запасний — візуально
        прихований h1 "Warfare Tech" (.sr-only, див. TODO в layout.tsx)
      */}
      <HeroSection articles={getItemsOrEmpty(featuredNews)} />

      <div className={`container ${styles.page__content}`}>
        <WarInUkraineSection articles={getItemsOrEmpty(ukraineNews)} />

        <div className={styles.page__subcategories}>
          {HOMEPAGE_SUBCATEGORIES.map((subcategory, index) => (
            <SubcategorySection
              key={subcategory}
              subcategory={subcategory}
              articles={getItemsOrEmpty(subcategoryResults[index])}
            />
          ))}
        </div>

        {/* <SpecialReportSection /> */}

        <LatestSection articles={getItemsOrEmpty(latestNews)} />

        {/**
         * Додамо потім форму підписки
         */}
      </div>
    </div>
  );
}