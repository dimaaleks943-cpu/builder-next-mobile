### Общие принципы `mobileAPP`

Этот файл фиксирует рабочие договоренности мобильного рантайма (Expo + React Native)
и его совместимость с `builder` и `site-runtime-ssr`.

---

### 1. Контракт данных и parity с SSR

- `ContentList.selectedSource` всегда равен `content_type_id` (UUID).
- Коллекции загружаются через:
  `GET /v3/sites/{domain}/content/items?filter={"content_type_id":["<UUID>"]}`.
- `content/types` используется только как опциональный endpoint (схемы/подписи), не как обязательная часть рендера.

---

### 2. Резолюция collection fields

- Для `Text` и `Image` поле берется только из `item.fields[]` по `field.id === collectionField`.
- Display-значение для текста нормализуем в порядке:
  `value_text -> value_boolean -> value_float -> value`.
- Для изображения:
  - сначала `value_text`,
  - затем `value` (строка или media-объект с `url`, `urls.small.url`, `urls.original.url`),
  - если не найдено — fallback на `src`/placeholder.

---

### 3. Режимы отображения страницы

- Нативный рендер включается только если страница действительно собрана для RN
  и после парсинга есть рендеримые компоненты.
- Иначе используется WebView fallback (`WEB_VIEW_BASE_URL + slug`).
- При изменении правил переключения Native/WebView, обновляем одновременно:
  - `mobileAPP/src/api/sitePagesApi.ts`,
  - `mobileAPP/README.md`,
  - этот файл.

---

### 4. Template-страницы, резолвинг `slug` и внутренние ссылки

Поведение выровнено с `site-runtime-ssr/pages/[[...slug]].tsx`, `lib/templateRoute.ts` и `components/LinkText.tsx`.

**Поля `SitePage` из API** (`GET /v3/sites/{domain}/pages` с заголовком `x-mobile-client`):

- `type`: для шаблона записи коллекции ожидается `"template"` (см. `isTemplateSitePage` в `mobileAPP/src/lib/templateRoute.ts`).
- `collection_type_id`: UUID типа контента, к которому относится шаблон.
- `item_path_prefix`: префикс URL записи; если пусто, используется `slug` страницы.
- `sort`: вспомогательный порядок при выборе template при пересечении префиксов.

**Нормализация пути экрана**: `normalizeSiteSlugPath` в `mobileAPP/src/api/sitePagesApi.ts` — путь всегда с ведущим `/` (корень → `"/"`).

**Выбор страницы**: `resolveSitePageForSlugPath(pages, slugPath)`:

- статическая страница — точное совпадение `slug` с нормализованным путём и страница **не** template;
- иначе — `resolveTemplatePageForSlug`: самый длинный подходящий префикс template + сегмент записи после префикса;
- template без сегмента (только префикс) не резолвится в пару «страница + запись».

**Загрузка записи для template**: `fetchTemplatePageItem` в `sitePagesApi.ts` — по сегменту UUID вызывается `GET .../content/items/{id}` с проверкой типа, иначе список по `collection_type_id` и поиск сегмента (`findContentItemByUrlSegment`).

**Провайдеры на экране `Page`** (`mobileAPP/App.tsx`):

- `SiteCollectionsProvider`: `domain`, полный список `sitePages`, `collectionItemsByTypeId` (для типа шаблона — массив с текущей записью, как на SSR).
- Для template с загруженной записью корень нативного контента оборачивается в `ContentDataProvider` с `collectionKey = collection_type_id` и `itemData = запись`, чтобы `Text` / `Image` / `LinkText` с `collectionField` работали вне `ContentList`.

**`LinkText`** (`mobileAPP/src/components/LinkText.tsx`), тот же контракт пропсов, что в `builder/src/craft/LinkText.tsx`:

- `linkMode`: `"url" | "page" | "collectionItemPage"`.
- `collectionItemLinkTarget`: `"none" | "template"`.
- `collectionItemTemplatePageId`: id страницы-шаблона из списка страниц.

Если `linkMode === "collectionItemPage"`, `collectionItemLinkTarget === "template"` и задан `collectionItemTemplatePageId`, целевой URL считается как на SSR: `normalizeItemPathPrefix(page.item_path_prefix ?? page.slug)` + закодированный сегмент `item.id` из `useContentData().itemData` (ссылка имеет смысл внутри строки `ContentList` или иного контекста с `itemData`). Итоговая строка попадает в `resolvedHref`; внутренний переход: `navigation.navigate("Page", { slug })`, где `slug` — **полный** путь с ведущим `/`, без изменения резолвера. Если шаблонная ссылка собрана без контекста записи или страница не найдена в `sitePages`, используется запасной `href` (или клик игнорируется, если он пустой).

При правках template-flow синхронизируем формулировки с `site-runtime-ssr/DEV_NOTES.md` (контексты, списки, маршрут).

---

### 5. Update protocol для DEV_NOTES (обязательный)

- Любые изменения flow/контрактов в мобилке фиксируем в этом файле в рамках той же задачи.
- При изменениях, затрагивающих совместимость, обязательно синхронизируем описание с:
  - `builder/DEV_NOTES.md`,
  - `site-runtime-ssr/DEV_NOTES.md`.
- Термины и API-формулировки держим едиными во всей документации:
  - `selectedSource = content_type_id`,
  - items endpoint = `content/items` с filter по `content_type_id`.
