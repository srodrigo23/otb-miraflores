import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SideDrawerNav, {
  DrawerTopBar,
} from './components/navigation/SideDrawerNav';
import { Footer } from './components/shared/Footer';
// import { Footer } from './components/shared/Footer';

const COLLAPSED_KEY = 'otb.nav.collapsed';

/**
 * Same shell as App.tsx but with a left drawer instead of the top navbar.
 * App.tsx and TopNavBar are left untouched; swap the import in ProtectedRoute
 * to switch between the two.
 */
function AppDrawer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === 'true',
  );
  const { pathname } = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setIsDrawerOpen(false), [pathname]);

  const toggleCollapsed = () =>
    setIsCollapsed((prev) => {
      localStorage.setItem(COLLAPSED_KEY, String(!prev));
      return !prev;
    });

  return (
    <>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
      <div className='flex h-screen w-full overflow-hidden bg-gray-50'>
        <SideDrawerNav
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          collapsed={isCollapsed}
          onToggleCollapsed={toggleCollapsed}
        />

        <div className='flex min-w-0 flex-1 flex-col'>
          <DrawerTopBar onOpen={() => setIsDrawerOpen(true)} />
          <main className='flex-1 overflow-y-auto'>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default AppDrawer;
