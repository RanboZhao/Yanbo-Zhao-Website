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

// EmailJS Configuration (secure)
const EMAIL_CONFIG = {
    serviceID: 'service_oyiv05q',
    templateID: 'template_bz2rt8k',
    publicKey: 'tFwh-FOup7w2Dpikn',
    userID: 'tFwh-FOup7w2Dpikn' // EmailJS user ID (same as public key)
};

// Contact Form Handler
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.isEmailJSReady = false;
        if (this.form) {
            this.init();
        }
    }

    init() {
        // Validate configuration
        if (!this.validateConfig()) {
            this.showMessage('Contact form configuration error. Please contact the site administrator.', 'error');
            return;
        }

        // Wait for EmailJS to load
        this.initializeEmailJS();
    }

    validateConfig() {
        return EMAIL_CONFIG.serviceID && 
               EMAIL_CONFIG.templateID && 
               EMAIL_CONFIG.publicKey &&
               EMAIL_CONFIG.serviceID !== 'YOUR_SERVICE_ID';
    }

    async initializeEmailJS() {
        // Check if EmailJS is loaded
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS library not loaded!');
            this.showMessage('Unable to load email service. Please refresh the page.', 'error');
            return;
        }

        try {
            // Initialize EmailJS with user ID
            emailjs.init({
                publicKey: EMAIL_CONFIG.publicKey,
                blockHeadless: true, // Block headless browsers for security
                limitRate: {
                    throttle: 10000, // 10 seconds between requests
                }
            });
            
            this.isEmailJSReady = true;
            console.log('EmailJS initialized successfully');
        } catch (error) {
            console.error('EmailJS initialization failed:', error);
            this.showMessage('Email service initialization failed. Please try again later.', 'error');
            return;
        }
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
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
            
            // Security checks
            if (!this.isEmailJSReady) {
                throw new Error('Email service not ready');
            }
            
            if (typeof emailjs === 'undefined') {
                throw new Error('Email service unavailable');
            }
            
            // Rate limiting check
            if (this.lastSubmission && Date.now() - this.lastSubmission < 10000) {
                throw new Error('Please wait before sending another message');
            }
            
            console.log('Sending email via EmailJS...');
            
            // Sanitize and validate form data
            const templateParams = this.sanitizeFormData({
                from_name: formData.get('name')?.trim(),
                reply_to: formData.get('email')?.trim(),
                subject: formData.get('subject')?.trim(),
                message: formData.get('message')?.trim(),
                to_email: 'yanbozhao716@gmail.com'
            });

            // Validate required fields
            if (!templateParams.from_name || !templateParams.reply_to || 
                !templateParams.subject || !templateParams.message) {
                throw new Error('All fields are required');
            }

            // Send email using EmailJS
            console.log('Sending email...');
            const result = await emailjs.send(
                EMAIL_CONFIG.serviceID, 
                EMAIL_CONFIG.templateID, 
                templateParams
            );
            
            console.log('Email sent successfully:', result.status);
            this.lastSubmission = Date.now();

            this.showMessage('Message sent successfully! Thank you for contacting me.', 'success');
            this.form.reset();
        } catch (error) {
            console.error('Email sending error:', error.message || error);
            
            // User-friendly error messages
            let errorMessage = 'Failed to send message. ';
            if (error.message?.includes('rate limit') || error.message?.includes('wait')) {
                errorMessage += 'Please wait before sending another message.';
            } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                errorMessage += 'Please check your internet connection and try again.';
            } else {
                errorMessage += 'Please try again later.';
            }
            
            this.showMessage(errorMessage, 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    sanitizeFormData(data) {
        // Basic XSS protection and data sanitization
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                // Remove HTML tags and limit length
                sanitized[key] = value
                    .replace(/<[^>]*>/g, '') // Remove HTML tags
                    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
                    .substring(0, key === 'message' ? 2000 : 200); // Limit length
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
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
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new ThemeManager();
    new NavigationManager();
    new ScrollAnimations();
    
    // Initialize ContactForm with a small delay to ensure EmailJS loads
    setTimeout(() => {
        new ContactForm();
    }, 100);

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
