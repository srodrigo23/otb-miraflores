import { useState } from 'react';
import { NavLink   } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@material-tailwind/react';
import { UserIcon } from '@heroicons/react/24/outline';

const TopNavBar: React.FC<{pathName: string}> = ({ pathName }) => {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout =  async () => {
    await logout();
  };

  const navigationItems = [
    { label: 'Vecinos', path: '/vecinos' },
    { label: 'Mediciones', path: '/mediciones' },
    // { label: 'Reuniones', path: '/reuniones' },
    // { label: 'Recaudaciones', path: '/recaudaciones' },
  ];

  return (
    <nav className='bg-black text-white shadow-md'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-20'>
          <p className='flex flex-col items-center font-bold text-3xl tracking-wide'>
            OTB
            <span className='text-sm text-blue-500'>MIRAFLORES</span>
          </p>

          <div className='hidden md:flex items-center gap-6'>
            {navigationItems.map((item) => {
              const isActive = pathName === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative px-1 py-1 text-xl font-bold transition-colors ${
                    isActive
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className='absolute bottom-1 left-0 right-0 h-0.5 mx-2 bg-yellow-400 rounded-full' />
                  )}
                </NavLink>
              );
            })}

            <span className='w-px h-5 bg-gray-600' />
            <p className='flex gap-2 items-center text-sm font-bold cursor-pointer select-none'>
              <span className='flex gap-2 border rounded-xl p-2'>
                <UserIcon className='w-5 h-5' />
                {`${user?.first_name.toUpperCase()} ${user?.last_name.toUpperCase()}`}
              </span>
              <Button
                onClick={handleLogout}
                variant='text'
                size='sm'
                className='rounded-full text-red-400'
              >
                Cerrar sesión
              </Button>
            </p>
          </div>
          <div className='md:hidden flex gap-1'>
            <span className='flex gap-2 border rounded-xl p-2 text-xs items-center'>
              <UserIcon className='w-5 h-5' />
              {`${user?.first_name.toUpperCase()} ${user?.last_name.toUpperCase()}`}
            </span>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className=' p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors'
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className='h-6 w-6' />
              ) : (
                <Bars3Icon className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className='md:hidden border-t border-gray-700'>
          <div className='px-4 pt-3 pb-4 space-y-1'>
            {navigationItems.map((item) => {
              const isActive = pathName === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'text-yellow-400 bg-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className='ml-2 inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full align-middle' />
                  )}
                </NavLink>
              );
            })}
          </div>
          <span className='w-px h-5 bg-gray-600' />
          <p className='flex gap-2 items-center text-sm font-bold cursor-pointer select-none'>
            <Button
              onClick={handleLogout}
              variant='text'
              size='sm'
              className='rounded-full text-red-400'
            >
              Cerrar sesión
            </Button>
          </p>
          {/* <div className='border-t border-gray-700 px-4 py-3'>
            <button
              onClick={handleLogout}
              className='flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm font-medium transition-colors'
            >
              Cerrar sesión
            </button>
          </div> */}
        </div>
      )}
    </nav>
  );
};

export default TopNavBar;
