import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, MouseEvent } from "react"
import { useEditor } from "@craftjs/core"
import { AddIcon } from "../../../../icons/AddIcon.tsx"
import { ChevronDownIcon } from "../../../../icons/ChevronDownIcon.tsx"
import { COLORS } from "../../../../theme/colors.ts"
import { CONTENT_FIELD_TYPES } from "../../../../api/extranet.ts"
import type { IContentItem } from "../../../../api/extranet.ts"
import { useContentListData } from "../../context/ContentListDataContext.tsx"
import { useBuilderTemplatePage } from "../../context/BuilderTemplatePageContext.tsx"
import { useCollectionsContext } from "../../context/CollectionsContext.tsx"
import { resolveNodeDisplayName } from "../../../../utils/resolveNodeDisplayName.ts"
import { CRAFT_DISPLAY_NAME } from "../../../../craft/craftDisplayNames.ts"
import { SettingsAccordion } from "../components/SettingsAccordion/SettingsAccordion.tsx"
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "../../../../utils/contentFieldValue.ts"
import { useBuilderModeContext } from "../../context/BuilderModeContext.tsx"
import { MODE_TYPE } from "../../builder.enum.ts"
import { makeTextI18nKey } from "../../../../utils/i18nTranslations.ts"
import {
  CraftSettingsResetLabelWithPopper
} from "../../components/craftSettingsControls/CraftSettingsResetLabelWithPopper.tsx"
import {
  CollectionFieldIconWrap,
  CollectionFieldName,
  ConnectBlock,
  ConnectBlockTitle,
  ConnectButton,
  ConnectDot,
  ConnectEmptyMessage,
  ConnectFieldIcon,
  ConnectFieldLabel,
  ConnectFieldList,
  ConnectFieldRow,
  ConnectSearchIconArea,
  ConnectSearchInput,
  ConnectSearchShell,
  ConnectSectionHeader,
  ConnectSectionTitle,
  FieldsRoot,
  SearchIconSvg,
  TextInput,
  TextInputShell,
  TextInputShellConnected,
  TextRow,
} from "./styles.ts"
import { TextFieldsIcon } from "../../../../icons/TextFieldsIcon.tsx";

const getDefaultTextForDisplayName = (displayName: string | null): string => {
  if (displayName === CRAFT_DISPLAY_NAME.LinkText) return "Ссылка"

  return "Заголовок"
}

interface SelectedTextProps {
  text?: string
  i18nKey?: string | null
  collectionField?: string | null
}

interface EditorSelection {
  selectedId: string | null
  selectedProps: SelectedTextProps | null
  parentCollectionKey: string | null
  selectedDisplayName: string | null
}

interface CollectionFieldOption {
  id: string
  label: string
  fieldType: CONTENT_FIELD_TYPES | string
}

interface Props {
  /** Если true — рендерится как аккордеон в правой панели, иначе — как простой блок в модалке. */
  asAccordion?: boolean
  nodeId?: string
}
const FieldTypeIcon = ({ connected = false }: { connected?: boolean}) => {
  const fill = connected ? COLORS.white : COLORS.gray600

  return (
    <TextFieldsIcon fill={fill}/>
  )
}

