### Общие принципы `site-runtime-ssr`

Этот файл фиксирует основные подходы и договорённости по реализации рентайма витрины.
Его цель — чтобы при возвращении к проекту можно было быстро «въехать» в архитектуру
и продолжать работу в том же стиле.

---

### 1. Поток данных: от конструктора до рендера

- **Источник контента**: билдер (проект `builder`) сохраняет структуру страницы
  как JSON (сериализованное дерево Craft.js) в поле `content`.
- **Парсер**: в рентайме этот JSON парсится функцией
  `craftContentToComponents(content: string): ComponentNode[]`.
  - Файл: `lib/craftContentToComponents.ts`.
  - Результат — массив `ComponentNode`:
    - `type: string` — имя компонента для рендера (`"Body"`, `"Block"`, `"Text"`, `"LinkText"`, `"Image"`, `"ContentList"` и т.п.).
    - `props: Record<string, any>` — пропсы из Craft.
    - `children?: ComponentNode[]` — дерево потомков.
- **Рендер**:
  - Файл: `lib/renderer.tsx`.
  - Карта компонентов: `componentMap` (строковый ключ → React‑компонент).
  - Для каждого `ComponentNode` вызывается `renderComponent(node)`, который:
    - находит компонент в `componentMap` по имени,
    - рекурсивно рендерит детей,
    - создаёт элемент через `React.createElement`.

### 1.1. Адаптивные стили и брейкпоинты (`buildResponsiveCss`)

Стили узлов с **responsive**-пропом `style` попадают на витрину как инжектируемый CSS: `buildResponsiveCss` в `lib/responsiveCss.ts`, порядок веток — `BRANCHES` (как в билдере / codec). Базовый слой без `media` соответствует ветке **`desktop`** в JSON и применяется при ширине viewport **> 1279px**; далее накладываются вложенные `@media (max-width: …)`:

- `1279px` — ветка `tablet_landscape`;
- `1023px` — `tablet`;
- `767px` — `phone_landscape`;
- `567px` — `phone`.

Так SSR остаётся на одном контракте с превью билдера и `builder/src/utils/stylePropsCodec.ts`. Полная таблица ветка ↔ px ↔ `media` — **`builder/DEV_NOTES.md` §3.1**. Маппинг окна на ветку в нативном приложении (без `desktop`) — **`mobileAPP/DEV_NOTES.md` §4**.

---

### 2. ContentDataContext / useContentData

**Идея**: сделать единый механизм «data binding’а» для контейнеров с динамическими данными
(списки, таблицы и т.п.), чтобы простые компоненты (как `Text`) не знали, в каком именно контейнере они находятся.

- Файл: `components/ContentDataContext.tsx`.
- Основные сущности:
  - `ContentDataContextValue`:
    - `collectionKey: string | null` — идентификатор источника данных (`content_type_id`).
    - `itemData: any | null` — данные текущего элемента (продукт, строка таблицы и т.п.).
  - `ContentDataProvider`:
    - Оборачивает поддерево и прокидывает внутрь `collectionKey` и `itemData`.
  - `useContentData()`:
    - Хук, который достаёт текущее значение контекста.

**Пример использования**:

```tsx
<ContentDataProvider collectionKey="5fbf56af-df5d-4e73-b5b2-74d7c5206bd6" itemData={item}>
  <Text collectionField="name" />
</ContentDataProvider>
```

**Ключевая договорённость**:

- Все компоненты, которые должны уметь подставлять данные из коллекций/таблиц
  (например, `Text`, `LinkText`, `Image`), используют **только** `useContentData()`
  и не знают, что их оборачивает — `ContentList`, таблица или что‑то ещё.
- Новые контейнеры (таблица, карусель и т.п.) просто используют `ContentDataProvider`
  в нужных местах (например, на уровне строки / ячейки).

---

### 3. ContentList и работа с коллекцией

Файл: `components/ContentList.tsx`.

**Назначение**: рендер списка элементов коллекции по выбранному источнику
(`selectedSource`) с шаблоном ячейки, собранным в билдере.

