import { useNavigate } from 'react-router-dom';

export const BackButton:React.FC<{path:string}> = ({path}) => {
  const navigate = useNavigate();
  return (
    <div
      className='text-gray-500  underline border w-fit p-3 rounded-lg select-none cursor-pointer'
      onClick={() => navigate(path)}
    >
      {' '}
      {'Atrás'}
    </div>
  );
};
