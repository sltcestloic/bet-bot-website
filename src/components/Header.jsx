import React from 'react'

function Header() {
  return (
    <div className='flex text-white p-8 items-center justify-between'>
        <div className='flex gap-3 items-center'>
            <img width={40} height={40} src="logo192.png" alt="" />
            <h1 className='text-2xl font-bold'>BET BOT</h1>
        </div>
        <i class="fa-solid fa-bars-staggered fa-xl text-[#9B9D9F]"></i>
    </div>
  )
}

export default Header