Основные шаги:

1. **Загрузка коллекции**:
   - Используем `getCollectionByKey(domain, selectedSource)` из `lib/collectionsApi.ts`.
   - При `!selectedSource` или ошибке — возвращаем пустой контейнер (но без крэша).
2. **Нормализация входных пропов**:
   - `itemsPerRow` и `children` нормализуются в локальные переменные строго типизированные:
     - `const itemsPerRow: number = itemsPerRowProp ?? 1`
     - `const children: ComponentNode[] = childrenProp ?? []`
   - Это убирает `number | undefined` и `ComponentNode[] | undefined` в остальном коде.
3. **Разбиение на строки**:
   - Массив `collectionItems` режется на `rows` по `itemsPerRow`.
4. **Контекст данных ячейки**:
   - Для каждой ячейки используется `ContentListItem`, который:
     - оборачивает содержимое в `ContentDataProvider` с `itemData`,
     - внутри рендерит `children` (шаблон ячейки) через `renderComponent`.
   - Благодаря этому `Text` внутри ячейки может взять данные текущего товара через `useContentData()`.

---

### 4. Компонент Text и привязка к полю коллекции

Файл: `components/Text.tsx`.

- Принимает:
  - `text` — статический текст по умолчанию.
  - `i18nKey?: string | null` — ключ в словаре страницы (`PageLocaleProvider` / `resolveTranslationText`), если нет привязки к коллекции.
  - `collectionField?: string | null` — ключ поля в данных элемента коллекции (`itemData`).
- Логика:
  - Через `useContentData()` получает `itemData` для текущего элемента.
  - Если заданы и `collectionField`, и `itemData`, и найдено поле — показывает его отображаемое значение (как в билдере: пустое значение → fallback на `text`).
  - Если **нет** `collectionField` или **нет** `itemData` — подстановка через `i18nKey` и `usePageLocale()` / `resolveTranslationText` (как в билдере для веб-режима).
  - В остальных случаях — `text`.

Таким образом, один и тот же `Text` может быть как статическим, так и «привязанным»
к данным коллекции/таблицы.

---

### 4.1. Компонент Image

Файл: `components/Image.tsx`.

- Принимает:
  - `src` — ручной URL изображения.
  - `collectionField?: string | null` — поле коллекции с URL (если внутри ContentList).
  - `alt`, `width`, `height`, `borderRadius`.
- Логика:
  - Через `useContentData()` получает `itemData`.
  - Если `collectionField` задан — извлекает URL из поля (строка или объект `{ urls: { original/small: { url } } }`).
  - Иначе использует `src` или плейсхолдер по умолчанию.

Текущий статус:

- поведение `Image` в SSR намеренно консервативное: при невалидном значении показываем placeholder,
  чтобы не ронять рендер страницы;
- TODO: расширить нормализацию сложных media-структур (массивы/вложенные форматы), когда формат API
  будет стабилизирован.

---

### 5. Разбор ContentList в craftContentToComponents

Файл: `lib/craftContentToComponents.ts`.

Особый кейс — узел `ContentList` из билдера:

- В JSON‑дереве его дети — ячейки (`ContentListCell`), а уже внутри ячейки лежит «шаблон»:
  `Text`, `Block` и т.п.
- В рантайме `ContentListCell` не рендерится как отдельный компонент, она только
  нужна билдеру для редактирования.

Подход:

1. В `buildNodeTree` при `componentType === "ContentList"`:
   - Берём первую ячейку среди детей/linkedNodes.
   - Из неё вытаскиваем детей (с учётом `linkedNodes`) и рекурсивно строим `ComponentNode[]`
     для шаблона.
   - Возвращаем узел `ComponentNode` с:
     - `type: "ContentList"`,
     - `props: node.props`,
     - `children: templateChildren` (шаблон ячейки).
2. Для `ContentListCell` возвращаем `null`:
   - она не рендерится напрямую, её содержимое уже поднято в `ContentList`.

