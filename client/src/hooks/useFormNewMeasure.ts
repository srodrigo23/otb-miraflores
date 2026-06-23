import { useState } from "react";

const useFormNewMeasure = ()=>{
  
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () =>{
    // if(event) event.preventDefault();
    setLoading(true);
    try{
      
      // await callback()

    }catch(error){

    }finally{
      setLoading(false)
    }
  }
  return   {handleSubmit, loading}
}
export default useFormNewMeasure;