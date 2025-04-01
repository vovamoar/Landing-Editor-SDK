document.addEventListener('DOMContentLoaded', function () {
	// Variables
	const header = document.querySelector('.header')
	const mobileToggle = document.querySelector('.header__mobile-toggle')
	const menu = document.querySelector('.menu')
	const menuLinks = document.querySelectorAll('.menu__link')
	const portfolioItems = document.querySelectorAll('.portfolio__item')
	const portfolioTabs = document.querySelectorAll('.portfolio__tab')
	const modal = document.querySelector('.modal')
	const modalClose = document.querySelector('.modal__close')
	const modalImg = document.querySelector('.modal__img')
	const modalTitle = document.querySelector('.modal__title')
	const modalCategory = document.querySelector('.modal__category')
	const modalText = document.querySelector('.modal__text')
	const contactForm = document.querySelector('.contact__form')

	// Header scroll effect
	window.addEventListener('scroll', function () {
		if (window.scrollY > 50) {
			header.classList.add('scrolled')
		} else {
			header.classList.remove('scrolled')
		}

		// Active menu link based on scroll position
		const scrollPosition = window.scrollY + 200

		document.querySelectorAll('section[id]').forEach(section => {
			const sectionTop = section.offsetTop
			const sectionHeight = section.offsetHeight
			const sectionId = section.getAttribute('id')

			if (
				scrollPosition >= sectionTop &&
				scrollPosition < sectionTop + sectionHeight
			) {
				menuLinks.forEach(link => {
					link.classList.remove('active')
					if (link.getAttribute('href') === '#' + sectionId) {
						link.classList.add('active')
					}
				})
			}
		})
	})

	// Mobile menu toggle
	mobileToggle.addEventListener('click', function () {
		this.classList.toggle('open')
		menu.classList.toggle('active')
		document.body.classList.toggle('menu-open')
	})

	// Close mobile menu when clicking outside
	document.addEventListener('click', function (e) {
		if (!e.target.closest('.header') && menu.classList.contains('active')) {
			mobileToggle.classList.remove('open')
			menu.classList.remove('active')
			document.body.classList.remove('menu-open')
		}
	})

	// Smooth scrolling for menu links
	menuLinks.forEach(link => {
		link.addEventListener('click', function (e) {
			e.preventDefault()

			// Close mobile menu
			mobileToggle.classList.remove('open')
			menu.classList.remove('active')
			document.body.classList.remove('menu-open')

			// Get target section
			const target = this.getAttribute('href')

			if (target.startsWith('#') && target.length > 1) {
				const targetSection = document.querySelector(target)
				if (targetSection) {
					const offsetTop = targetSection.offsetTop - 100

					window.scrollTo({
						top: offsetTop,
						behavior: 'smooth',
					})

					// Update URL hash without scrolling
					history.pushState(null, null, target)
				}
			}
		})
	})

	// Portfolio tabs functionality
	portfolioTabs.forEach(tab => {
		tab.addEventListener('click', function () {
			// Remove active class from all tabs
			portfolioTabs.forEach(t => t.classList.remove('active'))

			// Add active class to clicked tab
			this.classList.add('active')

			// Get category from data attribute
			const category = this.getAttribute('data-category')

			// Filter portfolio items
			portfolioItems.forEach(item => {
				const itemCategory = item.getAttribute('data-category')

				if (category === 'all' || category === itemCategory) {
					item.style.display = 'block'
					setTimeout(() => {
						item.style.opacity = '1'
						item.style.transform = 'translateY(0)'
					}, 50)
				} else {
					item.style.opacity = '0'
					item.style.transform = 'translateY(20px)'
					setTimeout(() => {
						item.style.display = 'none'
					}, 300)
				}
			})
		})
	})

	// Portfolio item click - open modal
	portfolioItems.forEach(item => {
		item.addEventListener('click', function () {
			const imgSrc = this.querySelector('.portfolio__item-img').getAttribute(
				'src'
			)
			const title = this.querySelector('.portfolio__item-title').textContent
			const category = this.querySelector(
				'.portfolio__item-category'
			).textContent
			const desc =
				this.getAttribute('data-description') || 'No description available.'

			// Set modal content
			modalImg.setAttribute('src', imgSrc)
			modalTitle.textContent = title
			modalCategory.textContent = category
			modalText.textContent = desc

			// Show modal
			modal.classList.add('active')
			document.body.style.overflow = 'hidden'
		})
	})

	// Close modal
	modalClose.addEventListener('click', function () {
		closeModal()
	})

	// Close modal on background click
	modal.addEventListener('click', function (e) {
		if (e.target === this) {
			closeModal()
		}
	})

	// Close modal with Escape key
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && modal.classList.contains('active')) {
			closeModal()
		}
	})

	function closeModal() {
		modal.classList.remove('active')
		document.body.style.overflow = ''

		// Clear modal content after animation
		setTimeout(() => {
			modalImg.setAttribute('src', '')
		}, 300)
	}

	// Contact form validation
	if (contactForm) {
		contactForm.addEventListener('submit', function (e) {
			e.preventDefault()

			let isValid = true
			const inputs = this.querySelectorAll('.form__input, .form__textarea')

			// Validate each input
			inputs.forEach(input => {
				const error = input.nextElementSibling

				if (!input.value.trim()) {
					isValid = false
					input.classList.add('error')
					error.textContent = 'This field is required'
					error.style.display = 'block'
				} else if (input.type === 'email' && !validateEmail(input.value)) {
					isValid = false
					input.classList.add('error')
					error.textContent = 'Please enter a valid email address'
					error.style.display = 'block'
				} else {
					input.classList.remove('error')
					error.style.display = 'none'
				}
			})

			// If form is valid, submit it (here just simulating submission)
			if (isValid) {
				const btn = this.querySelector('button[type="submit"]')
				const originalText = btn.textContent

				// Disable button and show loading state
				btn.disabled = true
				btn.textContent = 'Sending...'

				// Simulate form submission
				setTimeout(() => {
					this.reset()
					btn.textContent = 'Message Sent!'

					setTimeout(() => {
						btn.disabled = false
						btn.textContent = originalText
					}, 2000)
				}, 1500)
			}
		})

		// Clear errors on input
		contactForm
			.querySelectorAll('.form__input, .form__textarea')
			.forEach(input => {
				input.addEventListener('input', function () {
					this.classList.remove('error')
					const error = this.nextElementSibling
					error.style.display = 'none'
				})
			})
	}

	// Helper function to validate email
	function validateEmail(email) {
		const re =
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		return re.test(String(email).toLowerCase())
	}

	// Animate elements when they come into view
	const animateElements = document.querySelectorAll(
		'.fade-in, .slide-up, .slide-right'
	)

	const observer = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('animated')
					observer.unobserve(entry.target)
				}
			})
		},
		{ threshold: 0.1 }
	)

	animateElements.forEach(el => {
		observer.observe(el)
	})

	// Count up animation for statistics
	const countElements = document.querySelectorAll('.count-up')

	function animateCount(el) {
		const target = parseInt(el.getAttribute('data-count'))
		const duration = 2000 // ms
		const step = Math.ceil(target / (duration / 16)) // 60fps
		let current = 0

		const timer = setInterval(() => {
			current += step
			if (current >= target) {
				el.textContent = target
				clearInterval(timer)
			} else {
				el.textContent = current
			}
		}, 16)
	}

	const statsObserver = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					animateCount(entry.target)
					statsObserver.unobserve(entry.target)
				}
			})
		},
		{ threshold: 0.5 }
	)

	countElements.forEach(el => {
		statsObserver.observe(el)
	})

	// Add parallax effect to hero section
	const heroBackground = document.querySelector('.hero__background')
	if (heroBackground) {
		window.addEventListener('scroll', function () {
			const scrollPosition = window.scrollY
			heroBackground.style.transform = `translateY(${scrollPosition * 0.4}px)`
		})
	}
})