Важно: парсер всегда нормализует `ComponentNode.type` в строку (через `resolveTypeName`),
поэтому дерево на выходе — чисто строковые типы.

---

### 6. Почему в renderer обрабатываем `type === function`, а в craftContentToComponents — нет

**В `craftContentToComponents`**:

- Работаем с **сериализованным JSON** из билдера.
- JSON по определению не содержит функций, `type` там:
  - либо строка (`"Text"`, `"Block"`),
  - либо объект с `resolvedName` / `displayName`.
- Поэтому `resolveTypeName` обрабатывает:
  - `string`,
  - `object` с `resolvedName` / `displayName`,
  - и логирует всё остальное как неожиданный формат.
- Функции здесь не ожидаются и не поддерживаются.

**В `renderer.renderComponent`**:

- На практике (из‑за особенностей пайплайна и/или гидрации) сюда иногда прилетает
  `node.type` как **сам React‑компонент (function)**, а не строка.
- Если обрабатывать только строку, часть потомков (особенно внутри `ContentList`)
  начинает рендериться некорректно.
- Поэтому:
  - мы принимаем `rawType: any = (node as any).type`,
  - если это функция — вытаскиваем имя через `displayName` / `name`
    и используем его как ключ в `componentMap`,
  - для других случаев берём `String(rawType)` и логируем неожиданный формат.

Таким образом:

- **Парсер** (`craftContentToComponents`) работает строго с JSON‑представлением (строка/объект).
- **Рендерер** (`renderer.tsx`) более гибкий и умеет жить с тем, что в `type` может оказаться
  как строка, так и функция, чтобы не ломать реальные кейсы работы.

---

### 7. Работа с API и коллекциями

Файл: `lib/collectionsApi.ts` (заглушка/адаптер над реальным API).

Подход:

- В одном месте инкапсулируем:
  - как получить коллекцию по ключу (`getCollectionByKey(domain, key)`),
  - как выглядят элементы (минимальный интерфейс/структура),
  - возможные заглушки/моки.
- Компоненты типа `ContentList`:
  - знают только про `getCollectionByKey(domain, selectedSource)` и то, что вернётся `{ items: any[] }`.
  - не зависят напрямую от URL, схемы бэкенда и т.п.

Актуальный API-контракт:

- `selectedSource` = `content_type_id` (UUID);
- items: `GET /v3/sites/{domain}/content/items?filter={"content_type_id":["<UUID>"]}`;
- одна запись по **slug** (уникален среди items и categories на сайте): `GET /v3/sites/{domain}/content/items/s/{slug}`;
- одна категория по **slug**: `GET /v3/sites/{domain}/content/categories/s/{slug}`;
- `GET /v3/sites/{domain}/content/types` - optional endpoint (используется там, где нужен список типов).

### 7.1 SSR flow для ContentList (prefetch + fallback)

Актуальный поток в `pages/[[...slug]].tsx`:

1. из Craft JSON извлекаются пары `(filterScope?, selectedSource)` через `extractContentListPrefetchPairsFromCraftContent` — ключ кэша `getCollectionItemsCacheKey(filterScope, content_type_id)`;
2. на сервере prefetch'им items по каждой паре через `fetchContentItems` (с `category_id` в filter, если в URL задана категория и у блока есть `filterScope`);
3. складываем результат в `collectionItemsByTypeId` и прокидываем в `SiteCollectionsProvider`;
4. при URL вида `/страница/slug-категории` начальный выбор категории задаётся через `CollectionFilterScopeProvider` (`initialSelectedCategoryIdByScope` с SSR);
5. `ContentList` на клиенте сначала использует prefetched data из provider;
6. если данных нет/они не были префетчены - выполняется client fallback (дозагрузка по API).

Это позволяет:

- легко подменить источник данных (другой URL / другая схема) без переписывания компонентов,
- использовать тот же подход в будущих контейнерах (таблица и пр.) — они тоже будут
  работать через общую обёртку над API.

---

