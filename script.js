// Theme Management
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme();
        this.setupToggle();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        const toggle = document.getElementById('theme-toggle');
        const icon = toggle.querySelector('i');
        icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    setupToggle() {
        const toggle = document.getElementById('theme-toggle');
        toggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navMenu = document.querySelector('.nav-menu');
        this.hamburger = document.querySelector('.hamburger');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupScrollSpy();
        this.setupSmoothScroll();
        this.setupScrollEffect();
    }

    setupMobileMenu() {
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => {
                this.navMenu.classList.toggle('active');
                this.hamburger.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.navMenu.classList.remove('active');
                this.hamburger.classList.remove('active');
            });
        });
    }

    setupScrollSpy() {
        const sections = document.querySelectorAll('section');
        const options = {
            threshold: 0.3,
            rootMargin: '0px 0px -50% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    this.setActiveNavLink(id);
                }
            });
        }, options);

        sections.forEach(section => observer.observe(section));
    }

    setActiveNavLink(activeId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }

    setupSmoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupScrollEffect() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.navbar.style.background = 'rgba(var(--bg-primary-rgb), 0.95)';
                this.navbar.style.backdropFilter = 'blur(10px)';
            } else {
                this.navbar.style.background = 'var(--bg-primary)';
                this.navbar.style.backdropFilter = 'blur(10px)';
            }
        });
    }
}

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.timeline-item, .skill-item, .project-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-on-scroll', 'animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(element => {
            element.classList.add('animate-on-scroll');
            observer.observe(element);
        });
    }
}

// EmailJS Configuration
const EMAILJS_CONFIG = {
    serviceID: 'service_oyiv05q',
    templateID: 'template_bz2rt8k',
    publicKey: 'tFwh-FOup7w2Dpikn'
};

// Contact Form Handler
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.isEmailJSReady = false;
        this.initializationAttempts = 0;
        this.maxInitAttempts = 3;
        
        if (this.form) {
            this.init();
        }
    }

    async init() {
        console.log('Initializing ContactForm...');
        
        // Wait for EmailJS to be available
        await this.waitForEmailJS();
        
        // Initialize EmailJS
        await this.initializeEmailJS();
        
        // Set up form listener
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        console.log('ContactForm initialization complete');
    }

    async waitForEmailJS() {
        return new Promise((resolve, reject) => {
            const checkEmailJS = () => {
                if (typeof emailjs !== 'undefined') {
                    console.log('EmailJS library loaded successfully');
                    resolve();
                } else if (this.initializationAttempts < this.maxInitAttempts) {
                    this.initializationAttempts++;
                    console.log(`Waiting for EmailJS... attempt ${this.initializationAttempts}`);
                    setTimeout(checkEmailJS, 500);
                } else {
                    console.error('EmailJS library failed to load after multiple attempts');
                    reject(new Error('EmailJS library not available'));
                }
            };
            checkEmailJS();
        });
    }

    async initializeEmailJS() {
        try {
            console.log('Initializing EmailJS with config:', {
                serviceID: EMAILJS_CONFIG.serviceID,
                templateID: EMAILJS_CONFIG.templateID,
                publicKey: EMAILJS_CONFIG.publicKey.substring(0, 8) + '...'
            });

            // Initialize EmailJS with the new v4 syntax
            emailjs.init({
                publicKey: EMAILJS_CONFIG.publicKey,
                blockHeadless: true,
                limitRate: {
                    throttle: 10000, // 10 seconds between requests
                }
            });

            this.isEmailJSReady = true;
            console.log('EmailJS initialized successfully');
            
        } catch (error) {
            console.error('EmailJS initialization failed:', error);
            this.isEmailJSReady = false;
            throw error;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const formData = new FormData(this.form);
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        try {
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Check if EmailJS is ready
            if (!this.isEmailJSReady) {
                console.log('EmailJS not ready, attempting to reinitialize...');
                await this.initializeEmailJS();
            }
            
            // Validate form data
            const templateParams = this.validateAndSanitizeFormData(formData);
            
            console.log('Sending email with EmailJS...');
            console.log('Service ID:', EMAILJS_CONFIG.serviceID);
            console.log('Template ID:', EMAILJS_CONFIG.templateID);
            console.log('Template params:', {
                from_name: templateParams.from_name,
                reply_to: templateParams.reply_to,
                subject: templateParams.subject,
                message: templateParams.message.substring(0, 50) + '...'
            });

            // Send email using EmailJS
            const result = await emailjs.send(
                EMAILJS_CONFIG.serviceID,
                EMAILJS_CONFIG.templateID,
                templateParams
            );
            
            console.log('EmailJS send result:', result);
            
            if (result.status === 200) {
                this.showMessage('Message sent successfully! Thank you for contacting me.', 'success');
                this.form.reset();
            } else {
                throw new Error(`EmailJS returned status: ${result.status}`);
            }
            
        } catch (error) {
            console.error('Email sending error:', error);
            
            // Detailed error logging
            console.log('Error details:', {
                message: error.message,
                status: error.status,
                text: error.text,
                name: error.name
            });
            
            // User-friendly error message
            let errorMessage = 'Failed to send message. ';
            
            if (error.message?.includes('network') || error.message?.includes('fetch')) {
                errorMessage += 'Please check your internet connection and try again.';
            } else if (error.status === 400) {
                errorMessage += 'Please check that all fields are filled correctly.';
            } else if (error.status === 403) {
                errorMessage += 'Service temporarily unavailable. Please try again later.';
            } else {
                errorMessage += 'Please try again in a few moments.';
            }
            
            this.showMessage(errorMessage, 'error');
            
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    validateAndSanitizeFormData(formData) {
        const name = formData.get('name')?.trim();
        const email = formData.get('email')?.trim();
        const subject = formData.get('subject')?.trim();
        const message = formData.get('message')?.trim();
        
        // Validation
        if (!name || name.length < 2) {
            throw new Error('Please enter a valid name (at least 2 characters)');
        }
        
        if (!email || !this.isValidEmail(email)) {
            throw new Error('Please enter a valid email address');
        }
        
        if (!subject || subject.length < 3) {
            throw new Error('Please enter a subject (at least 3 characters)');
        }
        
        if (!message || message.length < 10) {
            throw new Error('Please enter a message (at least 10 characters)');
        }
        
        // Sanitization
        return {
            from_name: this.sanitizeInput(name),
            reply_to: email, // Email doesn't need HTML sanitization
            subject: this.sanitizeInput(subject),
            message: this.sanitizeInput(message),
            to_email: 'yanbozhao716@gmail.com'
        };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
            .substring(0, 2000) // Limit length
            .trim();
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 0.5rem;
            font-weight: 500;
            ${type === 'success' 
                ? 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;' 
                : 'background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;'
            }
        `;

        this.form.insertBefore(messageElement, this.form.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => messageElement.remove(), 300);
        }, 5000);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize all components
    new ThemeManager();
    new NavigationManager();
    new ScrollAnimations();
    
    // Initialize ContactForm with proper error handling
    try {
        const contactForm = new ContactForm();
        console.log('All components initialized successfully');
    } catch (error) {
        console.error('Failed to initialize ContactForm:', error);
    }

    // Add fade-in animation to hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('fade-in-up');
    }
});

// Handle mobile menu hamburger animation
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const bars = hamburger.querySelectorAll('.bar');
            bars.forEach((bar, index) => {
                if (hamburger.classList.contains('active')) {
                    if (index === 0) bar.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) bar.style.opacity = '0';
                    if (index === 2) bar.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                }
            });
        });
    }
});
