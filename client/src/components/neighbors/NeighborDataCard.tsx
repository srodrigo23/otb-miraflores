import { Typography } from "@material-tailwind/react";
import { NeighborWithDetailsType } from "../../interfaces/neighborsInterfaces";


const NeighborDataCard: React.FC<{
  neighborData: NeighborWithDetailsType|undefined;
}> = ({ neighborData }) => {
  return (
    <div className='flex items-center gap-5 py-3'>
      <div className='w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg font-bold shadow-md'>
        {neighborData?.first_name?.[0]}
        {neighborData?.last_name?.[0]}
      </div>
      <div>
        <div className='text-2xl lg:text-4xl'>
          {neighborData?.first_name} {neighborData?.second_name}{' '}
          {neighborData?.last_name}
        </div>
        <div className='flex items-center gap-2 mt-1'>
          {/* <Chip
            size='sm'
            value={data?.section || 'Sin sección'}
            color='blue'
            variant='ghost'
          /> */}
          <Typography variant='small' color='gray'>
            CI: {neighborData?.ci}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default NeighborDataCard;
