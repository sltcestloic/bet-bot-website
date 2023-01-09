import React from 'react'
import Header from '../components/Header'

function NotFound() {
  return (
    <div className='bg-[#272934] h-screen'>
        
        <Header />
        
        <div className='text-white flex flex-col gap-8 items-center p-5'>
            <h2 className='font-bold text-4xl text-center'>404</h2>
            <p className='text-[#9B9D9F] text-center'>Page introuvable</p>	
        </div>
    </div>
  )
}

export default NotFound