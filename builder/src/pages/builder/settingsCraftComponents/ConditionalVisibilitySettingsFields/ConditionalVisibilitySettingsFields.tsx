import { useMemo } from "react"
import { useEditor } from "@craftjs/core"
import { AddIcon } from "../../../../icons/AddIcon.tsx"
import { DeleteIcon } from "../../../../icons/DeleteIcon.tsx"
import { CRAFT_DISPLAY_NAME } from "../../../../craft/craftDisplayNames.ts"
import { resolveNodeDisplayName } from "../../../../utils/resolveNodeDisplayName.ts"
import { useBuilderModeContext } from "../../context/BuilderModeContext.tsx"
import { useBuilderTemplatePage } from "../../context/BuilderTemplatePageContext.tsx"
import { useCollectionsContext } from "../../context/CollectionsContext.tsx"
import { useContentListData } from "../../context/ContentListDataContext.tsx"
import { CraftSettingsButtonGroup } from "../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsInput } from "../../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsSelect } from "../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { SettingsAccordion } from "../components/SettingsAccordion/SettingsAccordion.tsx"
import {
  createDefaultConditionalVisibilityCondition,
  createDefaultConditionalVisibilityGroup,
  DEFAULT_CONDITIONAL_VISIBILITY_CONFIG,
  normalizeConditionalVisibilityConfig,
  resolveConditionalVisibilitySourceValue,
  type ConditionalVisibilityCondition,
  type ConditionalVisibilityConfig,
  type ConditionalVisibilityOperator,
  type ConditionalVisibilitySource,
  type ConditionalVisibilityValue,
} from "../../utils/conditionalVisibility"
import {
  ActionButton,
  Column,
  DangerButton,
  GroupHeader,
  GroupTitle,
  Hint,
  Root,
  Row,
  Section,
} from "./styles.ts"

interface Props {
  asAccordion?: boolean
  nodeId?: string
}

interface EditorSelection {
  selectedId: string | null
  selectedProps: Record<string, unknown> | null
  conditionalVisibilityRaw: unknown
  parentCollectionKey: string | null
}

interface SelectOption {
  id: string
  value: string
}

const GROUP_MATCH_OPTIONS: SelectOption[] = [
  { id: "all", value: "All conditions" },
  { id: "any", value: "Any condition" },
]

const GROUP_RESULT_OPTIONS: SelectOption[] = [
  { id: "visible", value: "Visible" },
  { id: "hidden", value: "Hidden" },
]

const ELSE_VISIBILITY_OPTIONS: SelectOption[] = [
  { id: "visible", value: "Visible" },
  { id: "hidden", value: "Hidden" },
]

const SOURCE_OPTIONS: SelectOption[] = [
  { id: "locale", value: "Locale" },
  { id: "collectionField", value: "Collection field" },
  { id: "componentProp", value: "Component prop" },
]

const OPERATOR_OPTIONS: SelectOption[] = [
  { id: "equals", value: "Equals" },
  { id: "notEquals", value: "Not equals" },
  { id: "contains", value: "Contains" },
  { id: "notContains", value: "Not contains" },
  { id: "greaterThan", value: "Greater than" },
  { id: "greaterOrEqual", value: "Greater or equal" },
  { id: "lessThan", value: "Less than" },
  { id: "lessOrEqual", value: "Less or equal" },
  { id: "isEmpty", value: "Is empty" },
  { id: "isNotEmpty", value: "Is not empty" },
  { id: "inList", value: "In list" },
  { id: "notInList", value: "Not in list" },
]

const isPrimitiveValue = (value: unknown): value is ConditionalVisibilityValue =>
  value === null ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean"

const parseValueFromInput = (value: string): ConditionalVisibilityValue => {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return ""
  }

  if (trimmed === "true") {
    return true
  }

  if (trimmed === "false") {
    return false
  }

  if (trimmed === "null") {
    return null
  }

  const numberValue = Number(trimmed)
  if (Number.isFinite(numberValue) && String(numberValue) === trimmed) {
    return numberValue
  }

  return value
}

const stringifyValue = (value: ConditionalVisibilityValue | undefined): string => {
  if (value === undefined) {
    return ""
  }

  if (value === null) {
    return "null"
  }

  return String(value)
}

