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

### Поля с Reset

| Поле | Поведение сброса |
|------|------------------|
| **Clipping** | Удаляет `backgroundClip` и `WebkitTextFillColor` из craft element |

**Color** и слои Image & Gradient — без `labelReset` (удаление слоя / смена режима Type — отдельная логика).

---

## EffectsAccordion — «Эффекты»

Управляет визуальными эффектами: наложение (`mix-blend-mode`), прозрачность, обводка и тень блока.

> **RN:** весь аккордеон кроме **Opacity** скрыт (`MODE_TYPE.RN`).

### Поток работы

1. **Opacity** — всегда доступна; движение слайдера сразу пишет `opacity` в style class.
2. **Blending** (web) — селект `mix-blend-mode`; значение `normal` снимает переопределение.
3. **Outline** (web) — переключатель стиля; при выборе `solid` / `dashed` / `dotted` появляются **Width**, **Offset**, **Color**.
4. **Box shadows** (web) — кнопка **+** создаёт тень с дефолтами и открывает `BoxShadowSettingsPopper`; строка тулбара позволяет редактировать, скрывать с канваса и удалять.

### Opacity

Слайдер **0–100%**. В style class хранится CSS-дробь `0–1`. Значение **100%** не записывается — свойство удаляется из craft element.

### Blending

Селект **Blending** → `mix-blend-mode`. Опция **normal** удаляет свойство из craft element.

### Outline

Переключатель **Outline** — четыре режима: `none`, `solid`, `dashed`, `dotted`.

| Режим | CSS |
|-------|-----|
| `none` | удаляет `outline` и `outlineOffset` |
| `solid` / `dashed` / `dotted` | `outline: {color} {style} {width}px` |

При активном outline доступны:

- **Width** — толщина в `outline` shorthand;
- **Offset** → `outline-offset` (`0` удаляет свойство);
- **Color** — цвет в `outline` shorthand.

### Box shadows

#### Тулбар (`BoxShadowToolbar`)

| Действие | Поведение |
|----------|-----------|
| **+** / клик по строке | Открыть popper; при первом добавлении — дефолтная тень в style class |
| **Hide** | Убрать `box-shadow` с канваса; строка сохраняется в node prop `boxShadowDraft` |
| **Show** | Вернуть тень из `boxShadowDraft` в style class |
| **Delete** | Удалить `boxShadow` и `boxShadowDraft` полностью |

Дефолт при добавлении:

```css
box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
```

#### Popper (`BoxShadowSettingsPopper`)

| Поле | CSS | Reset |
|------|-----|-------|
| **Type** | `inset` в `box-shadow` | ✓ — возврат к `outside` (дефолт) |
| **X** | offset X | ✓ — `0px` |
| **Y** | offset Y | ✓ — `2px` |
| **Blur** | blur | ✓ — `5px` |
| **Size** | spread | ✓ — `0px` |
| **Color** | цвет тени | ✓ — `rgba(0, 0, 0, 0.2)` |

> Reset в popper тени **возвращает параметр к дефолту внутри конфигурации**, а не удаляет `box-shadow` из craft element. Полное удаление — только **Delete** на тулбаре.

### Хранение данных (box-shadow)

- **Style class** — painted `box-shadow` (видно на канвасе).
- **Node prop** `boxShadowDraft` (builder-only) — сохранённая строка тени при **Hide**; аналог `backgroundImageLayers` в BackgroundAccordion.

### Поля с Reset

| Поле | Тип сброса |
|------|------------|
| **Box shadows → Type** | К дефолту (`outside`) |
| **Box shadows → X, Y, Blur, Size** | К дефолтным длинам |
| **Box shadows → Color** | К дефолтному цвету (`labelReset`) |
| **Blending** | Неявный: опция `normal` удаляет `mixBlendMode` |
| **Opacity** | Неявный: `100%` удаляет `opacity` |
| **Outline** | Неявный: режим `none` удаляет `outline` и `outlineOffset` |

**Width**, **Offset**, **Color** outline — без отдельного `labelReset`.

---

## LayoutAccordion — «Расположение»

Управляет `display`, flex/grid-раскладкой и `gap`. Секции flex и grid показываются в зависимости от текущего `display`.

> **RN:** доступен только **flex**; inline-режимы и grid-секция скрыты. Flex-секция видна при `display: flex` или `display: grid`.

### Поток работы

