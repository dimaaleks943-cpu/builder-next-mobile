import { ReactNode } from 'react'
import { Box, Button, Typography } from '@mui/material'

type HomePageProps = {
  onOpenBuilder: () => void
}

export const HomePage = ({ onOpenBuilder }: HomePageProps): ReactNode => {
  return (
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
            В этом модуле вы будете собирать страницы из блоков и экспортировать их в web и мобильное приложение.
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={onOpenBuilder}
          >
            Конструктор
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

