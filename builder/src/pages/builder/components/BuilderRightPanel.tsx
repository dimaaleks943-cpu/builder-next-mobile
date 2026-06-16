import { Box, Tab, Tabs, Typography } from "@mui/material"
import type { ChangeEvent } from "react"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import emptySelectionImg from "../assets/dontSelectedElement.png"
import {
  LayoutAccordion,
  PositioningAccordion,
  SizeAccordion,
  SpacingAccordion,
  BordersAccordion,
  EffectsAccordion,
  BackgroundAccordion,
  TypographyAccordion,
} from "../craftStylesComponents"
import {
  ImageSettingsFields,
  LinkTextSettingsFields,
  NavbarSettingsFields,
  FormSettingsFields,
  FormWrapperSettingsFields,
  FormFieldSettingsFields,
  HtmlIdSettingsFields,
} from "../settingsCraftComponents"
import { useRightPanelContext } from "../context/RightPanelContext.tsx"
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import { PreviewViewport } from "../builder.enum.ts"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"
import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts"
import { findFormFormChildId } from "../../../craft/form/formNodeUtils.ts"
import { CraftSettingsInput } from "./craftSettingsControls/CraftSettingsInput.tsx"
import { StyleSelector } from "./StyleSelector/StyleSelector.tsx"
import { TextSettingsFields } from "../settingsCraftComponents/TextSettingsFields/TextSettingsFields.tsx";

type Props = {
  isTemplatePage?: boolean
  templateItemPathPrefix?: string
  onTemplateItemPathPrefixChange?: (value: string) => void
}

export const BuilderRightPanel = ({
  isTemplatePage = false,
  templateItemPathPrefix = "",
  onTemplateItemPathPrefixChange,
}: Props) => {
  const rightPanelContext = useRightPanelContext()
  const previewViewport = usePreviewViewport()
  const tabIndex = rightPanelContext?.tabIndex ?? 0
  const { hasSelection, selectedType, selectedId, isFormWrapper, isFormForm, isFormField, formFormChildId } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null

    const displayName = node ? resolveNodeDisplayName(node) : null
    const isLinkBlock = displayName === CRAFT_DISPLAY_NAME.LinkBlock
    const isButton = displayName === CRAFT_DISPLAY_NAME.Button
    const isLinkText =
      displayName === CRAFT_DISPLAY_NAME.LinkText ||
      isButton ||
      isLinkBlock ||
      node?.data.props?.href !== undefined ||
      node?.data.props?.linkMode === "collectionItemPage"
    const isHeading = displayName === CRAFT_DISPLAY_NAME.Heading
    const isParagraph = displayName === CRAFT_DISPLAY_NAME.Paragraph
    const isImage = displayName === CRAFT_DISPLAY_NAME.Image
    const isFormWrapper = displayName === CRAFT_DISPLAY_NAME.FormWrapper
    const isFormForm = displayName === CRAFT_DISPLAY_NAME.FormForm
    const isFormField =
      displayName === CRAFT_DISPLAY_NAME.FormTextInput ||
      displayName === CRAFT_DISPLAY_NAME.FormTextarea ||
      displayName === CRAFT_DISPLAY_NAME.FormBlockLabel ||
      displayName === CRAFT_DISPLAY_NAME.FormButton
    const formFormChildId = isFormWrapper && id ? findFormFormChildId(id, state.nodes) : null

    return {
      hasSelection: Boolean(id),
      selectedId: id ?? null,
      isFormWrapper,
      isFormForm,
      isFormField,
      formFormChildId,
      selectedType: isLinkBlock
        ? "LinkBlock"
        : isButton
          ? "Button"
        : isLinkText
          ? "LinkText"
          : isHeading
          ? "Heading"
          : isParagraph
            ? "Paragraph"
            : isImage
              ? "Image"
              : displayName,
    }
  })

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    rightPanelContext?.setTabIndex(newValue)
  }

  return (
    <Box
      sx={{
        width: 320,
        borderLeft: `1px solid ${COLORS.gray200}`,
        backgroundColor: COLORS.secondaryVeryLightGray,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isTemplatePage && onTemplateItemPathPrefixChange && (
          <Box
            sx={{
              flexShrink: 0,
              padding: "12px 16px",
              borderBottom: `1px solid ${COLORS.gray200}`,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              backgroundColor: COLORS.white,
            }}
          >
            <Typography
              sx={{ fontSize: "11px", fontWeight: 600, color: COLORS.gray700 }}
            >
              Страница коллекции
            </Typography>
            <CraftSettingsInput
              label="Базовый URL коллекции"
              value={templateItemPathPrefix}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onTemplateItemPathPrefixChange(e.target.value)
              }
            />
            <Typography sx={{ fontSize: "10px", lineHeight: "14px", color: COLORS.gray600 }}>
              {
                "Совпадайте с путём листинга (например /products). Детальные URL: /products/<slug или id>."
              }
            </Typography>
          </Box>
        )}
        {hasSelection ? (
          <>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Стили"/>
              <Tab label="Настройки"/>
              <Tab label="Анимация"/>
            </Tabs>

            {tabIndex === 0 && (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "auto",
                }}
              >
                <StyleSelector />
                <LayoutAccordion />
                <PositioningAccordion />
                {(selectedType !== CRAFT_DISPLAY_NAME.Body ||
                  previewViewport === PreviewViewport.DESKTOP) && (
                  <SizeAccordion />
                )}

                <SpacingAccordion/>

                <BordersAccordion/>
                <EffectsAccordion />
                <BackgroundAccordion />
                <TypographyAccordion />

              </Box>
            )}

            {tabIndex === 1 && (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  overflowY: "auto",
                }}
              >
                <HtmlIdSettingsFields />
                {(selectedType === "Heading" ||
                  selectedType === "Paragraph" ||
                  selectedType === "LinkText" ||
                  selectedType === "Button") && (
                  <TextSettingsFields asAccordion />
                )}
                {(selectedType === "LinkText" ||
                  selectedType === "LinkBlock" ||
                  selectedType === "Button") && (
                  <LinkTextSettingsFields asAccordion />
                )}
                {selectedType === "Image" && (
                  <ImageSettingsFields asAccordion />
                )}
                {selectedType === CRAFT_DISPLAY_NAME.Navbar && selectedId && (
                  <NavbarSettingsFields nodeId={selectedId} asAccordion />
                )}
                {isFormWrapper && <FormWrapperSettingsFields asAccordion />}
                {isFormWrapper && formFormChildId && (
                  <FormSettingsFields nodeId={formFormChildId} asAccordion />
                )}
                {isFormForm && <FormSettingsFields asAccordion />}
                {isFormField && <FormFieldSettingsFields asAccordion />}
              </Box>
            )}
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "16px",
            }}
          >
            <Box
              component="img"
              src={emptySelectionImg}
              alt="Ничего не выбрано"
              sx={{
                maxWidth: "100%",
                marginBottom: 2,
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

