import React from 'react'
import { Link } from 'react-router-dom';


function Header() {
  return (
    <div className='flex text-white p-8 items-center justify-between'>
        <div className='flex gap-3 items-center'>
            <img width={40} height={40} src="logo-icon.png" alt="" />
            <Link to='/' className='text-2xl font-bold'>
                BET BOT
            </Link> 
        </div>
        <i class="fa-solid fa-bars-staggered fa-xl text-[#9B9D9F]"></i>
    </div>
  )
}

export default Header