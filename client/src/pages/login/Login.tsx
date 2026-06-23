import { Card, Input, Button, Typography } from '@material-tailwind/react';

import { useForm, SubmitHandler } from 'react-hook-form';
import { 
  // useNavigate, 
  Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

import { Droplets, User, Lock, LogIn } from 'lucide-react';
// import useFetchData from '../../hooks/useFetchData';
// import { apiLink } from '../../config';
import type { LoginFormInputsType } from '../../types/LoginTypes';

export function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputsType>();

  // const navigate = useNavigate();

  const { login, isAuthenticated, loading } = useAuth();
  const [loginError, setLoginError] = useState<string>('');

  // const apiLinkLogin = `${apiLink}/auth/login`;
  // const { execute } = useFetchData(apiLinkLogin);

  const onSubmit: SubmitHandler<LoginFormInputsType> = async ({
    username,
    password,
  }) => {
    await login(username, password);
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200'>
        <div className='inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent'></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to='/vecinos' replace />;
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-200'>
      <Card className='w-full max-w-sm px-8 py-12 bg-white shadow-2xl border-0'>
        <div className='mb-10'>
          <div className='w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg bg-gray-900 text-white'>
            <Droplets className='h-7 w-7' />
          </div>
          <Typography
            variant='h5'
            className='text-center text-gray-800 font-bold'
          >
            OTB Miraflores
          </Typography>
          <Typography
            variant='small'
            className='text-center text-gray-500 mt-1'
          >
            Sistema Centralizado
          </Typography>
        </div>

        <form className='space-y-5' onSubmit={handleSubmit(onSubmit)}>
          {loginError && (
            <div className='bg-red-50 border-l-4 border-red-500 p-3'>
              <Typography variant='small' className='text-red-700 text-center'>
                {loginError}
              </Typography>
            </div>
          )}

          <div>
            <Input
              label='Usuario'
              icon={<User size={20} className='text-gray-400' />}
              containerProps={{ className: 'min-w-0' }}
              {...register('username', {
                required: true,
                onChange: () => setLoginError(''),
              })}
            />
            {errors.username && (
              <Typography variant='small' className='text-red-500 mt-1 text-xs'>
                Campo requerido
              </Typography>
            )}
          </div>

          <div>
            <Input
              type='password'
              label='Contraseña'
              icon={<Lock size={20} className='text-gray-400' />}
              {...register('password', {
                required: true,
                onChange: () => setLoginError(''),
              })}
            />
            {errors.password && (
              <Typography variant='small' className='text-red-500 mt-1 text-xs'>
                Campo requerido
              </Typography>
            )}
          </div>

          <Button
            className='bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center gap-3'
            fullWidth
            type='submit'
          >
            <LogIn size={20} />
            Iniciar Sesión
          </Button>
        </form>
      </Card>
    </div>
  );
}
