import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { ThemeProvider } from '@material-tailwind/react';

// import CheckNeighborDebts from './pages/checkDebts/CheckNeighborsDebts.tsx';
import Neighbors from './pages/neighbors/Neighbors.tsx';
import Meetings from './pages/meetings/Meetings.tsx';
import Collections from './pages/collections/Collections.tsx';
// import Receipts from './pages/receipts/Receipts.tsx';
import Measures from './pages/measures/Measures.tsx';

import { AuthProvider } from './context/AuthContext.tsx';
import ProtectedRoute from './components/shared/ProtectedRoute.tsx';

import { Login } from './pages/login/Login.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* <Route element={<App />}/> */}

            <Route path='/login' element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path='/' element={<Neighbors />} />

              <Route path='/Reuniones' element={<Meetings />} />
              <Route path='/recaudaciones' element={<Collections />} />
              {/* <Route path="/recibos" element={<Receipts />} /> */}
              <Route path='/vecinos' element={<Neighbors />} />
              <Route path='/mediciones' element={<Measures />} />
            </Route>

            {/* <Route element={<CheckLayout/>}>
                <Route index element={<CheckNeighborDebts />} />
              </Route> */}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
