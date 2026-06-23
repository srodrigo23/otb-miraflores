import { useState } from 'react';
import { NavLink   } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

interface TopNavBarProps {
  pathName: string;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ pathName }) => {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout =  async () => {
    await logout();
  };

  const navigationItems = [
    { label: 'Vecinos', path: '/vecinos' },
    { label: 'Mediciones', path: '/mediciones' },
    { label: 'Reuniones', path: '/reuniones' },
    { label: 'Recaudaciones', path: '/recaudaciones' },
  ];

  return (
    <nav className='bg-gray-900 text-white shadow-md'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-14'>
          <span className='font-bold text-base sm:text-lg tracking-wide'>
            OTB MIRAFLORES
          </span>

          <div className='hidden md:flex items-center gap-6'>
            {navigationItems.map((item) => {
              const isActive = pathName === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative px-1 py-1 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className='absolute -bottom-1 left-0 right-0 h-0.5 bg-yellow-400 rounded-full' />
                  )}
                </NavLink>
              );
            })}

            <span className='w-px h-5 bg-gray-600' />

            <button
              onClick={handleLogout}
              className='text-red-400 hover:text-red-300 text-sm font-medium transition-colors'
            >
              Cerrar sesión
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors'
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
          <div className='border-t border-gray-700 px-4 py-3'>
            <button
              onClick={handleLogout}
              className='flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm font-medium transition-colors'
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNavBar;
