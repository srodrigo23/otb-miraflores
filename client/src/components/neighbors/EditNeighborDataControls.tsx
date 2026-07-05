import { XMarkIcon } from "@heroicons/react/24/outline";
import { IconButton, Typography } from "@material-tailwind/react";
import { CheckIcon, PencilIcon } from "lucide-react";


const EditNeighborDataControls: React.FC<{
  edit: boolean;
  setEdit: (el: boolean) => void;
  updateNeighborDetail: () => void;
  onCancel?: () => void;
}> = ({ edit, setEdit, updateNeighborDetail, onCancel }) => {
  return (
    <div className='flex justify-between pb-3 px-4 lg:px-6'>
      <Typography variant='h5' className='text-lg lg:text-xl'>Datos personales</Typography>
      {!edit ? (
        <IconButton
          size='sm'
          variant='outlined'
          color='blue-gray'
          onClick={() => setEdit(true)}
        >
          <PencilIcon className='h-5 w-5' />
        </IconButton>
      ) : (
        <div className='flex gap-1'>
          <IconButton
            size='sm'
            variant='filled'
            color='red'
            onClick={() => onCancel?.()}
          >
            <XMarkIcon className='h-5 w-5' />
          </IconButton>
          <IconButton
            size='sm'
            variant='filled'
            color='green'
            onClick={updateNeighborDetail}
          >
            <CheckIcon className='h-5 w-5' />
          </IconButton>
        </div>
      )}
    </div>
  );
};
export default EditNeighborDataControls;