import { ChangeEvent, HTMLInputTypeAttribute } from "react";

export function InfoField({ label, value, isInput, onChange, error, type = 'text', inputMode }: {
  label: string;
  value?: number | string | null;
  isInput: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
}) {
  return (
    <div className="w-full">
      <label className='font-semibold text-gray-500 text-sm mb-1 block'>{label}</label>
      {isInput ? (
        <input
          type={type}
          inputMode={inputMode}
          className={`w-full text-base border rounded-lg px-3 py-2 transition-colors outline-none ${
            error
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-300 focus:border-blue-600 bg-white'
          }`}
          value={value ?? ''}
          onChange={onChange}
          aria-invalid={!!error}
        />
      ) : (
        <div className='text-base lg:text-xl break-words'>{value ?? '-'}</div>
      )}
      {error && (
        <p className='text-red-500 text-xs mt-1'>{error}</p>
      )}
    </div>
  );
}
