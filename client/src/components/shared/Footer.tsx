export const Footer = ()=>{
  return (
    <>
      <div className='bg-gray-50 text-gray-400 text-xs px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col sm:flex-row items-center justify-between py-1 gap-1'>
          <span>© {new Date().getFullYear()} OTB Miraflores</span>
          <span>
            Powered by{' '}
            <span className='text-gray-300 font-medium'>
              <a href=''>Kratos Software</a>
            </span>
          </span>
        </div>
      </div>
    </>
  );
}