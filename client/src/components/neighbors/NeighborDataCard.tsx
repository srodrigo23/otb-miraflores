import { Typography } from "@material-tailwind/react";
import { NeighborWithDetailsType } from "../../interfaces/neighborsInterfaces";

const NeighborDataCard: React.FC<{
  neighborData: NeighborWithDetailsType|undefined;
}> = ({ neighborData }) => {
  const meters = neighborData?.meters ?? [];
  return (
    <div className='flex items-center gap-4 lg:gap-6 py-3 w-fit'>
      <div className='w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0'>
        {neighborData?.first_name?.[0]}
        {neighborData?.last_name?.[0]}
      </div>
      <div className='min-w-0 w-fit'>
        <div className='text-xl lg:text-2xl font-semibold truncate'>
          {neighborData?.first_name} {neighborData?.second_name}{' '}
          {neighborData?.last_name}
        </div>
        <div className='flex items-center gap-3 mt-1'>
          <Typography variant='small' color='gray'>
            CI: {neighborData?.ci ?? '-'}
          </Typography>
          {/* {meters.length > 1 && (
            <Typography variant='small' color='gray' className='text-xs'>
              {meters.length} medidores
            </Typography>
          )} */}
        </div>
        {meters.length > 0 && (
          <div className='flex items-center gap-4'>
            <div className="text-gray-500 text-sm">Medidores :</div>

            <div className='flex flex-wrap gap-3'>
              {meters.map((m) => (
                <div
                  key={m.id}
                  className='flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-sm'
                >
                  <div
                    className={`w-2 h-2 rounded-full ${m.is_active ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  <span className='font-medium text-gray-800'>
                    {m.meter_code}
                  </span>
                  <span className='text-gray-500'>·</span>
                  <span className='text-gray-600'>{m.section}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeighborDataCard;
