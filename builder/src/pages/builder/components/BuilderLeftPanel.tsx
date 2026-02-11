import { Box, Typography } from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { Block } from "../../../craft/Block"

export const BuilderLeftPanel = () => {
  const {
    connectors: { create },
  } = useEditor()

  return (
    <Box
      sx={{
        width: 280,
        borderRight: `1px solid ${COLORS.gray200}`,
        backgroundColor: COLORS.secondaryVeryLightGray,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          padding: "12px 16px",
          borderBottom: `1px solid ${COLORS.gray200}`,
        }}
      >
        <Typography variant="subtitle2" color={COLORS.gray700}>
          Блоки
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          padding: "8px",
        }}
      >
        {/* Элемент палитры: Блок */}
        <Box
          ref={(ref: HTMLDivElement | null) => {
            if (!ref) return
            create(ref, <Block />)
          }}
          sx={{
            padding: "8px 10px",
            borderRadius: 2,
            backgroundColor: COLORS.white,
            border: `1px dashed ${COLORS.gray300}`,
            cursor: "grab",
            fontSize: 14,
            color: COLORS.gray800,
            userSelect: "none",
            "&:hover": {
              backgroundColor: COLORS.gray100,
            },
          }}
        >
          Блок
        </Box>
      </Box>
    </Box>
  )
}

