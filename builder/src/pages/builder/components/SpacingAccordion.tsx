import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { EdgeInput } from "./EdgeInput"

export const SpacingAccordion = () => {
  const { selectedId, selectedProps } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null
    return {
      selectedId: id ?? null,
      selectedProps: node?.data.props ?? null,
    }
  }) as any

  if (!selectedId || !selectedProps) {
    return null
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
          Отступы
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {/* Внешний блок margin, внутри – блок padding, внутри – пустой контент */}
        <Box>
          {/* margin box */}
          <Box
            sx={{
              position: "relative",
              maxWidth: 260,
              height: "74px",
              width: "211px",
              borderRadius: 1,
              backgroundColor: COLORS.gray100,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* margin label */}
            <Typography
              sx={{
                position: "absolute",
                top: 3,
                left: 3,
                color: COLORS.gray600,
                fontSize: "8px",
                lineHeight: "8px",
              }}
            >
              margin
            </Typography>
            {/* top margin */}
            <EdgeInput
              nodeId={selectedId}
              kind="margin"
              side="Top"
              value={selectedProps?.marginTop ?? 0}
              sx={{
                position: "absolute",
                top: 0,
              }}
            />

            {/* bottom margin */}
            <EdgeInput
              nodeId={selectedId}
              kind="margin"
              side="Bottom"
              value={selectedProps?.marginBottom ?? 0}
              sx={{
                position: "absolute",
                bottom: 0,
              }}
            />

            {/* left margin */}
            <EdgeInput
              nodeId={selectedId}
              kind="margin"
              side="Left"
              value={selectedProps?.marginLeft ?? 0}
              sx={{
                position: "absolute",
                top: "50%",
                left: -5,
                width: 32,
                transform: "translateY(-50%)",
              }}
            />

            {/* right margin */}
            <EdgeInput
              nodeId={selectedId}
              kind="margin"
              side="Right"
              value={selectedProps?.marginRight ?? 0}
              sx={{
                position: "absolute",
                top: "50%",
                right: -5,
                width: 32,
                transform: "translateY(-50%)",
              }}
            />

            {/* padding box */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 20px",
                position: "absolute",
                borderRadius: 1,
                backgroundColor: COLORS.gray200,
                width: "171px",
                height: "42px",
              }}
            >
              {/* padding label */}
              <Typography
                sx={{
                  position: "absolute",
                  top: 2,
                  left: 4,
                  color: COLORS.gray600,
                  fontSize: "8px",
                  lineHeight: "8px",
                }}
              >
                padding
              </Typography>

              {/* top padding */}
              <EdgeInput
                nodeId={selectedId}
                kind="padding"
                side="Top"
                value={selectedProps?.paddingTop ?? 16}
                sx={{
                  position: "absolute",
                  top: 0,
                }}
              />

              {/* bottom padding */}
              <EdgeInput
                nodeId={selectedId}
                kind="padding"
                side="Bottom"
                value={selectedProps?.paddingBottom ?? 16}
                sx={{
                  position: "absolute",
                  bottom: 0,
                }}
              />

              {/* left padding */}
              <EdgeInput
                nodeId={selectedId}
                kind="padding"
                side="Left"
                value={selectedProps?.paddingLeft ?? 16}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: -7,
                  width: 32,
                  transform: "translateY(-50%)",
                }}
              />

              {/* right padding */}
              <EdgeInput
                nodeId={selectedId}
                kind="padding"
                side="Right"
                value={selectedProps?.paddingRight ?? 16}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: -7,
                  width: 32,
                  transform: "translateY(-50%)",
                }}
              />

              <Box
                sx={{
                  width: "100%",
                  height: "10px",
                  borderRadius: 1,
                  backgroundColor: COLORS.white,
                }}
              />
            </Box>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