### 7.2 Маршрутизация по `slugPath` (статика, template-запись, витрина с категорией)

**Где код**: `pages/[[...slug]].tsx`, разбор базы и хвоста — `lib/catalogPathResolve.ts` (`splitBaseSlugAndTail`), выбор template по префиксу — `lib/templateRoute.ts`.

**Домен для API**: `normalizeSiteDomain(context.req.headers.host)` (без захардкоженного хоста).

#### 7.2.1 Публичный URL и локаль (`ru` / `en`)

- **Дефолтная локаль** `ru` — в адресе **нет** языкового префикса: `/`, `/gid`, `/gid/europe/item`.
- **Английская** `en` — префикс **первого сегмента**: `/en`, `/en/gid`, `/en/gid/europe/item`.
- Список префиксов локалей (пока только `en`) и дефолт — `lib/localeFromPath.ts`: `LOCALE_PREFIXES`, `DEFAULT_LOCALE`, функции `parseLocaleFromSlugPath` (из полного catch-all пути получаем `{ locale, slugPathWithoutLocale }`) и `prefixPublicPath` (сборка пути для ссылок и `og:url`).
- В `getServerSideProps` после сборки `slugPath` из `[[...slug]]` вызывается `parseLocaleFromSlugPath`; **вся** дальнейшая маршрутизация (`splitBaseSlugAndTail`, `findStaticPage`, `resolveTemplatePageForSlug`, `categoryTrailBetweenPrefixAndItemSlug`, `notFound`) работает только с **`slugPathWithoutLocale`**, чтобы префикс `en` не воспринимался как часть `SitePage.slug`.
- В пропсы страницы уходят `locale`, `slug` (путь **без** префикса локали), объект `pageTranslate` (ветки `translate` / `translate_mobile`).
- **Заглушка переводов** по `page.id`: `lib/hardcodedPageTranslations.ts` (`PAGE_TRANSLATIONS_BY_ID`, `getHardcodedTranslationsForPage`). Для неизвестного `id` возвращаются пустые словари — рендер как раньше по полю `text` в Craft. Дальше словари и список локалей планируется брать из API (`translate` и метаданные локалей), как в билдере.
- **Резолв строки** (как `resolveTranslationText` в билдере): `lib/resolvePageTranslation.ts` — `translations[locale][key] ?? translations.ru[key] ?? fallbackText`.
- **Контекст**: `components/PageLocaleContext.tsx` (`PageLocaleProvider` / `usePageLocale`) оборачивает дерево страницы в `[[...slug]].tsx`; в `components/StorefrontPageContext.tsx` дополнительно прокидывается `locale` для префиксации внутренних URL (`LinkText`, `CategoryFilter` через `prefixPublicPath`).

**Разбор пути**:

- `slugPath` собирается из catch-all (ведущий `/`, корень = `"/"`); затем вычитается префикс локали → `slugPathWithoutLocale`.
- `splitBaseSlugAndTail(slugPathWithoutLocale)`: если в пути **один** сегмент страницы или только корень (`/`, `/gid`) — `tailSlug === null` (только статическая страница, без запросов item/category по slug).
- Если сегментов **два и больше**: `baseSlug` — путь без последнего сегмента, `tailSlug` — последний сегмент (после `decodeURIComponent`).

**Если `tailSlug === null`**

- Ищется **статическая** страница: `page.slug === slugPath`, `!isTemplateSitePage(page)`; для корня — допускается `slug === "/"`.
- Prefetch ContentList — как в §7.1 (без фильтра категории).

**Если `tailSlug` задан** (публичный slug уникален среди items и categories):

