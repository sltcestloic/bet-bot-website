import React from 'react'
import Header from '../components/Header'

function InDev() {
  return (
    <div className='bg-[#272934] h-screen'>
        
        <Header />
        
        <div className='text-white flex flex-col gap-8 items-center p-5'>
            <h2 className='font-bold text-4xl text-center'>En cours de développement</h2>
            <p className='text-[#9B9D9F] text-center max-w-2xl'>Bet Bot est encore en cours de développement et par conséquent n'est pas encore accessible au public.
            Vous pouvez tout de même venir tester le bot sur le serveur Discord ci-dessous (salons #bet-list et #bet-bot, commande /help pour apprendre à utiliser le bot)</p>	

            <a href="https://discord.gg/eU4vUtWWpW" className='p-4 px-8 mt-5 font-medium rounded-lg bg-[#3994FF]'>Essayer Bet Bot</a>

        </div>
    </div>
  )
}

export default InDev