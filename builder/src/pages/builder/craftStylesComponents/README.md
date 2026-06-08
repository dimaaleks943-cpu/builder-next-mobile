# craftStylesComponents

Панель стилей конструктора — правая колонка, вкладка **Style**. Каждый аккордеон редактирует CSS выбранного элемента через `useStyleEditing` с учётом текущего viewport (`usePreviewViewport`).

- Аккордеоны не рендерятся без выбранного элемента (`selectedId`).
- В режиме **RN** (`MODE_TYPE.RN`) часть web-only контролов скрыта (см. пометки в описаниях аккордеонов).

---

## Сброс стилей (Reset)

Общий механизм для всех аккордеонов. Поля с явно заданным значением показывают кликабельный label; по клику открывается popper с кнопкой **Сброс** (также **Alt + click** на label).

Реализован через `labelReset` (`hasValue` + `onReset`) в контролах `CraftSettingsSelect`, `CraftSettingsInput`, `CraftSettingsColorField` и аналогах.

**Что делает сброс:** `onReset` записывает `undefined` в responsive-ветку style class элемента (`setStyleProp` / `setResponsiveStyleProp`). Свойство **удаляется из craft element** — в JSON узла его больше нет, элемент снова наследует браузерное / каскадное значение. Это не подстановка дефолта в UI, а именно отмена переопределения.

Кнопка сброса видна только пока `hasValue: true` — то есть пока свойство реально записано в стили текущего viewport.

---

## BackgroundAccordion — «Фон»

Управляет `background-color`, многослойным фоном (`background-image` и сопутствующие свойства) и clipping.

### Поток работы

1. Пользователь нажимает **+** у блока **Image & Gradient** — открывается `ImageGradientMenuPopper`.
2. Выбирает **Type** (режим заливки) и настраивает параметры в popper.
3. Слой появляется в списке как `SortableBackgroundLayerRow`; клик по строке снова открывает popper для редактирования этого слоя.
4. Можно добавить несколько слоёв — каждый со своим режимом и настройками.
5. Ниже списка слоёв — **Color** и **Clipping** (см. отдельные подразделы).

### Режимы Type (`ImageGradientMenuPopper`)

Переключатель **Type** — четыре режима:

| Режим | Иконка | Управляемые CSS-свойства |
|-------|--------|--------------------------|
| `url` | Assets | `background-image`, `background-size`, `background-position`, `background-repeat`, `background-attachment` |
| `linear-gradient` | Gradient | только `background-image` |
| `radial-gradient` | Radial | только `background-image` |
| `overlay` | Overlay | только `background-image` (равномерный цветной слой) |

**При смене режима настройки предыдущего режима сбрасываются** — в слой записываются дефолты нового режима.

#### `url` (по умолчанию при добавлении слоя)

Сразу в стили попадают:

```css
background-image: url(/src/assets/background-image.svg);
background-position: 0px 0px;
background-size: auto;
background-repeat: repeat;
background-attachment: scroll;
```

В popper доступно:

- **background-image** — выбор изображения, хранится URL;
- **background-size** — пресеты или **custom** (`auto` + поля width / height);
- **background-position**;
- **background-repeat**;
- **background-attachment**.

#### `linear-gradient`

Сопутствующие url-свойства (`size`, `position`, `repeat`, `attachment`) очищаются. Устанавливается:

```css
background-image: linear-gradient(black, white);
```

Дальнейшие правки в секции редактора меняют только `background-image`.

#### `radial-gradient`

Аналогично — всё от других режимов сбрасывается, устанавливается дефолт:

```css
background-image: radial-gradient(circle, black, white);
```

Редактор управляет только `background-image`.

#### `overlay`

Устанавливается равномерный полупрозрачный слой:

```css
background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5));
```

Цвет настраивается полем **Color** в popper.

### Несколько слоёв

Пользователь может добавить несколько фонов. В painted CSS значения объединяются через запятую (по одному значению на видимый слой):

```css
background-image: url(…avif), url(…avif);
background-position: 100% 0%, 50% 50%;
background-size: contain, cover;
background-repeat: repeat-y, repeat-x;
background-attachment: scroll, fixed;
```

Каждый слой — строка `SortableBackgroundLayerRow`:

| Действие | Поведение |
|----------|-----------|
| Клик по строке | Открыть popper и редактировать выбранный слой |
| Drag | Изменить порядок слоёв (и соответствующих comma-значений) |
| Delete | Удалить слой |
| Hide | Скрыть слой с канваса; настройки сохраняются, слой можно включить обратно |

### Color

Поле **Color** (`CraftSettingsColorField`) задаёт `background-color` — сплошную заливку под слоями Image & Gradient.

- Поддерживает CSS-переменные (`withVariables`).
- Обычный цвет коммитится с debounce ~200 ms; переменная — сразу.
- В UI до первого изменения показывается `#ffffff`; после записи в style class отображается фактическое значение элемента.

### Clipping

Селект **Clipping** (`CraftSettingsSelect`) управляет обрезкой фона. Записывает пару свойств в style class:

| Значение в UI | CSS |
|---------------|-----|
| None | `background-clip: border-box`, `-webkit-text-fill-color: inherit` |
| Clip background to padding | `background-clip: padding-box` |
| Clip background to content | `background-clip: content-box` |
| Clip background to text | `background-clip: text`, `-webkit-text-fill-color: transparent` |

**Сброс** (см. общий раздел выше): `handleClipReset` удаляет `backgroundClip` и `WebkitTextFillColor` из craft element (`undefined` в текущем viewport). После сброса clipping снова определяется каскадом, а не переопределением в стилях узла. Кнопка сброса доступна, пока хотя бы одно из этих свойств явно задано (`hasClippingOverrides`).

### Хранение данных

Два уровня (паттерн как у `boxShadowDraft` в `EffectsAccordion`):

- **Node props** (builder-only) — полная модель слоёв: `backgroundImageLayers`, `backgroundImageLayerVisible`, `backgroundImageLayerIds`, `backgroundImageLayerSizes`, `backgroundImageLayerPositions`, `backgroundImageLayerRepeats`, `backgroundImageLayerAttachments`. Нужны для hide, drag-and-drop и per-layer редактирования. В runtime SSR не попадают.
- **Style class** — итоговый painted CSS (`background-image`, `background-size`, …) только для **видимых** слоёв; синхронизируется через `syncPaintedBackgroundStack`.

---

## Структура папки

```
craftStylesComponents/
├── LayoutAccordion/
├── PositioningAccordion/
├── SizeAccordion/
├── SpacingAccordion.tsx
├── BordersAccordion.tsx
├── EffectsAccordion/
│   ├── EffectsAccordion.tsx
│   ├── boxShadowUtils.ts
│   └── components/
├── BackgroundAccordion/
├── TypographyAccordion/
├── BorderSidesFrame.tsx
├── BackgroundPositionNineGrid/
├── GradientStopsTrackSection/
└── index.ts          # публичные экспорты
```

## Связанные хуки и контексты

- `useStyleEditing` — чтение/запись стилей выбранного узла.
- `usePreviewViewport` — breakpoint для responsive-стилей.
- `useBuilderModeContext` — web vs RN.
- `useBorderSidesControl` — выбор сторон border в `BordersAccordion`.
