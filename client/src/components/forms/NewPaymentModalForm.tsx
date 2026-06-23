import { useState } from 'react';
import {
  Input,
  DialogBody,
  DialogFooter,
  Button,
  Dialog,
  // Typography,
  // Textarea,
  DialogHeader
} from '@material-tailwind/react';

type InputsNewPaymentModalForm = {};

type FormState = {
  nombre: string;
  ci: string;
  lecturaActual: string;
  lecturaAnterior: string;
  montoCobrar: string;
  montoPagado: string;
  fechaPago: string;
  horaPago: string;
  gestion: string;
};

type NewPaymentModalFormType = {
  openModalState: boolean;
  handleCloseModal: () => void;
  onSubmit: (data: InputsNewPaymentModalForm) => void;
};

// Styles (minimalista)
// const containerStyle: React.CSSProperties = {
//   display: 'flex',
//   gap: 24,
//   alignItems: 'flex-start',
//   flexWrap: 'nowrap', // keep form and preview side-by-side on wide screens
//   justifyContent: 'space-between',
// };

// const formStyle: React.CSSProperties = {
//   flex: '1 1 520px',
//   minWidth: 320,
//   background: '#fff',
//   padding: 16,
//   borderRadius: 8,
//   boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
// };

// const fieldStyle: React.CSSProperties = {
//   display: 'flex',
//   flexDirection: 'column',
//   gap: 6,
//   marginBottom: 8,
// };

// const inputStyle: React.CSSProperties = {
//   padding: '8px 10px',
//   borderRadius: 6,
//   border: '1px solid #ddd',
//   fontSize: 14,
// };

// const previewStyle: React.CSSProperties = {
//   flex: '0 0 340px',
//   width: 340,
//   background: '#fafafa',
//   padding: 12,
//   borderRadius: 8,
//   border: '1px solid #e6e6e6',
//   boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
//   fontFamily: 'Arial, Helvetica, sans-serif',
// };

// const receiptBoxStyle: React.CSSProperties = {
//   background: '#fff',
//   padding: 12,
//   borderRadius: 6,
//   border: '1px solid #eee',
// };
const gestion_principal = 'SEP-OCT / 2025';
const getInitialState = (): FormState => {
  const now = new Date();
  const fecha = now.toLocaleDateString('es-BO');
  const hora = now.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    nombre: '',
    ci: '',
    lecturaActual: '',
    lecturaAnterior: '',
    montoCobrar: '',
    montoPagado: '',
    fechaPago: fecha,
    horaPago: hora,
    gestion: gestion_principal,
  };
};

const NewPaymentModalForm: React.FC<NewPaymentModalFormType> = ({
  openModalState,
  handleCloseModal,
  // onSubmit,
}) => {
  const [form, setForm] = useState<FormState>(getInitialState());
  // const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  return (
    <Dialog open={openModalState} handler={handleCloseModal} size='sm'>
      <DialogBody>
        <DialogHeader>Nueva Recaudación</DialogHeader>
        {/* <Typography variant='h2' color='black'></Typography> */}
        <form onSubmit={(e) => e.preventDefault()}>
          <div className=' flex flex-col gap-3'>
            {/* <label style={{ fontSize: 13, color: '#333' }}>Deuda Gestion</label> */}
            <Input
              name='gestion'
              label='Deuda Gestion'
              value={form.gestion}
              onChange={handleChange}
              // style={inputStyle}
            />
            <div className='flex flex-row gap-3'>
              <div className='basis-2/3'>
                <Input
                  name='nombre'
                  label='Nombre del vecino'
                  value={form.nombre}
                  onChange={handleChange}
                  // style={inputStyle}
                />
              </div>

              <div className='basis-1/3'>
                <Input
                  name='ci'
                  label='CI'
                  value={form.ci}
                  onChange={handleChange}
                  // style={inputStyle}
                />
              </div>
            </div>

            <div className='flex gap-3'>
              <Input
                name='lecturaAnterior'
                label='Lectura anterior'
                value={form.lecturaAnterior}
                onChange={handleChange}
                type='number'
              />

              <Input
                name='lecturaActual'
                label='Lectura actual'
                value={form.lecturaActual}
                onChange={handleChange}
                type='number'
              />
            </div>

            <Input
              name='montoCobrar'
              label='Monto a cobrar (calculado automáticamente)'
              value={form.montoCobrar}
              onChange={handleChange}
              type='number'
              step='0.01'
              // style={{
              //   ...inputStyle,
              //   backgroundColor: '#f5f5f5',
              //   cursor: 'not-allowed',
              // }}
              readOnly
            />

            {/* <div style={fieldStyle}>
            <label style={{ fontSize: 13, color: '#333' }}>
              Monto entregado
            </label>
            <Input
              name='montoPagado'
              value={form.montoPagado}
              onChange={handleChange}
              type='number'
              step='0.01'
              style={inputStyle}
            />
          </div> */}

            {/* {error && (
            <div style={{ color: 'crimson', marginTop: 6 }}>{error}</div>
          )} */}

            <DialogFooter className='py-0 px-0'>
              <Button
                // onClick={generatePDF} /* Here import method to generate PDF receipt */
                
                type='button'

                // style={{ padding: '8px 12px', borderRadius: 6 }}
              >
                Imprimir Recibo
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogBody>
    </Dialog>
  );
};

export default NewPaymentModalForm;
