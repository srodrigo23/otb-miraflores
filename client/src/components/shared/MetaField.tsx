import { Typography } from "@material-tailwind/react";

/** One labelled fact from the measure header, e.g. "Periodo: 2025-01" */
export const MetaField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className='flex flex-col'>
    <Typography variant='small' color='blue-gray' className='font-medium'>
      {label}:
    </Typography>
    {children}
  </div>
);
