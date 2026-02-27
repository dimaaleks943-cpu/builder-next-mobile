import { Box, Tab, Tabs } from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import emptySelectionImg from "../assets/dontSelectedElement.png"
import {
  LayoutAccordion,
  SpacingAccordion,
  BordersAccordion,
  TypographyAccordion,
} from "../craftStylesComponents"
import {
  ImageSettingsFields,
  TextSettingsFields,
  LinkTextSettingsFields,
} from "../settingsCraftComponents"
import { useRightPanelContext } from "../context/RightPanelContext.tsx"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts";

export const BuilderRightPanel = () => {
  const rightPanelContext = useRightPanelContext()
  const tabIndex = rightPanelContext?.tabIndex ?? 0
  const { hasSelection, selectedType } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null

    const displayName = node ? resolveNodeDisplayName(node) : null
    const hasTextProp = node?.data.props?.text !== undefined
    const isLinkText =
      displayName === "LinkText" || node?.data.props?.href !== undefined

    return {
      hasSelection: Boolean(id),
      selectedType: isLinkText
        ? "LinkText"
        : displayName === "Text" || hasTextProp
          ? "Text"
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

                <SpacingAccordion/>

                <BordersAccordion/>
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

