
import { ChangeEvent } from "react";

export function InfoField({ label, value, isInput, onChange }: { 
  label: string; 
  value?: number |string| undefined; 
  isInput: boolean; 
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void }) 
{
  return (
    <div>
      <div className='font-semibold  text-gray-500'>{label}</div>
      {isInput ? (
        <input type='text' className='text-2xl border border-blue-600 rounded-lg px-2' value={value} onChange={onChange}/>
      ) : (
        <div className='text-2xl '>{value || '-'}</div>
      )}
    </div>
  );
}
