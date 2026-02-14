import { useState } from "react"
import { Box, Tab, Tabs } from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import emptySelectionImg from "../assets/dontSelectedElement.png"
import { SpacingAccordion } from "./SpacingAccordion.tsx"
import { BordersAccordion } from "./BordersAccordion.tsx"
import { LayoutAccordion } from "./LayoutAccordion.tsx"
import { TextSettingsAccordion } from "./TextSettingsAccordion.tsx"
import { LinkSettingsAccordion } from "./LinkSettingsAccordion.tsx"

export const BuilderRightPanel = () => {
  const [tabIndex, setTabIndex] = useState(0)

  const { hasSelection, selectedType } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null

    let resolvedName: string | null = null
    const type = node?.data.type

    // type в Craft может быть строкой ИЛИ React-компонентом с полем resolvedName
    if (typeof type === "string") {
      resolvedName = type
    } else if (type && typeof (type as any).resolvedName === "string") {
      resolvedName = (type as any).resolvedName
    }

    const hasTextProp = node?.data.props?.text !== undefined
    const isLinkText = resolvedName === "LinkText" || node?.data.props?.href !== undefined

    return {
      hasSelection: Boolean(id),
      selectedType: isLinkText ? "LinkText" : resolvedName === "Text" || hasTextProp ? "Text" : resolvedName,
    }
  })

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)
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
                  <TextSettingsAccordion />
                )}
                {selectedType === "LinkText" && <LinkSettingsAccordion />}
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