1. **Display** — выбор типа раскладки (блок / флекс / сетка + inline-варианты).
2. При `flex` / `inline-flex` — секция **Direction**, **Align**, **Gap**.
3. При `grid` / `inline-grid` (web) — секция **Grid** (columns/rows), **Direction** (`grid-auto-flow`), **Align** (`place-items`), **Gap**, кнопка ручного редактирования сетки.

### Display (`LayoutDisplayControl`)

| UI | `display` |
|----|-----------|
| Блок | `block` |
| Флекс | `flex` |
| Сетка | `grid` |
| В строке → `none` | свойство **удаляется** из craft element |
| В строке → `inline-block` / `inline-flex` / `inline-grid` | соответствующее значение |

### Flex-секция

Показывается при `display: flex` или `inline-flex` (в RN — также при `grid`).

| Поле | CSS | Описание |
|------|-----|----------|
| **Direction** | `flex-flow` | Row / column, wrap, расширенное меню вариантов |
| **Align** | `justify-content`, `align-items` | Сетка 3×3 + селекты X / Y; оси зависят от `flex-flow` |
| **Gap** | `gap` | Слайдер 0–100 px |

### Grid-секция (web)

Показывается при `display: grid` или `inline-grid`.

| Поле | CSS | Описание |
|------|-----|----------|
| **Grid → Columns** | `grid-template-columns`, `itemsPerRow` | Число колонок → `repeat(n, minmax(0, 1fr))` |
| **Grid → Rows** | `grid-template-rows` | Число строк |
| **Grid → ⚙** | — | Открывает ручное редактирование сетки на канвасе |
| **Direction** | `grid-auto-flow` | `row` / `column` |
| **Align** | `place-items` | Сетка выравнивания ячеек (`CraftAlignControl`) |
| **Gap** | `gap` | Общий с flex-секцией |

### Поля с Reset

| Поле | Поведение сброса |
|------|------------------|
| **Direction** (flex) | Удаляет `flexFlow` из craft element |
| **Align** (flex) | Удаляет `justifyContent` и `alignItems` (клик по фиолетовому label) |
| **Grid** (label) | Удаляет `gridTemplateColumns`, `gridTemplateRows`, `itemsPerRow` |
| **Direction** (grid) | Удаляет `gridAutoFlow` |
| **Align** (grid) | Удаляет `placeItems` (`labelReset`) |

**Display**, **Gap**, поля **Columns** / **Rows** — без `labelReset`. Снятие `display` — через пункт **none** в меню «В строке».

---

## PositioningAccordion — «Позиционирование»

Управляет `position`, `inset`, `z-index`, `float` и `clear`.

### Поток работы

1. **Position** — выбор режима позиционирования.
2. При `position` ≠ `static` — блок **Inset** (пресеты + пошаговая настройка сторон), **Relative to** и **z-Index**.
3. Секция **Float and clear** раскрывается отдельной кнопкой — **Float** и **Clear**.

### Position

Селект **Position** → CSS `position`.

| Значение | Поведение |
|----------|-----------|
| `static` | Свойство **удаляется** из craft element; блок Inset скрывается |
| `relative` | `position: relative`; `inset` **очищается** |
| `absolute` | `position: absolute`; доступен Inset |
| `fixed` | `position: fixed`; доступен Inset |
| `sticky` | `position: sticky`; `inset` **очищается** |

### Inset

Показывается при `position: absolute` или `position: fixed`.

#### Пресеты (9 иконок)

Быстрая привязка к краям / центру. Примеры значений:

| Пресет | `inset` |
|--------|---------|
| Верхний левый угол | `0% auto auto 0%` |
| Верхний правый | `0% 0% auto auto` |
| Нижний левый | `auto auto 0% 0%` |
| Растянуть на 0% | `0%` (все стороны) |

Полный список — `INSET_OPTIONS` в `positioningAccordion.const.tsx`.

#### Ручная настройка сторон

Визуальный блок **top / right / bottom / left**. Клик по стороне открывает popper:

- слайдер с единицами (`px`, `%`, `em`, …);
- пресеты: **Auto**, `0`, `10`, `20`, `40`, `60`, `100`, `140`, `220`;
- **Сброс** стороны → `auto` для выбранной стороны (остальные стороны не меняются).

Значение пишется в одно свойство `inset` (shorthand `top right bottom left`).

### Relative to

Только отображение — **не пишет CSS**. Показывает имя ближайшего предка с `position: relative` (обход вверх от родителя выбранного узла). Клик по кнопке выделяет этот узел на канвасе. Если предка нет — «—», кнопка неактивна.

### z-Index

Поле **z-Index** (`CraftSettingsValueWithUnit`, unitless) → `z-index`. Placeholder **Auto** — до записи свойство отсутствует в craft element.

