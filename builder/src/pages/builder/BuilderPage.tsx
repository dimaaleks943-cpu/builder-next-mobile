import { Box } from "@mui/material"
import { Editor } from "@craftjs/core"
import { BuilderHeader } from "./components/BuilderHeader"
import { BuilderLeftPanel } from "./components/BuilderLeftPanel"
import { BuilderCanvas } from "./components/BuilderCanvas"
import { BuilderRightPanel } from "./components/BuilderRightPanel"
import { COLORS } from "../../theme/colors"
import { Block } from "../../craft/Block.tsx";

export const BuilderPage = () => {
  return (
    <Editor
      resolver={{
        Block,
      }}
    >
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: (theme) => theme.zIndex.modal + 1,
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: COLORS.gray100,
        }}
      >
        <BuilderHeader />

        <Box
          sx={{
            flex: 1,
            display: "flex",
            backgroundColor: COLORS.white,
          }}
        >
          <BuilderLeftPanel />
          <BuilderCanvas />
          <BuilderRightPanel />
        </Box>
      </Box>
    </Editor>
  )
}

