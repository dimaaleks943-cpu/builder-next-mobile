import { Box, Button, Tab, Tabs, Typography } from "@mui/material"
import { type ReactNode, useMemo, useState } from "react"
import { Form } from "react-final-form"
import { type ExtranetPage, PageType } from "../../api/extranet.ts"
import { useLazyGetExtranetPagesQuery } from "../../store/extranetApi.ts"
import { COLORS } from "../../theme/colors.ts"
import { FontUploadSection } from "./components/FontUploadSection/FontUploadSection.tsx";

type HomeFormValues = {
  page: ExtranetPage[]
}

interface Props {
  onOpenBuilder: (id?: string) => void
}

interface ExtranetPageListSectionsProps {
  pages: ExtranetPage[] | undefined
  onOpenBuilder: (id?: string) => void
}

const HOME_TAB_PAGES = 0
const HOME_TAB_FONTS = 1

const ExtranetPageListSections = ({
  pages,
  onOpenBuilder,
}: ExtranetPageListSectionsProps): ReactNode => {
  const { staticPages, templatePages, systemComponentPages } = useMemo(() => {
    const list = pages ?? []
    return {
      staticPages: list.filter((p) => (p.type ?? PageType.STATIC) === PageType.STATIC),
      templatePages: list.filter((p) => p.type === PageType.TEMPLATE),
      systemComponentPages: list.filter((p) => p.type === PageType.SYSTEM_COMPONENT),
    }
  }, [pages])

  const buttonRowSx = {
    display: "flex",
    gap: 1,
    justifyContent: "center",
    flexWrap: "wrap" as const,
  }

  return (
    <Box mt={2} display="flex" flexDirection="column" gap={2}>
      {staticPages.length > 0 ? (
        <Box>
          <Typography variant="subtitle1" component="h2" sx={{ mb: 1 }}>
            Статические страницы
          </Typography>
          <Box sx={buttonRowSx}>
            {staticPages.map((page) => (
              <Button
                key={page.id}
                variant="outlined"
                size="small"
                onClick={() => onOpenBuilder(page.id)}
              >
                {page.name}
              </Button>
            ))}
          </Box>
        </Box>
      ) : null}
      {templatePages.length > 0 ? (
        <Box>
          <Typography variant="subtitle1" component="h2" sx={{ mb: 1 }}>
            Шаблоны
          </Typography>
          <Box sx={buttonRowSx}>
            {templatePages.map((page) => (
              <Button
                key={page.id}
                variant="outlined"
                size="small"
                onClick={() => onOpenBuilder(page.id)}
              >
                {page.name}
              </Button>
            ))}
          </Box>
        </Box>
      ) : null}
      {systemComponentPages.length > 0 ? (
        <Box>
          <Typography variant="subtitle1" component="h2" sx={{ mb: 1 }}>
            Системные компоненты
          </Typography>
          <Box sx={buttonRowSx}>
            {systemComponentPages.map((page) => (
              <Button
                key={page.id}
                variant="outlined"
                size="small"
                onClick={() => onOpenBuilder(page.id)}
              >
                {page.name}
              </Button>
            ))}
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}

const PagesTabContent = ({
  pages,
  onOpenBuilder,
  onLoadPages,
}: {
  pages: ExtranetPage[]
  onOpenBuilder: (id?: string) => void
  onLoadPages: () => void
}): ReactNode => (
  <Box textAlign="center">
    <Typography variant="h4" component="h1" gutterBottom>
      Конструктор сайтов
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
      В этом модуле вы будете собирать страницы из блоков и экспортировать их в web и
      мобильное приложение.
    </Typography>
    <Button variant="contained" size="large" color="primary" onClick={() => onOpenBuilder()}>
      Конструктор
    </Button>
    <Box mt={2}>
      <Button variant="outlined" size="small" onClick={onLoadPages}>
        Загрузить страницы extranet
      </Button>
    </Box>
    <ExtranetPageListSections pages={pages} onOpenBuilder={onOpenBuilder} />
  </Box>
)

export const HomePage = ({ onOpenBuilder }: Props): ReactNode => {
  const [fetchExtranetPages] = useLazyGetExtranetPagesQuery()
  const [activeTab, setActiveTab] = useState(HOME_TAB_PAGES)

  const initialValues = useMemo((): HomeFormValues => ({ page: [] }), [])

  const handleLoadPages = async (setPages: (pages: ExtranetPage[]) => void) => {
    try {
      const data = await fetchExtranetPages().unwrap()
      setPages(data.data ?? [])
    } catch (error) {
      console.error("Ошибка при запросе страниц extranet:", error)
    }
  }

  return (
    <Form<HomeFormValues>
      onSubmit={() => {}}
      initialValues={initialValues}
      render={({ handleSubmit, values, form }) => (
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              height: "100vh",
              width: "100vw",
              bgcolor: COLORS.white,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 1440,
                mx: "auto",
                px: 2,
                borderBottom: `1px solid ${COLORS.gray200}`,
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_event, value: number) => setActiveTab(value)}
                sx={{
                  minHeight: 48,
                  "& .MuiTab-root": {
                    minHeight: 48,
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.gray700,
                  },
                  "& .Mui-selected": {
                    color: COLORS.purple400,
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: COLORS.purple400,
                  },
                }}
              >
                <Tab label="Страницы" value={HOME_TAB_PAGES} />
                <Tab label="Шрифты" value={HOME_TAB_FONTS} />
              </Tabs>
            </Box>

            <Box
              sx={{
                flex: 1,
                width: "100%",
                maxWidth: 1440,
                mx: "auto",
                px: 2,
                py: 3,
                overflowY: "auto",
                bgcolor: COLORS.lightGray,
              }}
            >
              {activeTab === HOME_TAB_PAGES ? (
                <PagesTabContent
                  pages={values.page}
                  onOpenBuilder={onOpenBuilder}
                  onLoadPages={() => handleLoadPages((pages) => form.change("page", pages))}
                />
              ) : (
                <FontUploadSection />
              )}
            </Box>
          </Box>
        </form>
      )}
    />
  )
}
