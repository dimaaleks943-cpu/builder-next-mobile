import { Box, Divider, Typography } from "@mui/material"
import { UndoIcon } from "../../../../icons/UndoIcon.tsx"
import { COLORS } from "../../../../theme/colors.ts"

interface Props {
  onReset: () => void
  withTopSeparator?: boolean
}

export const CraftSettingsStyleResetFooter = ({
  onReset,
  withTopSeparator = false,
}: Props) => {
  const resetRow = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <Box
        component="button"
        type="button"
        onClick={() => onReset()}
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
  )

  return (
    <Box sx={{ rowGap: "8px", display: "flex", flexDirection: "column" }}>
      {withTopSeparator ? (
        <Box
          sx={{
            borderTop: `1px solid ${COLORS.purple100}`,
            paddingTop: "8px",
          }}
        >
          {resetRow}
        </Box>
      ) : (
        resetRow
      )}

      <Divider/>

      <Typography sx={{ fontSize: "10px", lineHeight: "14px", color: COLORS.black }}>
        Сброс приведет к исходному значению.
      </Typography>
    </Box>
  )
}
