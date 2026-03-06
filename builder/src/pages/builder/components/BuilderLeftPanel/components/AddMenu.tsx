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
import { useMemo, useState } from "react"
import { COLORS } from "../../../../../theme/colors"
import { CraftBlock } from "../../../../../craft/Block.tsx"
import { CraftText } from "../../../../../craft/Text.tsx"
import { CraftLinkText } from "../../../../../craft/LinkText.tsx"
import { CraftContentList } from "../../../../../craft/ContentList.tsx"
import { CraftImage } from "../../../../../craft/Image.tsx"
import { useBuilderModeContext } from "../../../context/BuilderModeContext"
import { MODE_TYPE } from "../../../builder.enum"

interface ComponentItem {
  name: string;
  component: ReactElement;
}

interface Category {
  title: string;
  items: ComponentItem[];
}

export const useCategories = (): Category[] => {
  const modeContext = useBuilderModeContext()
  const isRn = modeContext?.mode === MODE_TYPE.RN

  return useMemo(
    () => [
      {
        title: "Базовые",
        items: [
          {
            name: "Div-блок",
            component: isRn ? (
              <CraftBlock layout="flex" />
            ) : (
              <CraftBlock />
            ),
          },
        ],
      },
      {
        title: "Типографика",
        items: [
          { name: "Текст", component: <CraftText /> },
          { name: "Текст-ссылка", component: <CraftLinkText /> },
        ],
      },
      {
        title: "CMS",
        items: [
          { name: "Список контента", component: <CraftContentList /> },
        ],
      },
      {
        title: "Медиа",
        items: [{ name: "Изображение", component: <CraftImage /> }],
      },
    ],
    [isRn],
  )
}

interface Props {
  onClose: () => void;
}

export const AddMenu = (_props: Props) => {
  const { connectors: { create } } = useEditor()
  const [tabIndex, setTabIndex] = useState(1)
  const categories = useCategories()

  return (
    <Box
      sx={{
        width: "280px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${COLORS.gray200}`,
        backgroundColor: COLORS.secondaryVeryLightGray,
      }}
    >
      <Box
        sx={{
          paddingTop: "12px",
          paddingRight: "8px",
          paddingBottom: "12px",
          paddingLeft: "8px",
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
          minHeight: "32px",
          "& .MuiTab-root": {
            minHeight: "32px",
            paddingTop: "4px",
            paddingBottom: "4px",
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
              paddingTop: "8px",
              paddingRight: "8px",
              paddingBottom: "8px",
              paddingLeft: "8px",
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
                minHeight: "40px",
                paddingTop: 0,
                paddingRight: "8px",
                paddingBottom: 0,
                paddingLeft: "8px",
                "& .MuiAccordionSummary-content": {
                  margin: 0,
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: COLORS.gray700,
                  fontWeight: 600,
                }}
              >
                {category.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                paddingTop: "8px",
                paddingRight: "8px",
                paddingBottom: "8px",
                paddingLeft: "8px",
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
                      fontSize: "8px",
                      lineHeight: "10px",
                      color: COLORS.gray600,
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

