import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'dayjs/locale/pt-br';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import CheckIn from './pages/CheckIn';
import Dashboard from './pages/Dashboard';
import Estoque from './pages/Estoque';
import Funcionarios from './pages/Funcionarios';
import Pratos from './pages/Pratos';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/estoque" element={<Estoque />} />
              <Route path="/funcionarios" element={<Funcionarios />} />
              <Route path="/pratos" element={<Pratos />} />
              <Route path="/checkin" element={<CheckIn />} />
            </Routes>
          </Layout>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;