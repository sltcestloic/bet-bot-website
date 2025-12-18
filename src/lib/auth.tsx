import { configureAuth } from 'react-query-auth';
import { Navigate } from 'react-router-dom';

import { api } from './api-client';

import { paths } from '@/config/paths';
import { User } from '@/types/api';

const getUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};

const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

const authConfig = {
  userFn: getUser,
  logoutFn: logout,
  loginFn: async () => {
    throw new Error('Login handled by Discord OAuth redirect');
  },
  registerFn: async () => {
    throw new Error('Registration handled by Discord OAuth redirect');
  },
};

export const { useUser, useLogout, AuthLoader } = configureAuth(authConfig);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();

  if (!user.data) {
    return <Navigate to={paths.app.root.getHref()} replace />;
  }

  return children;
};
