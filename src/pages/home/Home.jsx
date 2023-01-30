import Aos from 'aos'
import 'aos/dist/aos.css'
import React from 'react'
import { useEffect } from 'react'
import Header from '../../components/Header'
import Homecard from './component/Homecard'

function Home() {
	//			<a href="https://discord.com/api/oauth2/authorize?client_id=1010998423178203156&permissions=8208&scope=bot%20applications.commands" className='p-4 px-8 mt-5 font-medium rounded-lg bg-[#3994FF]'>Ajouter à Discord</a>

	useEffect(() => {
		Aos.init({ duration: 1000 })
	}, [])

	return (
		<div className='bg-[#272934]'>
			
			<Header />
			
			<section className='text-white flex flex-col gap-8 items-center p-5'>
				<h2 className='font-bold text-4xl text-center'>Paris sportifs virtuels sur Discord</h2>
				<p className='text-[#9B9D9F] text-center'>Bet Bot vous permet de parier sur n'importe quelle rencontre sportive en direct</p>
				<p className='text-[#9B9D9F] text-center'>Pas d'argent réel, uniquement une monnaie fictive pour parier sans risques et ajouter de l'enjeu aux plus grands matchs</p>
				<a href="indev" className='p-4 px-8 mt-5 font-medium rounded-lg bg-[#3994FF]'>Ajouter à Discord</a>

				<div className='h-1 bg-[#3D3E48] w-1/4'></div>
				<ul className='flex flex-col gap-4'>
					<li className='text-[#9B9D9F] flex gap-3 items-center'><i class="fa-solid fa-check text-[#63F58C]"></i>Côtes et scores en direct</li>
					<li className='text-[#9B9D9F] flex gap-3 items-center'><i class="fa-solid fa-check text-[#63F58C]"></i>Pas d'argent réel</li>
					<li className='text-[#9B9D9F] flex gap-3 items-center'><i class="fa-solid fa-check text-[#63F58C]"></i>Classement des meilleurs parieurs</li>
					<li className='text-[#9B9D9F] flex gap-3 items-center'><i class="fa-solid fa-check text-[#63F58C]"></i>Statistiques et profils d'utilisateurs</li>
				</ul>
				<div className='h-1 bg-[#3D3E48] w-1/4'></div>
			</section>
			
			<section className='text-white text-center overflow-x-hidden'>

				<Homecard 
					text='Lance un paris sur le match de ton choix du sport de ton choix parmis les sports supportés, les côtes et les scores seront mis à jours automatiquement et le paris se terminera en même temps que le match'
					img='bet-example.png'
					odd='ezez'
				/>

				<Homecard 
					text='À la fin du match, les résultats sont annoncés avec la liste des gains et des pertes, ainsi que les sommes et les côtes des paris placés'
					img='result-example.png'
				/>

				<Homecard 
					text='Plusieurs classements sont disponibles en fonction de différentes statistiques, des classements mensuels et des classement par compétition et par sports sont à venir !'
					img='ladder-example.png'
					odd='ezez'
				/>

			</section>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#3994FF" fill-opacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>

		</div>
	)
}

export default Home