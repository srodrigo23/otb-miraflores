// import { CSSProperties } from 'react';
// import { ClipLoader } from 'react-spinners';
// const override: CSSProperties = {
//   display: 'block',
//   margin: '0 auto',
//   borderColor: 'red',
// };

export const LoaderAnimation: React.FC<{isLoading:true}> = ({isLoading})=>{
  return(
    // <div className='flex justify-center items-center py-20'>
    //   <ClipLoader
    //     loading={isLoading}
    //     cssOverride={override}
    //     size={150}
    //     aria-label='Loading Spinner'
    //     data-testid='loader'
    //   />
    // </div>
    <>
      {
        isLoading? 
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200'>
          <div className='inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent'/>
        </div>:<></>
      }
    </>
  )
}