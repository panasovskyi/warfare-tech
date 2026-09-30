import styles from './page.module.scss';
import { HeroSection } from '@/app/_components/HeroSection/HeroSection';
import { WarInUkraineSection } from '@/app/_components/WarInUkraineSection/WarInUkraineSection';
import { SubcategorySection } from '@/app/_components/SubcategorySection/SubcategorySection';
import { SpecialReportSection } from '@/app/_components/SpecialReportSection/SpecialReportSection';
import { LatestSection } from '@/app/_components/LatestSection/LatestSection';
import { articleApi } from '@/features/article/article.api';
import {
  ArticleCategory,
  ArticleSubcategory,
} from '@/features/article/article.types';

export default async function Home() {
  // TODO: дублі між блоками. Найсвіжіші новини в Latest майже напевно ті самі, що стоять першими
  // в блоках категорій і War in Ukraine. Рішення про дизайн, прийняти свідомо:
  // - лишити дублі (як на багатьох новинних сайтах, найпростіше);
  // - виключати вже показані: параметр на сервері на кшталт "крім цих id"
  //   або брати трохи більше новин і відсіювати на фронті.

  // TODO: позиційна прив'язка. Запити в масиві і змінні в деструктуризації нижче зіставляються
  // лише за порядком. Якщо переставити або вставити запит (напр. special), усі змінні після нього
  // тихо зсунуться, і TypeScript цього не помітить: типи в усіх однакові.
  // Зменшити ризик: список підкатегорій + map будує і шість запитів, і шість SubcategorySection;
  // вручну лишаються лише featured, Ukraine і Latest.
  const results = await Promise.allSettled([
    // тут придумаємо ендпоінт на special
    articleApi.getArticles({
      category: ArticleCategory.NEWS,
      isFeatured: true,
      limit: 1,
    }),
    articleApi.getArticles({
      isWarInUkraine: true,
      isFeatured: false,
      limit: 4,
    }),
    articleApi.getArticles({
      category: ArticleCategory.NEWS,
      subcategory: ArticleSubcategory.AIR,
      isFeatured: false,
      limit: 4,
    }),
    articleApi.getArticles({
      category: ArticleCategory.NEWS,
      subcategory: ArticleSubcategory.LAND,
      isFeatured: false,
      limit: 4,
    }),
    articleApi.getArticles({
      category: ArticleCategory.NEWS,
      subcategory: ArticleSubcategory.NAVAL,
      isFeatured: false,
      limit: 4,
    }),
    articleApi.getArticles({
      category: ArticleCategory.NEWS,
      subcategory: ArticleSubcategory.CYBER,
      isFeatured: false,
      limit: 4,
    }),
    articleApi.getArticles({
      category: ArticleCategory.NEWS,
      subcategory: ArticleSubcategory.UAV,
      isFeatured: false,
      limit: 4,
    }),
    articleApi.getArticles({
      category: ArticleCategory.NEWS,
      subcategory: ArticleSubcategory.SPACE,
      isFeatured: false,
      limit: 4,
    }),
    articleApi.getArticles({
      category: ArticleCategory.NEWS,
      isFeatured: false,
      limit: 6,
    }),
  ]);

  // allSettled не відхиляється, тож без цього запит, що впав, тихо зникне зі сторінки.
  // Номер — позиція запиту в масиві вище
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Homepage request #${index} failed:`, result.reason);
    }
  });

  const [
    // specialNews
    featuredNews,
    ukraineNews,
    airNews,
    landNews,
    navalNews,
    cyberNews,
    uavNews,
    spaceNews,
    latestNews,
  ] = results;
  // TODO: <main> — один на сторінку; найімовірніше в layout.tsx навколо {children}
  // між Header і Footer. Тоді кореневий div тут можна буде прибрати або лишити лише для стилів.

  return (
    <div className={styles.page}>
      <HeroSection
        articles={
          featuredNews.status === 'fulfilled' ? featuredNews.value.items : []
        }
      />

      <div className='container'>
        {/*
          TODO: тернарник винести у функцію в lib/api (поруч із pagination.ts):
          отримує результат allSettled, повертає value.items або порожній масив.
          Буде потрібна для всіх дев'яти блоків; логування rejected тоді можна перенести в неї
        */}
        <WarInUkraineSection
          articles={
            ukraineNews.status === 'fulfilled' ? ukraineNews.value.items : []
          }
        />

        <div className={styles.page__subcategories}>
          <SubcategorySection
            subcategory='air'
            articles={airNews.status === 'fulfilled' ? airNews.value.items : []}
          />
          <SubcategorySection
            subcategory='land'
            articles={
              landNews.status === 'fulfilled' ? landNews.value.items : []
            }
          />
          <SubcategorySection
            subcategory='naval'
            articles={
              navalNews.status === 'fulfilled' ? navalNews.value.items : []
            }
          />
          <SubcategorySection
            subcategory='space'
            articles={
              spaceNews.status === 'fulfilled' ? spaceNews.value.items : []
            }
          />
          <SubcategorySection
            subcategory='cyber'
            articles={
              cyberNews.status === 'fulfilled' ? cyberNews.value.items : []
            }
          />
          <SubcategorySection
            subcategory='uav'
            articles={uavNews.status === 'fulfilled' ? uavNews.value.items : []}
          />
        </div>

        {/* <SpecialReportSection /> */}

        <LatestSection
          articles={
            latestNews.status === 'fulfilled' ? latestNews.value.items : []
          }
        />

        {/**
         * Додамо потім форму підписки
         */}
      </div>
    </div>
  );
}