export const TextSettingsFields = ({ asAccordion, nodeId }: Props) => {
  const { actions } = useEditor()
  const { selectedId, selectedProps, parentCollectionKey, selectedDisplayName } = useEditor(
    (state, query): EditorSelection => {
      const id = nodeId ?? (Array.from(state.events.selected)[0] as string | undefined) ?? null
      const node = id ? state.nodes[id] : null

      let foundCollectionKey: string | null = null

      if (id) {
        try {
          const ancestors: string[] = query.node(id).ancestors(true) as string[]
          for (const ancestorId of ancestors) {
            const ancestorNode = query.node(ancestorId).get()
            const displayName = resolveNodeDisplayName(ancestorNode)

            if (displayName === CRAFT_DISPLAY_NAME.ContentList) {
              const selectedSource = (ancestorNode.data.props as { selectedSource?: string })
                ?.selectedSource
              if (selectedSource) {
                foundCollectionKey = selectedSource
              }
              break
            }
          }
        } catch {
          // пока игнор
        }
      }

      return {
        selectedId: id ?? null,
        selectedProps: (node?.data.props as SelectedTextProps) ?? null,
        parentCollectionKey: foundCollectionKey,
        selectedDisplayName: node ? resolveNodeDisplayName(node) : null,
      }
    },
  )

  const defaultText =
    useMemo(() => getDefaultTextForDisplayName(selectedDisplayName), [selectedDisplayName])

  const contentListData = useContentListData()
  const modeContext = useBuilderModeContext()
  const { templatePageCollectionKey, templatePreviewItem } = useBuilderTemplatePage()
  const collectionsContext = useCollectionsContext()
  const [textDraft, setTextDraft] = useState<string>(selectedProps?.text ?? "")
  const [isConnectHovered, setIsConnectHovered] = useState(false)
  const [isConnectOpen, setIsConnectOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setTextDraft(selectedProps?.text ?? "")
  }, [selectedProps?.text])

  useEffect(() => {
    if (!isConnectOpen) {
      setSearchQuery("")
    }
  }, [isConnectOpen])

  const effectiveCollectionKey =
    contentListData?.collectionKey ??
    parentCollectionKey ??
    templatePageCollectionKey

  const collectionFields = useMemo((): CollectionFieldOption[] => {
    if (!effectiveCollectionKey || !collectionsContext) {
      return []
    }

    const collection = collectionsContext.collections.find(
      (collectionItem) => collectionItem.key === effectiveCollectionKey,
    )

    if (!collection?.fields?.length) {
      return []
    }

    return collection.fields.map((field) => ({
      id: field.id,
      label: field.name,
      fieldType: field.field_type,
    }))
  }, [effectiveCollectionKey, collectionsContext])

  const filteredCollectionFields = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) {
      return collectionFields
    }

    return collectionFields.filter((field) =>
      field.label.toLowerCase().includes(normalized),
    )
  }, [collectionFields, searchQuery])

  const isCollectionAvailable = Boolean(
    effectiveCollectionKey && collectionFields.length > 0,
  )

  const collectionField = selectedProps?.collectionField ?? null
  const isCollectionConnected = Boolean(collectionField)

  const connectedField = useMemo(
    () => collectionFields.find((field) => field.id === collectionField) ?? null,
    [collectionField, collectionFields],
  )

  const hasResettableValue = isCollectionConnected || (selectedProps?.text ?? defaultText) !== defaultText

  if (!selectedId || !selectedProps) {
    return null
  }

  const handleReset = () => {
    setTextDraft(defaultText)
    setIsConnectOpen(false)
    actions.setProp(selectedId, (props: SelectedTextProps) => {
      props.text = defaultText
      props.collectionField = null
      props.i18nKey = null
    })
    if (modeContext && selectedProps.i18nKey) {
      const setTranslations =
        modeContext.mode === MODE_TYPE.WEB
          ? modeContext.setTranslateWeb
          : modeContext.setTranslateMobile
      const currentTranslations =
        modeContext.mode === MODE_TYPE.WEB
          ? modeContext.translateWeb
          : modeContext.translateMobile
      const { [selectedProps.i18nKey]: _removed, ...restLocale } =
      currentTranslations[modeContext.activeLocale] ?? {}
      setTranslations({
        ...currentTranslations,
        [modeContext.activeLocale]: restLocale,
      })
    }
  }

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setTextDraft(value)
    const nextI18nKey =
      selectedProps?.i18nKey && selectedProps.i18nKey.trim().length > 0
        ? selectedProps.i18nKey
        : makeTextI18nKey(selectedId, "text")
    actions.setProp(selectedId, (props: SelectedTextProps) => {
      props.text = value
      props.i18nKey = nextI18nKey
      props.collectionField = null
    })
    if (modeContext) {
      const setTranslations =
        modeContext.mode === MODE_TYPE.WEB
          ? modeContext.setTranslateWeb
          : modeContext.setTranslateMobile
      const currentTranslations =
        modeContext.mode === MODE_TYPE.WEB
          ? modeContext.translateWeb
          : modeContext.translateMobile
      setTranslations({
        ...currentTranslations,
        [modeContext.activeLocale]: {
          ...currentTranslations[modeContext.activeLocale],
          [nextI18nKey]: value,
        },
      })
    }
  }

  const resolveCollectionText = (fieldId: string | null): string | undefined => {
    if (!fieldId) return undefined
    const item =
      (contentListData?.itemData as IContentItem | undefined) ?? templatePreviewItem
    if (!item) return undefined
    return getContentFieldDisplayValue(findContentItemField(item, fieldId))
  }

  const handleCollectionFieldSelect = (fieldId: string) => {
    actions.setProp(selectedId, (props: SelectedTextProps) => {
      props.collectionField = fieldId

      const resolved = resolveCollectionText(fieldId)
      if (resolved !== undefined) {
        props.text = resolved
      }
    })
  }

  const handleOpenConnect = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setIsConnectOpen((current) => !current)
  }

  const InputShell = isCollectionConnected ? TextInputShellConnected : TextInputShell

  const content = (
    <FieldsRoot>
      <TextRow>
        <CraftSettingsResetLabelWithPopper
          kind="buttonToggle"
          label="Text"
          withoutLabel={false}
          onReset={handleReset}
          hasResettableValue={hasResettableValue}
          disableResetPopperPortal={!asAccordion}
        />

        <InputShell>
          {isCollectionAvailable && (
            <ConnectButton
              role="button"
              tabIndex={0}
              onMouseEnter={() => setIsConnectHovered(true)}
              onMouseLeave={() => setIsConnectHovered(false)}
              onClick={handleOpenConnect}
            >
              {isConnectHovered ? (
                <AddIcon height={8} width={8} fill={COLORS.white}/>
              ) : (
                <ConnectDot/>
              )}
            </ConnectButton>
          )}

          {isCollectionConnected && connectedField ? (
            <>
              <CollectionFieldIconWrap>
                <FieldTypeIcon connected/>
              </CollectionFieldIconWrap>
              <CollectionFieldName title={connectedField.label}>
                {connectedField.label}
              </CollectionFieldName>
            </>
          ) : (
            <TextInput
              type="text"
              value={textDraft}
              onChange={handleTextChange}
            />
          )}
        </InputShell>
      </TextRow>

      {isConnectOpen && isCollectionAvailable && (
        <ConnectBlock>
          <ConnectBlockTitle>Подключение к данным</ConnectBlockTitle>

          <ConnectSearchShell>
            <ConnectSearchIconArea>
              <SearchIconSvg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="5.25" cy="5.25" r="3.25" stroke={COLORS.gray600} strokeWidth="1"/>
                <path d="M8 8L10.5 10.5" stroke={COLORS.gray600} strokeWidth="1" strokeLinecap="round"/>
              </SearchIconSvg>
            </ConnectSearchIconArea>
            <ConnectSearchInput
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Поиск по переменным"
            />
          </ConnectSearchShell>

          <ConnectSectionHeader>
            <ChevronDownIcon size={12} fill={COLORS.gray600}/>
            <ConnectSectionTitle>Переменные</ConnectSectionTitle>
          </ConnectSectionHeader>

          <ConnectFieldList>
            {filteredCollectionFields.length === 0 ? (
              <ConnectEmptyMessage>Переменные не найдены</ConnectEmptyMessage>
            ) : (
              filteredCollectionFields.map((field) => (
                <ConnectFieldRow
                  key={field.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCollectionFieldSelect(field.id)}
                >
                  <ConnectFieldIcon>
                    <FieldTypeIcon/>
                  </ConnectFieldIcon>
                  <ConnectFieldLabel title={field.label}>{field.label}</ConnectFieldLabel>
                </ConnectFieldRow>
              ))
            )}
          </ConnectFieldList>
        </ConnectBlock>
      )}
    </FieldsRoot>
  )

  return (
    <SettingsAccordion asAccordion={asAccordion} title="Text settings">
      {content}
    </SettingsAccordion>
  )
}
