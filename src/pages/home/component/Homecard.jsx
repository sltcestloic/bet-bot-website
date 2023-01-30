import React from 'react'

function Homecard(props) {
  return (
    <div data-aos={`${props.odd ? 'fade-left' : 'fade-right'}`} className='flex flex-col gap-8 items-center p-14'>			
		<div className={`flex flex-col items-center gap-10 md:flex-row text-[#9B9D9F] p-5 ${props.odd ? "md:flex-row-reverse" : "md:flex-row"}`}>
			<p className='max-w-sm'>{props.text}</p>
			<img className="max-w-sm" src={props.img} alt='ouais'/>
		</div>	
	</div>
  )
}

export default Homecard