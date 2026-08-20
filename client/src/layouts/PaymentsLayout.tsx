import { Outlet } from 'react-router-dom';

export default function PaymentsLayout() {
  return (
    <div className='mx-auto container w-full flex flex-col h-full py-5 px-3 lg:px-3'>
      <Outlet />
    </div>
  );
}
