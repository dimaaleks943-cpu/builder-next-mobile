# craftStylesComponents

Панель стилей конструктора (правая колонка, вкладка **Style**). Каждый аккордеон редактирует CSS-свойства выбранного элемента через хук `useStyleEditing` и поддерживает **responsive-стили** по текущему viewport (`usePreviewViewport`).

Аккордеоны не рендерятся, если нет выбранного элемента (`selectedId`).

Режим **RN** (`MODE_TYPE.RN`) скрывает часть web-only контролов (см. пометки в описаниях).

---

## BackgroundAccordion — «Фон»

Управляет заливкой и многослойным фоном.

При добавление "Image & Gradient" открывается Poper с настройкой. Поле Type определяет 4 режима:
{ id: "url", content: <AssetsIcon size={16} fill={iconFill}/> },
{ id: "linear-gradient", content: <GradientRoundedIcon size={16} fill={iconFill}/> },
{ id: "radial-gradient", content: <RadialGradientIcon size={16} fill={iconFill}/> },
{ id: "overlay", content: <OverlayRoundedIcon size={16} fill={iconFill}/> },
До дефолту превым устанавливается url, в craftElement сразу попадают эти параметеры:
background-image: url(/src/assets/background-image.svg);
background-position: 0px 0px;
background-size: auto;

Так же ниже в Poper предлает настройку:
background-image - можно выбрать изображение, хнраить ссылку урл на картинку
background-size: где кнопку custom - устанавливает auto, и позволяет записать значения with и height
background-position - настройка background-position
background-repeat
background-attachment

Пользотваель может настроесть все эти CSS свой-ва, если пользователь переключается на linear-gradient либо любой другой режим все эти свой-ва удаляются и устанавливается:
background-image: linear-gradient(black, white);
В этом режиме мы управляем background-image

При установке radial-gradient мы удаляем всё что поставили в других режимах и устанавливаем:
background-image: radial-gradient(circle, black, rgb(38, 38, 38) 17%, white);
Все настройки внутри управляют background-image

4 режим устанавливает overlay:   
background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5));

Когда пользователь переключается между режимами прошлый настройки удаляются!



Настроек может быть несколько. Пользователь может установить несколько настроек фона:
Пример хранения:
background-image: url(https://cdn.prod.website-files.com/6940fbf…/6940fc5…_c2f5c949-97e3-4088-8145-d0f7c234301d.avif), url(https://cdn.prod.website-files.com/6940fbf…/6940fc4…_2a0fe3a7-a7ca-4fc6-babf-2360a8073238.avif);
background-position: 100% 0%, 50% 50%;
background-size: contain, cover;
background-repeat: repeat-y, repeat-x;
background-attachment: scroll, fixed;

Каждая настройка отображается в аккордионе как SortableBackgroundLayerRow, при клике на неё я могу отдельо отредактировать выбраный фон, так же есть сортировку, кнопка удаления и кнока hide.
Кнопка удаления - удаляем этот фон
Кнопка hide - отключет его, пользователь может потом включить обратно
Сортировка меняет порядок нескольких фонов

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
