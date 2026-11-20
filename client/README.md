# Warfare Tech website

The website at [warfare-tech.com](https://warfare-tech.com): a military technology news site built with Next.js 16 and the App Router. It reads everything from the [Warfare Tech API](../server/README.md) and has no database of its own.

The project overview is in the [root README](../README.md).

## Stack

- **Next.js 16** (App Router, Turbopack) and **React 19**
- **TypeScript** in strict mode with `noUncheckedIndexedAccess`
- **SCSS Modules** with design tokens, no UI library
- **react-markdown** for article bodies
- **ESLint** and **Prettier**

## Pages

| Route                | What it shows                                                                        |
| -------------------- | ------------------------------------------------------------------------------------ |
| `/`                  | Featured story, War in Ukraine, a block per section, latest news                     |
| `/news`              | All news with top stories and pagination                                             |
| `/news/[section]`    | One section: `air`, `land`, `naval`, `space`, `cyber`, `uav`, `ukraine`              |
| `/[slug]`            | An article with breadcrumbs, the source link and the latest stories from its section |
| `/authors/[login]`   | Author profile with the latest articles                                              |
| `/about`, `/contact` | How the articles are made, how to report a mistake                                   |

## How it works

- **Data.** Pages are server components and fetch from the API on the server, so the API address never reaches the browser. All requests go through a small wrapper over `fetch` in `src/lib/api`: one place for the base URL, query parameters and error handling. `fetch` is used instead of axios because Next.js caching and request deduplication are built on it.
- **Caching.** The home page and article pages use incremental static regeneration: they are served from the cache and rebuilt in the background when the data is older than five minutes. Article pages are generated on the first visit, not at build time. The news lists are rendered per request, but their API responses are cached the same way.
- **Loading and errors.** The news lists show skeletons while loading, including when only `?page=` changes. Unknown routes, sections and out-of-range pages get not-found pages; a failed request on an article page falls back to the error page with a retry button.
- **Metadata.** Every page has its own title and description. Articles add Open Graph data with the main photo; other pages share a 1200×630 social image. There is a sitemap with all articles, `robots.txt` and canonical addresses for the paginated lists.
- **Theme.** A dark theme follows the system setting and can be switched by hand. A small inline script sets the theme before the first paint, so the page does not flash.
- **Layout.** Desktop-first, with three breakpoints down to 320px.
- **Accessibility.** A skip link, one `h1` per page, labelled landmarks, `aria-current` in navigation and pagination, visible focus, and contrast checked for text in section colours in both themes.

## Project structure

```
src/
  app/                 routes, metadata, sitemap, robots, error and not-found pages
    _components/       sections of the home page
    news/              news list and section pages, their skeletons
    [slug]/            article page
    authors/[login]/   author page
  components/
    layout/            header, footer, logo
    ui/                shared building blocks: pagination, page cover, skeleton, theme toggle
    icons/             section icons drawn for this project
  features/
    article/           article types, API calls, cards, byline, breadcrumbs
    author/            author profile types and API call
  lib/
    api/               fetch wrapper, ApiError, pagination helpers
  styles/              design tokens and breakpoints
```

## Running locally

You need Node.js 20.9 or newer and the API running (see the [API README](../server/README.md)).

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site opens on `http://localhost:3000`. With an empty database it shows empty states.

### Environment variables

| Variable  | What it is                                                                                                                                                |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `API_URL` | Address of the API including `/api`, for example `http://localhost:5000/api`. Needed at build time too: the home page is prerendered during `next build`. |

### Scripts

| Script                                   | What it does                        |
| ---------------------------------------- | ----------------------------------- |
| `npm run dev`                            | Start the development server        |
| `npm run build`, `npm start`             | Build and run the production server |
| `npm run lint`                           | ESLint                              |
| `npm run format`, `npm run format:check` | Prettier                            |

## Images

Article photos are loaded through `next/image` from the hosts listed in `next.config.ts` (`res.cloudinary.com` and `placehold.co`). The API accepts photos only from the same hosts, so a new host has to be added in both places.