### Float and clear

Раскрывающаяся секция.

#### Float

Переключатель → `float`.

| Значение | CSS |
|----------|-----|
| `none` (иконка ✕) | свойство **удаляется** |
| `left` | `float: left` |
| `right` | `float: right` |

#### Clear

Переключатель → `clear`.

| Значение | CSS |
|----------|-----|
| `none` (иконка ✕) | свойство **удаляется** |
| `left` | `clear: left` |
| `right` | `clear: right` |
| `both` | `clear: both` |

### Поля с Reset

| Поле | Поведение сброса |
|------|------------------|
| **Inset → popper стороны** | Сторона → `auto` (внутри shorthand `inset`) |
| **Position** | Неявный: `static` удаляет `position`; `relative` / `sticky` удаляют `inset` |
| **Float** | Неявный: `none` удаляет `float` |
| **Clear** | Неявный: `none` удаляет `clear` |

**z-Index**, **Relative to** — без `labelReset`. Полное удаление `inset` — смена **Position** на `static`, `relative` или `sticky`.

---

## SizeAccordion — «Размеры»

Управляет размерами элемента, overflow, aspect ratio, box model и (для медиа) `object-fit` / `object-position`.

> **RN:** только **Width**, **Height**, **Min H** с единицами `CSS_SIZE_UNITS_RN`. Секции Overflow, More size options, Fit/Position скрыты.

### Поток работы

1. Сетка полей **Width** / **Height** / min / max (web) или **Width** / **Height** / **Min H** (RN).
2. **Overflow** (web) — переключатель видимости содержимого.
3. **More size options** (web) — **Ratio**, **Box size**.
4. **Fit** + кнопка **Position** (web) — поведение вложенного изображения / медиа.

### Размеры (Width / Height / Min / Max)

Поля `CraftSettingsValueWithUnit` → соответствующие CSS-свойства:

| Поле (web) | CSS | Примечание |
|------------|-----|------------|
| **Width** | `width` | |
| **Height** | `height` | |
| **Min W** | `min-width` | |
| **Min H** | `min-height` | |
| **Max W** | `max-width` | placeholder **None** |
| **Max H** | `max-height` | placeholder **None** |

| Поле (RN) | CSS |
|-----------|-----|
| **Width** | `width` |
| **Height** | `height` |
| **Min H** | `min-height` |

Пустое значение / снятие единицы удаляет свойство из craft element. Отдельного `labelReset` нет.

### Overflow (web)

Переключатель **Overflow** → `overflow`.

| Значение | CSS |
|----------|-----|
| visible | `overflow: visible` |
| hidden | `overflow: hidden` |
| clip | `overflow: clip` |
| scroll | `overflow: scroll` |
| auto | `overflow: auto` |

До первого выбора ни одна кнопка не подсвечена — свойство не задано.

### More size options (web)

#### Ratio

Селект **Ratio** → `aspect-ratio`.

| Значение | CSS |
|----------|-----|
| Auto | `aspect-ratio: auto` |
| Anamorphic (2.39:1) | `2.39 / 1` |
| Univisium/Netflix (2:1) | `2 / 1` |
| Widescreen (16:9) | `16 / 9` |
| Landscape (3:2) | `3 / 2` |
| Portrait (2:3) | `2 / 3` |
| Square (1:1) | `1 / 1` |
| Custom | произвольное `W / H`; при первом выборе без значения — дефолт `16 / 10` |

При **Custom** появляются поля **Width** и **Height** (числитель / знаменатель).

#### Box size

Переключатель **Box size** → `box-sizing`.

| Значение | CSS |
|----------|-----|
| border-box | `box-sizing: border-box` |
| content-box | `box-sizing: content-box` |

### Fit и Position (web)

Для элементов с вложенным изображением / медиа.

#### Fit

Селект **Fit** → `object-fit`: Fill, Contain, Cover, None, Scale down.

В UI до записи показывается **Fill**; первый клик по селекту записывает `object-fit: fill`, если свойство ещё не было задано.

#### Position

Кнопка **⋯** открывает popper **Position** → `object-position`:

- сетка 3×3 (`BackgroundPositionNineGrid`);
- поля **Left** и **Top** с единицами (`%`, `px`, …);
- дефолт в UI при отсутствии свойства: `50% 50%`.

### Поля с Reset

