import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { HomePage } from './pages/HomePage'
import { BuilderPage } from './pages/BuilderPage'

const theme = createTheme()

const AppRouter = () => {
  const navigate = useNavigate()

  return (
    <Routes>
      <Route path="/" element={<HomePage onOpenBuilder={() => navigate('/builder')} />} />
      <Route path="/builder" element={<BuilderPage />} />
    </Routes>
  )
}

export const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </ThemeProvider>
)

export default App
