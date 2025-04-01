import React, { useEffect, useState } from 'react'
import Card from '../components/Card'

const Home: React.FC = () => {
	const [sites, setSites] = useState<string[]>([])

	useEffect(() => {
		fetch('http://localhost:5000/sites')
			.then(res => res.json())
			.then(data => setSites(data))
	}, [])

	return (
		<div className='p-6 grid grid-cols-3 gap-4'>
			{sites.map(site => (
				<Card key={site} siteName={site} />
			))}
		</div>
	)
}

export default Home
