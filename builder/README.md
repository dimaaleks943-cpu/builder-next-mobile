# Builder (конструктор контента)

`builder` - редактор страниц на базе Craft.js. Он формирует JSON-дерево компонентов для двух
рендеров:

- `content` - веб-рендер (`site-runtime-ssr`);
- `content_mobile` - нативный мобильный рендер (`mobileAPP`).

## Архитектура на уровне модулей

- `src/craft` - визуальные компоненты конструктора (`Body`, `Block`, `Text`, `Image`, `LinkText`, `ContentList`);
- `src/pages/builder` - экран конструктора, режимы Web/RN, панели настроек и стили;
- `src/api` - API-адаптеры к extranet (`pages`, `content/items`, опционально `content/types`);
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
