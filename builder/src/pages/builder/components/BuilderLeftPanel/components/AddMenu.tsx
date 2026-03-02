import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Tab,
  Tabs,
  Typography,
} from "@mui/material"
import type { ReactElement } from "react"
import { useEditor } from "@craftjs/core"
import { useState } from "react"
import { COLORS } from "../../../../../theme/colors.ts"
import { Block } from "../../../../../craft/Block.tsx"
import { Text } from "../../../../../craft/Text.tsx"
import { LinkText } from "../../../../../craft/LinkText.tsx"
import { ContentList } from "../../../../../craft/ContentList.tsx"
import { Image } from "../../../../../craft/Image.tsx"

interface ComponentItem {
  name: string;
  component: ReactElement;
}

interface Category {
  title: string;
  items: ComponentItem[];
}

const categories: Category[] = [
  {
    title: "Базовые",
    items: [
      {
        name: "Div-блок",
        component: <Block/>,
      },
    ],
  },
  {
    title: "Типографика",
    items: [
      {
        name: "Текст",
        component: <Text/>,
      },
      {
        name: "Текст-ссылка",
        component: <LinkText/>,
      },
    ],
  },
  {
    title: "CMS",
    items: [
      {
        name: "Список контента",
        component: <ContentList/>,
      },
    ],
  },
  {
    title: "Медиа",
    items: [
      {
        name: "Изображение",
        component: <Image/>,
      },
    ],
  },
]

interface Props {
  onClose: () => void;
}

export const AddMenu = ({ onClose }: Props) => {
  const {
    connectors: { create },
  } = useEditor()
  const [tabIndex, setTabIndex] = useState(1)

  return (
    <Box
      sx={{
        width: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${COLORS.gray200}`,
        backgroundColor: COLORS.secondaryVeryLightGray,
      }}
    >
      <Box
        sx={{
          padding: "12px 8px",
          color: COLORS.black,
          fontWeight: 700,
          fontSize: "14px",
          lineHeight: "20px",
        }}
      >
        Добавить блок
      </Box>

      <Tabs
        value={tabIndex}
        onChange={(_event, value: number) => setTabIndex(value)}
        variant="fullWidth"
        sx={{
          minHeight: 32,
          "& .MuiTab-root": {
            minHeight: 32,
            paddingY: 0.5,
            textTransform: "none",
            fontSize: "11px",
          },
        }}
      >
        <Tab label="Библиотека" value={0} />
        <Tab label="Материалы для холста" value={1} />
      </Tabs>

      <Box
        sx={{
          flex: 1,
          padding: "8px",
          overflowY: "auto",
        }}
      >
        {tabIndex === 0 && (
          <Box
            sx={{
              padding: "8px",
              fontSize: "12px",
              color: COLORS.gray600,
            }}
          >
            Библиотека скоро появится.
          </Box>
        )}

        {tabIndex === 1 && categories.map((category) => (
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
                  onMouseDown={onClose}
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
                      borderRadius: "4px",
                      padding: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: COLORS.white,
                        width: "100%",
                        height: "100%",
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

