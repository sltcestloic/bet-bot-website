import Aos from 'aos';
import { useEffect } from 'react';
import 'aos/dist/aos.css';

export const AosProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    Aos.init({ duration: 1500 });
  }, []);

  return <>{children}</>;
};
