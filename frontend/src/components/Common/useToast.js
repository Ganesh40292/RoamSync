import { useContext, createContext } from 'react';

export const ToastContext = createContext({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export default useToast;
