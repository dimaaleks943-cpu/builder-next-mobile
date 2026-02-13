import { useMemo, useState } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import type { ChangeEvent } from "react"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"

type BorderSide = "top" | "right" | "bottom" | "left"

export const BordersAccordion = () => {
  const { actions } = useEditor()
  const { selectedId, selectedProps } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null
    return {
      selectedId: id ?? null,
      selectedProps: node?.data.props ?? null,
    }
  }) as any

  const initialSides = useMemo<"all" | BorderSide[]>(() => {
    if (!selectedProps) return "all"
    const enabled: BorderSide[] = []
    if (selectedProps.borderTopWidth > 0) enabled.push("top")
    if (selectedProps.borderRightWidth > 0) enabled.push("right")
    if (selectedProps.borderBottomWidth > 0) enabled.push("bottom")
    if (selectedProps.borderLeftWidth > 0) enabled.push("left")
    if (enabled.length === 0 || enabled.length === 4) return "all"
    return enabled
  }, [selectedProps])

  const [activeSides, setActiveSides] =
    useState<"all" | BorderSide[]>(initialSides)

  if (!selectedId || !selectedProps) {
    return null
  }

  const handleRadiusChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? 0 : next

    actions.setProp(selectedId, (props: any) => {
      props.borderRadius = safe
    })
  }

  const applySidesToBlock = (sides: "all" | BorderSide[]) => {
    const all: BorderSide[] = ["top", "right", "bottom", "left"]
    const enabled = sides === "all" ? all : sides

    actions.setProp(selectedId, (props: any) => {
      const currentWidth = props.borderTopWidth ?? 0
      const width = currentWidth > 0 ? currentWidth : 1

      props.borderTopWidth = enabled.includes("top") ? width : 0
      props.borderRightWidth = enabled.includes("right") ? width : 0
      props.borderBottomWidth = enabled.includes("bottom") ? width : 0
      props.borderLeftWidth = enabled.includes("left") ? width : 0
    })
  }

  const isSideActive = (side: BorderSide) =>
    activeSides === "all" || activeSides.includes(side)

  const toggleAllSides = () => {
    setActiveSides((prev) => {
      const next: "all" | BorderSide[] = prev === "all" ? [] : "all"
      applySidesToBlock(next)
      return next
    })
  }

  const toggleSide = (side: BorderSide) => {
    setActiveSides((prev) => {
      let next: "all" | BorderSide[]
      if (prev === "all") {
        next = [side]
      } else {
        const exists = prev.includes(side)
        if (exists) {
          const filtered = prev.filter((s) => s !== side)
          next = filtered.length === 0 ? [] : filtered
        } else {
          const added = [...prev, side]
          next = added.length === 4 ? "all" : added
        }
      }
      applySidesToBlock(next)
      return next
    })
  }

  return (
    <Accordion defaultExpanded disableGutters>
      <AccordionSummary
        sx={{
          minHeight: 40,
          "& .MuiAccordionSummary-content": { margin: 0 },
        }}
      >
        <Typography variant="subtitle2" sx={{ color: COLORS.gray700 }}>
          Границы
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: COLORS.gray600, mb: 0.5, display: "block" }}
              >
                Radius
              </Typography>
              <Box
                component="input"
                type="number"
                value={selectedProps?.borderRadius ?? 0}
                onChange={handleRadiusChange}
                sx={{
                  flex: 1,
                  height: 32,
                  borderRadius: 1,
                  border: `1px solid ${COLORS.gray300}`,
                  backgroundColor: COLORS.white,
                  px: 1,
                  fontSize: 12,
                  outline: "none",
                  MozAppearance: "textfield",
                  "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Borders + Style/Width/Color/Opacity */}
          <Box>
            <Typography
              variant="caption"
              sx={{ color: COLORS.gray600, mb: 0.5, display: "block" }}
            >
              Borders
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              {/* Кнопки выбора сторон бордера */}
              <Box
                sx={{
                  position: "relative",
                  minWidth: 60,
                  height: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* верх */}
                <Box
                  onClick={() => toggleSide("top")}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    width: 24,
                    height: 10,
                    transform: "translateX(-50%)",
                    borderTop: `3px solid ${
                      isSideActive("top") ? COLORS.purple400 : COLORS.purple200
                    }`,
                    borderRadius: 999,
                    cursor: "pointer",
                  }}
                />

                {/* низ */}
                <Box
                  onClick={() => toggleSide("bottom")}
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    width: 24,
                    height: 10,
                    transform: "translateX(-50%)",
                    borderBottom: `3px solid ${
                      isSideActive("bottom") ? COLORS.purple400 : COLORS.purple200
                    }`,
                    borderRadius: 999,
                    cursor: "pointer",
                  }}
                />

                {/* лево */}
                <Box
                  onClick={() => toggleSide("left")}
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    width: 10,
                    height: 24,
                    transform: "translateY(-50%)",
                    borderLeft: `3px solid ${
                      isSideActive("left") ? COLORS.purple400 : COLORS.purple200
                    }`,
                    borderRadius: 999,
                    cursor: "pointer",
                  }}
                />

                {/* право */}
                <Box
                  onClick={() => toggleSide("right")}
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    width: 10,
                    height: 24,
                    transform: "translateY(-50%)",
                    borderRight: `3px solid ${
                      isSideActive("right") ? COLORS.purple400 : COLORS.purple200
                    }`,
                    borderRadius: 999,
                    cursor: "pointer",
                  }}
                />

                {/* центр: все стороны */}
                <Box
                  onClick={toggleAllSides}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: `2px solid ${
                      activeSides === "all" ? COLORS.purple400 : COLORS.purple200
                    }`,
                    backgroundColor:
                      activeSides === "all" ? COLORS.purple100 : COLORS.secondaryVeryLightGray,
                    cursor: "pointer",
                  }}
                />
              </Box>

              {/* Параметры */}
              <Box
                sx={{
                  flex: 1,
                  display: "grid",
                  gridTemplateColumns: "minmax(60px,auto) minmax(0,1fr)",
                  rowGap: "4px",
                  columnGap: "8px",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                {/* Style (UI-заглушка) */}
                <Typography variant="caption" sx={{ color: COLORS.gray600 }}>
                  Style
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: "4px",
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      height: 28,
                      borderRadius: 1,
                      border: `1px solid ${COLORS.purple200}`,
                      backgroundColor: COLORS.purple100,
                    }}
                  />
                  <Box
                    sx={{
                      flex: 1,
                      height: 28,
                      borderRadius: 1,
                      border: `1px solid ${COLORS.gray300}`,
                      backgroundColor: COLORS.white,
                    }}
                  />
                  <Box
                    sx={{
                      flex: 1,
                      height: 28,
                      borderRadius: 1,
                      border: `1px solid ${COLORS.gray300}`,
                      backgroundColor: COLORS.white,
                    }}
                  />
                </Box>

                {/* Width */}
                <Typography variant="caption" sx={{ color: COLORS.gray600 }}>
                  Width
                </Typography>
                <Box
                  component="input"
                  type="number"
                  value={selectedProps?.borderTopWidth ?? 0}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const next = Number(event.target.value)
                    const safe = Number.isNaN(next) ? 0 : next
                    const sides: BorderSide[] =
                      activeSides === "all" ? ["top", "right", "bottom", "left"] : activeSides

                    actions.setProp(selectedId, (props: any) => {
                      if (sides.includes("top")) props.borderTopWidth = safe
                      if (sides.includes("right")) props.borderRightWidth = safe
                      if (sides.includes("bottom")) props.borderBottomWidth = safe
                      if (sides.includes("left")) props.borderLeftWidth = safe
                    })
                  }}
                  sx={{
                    width: "100%",
                    height: 28,
                    borderRadius: 1,
                    border: `1px solid ${COLORS.gray300}`,
                    backgroundColor: COLORS.white,
                    px: 1,
                    fontSize: 12,
                    outline: "none",
                    MozAppearance: "textfield",
                    "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                  }}
                />

                {/* Color */}
                <Typography variant="caption" sx={{ color: COLORS.gray600 }}>
                  Color
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                    minWidth: 0,
                  }}
                >
                  {/* Палитра браузера */}
                  <Box
                    component="input"
                    type="color"
                    value={selectedProps?.borderColor ?? "#000000"}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const value = event.target.value
                      actions.setProp(selectedId, (props: any) => {
                        props.borderColor = value
                      })
                    }}
                    sx={{
                      width: 32,
                      height: 24,
                      borderRadius: 0.5,
                      border: `1px solid ${COLORS.gray300}`,
                      padding: 0,
                      backgroundColor: "transparent",
                    }}
                  />
                  {/* Hex-инпут */}
                  <Box
                    component="input"
                    type="text"
                    value={selectedProps?.borderColor ?? "#000000"}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const value = event.target.value
                      actions.setProp(selectedId, (props: any) => {
                        props.borderColor = value
                      })
                    }}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      height: 28,
                      borderRadius: 1,
                      border: `1px solid ${COLORS.gray300}`,
                      backgroundColor: COLORS.white,
                      px: 1,
                      fontSize: 12,
                      outline: "none",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  />
                </Box>

                {/* Opacity */}
                <Typography variant="caption" sx={{ color: COLORS.gray600 }}>
                  Opacity
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                  }}
                >
                  <Box
                    component="input"
                    type="number"
                    value={Math.round((selectedProps?.borderOpacity ?? 1) * 100)}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const next = Number(event.target.value)
                      const safe = Math.min(100, Math.max(0, Number.isNaN(next) ? 0 : next))
                      actions.setProp(selectedId, (props: any) => {
                        props.borderOpacity = safe / 100
                      })
                    }}
                    sx={{
                      width: "100%",
                      height: 28,
                      borderRadius: 1,
                      border: `1px solid ${COLORS.gray300}`,
                      backgroundColor: COLORS.white,
                      px: 1,
                      fontSize: 12,
                      outline: "none",
                      MozAppearance: "textfield",
                      "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                        WebkitAppearance: "none",
                        margin: 0,
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

