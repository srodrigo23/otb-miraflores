import {
    Input,
    DialogBody,
    DialogFooter,
    Button,
    Dialog,
    Typography
} from "@material-tailwind/react"

import { useForm, SubmitHandler } from "react-hook-form"
import { useEffect } from "react"

type InputsNewNeighborForm = {
  firstName: string
  secondName: string
  lastName:string
  password: string
  ci:string
  phonenumber:string
  email:string
}

type NewNeighborModalFormType = {
    openModalState:boolean,
    handleCloseModal:()=>void,
    onSubmit: (data: InputsNewNeighborForm) => void
}

const NewNeighborModalForm: React.FC<NewNeighborModalFormType> = ({openModalState, handleCloseModal, onSubmit}) => {

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<InputsNewNeighborForm>()

    // Limpiar formulario cuando se cierra el modal
    useEffect(() => {
        if (!openModalState) {
            reset();
        }
    }, [openModalState, reset]);

    const onSubmitMethod: SubmitHandler<InputsNewNeighborForm> = (data) => {
        onSubmit(data);
        handleCloseModal();
        reset();
    }

    return(
        <Dialog open={openModalState} handler={handleCloseModal}>
            <DialogBody>
                <form className="flex flex-col gap-5 mx-4" onSubmit={handleSubmit(onSubmitMethod)}>

                    <Typography variant="h2" color="black">
                        Nuevo Vecino
                    </Typography>
                    <div className="flex gap-5">
                        <div className="flex-1">
                            <Input
                                label="Primer nombre"
                                defaultValue={''}
                                crossOrigin={undefined}
                                {...register("firstName", {required:true})}
                            />
                            {errors.firstName && <span className="text-red-400 text-xs">Campo requerido</span>}
                        </div>

                        <div className="flex-1">
                            <Input
                                label="Segundo nombre"
                                defaultValue={''}
                                crossOrigin={undefined}
                                {...register("secondName")}
                            />
                        </div>
                    </div>

                    <div>
                        <Input
                            label="Apellidos"
                            defaultValue={''}
                            crossOrigin={undefined}
                            {...register("lastName", {required:true})}
                        />
                        {errors.lastName && <span className="text-red-400 text-xs">Campo requerido</span>}
                    </div>

                    <div className="flex gap-5">
                        <div className="flex-1">
                            <Input
                                label="Cédula de identidad"
                                defaultValue={''}
                                crossOrigin={undefined}
                                {...register("ci", {required:true})}
                            />
                            {errors.ci && <span className="text-red-400 text-xs">Campo requerido</span>}
                        </div>

                        <div className="flex-1">
                            <Input
                                type="number"
                                inputMode="numeric"
                                label="Celular"
                                className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                crossOrigin={undefined}
                                {...register("phonenumber", {required:true})}
                            />
                            {errors.phonenumber && <span className="text-red-400 text-xs">Campo requerido</span>}
                        </div>
                    </div>

                    <div>
                        <Input
                            label="Correo Electrónico"
                            defaultValue={''}
                            crossOrigin={undefined}
                            {...register("email")}
                        />
                    </div>

                    <DialogFooter className="px-0">
                        <Button
                            variant="text"
                            color="red"
                            onClick={handleCloseModal}
                            className="mr-1"
                        >
                            <span>Cancelar</span>
                        </Button>
                        <Button
                            variant="gradient"
                            color="green"
                            type="submit"
                        >
                            <span>Crear Vecino</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogBody>
        </Dialog>
    )
}

export default NewNeighborModalForm
