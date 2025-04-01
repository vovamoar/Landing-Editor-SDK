import cors from 'cors'
import express from 'express'
import fs from 'fs-extra'
import path from 'path'

const app = express()
const PORT = 5000
const SITES_DIR = path.join(__dirname, 'sites')

app.use(cors())
app.use(express.json())

// ⚡ Отримати список сайтів
app.get('/sites', async (req, res) => {
	try {
		const sites = await fs.readdir(SITES_DIR)
		res.json(sites)
	} catch (error) {
		res.status(500).json({ error: 'Помилка отримання списку сайтів' })
	}
})

// ⚡ Отримати файли сайту для редагування
app.get('/edit/:siteName', async (req, res) => {
	const { siteName } = req.params
	const sitePath = path.join(SITES_DIR, siteName)

	try {
		const html = await fs.readFile(`${sitePath}/index.html`, 'utf-8')
		const css = await fs.readFile(`${sitePath}/css/styles.css`, 'utf-8')

		res.json({ html, css })
	} catch (error) {
		res.status(500).json({ error: 'Файли сайту не знайдено' })
	}
})

// ⚡ Зберегти оновлений сайт
app.post('/save/:siteName', async (req, res) => {
	const { siteName } = req.params
	const { html, css } = req.body
	const sitePath = path.join(SITES_DIR, siteName)

	try {
		await fs.writeFile(`${sitePath}/index.html`, html, 'utf-8')
		await fs.writeFile(`${sitePath}/css/styles.css`, css, 'utf-8')

		res.json({ success: true })
	} catch (error) {
		res.status(500).json({ error: 'Помилка збереження' })
	}
})

