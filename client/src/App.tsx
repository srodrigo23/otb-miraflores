// import NavBarComponent from './components/navigation/NavBarComponent'
import { useLocation } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
// import { useState } from 'react'
// import { ListBullets, XCircle } from '@phosphor-icons/react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import TopNavBar from './components/navigation/TopNavBar'
import { Footer } from './components/shared/Footer'

function App() {

  const {pathname} = useLocation()
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // const toggleSidebar = () => {
  //   setIsSidebarOpen(!isSidebarOpen)
  // }

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
      <div className='flex flex-col h-screen overflow-hidden w-full bg-gray-50 '>
        <TopNavBar pathName={pathname} />
        {/* lg:min-h-0 */}
        <main className='flex-1 overflow-y-auto'>
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App
