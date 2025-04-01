import * as GrapesJsStudioSDK from '@grapesjs/studio-sdk'
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

const Editor: React.FC = () => {
	const { siteName } = useParams<{ siteName: string }>()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const editorRef = useRef<any>(null)
	const [editorLoaded, setEditorLoaded] = useState<boolean>(false)
	const [images, setImages] = useState<string[]>([])

	// Force reload when site name changes
	useEffect(() => {
		// Clean up and force reload when site changes
		if (editorRef.current) {
			window.location.reload()
		}
	}, [siteName])

	useEffect(() => {
		// Add CDN styles
		const styleLink = document.createElement('link')
		styleLink.rel = 'stylesheet'
		styleLink.href =
			'https://unpkg.com/@grapesjs/studio-sdk@latest/dist/style.css'
		document.head.appendChild(styleLink)

		// Clear any cached data
		localStorage.clear()
		sessionStorage.clear()

		return () => {
			// Clean up on component unmount
			if (document.head.contains(styleLink)) {
				document.head.removeChild(styleLink)
			}
		}
	}, [])

	// Fetch available images
	useEffect(() => {
		if (!siteName) return

		async function fetchImages() {
			try {
				const response = await fetch(`http://localhost:5000/images/${siteName}`)
				if (response.ok) {
					const data = await response.json()
					setImages(data.images || [])
					console.log('Available images for site:', siteName, data.images)
				}
			} catch (error) {
				console.error('Error fetching images:', error)
			}
		}

		fetchImages()
	}, [siteName])

	useEffect(() => {
		if (!siteName || editorLoaded) return

		async function loadFiles() {
			try {
				const response = await fetch(`http://localhost:5000/edit/${siteName}`)
				if (!response.ok) throw new Error('Помилка отримання файлів')
				const { html, css } = await response.json()

				// Use fetched images or fall back to hardcoded ones if empty
				const assetImages =
					images.length > 0
						? images
						: [
								`http://localhost:5000/static/${siteName}/images/logo.webp`,
								`http://localhost:5000/static/${siteName}/images/windows.png`,
								`http://localhost:5000/static/${siteName}/images/decore.webp`,
						  ]

				console.log(`Creating editor for site: ${siteName}`)

				// Get image files for assets
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const editorConfig: any = {
					root: '#studio',
					licenseKey:
						'be06389675fe4c1fb2060fa47fd3b0b7a3e7a01dcecb46be8f102a8cf74b782f',
					// Direct GrapesJS settings to prevent base64 encoding
					assetManager: {
						embedAsBase64: false,
						upload: false,
						autoAdd: true,
						dropzone: false,
						handleAdd: asset => console.log('Asset added:', asset),
					},
					project: {
						default: {
							pages: [{ name: 'Home', component: html }],
							styles: css,
							// Add assets to make images available in editor with absolute URLs
							assets: assetImages,
						},
					},
					parser: {
						optionsHtml: {
							script: ({ node }) => ({
								type: 'script',
								content: node.innerHTML,
							}),
							style: ({ node }) => ({
								type: 'style',
								content: node.innerHTML,
							}),
							'*': ({ node }) => {
								// Ensure all image sources have absolute URLs
								if (node.tagName === 'IMG') {
									const src = node.getAttribute('src') || ''
									if (!src.startsWith('http') && !src.startsWith('/static')) {
										node.setAttribute(
											'src',
											`http://localhost:5000/static/${siteName}/images/${src}`
										)
									}
								}
								return { tagName: node.tagName }
							},
						},
					},
					// Storage settings
					storageManager: {
						type: 'none', // Disable storage completely
					},
				}

				const editorInstance = await GrapesJsStudioSDK.createStudioEditor(
					editorConfig
				)

				editorRef.current = editorInstance
				setEditorLoaded(true)
				console.log('Editor loaded for site:', siteName)
			} catch (error) {
				console.error('Помилка завантаження сайту:', error)
				alert('Не вдалося завантажити сайт!')
			}
		}

		// Wait for images to be fetched before loading editor
		loadFiles()

		// Clean up function to prevent memory leaks
		return () => {
			if (editorRef.current) {
				// Handle cleanup if needed
				console.log('Cleaning up editor component')
			}
		}
	}, [siteName, images, editorLoaded]) // Re-run when images are updated

	const handleSave = async () => {
		if (!editorRef.current || !siteName) return

		try {
			// Get HTML and CSS from editor
			const html = editorRef.current.getHtml()
			const css = editorRef.current.getCss()

			// Fix any remaining base64 images and convert to proper paths
			const fixedHtml = html
				.replace(/src="data:image\/(jpeg|png|webp);base64,[^"]+"/g, match => {
					console.log('Found base64 image, replacing with proper path')
					// Default to logo if we find a base64 image
					return `src="/static/${siteName}/images/logo.webp"`
				})
				.replace(/src="blob:[^"]+"/g, match => {
					console.log('Found blob URL, replacing with proper path')
					return `src="/static/${siteName}/images/logo.webp"`
				})

			console.log('Saving HTML:', fixedHtml)
			console.log('Saving CSS:', css)

			const response = await fetch(`http://localhost:5000/save/${siteName}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ html: fixedHtml, css }),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					`Помилка збереження: ${errorData.error || 'Невідома помилка'}`
				)
			}

			alert('✅ Збережено успішно!')

			// Redirect to preview
			window.open(`http://localhost:5000/preview/${siteName}`, '_blank')
		} catch (error) {
			console.error('Помилка збереження:', error)
			alert(
				`❌ Не вдалося зберегти зміни: ${
					error instanceof Error ? error.message : 'Невідома помилка'
				}`
			)
		}
	}

	return (
		<div className='h-screen flex flex-col'>
			<div className='p-2 bg-gray-100'>
				<button
					onClick={handleSave}
					className='p-2 bg-green-500 text-white'
					disabled={!editorLoaded}
				>
					💾 Save
				</button>
			</div>
			<div id='studio' className='flex-grow'></div>
		</div>
	)
}

export default Editor
