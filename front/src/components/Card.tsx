import { useNavigate } from 'react-router-dom'

const Card: React.FC<{ siteName: string }> = ({ siteName }) => {
	const navigate = useNavigate()

	const handlePreview = () => {
		window.open(`http://localhost:5000/preview/${siteName}`, '_blank')
		console.log('preview')
	}

	const handleEdit = () => {
		navigate(`/edit/${siteName}`)
	}

	return (
		<div className='p-4 bg-sky-950 flex flex-col justify-between min-h-50 rounded-lg shadow-md'>
			<h3 className='text-3xl font-semibold'>{siteName}</h3>
			<div className='flex mt-2 space-x-2'>
				<button
					onClick={handlePreview}
					className='px-4 py-2 bg-blue-500 text-white rounded'
				>
					Preview
				</button>
				<button
					onClick={handleEdit}
					className='px-4 py-2 bg-green-500 text-white rounded'
				>
					Edit
				</button>
			</div>
		</div>
	)
}

export default Card
