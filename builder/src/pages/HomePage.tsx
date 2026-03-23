import { Box, Button, Typography } from "@mui/material"
import { Form } from "react-final-form"
import type { ExtranetPage } from "../api/extranet"
import { useLazyGetExtranetPagesQuery } from "../store/extranetApi"
import { useMemo, type ReactNode } from "react"
type HomeFormValues = {
  page: ExtranetPage[]
}

type HomePageProps = {
  onOpenBuilder: (id?: string) => void
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
                  <Box mt={2} display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                    {values.page?.map(page => (
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
              </Box>
            </Box>
          </form>
        )
      }}
    />
  )
}

