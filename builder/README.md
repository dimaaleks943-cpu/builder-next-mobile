# Builder (конструктор контента)

`builder` - редактор страниц на базе Craft.js. Он формирует JSON-дерево компонентов для двух
рендеров:

- `content` - веб-рендер (`site-runtime-ssr`);
- `content_mobile` - нативный мобильный рендер (`mobileAPP`).

## Архитектура на уровне модулей

- `src/craft` - визуальные компоненты конструктора (`Body`, `Block`, `Text`, `Image`, `LinkText`, `ContentList`);
- `src/pages/builder` - экран конструктора, режимы Web/RN, панели настроек и стили;
- `src/api` - API-адаптеры к extranet (`pages`, `content/items`, опционально `content/types`);
- `src/utils` - в т.ч. локализация craft-текста (`craftLocalizedText.ts`, `i18nTranslations.ts`);
- `src/core` - общие UI/иконки/утилиты.

## Контракт коллекций и контента

Для `ContentList` используется единый контракт между Builder -> SSR -> Mobile:

- `selectedSource` всегда хранит `content_type_id` (UUID), а не "products" или иной текстовый alias;
- данные элементов загружаются через:
  `GET /v3/sites/{domain}/content/items?filter={"content_type_id":["<UUID>"]}`;
- endpoint `GET /v3/sites/{domain}/content/types` используется опционально (для UI выбора типа).

### API-сигнатуры (builder)

- `fetchContentItems(domain, contentTypeId, params?)` -> `IContentItem[] | null`;
- `fetchContentTypes(domain, params?)` -> `ContentType[] | null`;
- `getCollectionByKey(domain, key)` -> `CollectionInfo | null`, где `key` = `content_type_id`.

## Glossary

- `ContentType` - тип контента (схема полей), приходит из `content/types`;
- `IContentItem` - элемент контента (запись), приходит из `content/items`;
- `selectedSource` - выбранный источник `ContentList`, строго UUID `content_type_id`.
- `translate` / `translate_mobile` - словари переводов страницы для веб- и мобильного craft-дерева;
- `i18nKey` - ключ строки в словаре переводов, хранится в пропсах `Text` / `LinkText` рядом с `text`.

Минимальная форма `IContentItem`:

```ts
{
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

## Data flow

1. В Builder пользователь выбирает `selectedSource` в `ContentList`.
2. При сохранении страницы уходят `content` и `content_mobile`.
3. SSR и Mobile читают `selectedSource` как `content_type_id`.
4. Runtime получает items по `content/items` и рендерит шаблон ячейки с `ContentDataContext`.

## Локализация страницы (i18n, этап builder)

Цель: один layout (craft JSON), отдельные строки по языкам (`ru` / `en`), переключатель языка в хедере.

- **Поля страницы (контракт API):** `translate` и `translate_mobile` — объекты вида `{ ru: { [key]: string }, en: { ... } }` (типы в `src/api/extranet.ts`). Вместе с `content` / `content_mobile` уходят в теле сохранения (`BuilderHeader`).
- **Связь узла с переводом:** у `Text` и `LinkText` в пропсах хранится `i18nKey` (стабильный ключ вида `txt_<nodeId>_text`); значение для активной локали пишется в соответствующий словарь (`translate` для WEB, `translate_mobile` для APP).
- **Контекст:** `BuilderModeContext` держит `activeLocale`, `translateWeb` / `translateMobile` и сеттеры; при отображении и сохранении черновика используется `src/utils/craftLocalizedText.ts`.
- **Утилиты словарей:** `src/utils/i18nTranslations.ts` — нормализация/merge, резолв строки по локали, сбор использованных ключей из JSON, `prune` неиспользуемых ключей при сохранении, временный `localStorage` по `pageId`, пока бэкенд не отдаёт/не хранит `translate*`.
- **Загрузка страницы:** в `BuilderPage` словари с API нормализуются и мержатся с локально сохранёнными переводами, чтобы не терять правки после перезагрузки.
- **Рантайм:** резолв переводов на витрине (SSR) и в мобилке — отдельный этап; в `site-runtime-ssr` / `mobileAPP` пока не дублируем эту логику в этом репозитории без явной задачи.

## ContentList в редакторе (актуальный pipeline)

Текущий pipeline редактирования/сохранения для `ContentList`:

1. **compact (save-time)** - при `Save/Publish` JSON сначала проходит через
   `compactContentListCells`, где сохраняется только шаблонная ячейка `cell-0`,
   а дублированные `cell-1..N` удаляются.
2. **seed (editor-time)** - в редакторе шаблон из `cell-0` разворачивается в пустые целевые ячейки,
   чтобы пользователь видел структуру и мог править сетку.
3. **sync (editor-time)** - изменения шаблона мягко/жестко синхронизируются между ячейками,
   чтобы сохранялась одинаковая структура и props.
4. **delete fallback** - удаление узла делает `actions.delete`, но при ошибках Craft
   используется fallback через `serialize -> removeSerializedSubtree -> deserialize`.

Это поведение фиксирует единый контракт: в сохраненном JSON хранится шаблон, а не runtime-дубли.

## Запуск

```bash
npm install
npm run dev
```