| Поле | Поведение сброса |
|------|------------------|
| **Overflow** | Удаляет `overflow` из craft element |
| **Ratio** | Удаляет `aspectRatio` (`labelReset`) |
| **Box size** | Удаляет `boxSizing` |
| **Fit** | Удаляет `objectFit` (`labelReset`) |
| **Position** (popper) | Удаляет `objectPosition` (`labelReset`) |

**Width**, **Height**, **Min W/H**, **Max W/H**, поля **Custom ratio** — без `labelReset`.

---

## SpacingAccordion — «Отступы»

Визуальный редактор **margin** и **padding** в виде вложенных блоков (box model).

### Поток работы

1. Внешний блок — **margin** (Top / Right / Bottom / Left).
2. Внутренний блок — **padding** (Top / Right / Bottom / Left).
3. Каждая сторона — числовое поле `EdgeInput`; изменение сразу пишет в style class.

### Поля

| Поле | CSS |
|------|-----|
| margin Top / Right / Bottom / Left | `margin-top`, `margin-right`, `margin-bottom`, `margin-left` |
| padding Top / Right / Bottom / Left | `padding-top`, `padding-right`, `padding-bottom`, `padding-left` |

Значения — числа (в craft element записываются как number, в UI отображаются в px-контексте). Если свойство не задано, в поле показывается **0**; при вводе `0` свойство **остаётся** в craft element (не удаляется).

### Поля с Reset

Нет — ни одно поле не использует `labelReset`.

---

## BordersAccordion — «Границы»

Управляет скруглением (`border-radius`) и обводкой (`border-*`).

### Поток работы

1. **Radius** — единый слайдер или по углам.
2. **Borders** — выбор сторон на схеме, затем **Style**, **Width**, **Color**, **Opacity**.

### Radius

Два режима (переключатель иконками):

| Режим | CSS | UI |
|-------|-----|-----|
| **Uniform** | `border-radius: N` (число px) | Слайдер 0–100% → 0–100 px |
| **Corners** | `border-radius: TL TR BR BL` | Четыре поля px (сетка 2×2: TL, TR, BL, BR) |

Переключение режима конвертирует текущее значение: uniform → среднее по углам; corners → shorthand из четырёх значений.

### Borders

#### Выбор сторон (`BorderSidesFrame`)

Схема 2×2 + кнопка «все стороны». Определяет, на какие стороны применяется **Width** и **Color**:

- **all** — все четыре стороны;
- подмножество — только выбранные;
- при переключении стороны снимаются через `border-*-width: 0`.

Состояние сторон — UI-контрол (`useBorderSidesControl`), в craft element пишутся per-side `borderTopWidth` и т.д.

#### Style

Переключатель → `border-style`: `none`, `solid`, `dashed`, `dotted`.

#### Width

Число px → записывается в `borderTopWidth` / `borderRightWidth` / `borderBottomWidth` / `borderLeftWidth` для **активных** сторон.

#### Color и Opacity

- **Color** → `border-color` (hex + alpha, debounce ~200 ms);
- **Opacity** → пересчитывает alpha в `border-color` (сразу, без debounce).

### Поля с Reset

Нет `labelReset`. Снятие обводки со стороны — через схему сторон (`width: 0`); `border-style: none` — через переключатель **Style**.

---

## TypographyAccordion — «Типографика»

Управляет шрифтом, цветом, выравниванием, декорацией, колонками, переносами и тенью текста.

### Поток работы

1. Основной блок: **Font**, **Weight**, **Size** / **Height**, **Color**, **Align**, **Format**.
2. Кнопка **More type options** раскрывает расширенные настройки.
3. Popper'ы: расширенное подчёркивание (⋯ у Format), колонки (⋯ у Columns), text shadow.

### Основной блок

| Поле | CSS | Описание |
|------|-----|----------|
| **Font** | `font-family` | Список шрифтов; **system** удаляет свойство |
| **Weight** | `font-weight` | `normal` (400) / `bold` (700); при выборе upload-шрифта может выставиться его дефолтный weight |
| **Size** | `font-size` | `CraftSettingsValueWithUnit` (px, em, rem, …) |
| **Height** | `line-height` | рядом с Size |
| **Color** | `color` | Переменные (`withVariables`); debounce ~200 ms |
| **Align** | `text-align` | left / center / right / justify |
| **Format** | `text-decoration`, `font-style` | Быстрые кнопки + popper (см. ниже) |

### Format (`TypographyFormatRow`)

| Кнопка | CSS |
|--------|-----|
| ✕ (Clear) | Удаляет `text-decoration`, `text-decoration-skip-ink`, `font-style` |
| Underline / Strikethrough / Overline | Toggle `text-decoration` (underline / line-through / overline) |
| Italic | Toggle `font-style: italic` |
| ⋯ | Popper **Настройки подчёркивания** |

