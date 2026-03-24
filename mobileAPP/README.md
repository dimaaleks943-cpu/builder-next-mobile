# Мобильное приложение (Expo + React Native)

Приложение отображает сайт, собранный в конструкторе. Поддерживаются два режима: **нативный рендер** страницы из JSON (Body, Block, Text, Image, LinkText, ContentList в ScrollView) и отображение **веб-версии сайта в WebView**.

Платформы: **Android и iOS** (одна кодовая база).

## Откуда данные

- **Бэкенд конструктора (API):** список страниц сайта, контент страницы (JSON), content items для `ContentList`.
- Конфигурация через переменные окружения Expo: базовый URL API, домен сайта, URL веб-версии для WebView.

## Flow отображения страницы

1. По slug запрашивается страница с API (список страниц, затем выбор по slug).
2. Нативный рендер включается только если одновременно:
   - `is_mobile_content === true`,
   - `content != null`,
   - после парсинга есть хотя бы один компонент (`nativeComponents.length > 0`).
3. Во всех остальных случаях используется fallback в **WebView** (`WEB_VIEW_BASE_URL` + path).

## Структура проекта

- **`src/api`** — конфигурация и запросы к API: `config.ts` (API_BASE_URL, SITE_DOMAIN, WEB_VIEW_BASE_URL), `sitePagesApi.ts` (страницы по домену и по slug), `collectionsApi.ts` (content/items + optional content/types), `contentTypes.ts` (типы ответов).
- **`src/content`** — разбор и рендер контента страницы: парсинг JSON конструктора (Craft) в дерево узлов, маппинг на RN-компоненты, отрисовка страницы (`craftContentToComponents`, `renderer`, `interface`).
- **`src/components`** — RN-компоненты блоков: Body, Block, Text, Image, LinkText, ContentList, ContentDataContext.

## Запуск и конфигурация

В корне каталога приложения создайте `.env` с переменными:

```env
EXPO_PUBLIC_RUNTIME_API_URL=https://dev-api.cezyo.com
EXPO_PUBLIC_SITE_DOMAIN=marketflow.store
EXPO_PUBLIC_SITE_WEB_URL=https://marketflow.store
```

- **EXPO_PUBLIC_RUNTIME_API_URL** — базовый URL API бэкенда конструктора.
- **EXPO_PUBLIC_SITE_DOMAIN** — домен сайта, для которого развёрнуто приложение.
- **EXPO_PUBLIC_SITE_WEB_URL** — URL веб-версии сайта для WebView. По умолчанию подставляется `https://{EXPO_PUBLIC_SITE_DOMAIN}`.

**Локальная разработка (WebView):** если веб-сайт крутится локально (например на порту 3000), в Android-эмуляторе укажите `EXPO_PUBLIC_SITE_WEB_URL=http://10.0.2.2:3000` (10.0.2.2 — это хост-машина). В iOS-симуляторе обычно подходит `http://localhost:3000`.

Команды:

```bash
npm install
npm start
# или: npm run android | npm run ios
```

## Пример использования API страниц

```ts
import { fetchSitePageBySlug } from "./src/api/sitePagesApi";

const page = await fetchSitePageBySlug("/"); // корневая страница
// if (page?.is_mobile_content && page?.content && nativeComponents.length > 0) -> native render
// else -> WebView fallback по WEB_VIEW_BASE_URL + slug
```

## ContentList API контракт

`ContentList.selectedSource` в мобильном runtime трактуется строго как `content_type_id` (UUID).

- `getCollectionByKey(domain, key)` -> `CollectionInfo | null`;
- в текущем контракте `key` = `content_type_id`;
- загрузка items: `GET /v3/sites/{domain}/content/items?filter={"content_type_id":["<UUID>"]}`;
- endpoint `GET /v3/sites/{domain}/content/types` подключается опционально, если нужен список типов контента.

Минимальная схема item для рендера:

```ts
interface IContentItem {
  id: string;
  content_type_id?: string;
  fields?: Array<{
    id: string;
    value?: unknown;
    value_text?: string | null;
    value_float?: number | null;
    value_boolean?: boolean | null;
  }>;
}
```
