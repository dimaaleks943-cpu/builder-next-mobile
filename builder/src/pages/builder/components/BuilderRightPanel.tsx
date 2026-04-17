import { Box, Tab, Tabs, Typography } from "@mui/material"
import type { ChangeEvent } from "react"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import emptySelectionImg from "../assets/dontSelectedElement.png"
import {
  LayoutAccordion,
  SizeAccordion,
  SpacingAccordion,
  BordersAccordion,
  EffectsAccordion,
  BackgroundAccordion,
  TypographyAccordion,
} from "../craftStylesComponents"
import {
  ImageSettingsFields,
  TextSettingsFields,
  LinkTextSettingsFields,
} from "../settingsCraftComponents"
import { useRightPanelContext } from "../context/RightPanelContext.tsx"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"
import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts"
import { CraftSettingsInput } from "./craftSettingsControls/CraftSettingsInput.tsx"

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
  const tabIndex = rightPanelContext?.tabIndex ?? 0
  const { hasSelection, selectedType } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null

    const displayName = node ? resolveNodeDisplayName(node) : null
    const hasTextProp = node?.data.props?.text !== undefined
    const isLinkText =
      displayName === CRAFT_DISPLAY_NAME.LinkText ||
      node?.data.props?.href !== undefined ||
      node?.data.props?.linkMode === "collectionItemPage"
    const isText =
      displayName === CRAFT_DISPLAY_NAME.Text || hasTextProp
    const isImage = displayName === CRAFT_DISPLAY_NAME.Image

    return {
      hasSelection: Boolean(id),
      selectedType: isLinkText
        ? "LinkText"
        : isText
          ? "Text"
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
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  overflowY: "auto",
                }}
              >
                <LayoutAccordion />
                {selectedType !== CRAFT_DISPLAY_NAME.Body && <SizeAccordion />}

                <SpacingAccordion/>

                <BordersAccordion/>
                <EffectsAccordion />
                <BackgroundAccordion />
                {(selectedType === "Text" || selectedType === "LinkText") && (
                <TypographyAccordion />
              )}
              </Box>
            )}

            {tabIndex === 1 && (
              <Box
                sx={{
                  flex: 1,
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  overflowY: "auto",
                }}
              >
                {(selectedType === "Text" || selectedType === "LinkText") && (
                  <TextSettingsFields asAccordion />
                )}
                {selectedType === "LinkText" && (
                  <LinkTextSettingsFields asAccordion />
                )}
                {selectedType === "Image" && (
                  <ImageSettingsFields asAccordion />
                )}
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

