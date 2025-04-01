document.addEventListener('DOMContentLoaded', function () {
	// Variables
	const navToggle = document.querySelector('.nav__toggle')
	const navList = document.querySelector('.nav__list')
	const navLinks = document.querySelectorAll('.nav__link')
	const header = document.querySelector('.header')
	const galleryItems = document.querySelectorAll('.gallery__item')
	const modal = document.getElementById('galleryModal')
	const modalClose = document.querySelector('.modal__close')
	const modalImg = document.querySelector('.modal__img')
	const modalTitle = document.querySelector('.modal__title')
	const modalText = document.querySelector('.modal__text')
	const contactForm = document.getElementById('contactForm')
	const heroButton = document.querySelector('.hero__button')

	// Toggle mobile navigation
	navToggle.addEventListener('click', function () {
		this.classList.toggle('active')
		navList.classList.toggle('active')
	})

	// Close mobile nav when clicking outside
	document.addEventListener('click', function (event) {
		if (!event.target.closest('.nav') && navList.classList.contains('active')) {
			navToggle.classList.remove('active')
			navList.classList.remove('active')
		}
	})

	// Smooth scrolling for navigation links
	navLinks.forEach(link => {
		link.addEventListener('click', function (e) {
			e.preventDefault()

			// Close mobile nav
			navToggle.classList.remove('active')
			navList.classList.remove('active')

			// Get the target section
			const sectionId = this.getAttribute('data-section')
			const targetSection = document.getElementById(sectionId)

			if (targetSection) {
				// Smooth scroll to section
				window.scrollTo({
					top: targetSection.offsetTop - 100,
					behavior: 'smooth',
				})

				// Update active link
				navLinks.forEach(link => link.classList.remove('active'))
				this.classList.add('active')
			}
		})
	})

	// Header scroll effect
	window.addEventListener('scroll', function () {
		if (window.scrollY > 100) {
			header.classList.add('scrolled')
		} else {
			header.classList.remove('scrolled')
		}

		// Highlight active nav link based on scroll position
		const scrollPosition = window.scrollY + 200

		document.querySelectorAll('section').forEach(section => {
			if (
				section.offsetTop <= scrollPosition &&
				section.offsetTop + section.offsetHeight > scrollPosition
			) {
				const id = section.getAttribute('id')

				document.querySelectorAll('.nav__link').forEach(link => {
					link.classList.remove('active')
					if (link.getAttribute('data-section') === id) {
						link.classList.add('active')
					}
				})
			}
		})
	})

	// Gallery modal functionality
	galleryItems.forEach(item => {
		item.addEventListener('click', function () {
			const imgSrc = this.querySelector('.gallery__img').getAttribute('src')
			const title = this.querySelector('.gallery__item-title').textContent
			const text = this.querySelector('.gallery__text').textContent

			modalImg.setAttribute('src', imgSrc)
			modalTitle.textContent = title
			modalText.textContent = text

			// Open modal
			modal.classList.add('active')
			document.body.style.overflow = 'hidden'
		})
	})

	// Close modal
	modalClose.addEventListener('click', function () {
		modal.classList.remove('active')
		document.body.style.overflow = ''
	})

	// Close modal when clicking outside
	modal.addEventListener('click', function (e) {
		if (e.target === this) {
			modal.classList.remove('active')
			document.body.style.overflow = ''
		}
	})

	// Close modal with Escape key
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && modal.classList.contains('active')) {
			modal.classList.remove('active')
			document.body.style.overflow = ''
		}
	})

	// Form validation
	if (contactForm) {
		contactForm.addEventListener('submit', function (e) {
			e.preventDefault()

			let isValid = true
			const inputs = this.querySelectorAll('.form__input, .form__textarea')

			inputs.forEach(input => {
				const error = input.nextElementSibling

				if (!input.value.trim()) {
					isValid = false
					error.textContent = 'This field is required'
					input.classList.add('error')
				} else if (input.type === 'email' && !validateEmail(input.value)) {
					isValid = false
					error.textContent = 'Please enter a valid email address'
					input.classList.add('error')
				} else {
					error.textContent = ''
					input.classList.remove('error')
				}
			})

			if (isValid) {
				// Simulate form submission
				const submitBtn = this.querySelector('.form__button')
				const originalText = submitBtn.textContent

				submitBtn.textContent = 'Sending...'
				submitBtn.disabled = true

				setTimeout(() => {
					this.reset()
					submitBtn.textContent = 'Message Sent!'

					setTimeout(() => {
						submitBtn.textContent = originalText
						submitBtn.disabled = false
					}, 2000)
				}, 1500)
			}
		})

		// Clear error on input
		contactForm
			.querySelectorAll('.form__input, .form__textarea')
			.forEach(input => {
				input.addEventListener('input', function () {
					this.nextElementSibling.textContent = ''
					this.classList.remove('error')
				})
			})
	}

	// Hero button modal trigger
	if (heroButton && heroButton.getAttribute('data-modal') === 'contact') {
		heroButton.addEventListener('click', function () {
			const contactSection = document.getElementById('contact')
			if (contactSection) {
				window.scrollTo({
					top: contactSection.offsetTop - 100,
					behavior: 'smooth',
				})
			}
		})
	}

	// Animation on scroll initialization
	document.querySelectorAll('[data-aos]').forEach(item => {
		// Simple animation on scroll implementation
		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						setTimeout(() => {
							entry.target.classList.add('aos-animate')
						}, entry.target.getAttribute('data-aos-delay') || 0)
						observer.unobserve(entry.target)
					}
				})
			},
			{ threshold: 0.1 }
		)

		observer.observe(item)
	})

	// Email validation helper
	function validateEmail(email) {
		const re =
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		return re.test(String(email).toLowerCase())
	}

	// Add AOS animation classes to elements
	const addAOSClasses = () => {
		document.querySelectorAll('.features__item').forEach((item, index) => {
			item.setAttribute('data-aos', 'fade-up')
			item.setAttribute('data-aos-delay', index * 200)
		})

		document.querySelectorAll('.gallery__item').forEach((item, index) => {
			item.setAttribute('data-aos', 'zoom-in')
			item.setAttribute('data-aos-delay', index * 100)
		})
	}

	addAOSClasses()

	// Add CSS class for animation to elements that are visible on load
	setTimeout(() => {
		document.querySelectorAll('[data-aos]').forEach(item => {
			if (isElementInViewport(item)) {
				item.classList.add('aos-animate')
			}
		})
	}, 100)

	// Helper to check if element is in viewport
	function isElementInViewport(el) {
		const rect = el.getBoundingClientRect()
		return (
			rect.top <=
				(window.innerHeight || document.documentElement.clientHeight) &&
			rect.bottom >= 0
		)
	}
})
