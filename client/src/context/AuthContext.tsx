import {
  useState,
  createContext,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import useFetchData from '../hooks/useFetchData';

import { apiLink } from '../config';
interface User {
  userName: string;
}

const AuthContext = createContext<{
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
} | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUserActive = `${apiLink}/auth/me`;
  const apiLogin = `${apiLink}/auth/login`;
  const apiLogout = `${apiLink}/auth/logout`;

  const { execute } = useFetchData();

  useEffect(() => {
    checkActiveUser();
  },[]);
  
  const checkActiveUser = async () => {
    const result = await execute(apiUserActive,{
      credentials: 'include',
    });
    if (result?.ok && result.data) {
      setUser(result.data);
      setIsAuthenticated(true);
    }
    setLoading(false);
  };

  const login = async (username:string, password:string) => {
    const result = await execute(apiLogin,{
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if(result?.data){
      setUser(result.data);
      setIsAuthenticated(true);
    }
  };

  const logout = async () => {
    const result = await execute(apiLogout, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if(result){
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =  useContext(AuthContext)
  if(!context) throw new Error(
    'useAuth must be used  within AuthProvider'
  )
  return context
};
