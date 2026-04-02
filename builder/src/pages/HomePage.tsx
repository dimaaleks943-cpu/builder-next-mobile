import { Box, Button, Typography } from "@mui/material"
import { Form } from "react-final-form"
import { PageType, type ExtranetPage } from "../api/extranet"
import { useLazyGetExtranetPagesQuery } from "../store/extranetApi"
import { useMemo, type ReactNode } from "react"
type HomeFormValues = {
  page: ExtranetPage[]
}

type HomePageProps = {
  onOpenBuilder: (id?: string) => void
}

type ExtranetPageListSectionsProps = {
  pages: ExtranetPage[] | undefined
  onOpenBuilder: (id?: string) => void
}

function ExtranetPageListSections({
  pages,
  onOpenBuilder,
}: ExtranetPageListSectionsProps): ReactNode {
  const { staticPages, templatePages } = useMemo(() => {
    const list = pages ?? []
    return {
      staticPages: list.filter((p) => (p.type ?? PageType.STATIC) === PageType.STATIC),
      templatePages: list.filter((p) => p.type === PageType.TEMPLATE),
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
            {staticPages.map(page => (
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
            {templatePages.map(page => (
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

export const HomePage = ({ onOpenBuilder }: HomePageProps): ReactNode => {
  const [fetchExtranetPages] = useLazyGetExtranetPagesQuery()

  const initialValues = useMemo(
    (): HomeFormValues => ({ page: [] }),
    [],
  )

  const handleLoadPages = async (
    setPages: (pages: ExtranetPage[]) => void,
  ) => {
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
      render={({ handleSubmit, values, form }) => {
        return (
          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                height: '100vh',
                width: '100vw',
                bgcolor: '#ffffff',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 1440,
                  mx: 'auto',
                  px: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100vh',
                  bgcolor: '#f5f5f5',
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h4" component="h1" gutterBottom>
                    Конструктор сайтов
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    В этом модуле вы будете собирать страницы из блоков и экспортировать их в web и мобильное
                    приложение.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    onClick={() => onOpenBuilder()}
                  >
                    Конструктор
                  </Button>
                  <Box mt={2}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleLoadPages(pages => form.change('page', pages))}
                    >
                      Загрузить страницы extranet
                    </Button>
                  </Box>
                  <ExtranetPageListSections
                    pages={values.page}
                    onOpenBuilder={onOpenBuilder}
                  />
                </Box>
              </Box>
            </Box>
          </form>
        )
      }}
    />
  )
}

