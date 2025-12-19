import logo from '@/assets/logo-icon.png';
import { MenuIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Head = () => {
  return (
    <div className="flex text-white p-8 items-center justify-between">
      <div className="flex gap-3 items-center">
        <img width={40} height={40} src={logo} alt="Bet Bot Logo" />
        <Link to="/" className="text-2xl font-bold">
          Bet Bot
        </Link>
      </div>
      <MenuIcon className="text-[var(--text-secondary)]" />
    </div>
  );
};

export default Head;
