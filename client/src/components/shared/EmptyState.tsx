import { Typography } from '@material-tailwind/react';

/** Shown in place of a list that has nothing in it yet */
export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className='flex h-full items-center justify-center px-4 py-8 text-center'>
    <Typography variant='small' color='gray'>
      {message}
    </Typography>
  </div>
);
