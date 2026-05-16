import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import { COLORS } from "../../../theme/colors.ts"
import { EdgeInput } from "../components/EdgeInput.tsx"
import { useStyleEditing } from "../hooks/useStyleEditing.ts"

export const SpacingAccordion = () => {
  const { selectedId, getStyleProp } = useStyleEditing()

  if (!selectedId) {
    return null
  }

  return (
    <Accordion disableGutters>
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
              kind="margin"
              side="Top"
              value={(getStyleProp("marginTop") as number | undefined) ?? 0}
              sx={{
                position: "absolute",
                top: 0,
              }}
            />

            {/* bottom margin */}
            <EdgeInput
              kind="margin"
              side="Bottom"
              value={(getStyleProp("marginBottom") as number | undefined) ?? 0}
              sx={{
                position: "absolute",
                bottom: 0,
              }}
            />

            {/* left margin */}
            <EdgeInput
              kind="margin"
              side="Left"
              value={(getStyleProp("marginLeft") as number | undefined) ?? 0}
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
              kind="margin"
              side="Right"
              value={(getStyleProp("marginRight") as number | undefined) ?? 0}
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
                kind="padding"
                side="Top"
                value={(getStyleProp("paddingTop") as number | undefined) ?? 0}
                sx={{
                  position: "absolute",
                  top: 0,
                }}
              />

              {/* bottom padding */}
              <EdgeInput
                kind="padding"
                side="Bottom"
                value={(getStyleProp("paddingBottom") as number | undefined) ?? 0}
                sx={{
                  position: "absolute",
                  bottom: 0,
                }}
              />

              {/* left padding */}
              <EdgeInput
                kind="padding"
                side="Left"
                value={(getStyleProp("paddingLeft") as number | undefined) ?? 0}
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
                kind="padding"
                side="Right"
                value={(getStyleProp("paddingRight") as number | undefined) ?? 0}
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

