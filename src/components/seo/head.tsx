import { Helmet, HelmetData } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const helmetData = new HelmetData({});

export const Head = () => {
  return (
    <Helmet helmetData={helmetData}>
      <div className="flex text-white p-8 items-center justify-between">
        <div className="flex gap-3 items-center">
          <img width={40} height={40} src="logo-icon.png" alt="" />
          <Link to="/" className="text-2xl font-bold">
            BET BOT
          </Link>
        </div>
        <i className="fa-solid fa-bars-staggered fa-xl text-[#9B9D9F]"></i>
      </div>
    </Helmet>
  );
};

export default Head;