const createSourceByKind = (params: {
  kind: string
  collectionFieldId: string | null
  componentPropKey: string | null
}): ConditionalVisibilitySource => {
  if (params.kind === "collectionField") {
    return {
      kind: "collectionField",
      fieldId: params.collectionFieldId ?? "",
    }
  }

  if (params.kind === "componentProp") {
    return {
      kind: "componentProp",
      propKey: params.componentPropKey ?? "",
    }
  }

  return { kind: "locale" }
}

export const ConditionalVisibilitySettingsFields = ({ asAccordion, nodeId }: Props) => {
  const { actions } = useEditor()
  const {
    selectedId,
    selectedProps,
    conditionalVisibilityRaw,
    parentCollectionKey,
  } = useEditor((state, query): EditorSelection => {
    const id = nodeId ?? (Array.from(state.events.selected)[0] as string | undefined) ?? null
    const node = id ? state.nodes[id] : null

    let foundCollectionKey: string | null = null
    if (id) {
      try {
        const ancestors: string[] = query.node(id).ancestors(true) as string[]
        for (const ancestorId of ancestors) {
          const ancestorNode = query.node(ancestorId).get()
          const displayName = resolveNodeDisplayName(ancestorNode)
          if (displayName !== CRAFT_DISPLAY_NAME.ContentList) {
            continue
          }

          const selectedSource = (ancestorNode.data.props as { selectedSource?: string })?.selectedSource
          if (selectedSource) {
            foundCollectionKey = selectedSource
          }
          break
        }
      } catch {
        // ignore
      }
    }

    const props = (node?.data.props as Record<string, unknown> | undefined) ?? null
    return {
      selectedId: id,
      selectedProps: props,
      conditionalVisibilityRaw: props?.conditionalVisibility,
      parentCollectionKey: foundCollectionKey,
    }
  })

  const modeContext = useBuilderModeContext()
  const contentListData = useContentListData()
  const { templatePageCollectionKey, templatePreviewItem } = useBuilderTemplatePage()
  const collectionsContext = useCollectionsContext()

  const config = useMemo(
    () => normalizeConditionalVisibilityConfig(conditionalVisibilityRaw),
    [conditionalVisibilityRaw],
  )

  const effectiveCollectionKey =
    contentListData?.collectionKey ?? parentCollectionKey ?? templatePageCollectionKey
  const effectiveCollectionItem = contentListData?.itemData ?? templatePreviewItem

  const collectionFieldOptions = useMemo((): SelectOption[] => {
    if (!effectiveCollectionKey || !collectionsContext) {
      return []
    }

    const collection = collectionsContext.collections.find((item) => item.key === effectiveCollectionKey)
    if (!collection?.fields?.length) {
      return []
    }

    return collection.fields.map((field) => ({
      id: field.id,
      value: field.name || field.id,
    }))
  }, [effectiveCollectionKey, collectionsContext])

  const componentPropOptions = useMemo((): SelectOption[] => {
    if (!selectedProps) {
      return []
    }

    return Object.entries(selectedProps)
      .filter(([key, value]) => key !== "conditionalVisibility" && isPrimitiveValue(value))
      .map(([key]) => ({
        id: key,
        value: key,
      }))
  }, [selectedProps])

  if (!selectedId) {
    return null
  }

  const updateConfig = (nextConfig: ConditionalVisibilityConfig) => {
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      props.conditionalVisibility = nextConfig
    })
  }

  const handleEnableChange = (value: string) => {
    updateConfig({
      ...config,
      enabled: value === "enabled",
    })
  }

  const handleElseVisibilityChange = (value: string) => {
    updateConfig({
      ...config,
      elseVisibility: value === "hidden" ? "hidden" : "visible",
    })
  }

  const handleResetAll = () => {
    updateConfig(DEFAULT_CONDITIONAL_VISIBILITY_CONFIG)
  }

  const handleAddGroup = () => {
    const group = createDefaultConditionalVisibilityGroup()
    group.priority = config.groups.length
    updateConfig({
      ...config,
      groups: [...config.groups, group],
    })
  }

  const handleRemoveGroup = (groupId: string) => {
    updateConfig({
      ...config,
      groups: config.groups.filter((group) => group.id !== groupId),
    })
  }

  const handleGroupChange = (
    groupId: string,
    updater: (group: ConditionalVisibilityConfig["groups"][number]) => ConditionalVisibilityConfig["groups"][number],
  ) => {
    updateConfig({
      ...config,
      groups: config.groups.map((group) => (group.id === groupId ? updater(group) : group)),
    })
  }

  const handleAddCondition = (groupId: string) => {
    handleGroupChange(groupId, (group) => ({
      ...group,
      conditions: [...group.conditions, createDefaultConditionalVisibilityCondition()],
    }))
  }

  const handleRemoveCondition = (groupId: string, conditionId: string) => {
    handleGroupChange(groupId, (group) => ({
      ...group,
      conditions: group.conditions.filter((condition) => condition.id !== conditionId),
    }))
  }

  const handleConditionChange = (
    groupId: string,
    conditionId: string,
    updater: (condition: ConditionalVisibilityCondition) => ConditionalVisibilityCondition,
  ) => {
    handleGroupChange(groupId, (group) => ({
      ...group,
      conditions: group.conditions.map((condition) =>
        condition.id === conditionId ? updater(condition) : condition,
      ),
    }))
  }

  const content = (
    <Root>
      <CraftSettingsButtonGroup
        label="Status"
        value={config.enabled ? "enabled" : "disabled"}
        options={[
          { id: "enabled", content: "Enabled" },
          { id: "disabled", content: "Disabled" },
        ]}
        onChange={handleEnableChange}
      />
      <CraftSettingsSelect
        label="Else visibility"
        value={config.elseVisibility}
        onChange={(event) => handleElseVisibilityChange(event.target.value)}
        options={ELSE_VISIBILITY_OPTIONS}
      />
      <Row>
        <ActionButton type="button" onClick={handleAddGroup}>
          <AddIcon width={10} height={10} />
          Add group
        </ActionButton>
        <DangerButton type="button" onClick={handleResetAll}>
          Reset
        </DangerButton>
      </Row>
      {config.groups.length === 0 && (
        <Hint>
          No groups configured. Fallback visibility uses <strong>{config.elseVisibility}</strong>.
        </Hint>
      )}
      {config.groups.map((group, groupIndex) => (
        <Section key={group.id}>
          <GroupHeader>
            <GroupTitle>Group {groupIndex + 1}</GroupTitle>
            <DangerButton type="button" onClick={() => handleRemoveGroup(group.id)}>
              <DeleteIcon size={12} />
              Remove group
            </DangerButton>
          </GroupHeader>
          <CraftSettingsInput
            label="Priority"
            type="number"
            value={group.priority}
            onChange={(event) => {
              const nextPriority = Number(event.target.value)
              handleGroupChange(group.id, (nextGroup) => ({
                ...nextGroup,
                priority: Number.isFinite(nextPriority) ? nextPriority : 0,
              }))
            }}
          />
          <CraftSettingsSelect
            label="Group match"
            value={group.matchType}
            onChange={(event) => {
              handleGroupChange(group.id, (nextGroup) => ({
                ...nextGroup,
                matchType: event.target.value === "any" ? "any" : "all",
              }))
            }}
            options={GROUP_MATCH_OPTIONS}
          />
          <CraftSettingsSelect
            label="Result visibility"
            value={group.resultVisibility}
            onChange={(event) => {
              handleGroupChange(group.id, (nextGroup) => ({
                ...nextGroup,
                resultVisibility: event.target.value === "visible" ? "visible" : "hidden",
              }))
            }}
            options={GROUP_RESULT_OPTIONS}
          />
          <Column>
            {group.conditions.map((condition, conditionIndex) => {
              const selectedSourceKind = condition.source.kind
              const resolvedValue = resolveConditionalVisibilitySourceValue(condition.source, {
                collectionItem: effectiveCollectionItem,
                locale: modeContext?.activeLocale ?? null,
                componentProps: selectedProps,
              })
              const sourceFieldValue =
                selectedSourceKind === "collectionField" ? condition.source.fieldId : ""
              const sourcePropValue =
                selectedSourceKind === "componentProp" ? condition.source.propKey : ""
              const needsValueInput =
                condition.operator !== "isEmpty" && condition.operator !== "isNotEmpty"
              const isListOperator =
                condition.operator === "inList" || condition.operator === "notInList"

              return (
                <Section key={condition.id}>
                  <GroupHeader>
                    <GroupTitle>Condition {conditionIndex + 1}</GroupTitle>
                    <DangerButton
                      type="button"
                      onClick={() => handleRemoveCondition(group.id, condition.id)}
                    >
                      <DeleteIcon size={12} />
                      Remove
                    </DangerButton>
                  </GroupHeader>
                  <CraftSettingsSelect
                    label="Source"
                    value={selectedSourceKind}
                    onChange={(event) => {
                      const kind = event.target.value
                      handleConditionChange(group.id, condition.id, (nextCondition) => ({
                        ...nextCondition,
                        source: createSourceByKind({
                          kind,
                          collectionFieldId: collectionFieldOptions[0]?.id ?? null,
                          componentPropKey: componentPropOptions[0]?.id ?? null,
                        }),
                      }))
                    }}
                    options={SOURCE_OPTIONS}
                  />
                  {selectedSourceKind === "collectionField" && (
                    <CraftSettingsSelect
                      label="Collection field"
                      value={sourceFieldValue}
                      onChange={(event) =>
                        handleConditionChange(group.id, condition.id, (nextCondition) => ({
                          ...nextCondition,
                          source: {
                            kind: "collectionField",
                            fieldId: event.target.value,
                          },
                        }))
                      }
                      options={
                        collectionFieldOptions.length > 0
                          ? collectionFieldOptions
                          : [{ id: "", value: "No fields available" }]
                      }
                    />
                  )}
                  {selectedSourceKind === "componentProp" && (
                    <CraftSettingsSelect
                      label="Component prop"
                      value={sourcePropValue}
                      onChange={(event) =>
                        handleConditionChange(group.id, condition.id, (nextCondition) => ({
                          ...nextCondition,
                          source: {
                            kind: "componentProp",
                            propKey: event.target.value,
                          },
                        }))
                      }
                      options={
                        componentPropOptions.length > 0
                          ? componentPropOptions
                          : [{ id: "", value: "No primitive props" }]
                      }
                    />
                  )}
                  <CraftSettingsSelect
                    label="Operator"
                    value={condition.operator}
                    onChange={(event) => {
                      const nextOperator = event.target.value as ConditionalVisibilityOperator
                      handleConditionChange(group.id, condition.id, (nextCondition) => ({
                        ...nextCondition,
                        operator: nextOperator,
                      }))
                    }}
                    options={OPERATOR_OPTIONS}
                  />
                  {needsValueInput && (
                    <CraftSettingsInput
                      label={isListOperator ? "Values" : "Value"}
                      value={
                        isListOperator
                          ? condition.values.map((value) => stringifyValue(value)).join(", ")
                          : stringifyValue(condition.value)
                      }
                      onChange={(event) => {
                        const rawValue = event.target.value
                        handleConditionChange(group.id, condition.id, (nextCondition) => {
                          if (isListOperator) {
                            const parsedValues = rawValue
                              .split(",")
                              .map((value) => parseValueFromInput(value.trim()))
                            return {
                              ...nextCondition,
                              values: parsedValues,
                            }
                          }

                          return {
                            ...nextCondition,
                            value: parseValueFromInput(rawValue),
                          }
                        })
                      }}
                      placeholder={isListOperator ? "value1, value2, value3" : "value"}
                    />
                  )}
                  <Hint>Resolved value: {stringifyValue(resolvedValue) || "(empty)"}</Hint>
                </Section>
              )
            })}
          </Column>
          <ActionButton type="button" onClick={() => handleAddCondition(group.id)}>
            <AddIcon width={10} height={10} />
            Add condition
          </ActionButton>
        </Section>
      ))}
    </Root>
  )

  return (
    <SettingsAccordion asAccordion={asAccordion} title="Conditional visibility">
      {content}
    </SettingsAccordion>
  )
}