// ⚡ Відкрити сайт у редакторі
app.get('/editor/:siteName', async (req, res) => {
	const { siteName } = req.params
	const sitePath = path.join(SITES_DIR, siteName)

	try {
		const html = await fs.readFile(`${sitePath}/index.html`, 'utf-8')
		const css = await fs.readFile(`${sitePath}/css/styles.css`, 'utf-8')

		const editorHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Редактор - ${siteName}</title>
        <link rel="stylesheet" href="https://unpkg.com/@grapesjs/studio-sdk@latest/dist/style.css">
        <script src="https://unpkg.com/@grapesjs/studio-sdk@latest/dist/index.umd.js"></script>
        <script>
          // Clear storage to avoid caching issues
          localStorage.clear();
          sessionStorage.clear();
        </script>
      </head>
      <body style="margin:0;">
        <button onclick="saveChanges()" style="position: fixed; top: 10px; left: 10px; z-index: 1000;">Зберегти</button>
        <div id="studio" style="height:100vh;"></div>
        <script>
          const editor = GrapesJsStudioSDK.createStudioEditor({
            root: '#studio',
            project: {
              default: {
                pages: [{ name: "Home", component: \`${html}\` }],
                styles: \`${css}\`,
                assets: [
                  // Add images as assets with full URLs
                  "http://localhost:5000/static/${siteName}/images/logo.webp",
                  "http://localhost:5000/static/${siteName}/images/windows.png",
                  "http://localhost:5000/static/${siteName}/images/decore.webp"
                ],
              },
            },
            // Ensure external URLs are used for images instead of base64
            assetManager: {
              embedAsBase64: false,
              upload: false,
              uploadName: 'files',
              autoAdd: true,
            },
            // Disable any storage to avoid caching issues
            storageManager: {
              type: 'none',
              autosave: false,
              autoload: false,
              storeComponents: false,
              storeStyles: false,
            },
            // Properly configure base URL for assets
            canvas: {
              styles: [
                // Include your site styles 
                "http://localhost:5000/static/${siteName}/css/styles.css"
              ],
              scripts: [
                // Include your site scripts if needed
                "http://localhost:5000/static/${siteName}/js/index.js"
              ],
            },
          });

          function saveChanges() {
            const html = editor.getHtml();
            const css = editor.getCss();
            
            // Fix image paths in HTML if needed - replace base64 and add full paths
            let fixedHtml = html;
            
            // Replace any base64 images
            fixedHtml = fixedHtml.replace(/src="data:image\/(jpeg|png|webp);base64,[^"]+"/g, 
              'src="/static/${siteName}/images/logo.webp"');
            
            // Fix relative paths to include /static/
            fixedHtml = fixedHtml.replace(/src="images\//g, 'src="/static/${siteName}/images/');
            
            // Fix absolute URLs to be relative for saving
            fixedHtml = fixedHtml.replace(/src="http:\/\/localhost:5000\/static\/${siteName}\/images\//g, 
              'src="/static/${siteName}/images/');

            fetch("http://localhost:5000/save/${siteName}", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ html: fixedHtml, css }),
            })
            .then(response => response.json())
            .then(data => {
              alert("Зміни збережено!");
              // Open preview in new tab
              window.open("http://localhost:5000/preview/${siteName}", "_blank");
            })
            .catch(error => console.error("Помилка:", error));
          }
        </script>
      </body>
      </html>
    `

		res.send(editorHtml)
	} catch (error) {
		res.status(500).send('Помилка завантаження редактора')
	}
})

// ⚡ Відкрити сайт у Preview
app.get('/preview/:siteName', async (req, res) => {
	console.log('preview')
	const { siteName } = req.params
	const sitePath = path.join(SITES_DIR, siteName)

	try {
		const htmlPath = path.join(sitePath, 'index.html')
		let html = await fs.readFile(htmlPath, 'utf-8')

		// Fix relative image paths in the HTML
		html = html.replace(/src="images\//g, `src="/static/${siteName}/images/`)

		// Fix any remaining /static/ paths to ensure they're correct
		html = html.replace(/src="\/static\//g, `src="/static/`)

		// Додаємо CSS та JS якщо вони існують
		const cssPath = path.join(sitePath, 'css', 'styles.css')
		const bootstrapPath = path.join(sitePath, 'css', 'bootstrap.min.css')
		const materializePath = path.join(sitePath, 'css', 'materialize.min.css')
		const tailwindPath = path.join(sitePath, 'css', 'tailwind.min.css')
		const bulmaPath = path.join(sitePath, 'css', 'bulma.min.css')
		const allPath = path.join(sitePath, 'css', 'all.min.css')
		const jsPath = path.join(sitePath, 'js', 'index.js')

		if (await fs.pathExists(cssPath)) {
			html = html.replace(
				'</head>',
				`<link rel="stylesheet" href="/static/${siteName}/css/styles.css"></head>`
			)
		}

		if (await fs.pathExists(bootstrapPath)) {
			html = html.replace(
				'</head>',
				`<link rel="stylesheet" href="/static/${siteName}/css/bootstrap.min.css"></head>`
			)
		}

		if (await fs.pathExists(materializePath)) {
			html = html.replace(
				'</head>',
				`<link rel="stylesheet" href="/static/${siteName}/css/materialize.min.css"></head>`
			)
		}

		if (await fs.pathExists(tailwindPath)) {
			html = html.replace(
				'</head>',
				`<link rel="stylesheet" href="/static/${siteName}/css/tailwind.min.css"></head>`
			)
		}

		if (await fs.pathExists(bulmaPath)) {
			html = html.replace(
				'</head>',
				`<link rel="stylesheet" href="/static/${siteName}/css/bulma.min.css"></head>`
			)
		}

		if (await fs.pathExists(allPath)) {
			html = html.replace(
				'</head>',
				`<link rel="stylesheet" href="/static/${siteName}/css/all.min.css"></head>`
			)
		}

		if (await fs.pathExists(jsPath)) {
			html = html.replace(
				'</body>',
				`<script src="/static/${siteName}/js/index.js"></script></body>`
			)
		}

		res.send(html)
	} catch (error) {
		console.error('Preview error:', error)
		res.status(500).send('Помилка завантаження сайту')
	}
})

// ⚡ Статичні файли для Preview
app.use(
	'/static',
	express.static(SITES_DIR, {
		setHeaders: (res, path) => {
			// Set appropriate content types for images and other files
			if (path.endsWith('.webp')) {
				res.setHeader('Content-Type', 'image/webp')
				// Allow cross-origin requests
				res.setHeader('Access-Control-Allow-Origin', '*')
			} else if (path.endsWith('.png')) {
				res.setHeader('Content-Type', 'image/png')
				res.setHeader('Access-Control-Allow-Origin', '*')
			} else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
				res.setHeader('Content-Type', 'image/jpeg')
				res.setHeader('Access-Control-Allow-Origin', '*')
			} else if (path.endsWith('.css')) {
				res.setHeader('Content-Type', 'text/css')
				res.setHeader('Access-Control-Allow-Origin', '*')
			} else if (path.endsWith('.js')) {
				res.setHeader('Content-Type', 'application/javascript')
				res.setHeader('Access-Control-Allow-Origin', '*')
			}

			// Disable caching for all static files
			res.setHeader(
				'Cache-Control',
				'no-store, no-cache, must-revalidate, proxy-revalidate'
			)
			res.setHeader('Pragma', 'no-cache')
			res.setHeader('Expires', '0')
		},
	})
)

// ⚡ Отримати список файлів зображень
app.get('/images/:siteName', async (req, res) => {
	const { siteName } = req.params
	const imagesPath = path.join(SITES_DIR, siteName, 'images')

	try {
		if (await fs.pathExists(imagesPath)) {
			const images = await fs.readdir(imagesPath)
			const imageUrls = images.map(img => `/static/${siteName}/images/${img}`)
			res.json({ images: imageUrls })
		} else {
			res.json({ images: [], error: 'No images directory found' })
		}
	} catch (error) {
		console.error('Error listing images:', error)
		res.status(500).json({ error: 'Could not list images' })
	}
})

app.listen(PORT, () =>
	console.log(`🚀 Сервер запущено на http://localhost:${PORT}`)
)
