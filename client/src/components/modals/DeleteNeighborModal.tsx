import {
    DialogBody,
    DialogFooter,
    Button,
    Dialog,
    Typography
} from "@material-tailwind/react"

interface NeighborType {
  id: number;
  first_name: string;
  second_name: string;
  last_name: string;
  ci: string;
  phone_number: string;
  email: string;
}

type DeleteNeighborModalType = {
    openModalState: boolean,
    handleCloseModal: () => void,
    neighbor: NeighborType | null,
    onConfirmDelete: () => void
}

const DeleteNeighborModal: React.FC<DeleteNeighborModalType> = ({
    openModalState,
    handleCloseModal,
    neighbor,
    onConfirmDelete
}) => {

    const handleDelete = () => {
        onConfirmDelete();
        handleCloseModal();
    }

    return(
        <Dialog open={openModalState} handler={handleCloseModal} size="sm">
            <DialogBody className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-8 w-8 text-red-500"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                    </svg>
                </div>
                <Typography variant="h4" color="blue-gray" className="mb-2">
                    ¿Eliminar Vecino?
                </Typography>
                <Typography color="gray" className="mb-4 font-normal">
                    ¿Estás seguro que deseas eliminar al vecino{' '}
                    <span className="font-semibold">
                        {neighbor?.first_name} {neighbor?.second_name} {neighbor?.last_name}
                    </span>
                    ?
                </Typography>
                <Typography color="gray" className="font-normal text-sm">
                    Esta acción no se puede deshacer.
                </Typography>
            </DialogBody>
            <DialogFooter className="justify-center gap-2">
                <Button
                    variant="outlined"
                    color="blue-gray"
                    onClick={handleCloseModal}
                >
                    <span>Cancelar</span>
                </Button>
                <Button
                    variant="gradient"
                    color="red"
                    onClick={handleDelete}
                >
                    <span>Eliminar</span>
                </Button>
            </DialogFooter>
        </Dialog>
    )
}

export default DeleteNeighborModal
