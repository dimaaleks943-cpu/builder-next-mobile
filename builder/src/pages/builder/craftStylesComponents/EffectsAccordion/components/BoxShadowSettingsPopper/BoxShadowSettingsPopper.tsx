import { Box, Paper, Popper, Typography } from "@mui/material"
import type { Ref } from "react"
import { COLORS } from "../../../../../../theme/colors.ts"
import { CraftSettingsButtonGroup } from "../../../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsColorField } from "../../../../components/craftSettingsControls/CraftSettingsColorField.tsx"
import { CraftSettingsSliderWithUnit } from "../../../../components/craftSettingsControls/CraftSettingsSliderWithUnit.tsx"
import {
  BOX_SHADOW_LENGTH_UNITS,
  type BoxShadowParts,
  commitLength,
} from "../../boxShadowUtils.ts"

const BOX_SHADOW_SLIDER_ROWS = [
  { label: "X", key: "offsetX" as const, min: -100, max: 100 },
  { label: "Y", key: "offsetY" as const, min: -100, max: 100 },
  { label: "Blur", key: "blur" as const, min: 0, max: 100 },
  { label: "Size", key: "spread" as const, min: -50, max: 50 },
] as const

interface Props {
  open: boolean
  anchorEl: HTMLElement | null
  popperRef: Ref<HTMLDivElement>
  boxShadowParts: BoxShadowParts
  onApplyPatch: (patch: Partial<BoxShadowParts>) => void
}

export const BoxShadowSettingsPopper = ({
  open,
  anchorEl,
  popperRef,
  boxShadowParts,
  onApplyPatch,
}: Props) => (
  <Popper
    open={open}
    anchorEl={anchorEl}
    placement="bottom-end"
    modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
    style={{ zIndex: 4000 }}
  >
    <Paper
      ref={popperRef}
      elevation={3}
      sx={{
        width: "288px",
        maxWidth: "min(288px, calc(100vw - 24px))",
        border: `1px solid ${COLORS.purple100}`,
        borderRadius: "8px",
        padding: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <CraftSettingsButtonGroup
        label="Type"
        value={boxShadowParts.inset ? "inside" : "outside"}
        onChange={(id) => onApplyPatch({ inset: id === "inside" })}
        options={[
          { id: "outside", content: "Outside" },
          { id: "inside", content: "Inside" },
        ]}
      />

      {BOX_SHADOW_SLIDER_ROWS.map((row) => (
        <Box
          key={row.key}
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            columnGap: "8px",
            boxSizing: "border-box",
          }}
        >
          <Typography
            sx={{
              minWidth: "48px",
              flexShrink: 0,
              fontSize: "10px",
              lineHeight: "14px",
              color: COLORS.gray700,
            }}
          >
            {row.label}
          </Typography>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <CraftSettingsSliderWithUnit
              value={boxShadowParts[row.key]}
              onCommit={(next) =>
                onApplyPatch({
                  [row.key]: commitLength(next),
                })
              }
              allowedUnits={BOX_SHADOW_LENGTH_UNITS}
              min={row.min}
              max={row.max}
              step={1}
              disableUnitPopperPortal
            />
          </Box>
        </Box>
      ))}

      <CraftSettingsColorField
        label="Color"
        value={boxShadowParts.color}
        onChange={(value) => onApplyPatch({ color: value })}
      />
    </Paper>
  </Popper>
)
