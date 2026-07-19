import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const navigationItems = [
  { label: 'Vecinos', path: '/vecinos' },
  { label: 'Mediciones', path: '/mediciones' },
  // { label: 'Reuniones', path: '/reuniones' },
  // { label: 'Recaudaciones', path: '/recaudaciones' },
];

const TopNavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();

  const displayName = user
    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim().toUpperCase()
    : '';

  const closeMenu = () => setIsMobileMenuOpen(false);
  const handleLogout = async () => {
    closeMenu();
    await logout();
  };

  // Close the mobile menu with Escape and lock body scroll while it's open.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const UserBadge = ({ className = '' }: { className?: string }) => (
    <span
      className={`flex items-center gap-2 rounded-xl border border-gray-700 px-3 py-1.5 ${className}`}
      title={displayName}
    >
      <UserIcon className='h-5 w-5 shrink-0 text-blue-400' />
      <span className='max-w-[9rem] truncate font-semibold'>{displayName}</span>
    </span>
  );

  const LogoutButton = ({ full = false }: { full?: boolean }) => (
    <button
      onClick={handleLogout}
      className={`flex items-cenokimter justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 ${
        full ? 'w-full' : ''
      }`}
    >
      <ArrowRightStartOnRectangleIcon className='h-5 w-5' />
      Cerrar sesión
    </button>
  );

  return (
    <nav className='sticky top-0 z-50 border-b border-gray-800 bg-black/95 text-white shadow-md backdrop-blur supports-[backdrop-filter]:bg-black/80'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between sm:h-20'>
          {/* Brand */}
          <NavLink
            to='/'
            onClick={closeMenu}
            className='flex flex-col leading-none tracking-wide rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60'
          >
            <span className='text-2xl font-extrabold sm:text-3xl'>OTB</span>
            <span className='text-xs font-semibold text-blue-500 sm:text-sm'>
              MIRAFLORES
            </span>
          </NavLink>

          {/* Desktop navigation */}
          <div className='hidden items-center gap-6 md:flex'>
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative px-1 py-1 text-lg font-bold transition-colors focus:outline-none focus-visible:text-white lg:text-xl ${
                    isActive
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span
                      className={`absolute -bottom-0.5 left-0 right-0 mx-1 h-0.5 origin-center rounded-full bg-yellow-400 transition-transform duration-200 ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}

            <span className='h-6 w-px bg-gray-700' aria-hidden='true' />
            <UserBadge className='text-sm' />
            <LogoutButton />
          </div>

          {/* Mobile controls */}
          <div className='flex items-center gap-2 md:hidden'>
            <UserBadge className='max-w-[45vw] text-xs' />
            <button
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className='rounded-md p-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60'
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMobileMenuOpen}
              aria-controls='mobile-menu'
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

      {/* Mobile menu — animated open/close, no exit-flicker */}
      <div
        id='mobile-menu'
        className={`overflow-hidden border-t border-gray-800 transition-[max-height,opacity] duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen
            ? 'max-h-96 opacity-100'
            : 'pointer-events-none max-h-0 opacity-0'
        }`}
      >
        <div className='space-y-1 px-4 pb-3 pt-3'>
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-semibold transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-yellow-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`h-1.5 w-1.5 rounded-full bg-yellow-400 transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className='border-t border-gray-800 px-4 py-3'>
          <LogoutButton full />
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
