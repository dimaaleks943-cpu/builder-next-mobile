import { Box, IconButton } from "@mui/material"
import { Frame, Element, useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { Block } from "../../../craft/Block.tsx";

export const BuilderCanvas = () => {
  const { actions } = useEditor()

  const handleUndo = () => {
    actions.history.undo()
  }

  const handleRedo = () => {
    actions.history.redo()
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.gray100,
      }}
    >
      {/* Панель действий над холстом (undo/redo и т.п.) */}
      <Box
        sx={{
          height: "28px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          borderBottom: `1px solid ${COLORS.gray200}`,
          backgroundColor: COLORS.white,
        }}
      >
        <IconButton
          onClick={handleUndo}
          sx={{ padding: 0, mr: 1 }}
        >
          {"↶"}
        </IconButton>
        <IconButton
          onClick={handleRedo}
          sx={{ padding: 0 }}
        >
          {"↷"}
        </IconButton>
      </Box>

      {/* Сам холст, подключённый к Craft.js */}
      <Box
        sx={{
          flex: 1,
          padding: "0 8px 8px",
          display: "flex",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: COLORS.white,
            display: "flex",
          }}
        >
          <Frame>
            <Element
              is={Block}
              canvas
              fullSize
            />
          </Frame>
        </Box>
      </Box>
    </Box>
  )
}