#### Popper подчёркивания (`TypographyDecorationSettingsPopper`)

| Поле | CSS | Reset |
|------|-----|-------|
| **Line** | тип линии в `text-decoration` | ✓ → `none` |
| **Style** | solid / double / dotted / dashed / wavy | ✓ → solid (удаляет override) |
| **Thick** | толщина в `text-decoration` | ✓ → пусто |
| **Color** | цвет декорации | ✓ → пусто |
| **Skip ink** | `text-decoration-skip-ink` | ✓ → удаляет свойство (`auto` в UI) |

### More type options

Раскрывающаяся секция.

#### Letter spacing / Text indent / Columns

| Поле | CSS | Условие | Reset |
|------|-----|---------|-------|
| **Letter spacing** | `letter-spacing` | — | ✓ удаляет свойство |
| **Text indent** | `text-indent` | px, commit на blur / Enter | ✓ удаляет свойство |
| **Columns** | `column-count` | только при `display: grid` | ✓ удаляет свойство |
| **⋯** (колонки) | popper настроек колонок | — | см. ниже |

#### Capitalize

Переключатель → `text-transform`: `none`, `uppercase`, `capitalize`, `lowercase`. Без Reset.

#### Breaking (`TypographyBreakingRow`)

| Поле | CSS | Reset |
|------|-----|-------|
| **Word** (`word-break`) | `normal` удаляет свойство | ✓ |
| **Line** (`white-space`) | `normal` удаляет свойство | ✓ |

#### Wrap / Truncate (`TypographyWrapTruncateSection`)

| Поле | CSS | Reset |
|------|-----|-------|
| **Wrap** (`overflow-wrap`) | `normal` удаляет свойство | ✓ (`labelReset`) |
| **Truncate** (`text-overflow`) | `clip` / `ellipsis` | ✓ |

#### Stroke

| Поле | CSS | Reset |
|------|-----|-------|
| **Width** | `-webkit-text-stroke-width` | ✓ удаляет (при ≠ 0) |
| **Color** | `-webkit-text-stroke-color` | ✓ удаляет |

#### Text shadows

Аналог box-shadow из EffectsAccordion.

**Тулбар:** Add / Hide / Show / Delete.  
**Node prop** `textShadowDraft` — при Hide.  
**Дефолт при добавлении:** `0px 2px 4px rgba(0, 0, 0, 0.25)`.

**Popper:**

| Поле | Reset |
|------|-------|
| **X, Y, Blur** | К дефолтным длинам |
| **Color** | К `rgba(0, 0, 0, 0.25)` |

> Reset в popper text shadow возвращает к дефолту конфигурации; полное удаление — **Delete** на тулбаре.

### Popper колонок (`TypographyColumnsSettingsPopper`)

Открывается кнопкой **⋯** рядом с **Columns**.

| Поле | CSS | Условие | Reset |
|------|-----|---------|-------|
| **Gap** | `column-gap` | нужен `column-count` | ✓ удаляет |
| **Style** (разделитель) | `column-rule-style` | нужны columns + gap | ✓ удаляет |
| **Width** (разделитель) | `column-rule-width` | то же | ✓ удаляет |
| **Color** (разделитель) | `column-rule-color` | то же | ✓ удаляет |
| **Span** | `column-span` | `none` / `all`; нужен `column-gap` у родителя | ✓ удаляет |

При записи split-свойств (`column-rule-width` и т.д.) shorthand `column-rule` очищается.

### Поля с Reset (сводка)

| Поле | Поведение |
|------|-----------|
| **Align** | Удаляет `textAlign` |
| **Format → popper: Line, Style, Thick, Color, Skip ink** | См. таблицу popper |
| **Letter spacing, Text indent, Columns** | Удаляют соответствующее свойство |
| **Breaking → Word, Line** | Удаляют `wordBreak` / `whiteSpace` |
| **Wrap, Truncate** | Удаляют `overflowWrap` / `textOverflow` |
| **Stroke → Width, Color** | Удаляют stroke-свойства |
| **Text shadows → X, Y, Blur, Color** | К дефолтам конфигурации |
| **Columns popper → Gap, Style, Width, Color, Span** | Удаляют свойства |

**Font** (неявный): **system** удаляет `fontFamily`. **Format → Clear** удаляет декорацию и italic. Без Reset: **Size**, **Height**, **Color**, **Weight**, **Capitalize**.

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
