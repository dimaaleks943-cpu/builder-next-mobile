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
import { Element, useEditor } from "@craftjs/core"
import { useMemo, useState } from "react"
import { COLORS } from "../../../../../theme/colors"
import { CraftBlock } from "../../../../../craft/Block.tsx"
import { CraftHeading } from "../../../../../craft/CraftHeading.tsx"
import { CraftParagraph } from "../../../../../craft/CraftParagraph.tsx"
import { CraftButton } from "../../../../../craft/CraftButton.tsx"
import { CraftLinkText } from "../../../../../craft/LinkText.tsx"
import { CraftLinkBlock } from "../../../../../craft/CraftLinkBlock.tsx"
import { CraftContentList } from "../../../../../craft/ContentList.tsx"
import { CraftCategoryFilter } from "../../../../../craft/CategoryFilter.tsx"
import { CraftImage } from "../../../../../craft/Image.tsx"
import { CraftNavbar } from "../../../../../craft/CraftNavbar/CraftNavbar.tsx"
import { CraftNavbarMenuButton } from "../../../../../craft/CraftNavbar/components/CraftNavbarMenuButton.tsx"
import { CraftNavbarMenu } from "../../../../../craft/CraftNavbar/components/CraftNavbarMenu.tsx"
import { CraftNavbarLinks } from "../../../../../craft/CraftNavbar/components/CraftNavbarLinks.tsx"
import { useBuilderModeContext } from "../../../context/BuilderModeContext"
import { MODE_TYPE, PreviewViewport } from "../../../builder.enum"

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
          { name: "Div-блок", component: <CraftBlock /> },
          { name: "Кнопка", component: <CraftButton /> },
          { name: "Ссылка-блок", component: <CraftLinkBlock /> },
        ],
      },
      {
        title: "Типографика",
        items: [
          { name: "Заголовок", component: <CraftHeading /> },
          { name: "Текст", component: <CraftParagraph /> },
          { name: "Текст-ссылка", component: <CraftLinkText /> },
        ],
      },
      {
        title: "CMS",
        items: [
          { name: "Список контента", component: <CraftContentList /> },
          {
            name: "Фильтр категорий",
            // Пару с ContentList задаёт одинаковый filterScope в настройках блоков.
            component: <CraftCategoryFilter />,
          },
        ],
      },
      {
        title: "Медиа",
        items: [{ name: "Изображение", component: <CraftImage /> }],
      },
      {
        title: "Advanced",
        items: [
          {
            name: "Панель навигации",
            component: (
              <Element is={CraftNavbar} canvas>
                <Element
                  is={CraftBlock}
                  canvas
                  style={{
                    [PreviewViewport.DESKTOP]: {
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      width: "100%",
                    },
                  }}
                >
                  <Element is={CraftNavbarMenuButton} />
                  <Element
                    is={CraftNavbarLinks}
                    canvas
                    style={{
                      [PreviewViewport.DESKTOP]: {
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      },
                    }}
                  >
                    <Element is={CraftLinkText} text="About" href="#" linkMode="url" />
                    <Element is={CraftLinkText} text="Home" href="#" linkMode="url" />
                    <Element is={CraftLinkText} text="Contact" href="#" linkMode="url" />
                  </Element>
                </Element>
                <Element is={CraftNavbarMenu} canvas>
                  <Element is={CraftLinkText} text="About" href="#" linkMode="url" />
                  <Element is={CraftLinkText} text="Home" href="#" linkMode="url" />
                  <Element is={CraftLinkText} text="Contact" href="#" linkMode="url" />
                </Element>
              </Element>
            ),
          },
        ],
      },
    ],
    [isRn],
  )
}

interface Props {
  onClose: () => void;
  onDragStartHide: () => void;
}

export const AddMenu = ({ onClose, onDragStartHide }: Props) => {
  const { connectors: { create } } = useEditor()
  const [tabIndex, setTabIndex] = useState(1)
  const categories = useCategories()

  const handleDragStart = () => {
    window.requestAnimationFrame(() => {
      onDragStartHide()
    })
  }

  const handleDragEnd = () => onClose();

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
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
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

