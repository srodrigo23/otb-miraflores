import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const BackButton:React.FC<{path:string}> = ({path}) => {
  const navigate = useNavigate();
  return (
    <button
      className='flex items-center gap-2 text-sm text-blue-gray-600 hover:text-blue-gray-900 transition-colors py-2 px-1 w-fit cursor-pointer'
      onClick={() => navigate(path)}
    >
      <ArrowLeftIcon className='w-4 h-4' />
      Atrás
    </button>
  );
};
