import { Typography, Input, Button} from "@material-tailwind/react"
import { IdentificationIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline"


export default function CheckNeighborDebts() {
    return(
        
        <div className="flex flex-row min-h-screen justify-center items-center">
            <div className="border rounded-3xl py-10 px-5 lg:w-3/12 sm:w-1/2">
                <Typography className="mb-10 text-center" variant="h2">Consultar deudas</Typography>
                <form className="text-center">
                    <Input 
                        type="number" 
                        inputMode="numeric" 
                        label="Número de celular" 
                        icon={<DevicePhoneMobileIcon/>}
                        className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <br/>
                    <Input label="Carnet de Identidad" icon={<IdentificationIcon/>}/>
                    <Button className="w-2/3 mt-5">Consultar</Button>
                </form>
            </div>
        </div>
            
        
    )
}