import { Link } from 'react-router-dom';
import logo from '@/assets/logo-icon.png';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { MenuIcon } from 'lucide-react';

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
