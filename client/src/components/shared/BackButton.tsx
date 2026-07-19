import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BackButtonProps {
  /** Explicit destination. If omitted, goes back in history (with `path` as fallback). */
  path?: string;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  path,
  label = 'Atrás',
  className = '',
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Explicit destination wins; otherwise go back in history (or home if none).
    if (path) navigate(path);
    else if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/');
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      aria-label={label}
      className={`group inline-flex w-fit items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-blue-gray-600 transition-colors hover:bg-blue-gray-50 hover:text-blue-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-gray-400/60 active:scale-95 ${className}`}
    >
      <ArrowLeftIcon className='h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5' />
      {label}
    </button>
  );
};
