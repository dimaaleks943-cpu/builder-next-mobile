# Формы (Craft)

Документация по блокам форм в билдере. Модель соответствует [Webflow Forms](https://developers.webflow.com/designer/reference/forms).

## Структура дерева

```
FormWrapper          — внешняя обёртка; preview state (builder-only)
├── FormForm         — поля и submit (div role="form" в билдере)
│   ├── FormInput    — обёртка поля
│   │   ├── FormBlockLabel
│   │   └── FormTextInput | FormTextarea | …
│   └── FormButton
├── FormSuccessMessage
└── FormErrorMessage
```

## Preview state (FormWrapper)

| Prop | Где | Описание |
|---|---|---|
| `previewState` | **FormWrapper** | `"normal" \| "success" \| "error"` — builder-only |

Настройка: выбрать **FormWrapper** → Настройки → **Form preview** → Preview state.

| Preview | На холсте |
|---|---|
| normal | FormForm |
| success | FormSuccessMessage |
| error | FormForm + FormErrorMessage |

## Submit settings (FormForm)

| Prop | Описание |
|---|---|
| `name` | Имя формы в submissions |
| `action` | Endpoint; пусто = API платформы |
| `method` | `get` \| `post` |
| `redirect` | URL после успеха |

Настройка: выбрать **FormForm** → Настройки → **Form submit**.

## Drag-and-drop

- **FormForm** в билдере — `<div role="form">`, не `<form>`: нативный `<form>` ломает Craft.js DnD.
- В **FormForm** можно: `FormInput`, `FormButton`, `Block`.
- `canMoveIn` использует `resolveCraftNodeResolvedName` (displayName + resolvedName).

## Field props

См. `FormFieldSettingsFields` для TextInput, Textarea, Label, Submit.

## Планируется

- Select, Checkbox, Radio, File upload, reCAPTCHA
- Runtime (`site-runtime-ssr`, `mobileAPP`)