1. `GET .../content/items/s/{tailSlug}`. Если запись есть — **ветка template**:
   - `resolveTemplatePageForSlug(pages, slugPath)` выбирает страницу с `type === "template"` и префиксом (`item_path_prefix ?? slug`); при нескольких кандидатах — более длинный префикс, затем `sort`, затем `id`.
   - Проверка: `content_type_id` / `collection_type_id` записи совпадает с `page.collection_type_id` (без учёта регистра). Иначе — `notFound`.
   - Запись берётся **только** из ответа `items/s/{slug}` (без загрузки по UUID и без поиска по полному списку).
   - `templateContentData = { collectionKey, itemData }`; в `collectionItemsByTypeId` для списков с тем же `selectedSource`, что и `collection_type_id`, кладётся `[item]` под ключом `getCollectionItemsCacheKey(...)`; остальные пары догружаются через `fetchContentItems`.
2. Если итема нет — `GET .../content/categories/s/{tailSlug}`. Если категория есть — **ветка витрины**:
   - Загружается **статическая** страница с `slug === baseSlug` (не template).
   - Prefetch: для каждой пары ContentList с `filterScope` — `fetchContentItems` с `category_id`; для пар без scope — без фильтра.
   - `CollectionFilterScopeProvider` получает `initialSelectedCategoryIdByScope`: для каждого встреченного `filterScope` — `category.id`.
3. Если категория не найдена — `notFound`.

**Поля `SitePage` для template** (см. `lib/sitePages.ts`): `type: "template"`, `collection_type_id`, `item_path_prefix`, `sort` — как раньше для `resolveTemplatePageForSlug`.

**Рендер**:

- `SiteCollectionsProvider` + `CollectionFilterScopeProvider` + при необходимости `ContentDataProvider` вокруг `<main>` (см. `[[...slug]].tsx`).
- `renderPage(components)` без изменений.

**LinkText на template-URL** (`components/LinkText.tsx`):

- При `linkMode === "collectionItemPage"` и template: в путь подставляется **`item.slug`** (не `item.id`); при пустом slug — предупреждение в dev и fallback `href`; итоговый путь префиксуется через `prefixPublicPath` при `locale === "en"`.
- При `linkMode === "page"` и `href`, начинающемся с `/`, тот же префикс добавляется для согласованности с URL вида `/en/...`.

---

### 7.3 Parity с React Native (`mobileAPP`)

Та же **логическая** цепочка, другой каркас UI:

| Этап | SSR (`site-runtime-ssr`) | RN (`mobileAPP`) |
|------|---------------------------|------------------|
| Список страниц | `getSitePages(domain)` в `getServerSideProps` | `fetchSitePages(domain)` с заголовком `x-mobile-client` |
| Нормализация пути | вручную в `[[...slug]].tsx` | `normalizeSiteSlugPath` в `src/api/sitePagesApi.ts` |
| Статика vs template + сегмент | блоки в `[[...slug]].tsx` + `resolveTemplatePageForSlug` | `resolveSitePageForSlugPath` (обёртка над той же идеей) |
| Утилиты префикса/сегмента | `lib/templateRoute.ts` | `src/lib/templateRoute.ts` (копия контракта) |
| Загрузка записи | inline в GSSP | `fetchTemplatePageItem` в `sitePagesApi.ts` |
| Обёртки контекста | `SiteCollectionsProvider` + опционально `ContentDataProvider` вокруг `<main>` | `SiteCollectionsProvider` + `ContentDataProvider` вокруг нативного `ScrollView` в `App.tsx` |
| Переход по ссылке | обычный `<a href={resolvedHref}>` | `navigation.navigate("Page", { slug: resolvedHref })` при пути с `/` |

Отличия продукта: на RN страница без нативного контента уходит в **WebView** по полному URL; на SSR при отсутствии записи — **404**. Детали и контракт `SitePage` для мобилки — `mobileAPP/DEV_NOTES.md`, §5.

---

### 8. Рендер страниц

Основной сценарий:

1. Получаем из БД/файла `content` (строка JSON из билдера).
2. Прогоняем через `craftContentToComponents(content)` → `ComponentNode[]`.
3. На странице (`pages/[[...slug]].tsx`) вызываем `renderPage(components)`:
   - тот в свою очередь вызывает `renderComponent` для каждого `ComponentNode`.

Ключевые договорённости:

