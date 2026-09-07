import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronDoubleLeftIcon,
} from '@heroicons/react/24/outline';
import { Droplets } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Same routes as TopNavBar, plus an icon for the collapsed rail.
const navigationItems = [
  { label: 'Vecinos', path: '/vecinos', icon: UsersIcon },
  { label: 'Mediciones', path: '/mediciones', icon: ClipboardDocumentListIcon },
  { label: 'Pagos', path: '/pagos', icon: BanknotesIcon },
  // { label: 'Reuniones', path: '/reuniones', icon: CalendarDaysIcon },
  // { label: 'Recaudaciones', path: '/recaudaciones', icon: InboxStackIcon },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  collector: 'Cobrador',
};

/** Same blue gradient the neighbor cards use for their avatars. */
const BrandMark = () => (
  <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md'>
    <Droplets className='h-5 w-5' />
  </span>
);

type SideDrawerNavProps = {
  /** Mobile drawer visibility. Ignored on lg+, where the rail is always shown. */
  open: boolean;
  onClose: () => void;
  /** Desktop rail collapsed to icons only. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

const SideDrawerNav = ({
  open,
  onClose,
  collapsed,
  onToggleCollapsed,
}: SideDrawerNavProps) => {
  const { logout, user } = useAuth();

  const displayName = user
    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
    : '';
  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : '';
  const roleLabel = user ? (ROLE_LABELS[user.role] ?? user.role) : '';

  // Hides labels on the collapsed desktop rail while keeping them on mobile,
  // where the drawer is always full width.
  const labelHidden = collapsed ? 'lg:hidden' : '';
  const centerWhenCollapsed = collapsed ? 'lg:justify-center lg:px-0' : '';

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  // Close the mobile drawer with Escape and lock body scroll while it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        onClick={onClose}
        aria-hidden='true'
        className={`fixed inset-0 z-40 bg-blue-gray-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-cyan-100 bg-gradient-to-b from-sky-50 via-cyan-50 to-white text-blue-gray-800 shadow-2xl transition-[transform,width] duration-300 ease-in-out lg:static lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-64 lg:w-20' : 'w-64'}`}
      >
        {/* Brand */}
        <div className='flex h-16 shrink-0 items-center gap-3 px-4 sm:h-20'>
          <NavLink
            to='/'
            onClick={onClose}
            title='OTB Miraflores'
            className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${centerWhenCollapsed}`}
          >
            <BrandMark />
            <span
              className={`flex min-w-0 flex-col leading-tight ${labelHidden}`}
            >
              <span className='truncate text-lg font-extrabold tracking-wide text-blue-gray-900'>
                OTB Miraflores
              </span>
              <span className='truncate text-[11px] font-medium text-blue-gray-500'>
                Sistema Centralizado
              </span>
            </span>
          </NavLink>

          {/* Close — mobile only */}
          <button
            onClick={onClose}
            aria-label='Cerrar menú'
            className='-mr-1 shrink-0 rounded-lg p-2 text-blue-gray-500 transition-colors hover:bg-white hover:text-blue-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden'
          >
            <XMarkIcon className='h-6 w-6' />
          </button>
        </div>

        <span
          className='mx-4 h-px shrink-0 bg-cyan-100'
          aria-hidden='true'
        />

        {/* Links */}
        <nav className='flex-1 overflow-y-auto px-3 py-4'>
          <p
            className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-blue-gray-400 ${labelHidden}`}
          >
            Navegación
          </p>

          <div className='space-y-1'>
            {navigationItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                title={label}
                className={({ isActive }) =>
                  // Active state mirrors ViewSwitch: white pill, blue label.
                  `relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${centerWhenCollapsed} ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-blue-gray-600 hover:bg-white/70 hover:text-blue-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active marker on the left edge */}
                    <span
                      className={`absolute inset-y-0 left-0 w-1 rounded-r-full bg-blue-500 transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        isActive ? 'text-blue-500' : 'text-blue-gray-400'
                      }`}
                    />
                    <span className={labelHidden}>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User + actions */}
        <div className='shrink-0 border-t border-cyan-100 p-3'>
          <div
            className={`flex items-center gap-3 rounded-xl border border-blue-gray-100 bg-white px-3 py-2.5 shadow-sm ${centerWhenCollapsed}`}
            title={`${displayName}${roleLabel ? ` · ${roleLabel}` : ''}`}
          >
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white shadow-md'>
              {initials}
            </span>
            <span
              className={`flex min-w-0 flex-col leading-tight ${labelHidden}`}
            >
              <span className='truncate text-sm font-semibold text-blue-gray-900'>
                {displayName}
              </span>
              <span className='truncate text-[11px] text-blue-gray-500'>
                {roleLabel}
              </span>
            </span>
          </div>

          <div className='mt-2 space-y-1'>
            <button
              onClick={handleLogout}
              title='Cerrar sesión'
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${centerWhenCollapsed}`}
            >
              <ArrowRightStartOnRectangleIcon className='h-5 w-5 shrink-0' />
              <span className={labelHidden}>Cerrar sesión</span>
            </button>

            {/* Collapse toggle — desktop only */}
            <button
              onClick={onToggleCollapsed}
              aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
              className={`hidden w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-blue-gray-400 transition-colors hover:bg-white hover:text-blue-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:flex ${centerWhenCollapsed}`}
            >
              <ChevronDoubleLeftIcon
                className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                  collapsed ? 'rotate-180' : ''
                }`}
              />
              <span className={labelHidden}>Contraer</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

/** Slim bar that holds the hamburger. Mobile only — the rail replaces it on lg+. */
export const DrawerTopBar = ({ onOpen }: { onOpen: () => void }) => (
  <header className='flex h-16 shrink-0 items-center gap-3 border-b border-cyan-100 bg-gradient-to-r from-sky-50 to-cyan-50 px-3 lg:hidden'>
    <button
      onClick={onOpen}
      aria-label='Abrir menú'
      className='rounded-lg p-2 text-blue-gray-600 transition-colors hover:bg-white hover:text-blue-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
    >
      <Bars3Icon className='h-6 w-6' />
    </button>
    <span className='flex items-center gap-2'>
      <BrandMark />
      <span className='text-lg font-extrabold tracking-wide text-blue-gray-900'>
        OTB Miraflores
      </span>
    </span>
  </header>
);

export default SideDrawerNav;
