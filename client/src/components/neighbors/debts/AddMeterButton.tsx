import { useState } from 'react';
import { IconButton, Tooltip } from '@material-tailwind/react';
import { PlusIcon } from '@heroicons/react/24/outline';

import { InputsNewMeterForm } from '../../../types/NeighborsTypes';
import NewMeterModalForm from '../../forms/NewMeterModalForm';

/**
 * Registers a meter for the neighbor. Owns the modal, so it can be dropped
 * both next to the meter tabs and into the empty state of a neighbor that has
 * no meters yet — which is exactly who needs it.
 */
export const AddMeterButton: React.FC<{
  /** Resolves to whether it was created; the modal stays open on failure */
  onCreateMeter: (data: InputsNewMeterForm) => Promise<boolean>;
}> = ({ onCreateMeter }) => {
  const [openModal, setOpenModal] = useState(false);
  const toggleModal = () => setOpenModal((isOpen) => !isOpen);

  return (
    <>
      <Tooltip content='Agregar medidor'>
        <IconButton
          variant='gradient'
          color='blue'
          size='md'
          onClick={toggleModal}
          aria-label='Agregar medidor'
          className='shrink-0'
        >
          <PlusIcon className='h-5 w-5' />
        </IconButton>
      </Tooltip>

      <NewMeterModalForm
        openModalState={openModal}
        handleCloseModal={toggleModal}
        onSubmit={onCreateMeter}
      />
    </>
  );
};

export default AddMeterButton;