- `renderPage` и `renderComponent` **ничего не знают** про коллекции, API и т.п. —
  они просто рендерят дерево компонентов по описанию.
- Вся «магия» динамических данных (коллекции, таблицы) строится поверх:
  - специальных компонентов (`ContentList`, в будущем таблица),
  - общего контекста данных (`ContentDataContext` / `useContentData`).

---

### 9. Как использовать этот файл дальше

- При доработках `site-runtime-ssr`:
  - перед началом работы пробегаться по этому файлу, чтобы вспомнить договорённости;
  - по итогам значимых изменений дополнять разделы (особенно если:
    - добавили новый тип контейнера с данными,
    - поменяли формат `ComponentNode`,
    - поменяли способ работы с API/коллекциями).
- При появлении новой функциональности (например, таблица):
  - описать в этом файле:
    - как она использует `ContentDataContext`,
    - как связывается с API,
    - как вписывается в общий рендер‑пайплайн.

---

### 10. Стиль кода (локальные договорённости для `site-runtime-ssr`)

- **Функции**
  - Предпочитаем **стрелочные функции**, особенно для:
    - функциональных React‑компонентов,
    - коллбеков (`map`, `filter`, обработчики событий),
    - вспомогательной логики внутри модулей.
  - Классические `function` / объявление через `function` используем только там, где это
    осознанно нужно (например, работа с `this`, специфические случаи контекста и т.п.).

- **Типы: `interface` vs `type`**
  - По умолчанию для описания "объектных форм" (props, контексты, структуры данных)
    используем **`interface`**:
    - проще расширять/мерджить,
    - понятнее читается в контексте React‑компонентов.
  - **`type`** используем, когда:
    - нужно описать объединения (`A | B`), пересечения, мап‑типы,
    - alias для примитивов/сложных выражений,
    - в конкретном месте с `type` действительно проще/нагляднее.

- **Форматирование типов**
  - В интерфейсах и типах после каждой строки с полем/alias **ставим `;` в конце**:
    - в т.ч. внутри `interface` и объектных `type`:
      - `field: string;`
      - `other?: number;`
  - Это делает стиль единообразным и снижает количество "пограничных" диффов при
    добавлении/удалении полей.

---

### 11. Сокращения CSS-style props (v1)

- Для сокращённого формата style-props используем единый v1-словарь из `builder/src/utils/stylePropsShortMapV1.ts`.
- В runtime запрещены локальные «самодельные» сокращения, которые не зафиксированы в общем словаре.
- При добавлении нового style-prop порядок изменений всегда один:
  1) добавить ключ в `FULL_TO_SHORT` (source of truth в builder),
  2) синхронизировать codec в `site-runtime-ssr`,
  3) синхронизировать codec в `mobileAPP`.

---

### 12. Update protocol для DEV_NOTES (обязательный)

- Все изменения runtime-контрактов и data-flow фиксируем здесь в рамках той же задачи.
- При изменениях `ContentList`/collections обязательно проверяем parity с `builder` и `mobileAPP`:
  - `selectedSource` трактуется как `content_type_id` (UUID);
  - items загружаются через `GET /v3/sites/{domain}/content/items` с filter по `content_type_id`;
  - field-resolution в `Text`/`Image` работает через `item.fields[]` и `field.id`.
- Если меняется SSR prefetch/client fallback в `pages/[[...slug]].tsx` или API-адаптеры,
  обновляем этот раздел и `site-runtime-ssr/README.md`, чтобы не было расхождений.
- Любые изменения **template-маршрута** (`templateRoute`, выбор страницы по slug, загрузка записи, `templateContentData`, `LinkText` template-href) синхронизируем с **§7.2–7.3**, `builder/DEV_NOTES.md` и `mobileAPP/DEV_NOTES.md` §5.
- При изменении **брейкпоинтов responsive CSS** (`lib/responsiveCss.ts`, `BRANCHES`, строки `max-width`) — обновляем **§1.1**, `builder/DEV_NOTES.md` §3.1 и `mobileAPP/DEV_NOTES.md` §4.


