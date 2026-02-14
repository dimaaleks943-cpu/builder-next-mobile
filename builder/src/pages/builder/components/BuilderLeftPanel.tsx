import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import type { ReactElement } from "react"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { Block } from "../../../craft/Block"
import { Text } from "../../../craft/Text"
import { LinkText } from "../../../craft/LinkText"

interface ComponentItem {
  name: string;
  component: ReactElement;
}

interface Category {
  title: string
  items: ComponentItem[]
}

const categories: Category[] = [
  {
    title: "Базовые",
    items: [
      {
        name: "Div-блок",
        component: <Block />,
      },
    ],
  },
  {
    title: "Типографика",
    items: [
      {
        name: "Текст",
        component: <Text />,
      },
      {
        name: "Текст-ссылка",
        component: <LinkText />,
      },
    ],
  },
]

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
          Материалы для холста
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          padding: "8px",
          overflowY: "auto",
        }}
      >
        {categories.map((category) => (
          <Accordion
            key={category.title}
            defaultExpanded
            disableGutters
            sx={{
              backgroundColor: "transparent",
              boxShadow: "none",
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              sx={{
                minHeight: 40,
                padding: "0 8px",
                "& .MuiAccordionSummary-content": {
                  margin: 0,
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: COLORS.gray700,
                  fontWeight: 600,
                }}
              >
                {category.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                padding: "8px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {category.items.map((item) => (
                <Box
                  key={item.name}
                  ref={(ref: HTMLDivElement | null) => {
                    if (!ref) return
                    create(ref, item.component)
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "grab",
                    userSelect: "none",
                    "&:hover": {
                      backgroundColor: COLORS.gray100,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: "65px",
                      height: "65px",
                      aspectRatio: "1",
                      backgroundColor: COLORS.blue100,
                      borderRadius: 0.5,
                      padding: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: COLORS.white,
                        width: "100%",
                        height: "100%"
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      color: COLORS.gray600,
                      fontSize: "8px",
                      lineHeight: "10px",
                      textAlign: "center",
                    }}
                  >
                    {item.name}
                  </Typography>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  )
}
