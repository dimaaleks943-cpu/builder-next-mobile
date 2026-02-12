import { useState } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import emptySelectionImg from "../assets/dontSelectedElement.png"
import { SpacingAccordion } from "./SpacingAccordion.tsx";
import { BordersAccordion } from "./BordersAccordion.tsx";

export const BuilderRightPanel = () => {
  const [tabIndex, setTabIndex] = useState(0)
  const [layoutMode, setLayoutMode] =
    useState<"block" | "flex" | "grid" | "absolute">("block")

  const { actions } = useEditor()
  const { hasSelection, selectedId, selectedProps } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null
    return {
      hasSelection: Boolean(id),
      selectedId: id ?? null,
      selectedProps: node?.data.props ?? null,
    }
  }) as any

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)
  }

  const handleLayoutChange = (value: "block" | "flex" | "grid" | "absolute") => {
    setLayoutMode(value)
    if (!selectedId) return
    actions.setProp(selectedId, (props: any) => {
      props.layout = value
    })
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
                  gap: 1,
                  overflowY: "auto",
                }}
              >
                {/* Аккордеон: Расположение */}
                <Accordion defaultExpanded disableGutters>
                  <AccordionSummary
                    sx={{
                      minHeight: 40,
                      "& .MuiAccordionSummary-content": { margin: 0 },
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: COLORS.gray700 }}>
                      Расположение
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ToggleButtonGroup
                      value={selectedProps?.layout ?? layoutMode}
                      exclusive
                      onChange={(_, value) => {
                        if (!value) return
                        handleLayoutChange(value)
                      }}
                      size="small"
                      fullWidth
                    >
                      <ToggleButton value="block">Блок</ToggleButton>
                      <ToggleButton value="flex">Флекс</ToggleButton>
                      <ToggleButton value="grid">Сетка</ToggleButton>
                      <ToggleButton value="absolute">Абсолют.позиция</ToggleButton>
                    </ToggleButtonGroup>
                  </AccordionDetails>
                </Accordion>

                <SpacingAccordion/>

                <BordersAccordion/>
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

