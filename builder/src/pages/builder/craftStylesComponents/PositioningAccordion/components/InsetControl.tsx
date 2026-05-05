import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react"
import { Box, Divider, Paper, Popper, Typography } from "@mui/material"
import { COLORS } from "../../../../../theme/colors.ts"
import { UndoIcon } from "../../../../../icons/UndoIcon.tsx"
import { CraftSettingsSliderWithUnit } from "../../../components/craftSettingsControls/CraftSettingsSliderWithUnit.tsx"
import { CRAFT_SIZE_MENU_UNITS_WEB } from "../../../../../utils/craftCssSizeProp.ts"
import { INSET_OPTIONS } from "../positioningAccordion.const.tsx";

export type InsetSide = "top" | "right" | "bottom" | "left"
const INSET_PRESETS = ["auto", "0", "10", "20", "40", "60", "100", "140", "220"]

type InsetControlProps = {
  insetSideOrder: InsetSide[];
  activeInsetId: string;
  insetSides: Record<InsetSide, string>;
  formatInsetSideValue: (token: string) => string;
  onInsetSelect: (id: string) => void;
  onInsetSideCommit: (side: InsetSide, next: string | number | undefined) => void;
  onInsetPresetClick: (side: InsetSide, preset: string) => void;
  onInsetReset: (side: InsetSide) => void;
}

export const InsetControl = ({
  insetSideOrder,
  activeInsetId,
  insetSides,
  formatInsetSideValue,
  onInsetSelect,
  onInsetSideCommit,
  onInsetPresetClick,
  onInsetReset,
}: InsetControlProps) => {
  const [insetAnchorEl, setInsetAnchorEl] = useState<HTMLElement | null>(null)
  const [activeInsetSide, setActiveInsetSide] = useState<InsetSide | null>(null)
  const insetPopperRef = useRef<HTMLDivElement | null>(null)

  const handleInsetSideClick =
    (side: InsetSide) => (event: ReactMouseEvent<HTMLElement>) => {
      setActiveInsetSide(side)
      setInsetAnchorEl(event.currentTarget)
    }

  useEffect(() => {
    if (!insetAnchorEl) return
    const onDocMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (insetAnchorEl.contains(target)) return
      if (insetPopperRef.current?.contains(target)) return
      setInsetAnchorEl(null)
      setActiveInsetSide(null)
    }
    document.addEventListener("mousedown", onDocMouseDown, true)

    return () => document.removeEventListener("mousedown", onDocMouseDown, true)
  }, [insetAnchorEl])

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(9, 1fr)",
          gap: "4px",
          overflow: "hidden",
          alignSelf: "flex-end",
        }}
      >
        {INSET_OPTIONS.map((option) => {
          const isActive = option.id === activeInsetId

          return (
            <Box
              key={option.id}
              component="button"
              type="button"
              onClick={() => onInsetSelect(option.id)}
              sx={{
                padding: 0,
                maxWidth: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                backgroundColor: isActive ? COLORS.purple100 : COLORS.white,
                "&:hover": {
                  backgroundColor: COLORS.white,
                },
              }}
            >
              {option.icon}
            </Box>
          )
        })}
      </Box>

      <Box
        sx={{
          position: "relative",
          width: "159px",
          height: "42px",
          borderRadius: "2px",
          backgroundColor: COLORS.gray200,
          alignSelf: "end",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "102px",
            height: "10px",
            borderRadius: "2px",
            backgroundColor: COLORS.white,
          }}
        />

        {insetSideOrder.map((side) => {
          const sidePositionSx =
            side === "top"
              ? {
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "64px",
                justifyContent: "center",
              }
              : side === "bottom"
                ? {
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "64px",
                  justifyContent: "center",
                }
                : side === "left"
                  ? {
                    top: "50%",
                    left: "-1px",
                    transform: "translateY(-50%)",
                    width: "52px",
                    justifyContent: "flex-start",
                  }
                  : {
                    top: "50%",
                    right: "-1px",
                    transform: "translateY(-50%)",
                    width: "52px",
                    justifyContent: "flex-end",
                  }

          return (
            <Box
              key={side}
              component="button"
              type="button"
              onClick={handleInsetSideClick(side)}
              sx={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                border: "none",
                backgroundColor: "transparent",
                padding: "2px 4px",
                cursor: "pointer",
                minWidth: 0,
                ...sidePositionSx,
              }}
            >
              <Typography
                sx={{
                  fontSize: "10px",
                  lineHeight: "12px",
                  fontWeight: 600,
                  color: COLORS.gray700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {formatInsetSideValue(insetSides[side])}
              </Typography>
            </Box>
          )
        })}
      </Box>

      <Popper
        open={Boolean(insetAnchorEl && activeInsetSide)}
        anchorEl={insetAnchorEl}
        placement="bottom-start"
        modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
        style={{ zIndex: 4000 }}
      >
        <Paper
          ref={insetPopperRef}
          elevation={3}
          sx={{
            width: "211px",
            border: `1px solid ${COLORS.purple100}`,
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {activeInsetSide ? (
            <CraftSettingsSliderWithUnit
              value={insetSides[activeInsetSide]}
              allowedUnits={CRAFT_SIZE_MENU_UNITS_WEB}
              onCommit={(next) => onInsetSideCommit(activeInsetSide, next)}
              disableUnitPopperPortal
            />
          ) : null}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "44px repeat(4, 33px)",
              gridTemplateRows: "20px 20px",
              gap: "4px",
            }}
          >
            {INSET_PRESETS.map((preset) => {
              const isAutoBtn = preset === "auto"

              return (
                <Box
                  key={preset}
                  component="button"
                  type="button"
                  onClick={() =>
                    activeInsetSide && onInsetPresetClick(activeInsetSide, preset)
                  }
                  sx={{
                    borderRadius: "2px",
                    border: "none",
                    backgroundColor: COLORS.purple100,
                    color: COLORS.purple400,
                    fontSize: "10px",
                    lineHeight: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "4px 6px",
                    transition: "background-color 0.15s ease, border-color 0.15s ease",
                    "&:hover": {
                      backgroundColor: COLORS.purple100,
                    },
                    ...(isAutoBtn ? {
                      gridRow: "span 2",
                    } : {}),
                  }}
                >
                  {isAutoBtn ? "Auto" : preset}
                </Box>
              )
            })}
          </Box>

          <Box
            sx={{
              borderTop: `1px solid ${COLORS.purple100}`,
              paddingTop: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => activeInsetSide && onInsetReset(activeInsetSide)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                border: "none",
                backgroundColor: "transparent",
                padding: 0,
                color: COLORS.gray700,
                fontSize: "11px",
                lineHeight: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <UndoIcon size={12} fill={COLORS.black}/>
              Сброс
            </Box>
            <Typography sx={{ fontSize: "10px", lineHeight: "14px", color: COLORS.black }}>
              Alt + click
            </Typography>
          </Box>

          <Divider/>

          <Typography sx={{ fontSize: "10px", lineHeight: "14px", color: COLORS.black }}>
            Сброс приведет к исходному значению.
          </Typography>
        </Paper>
      </Popper>
    </>
  )
}
