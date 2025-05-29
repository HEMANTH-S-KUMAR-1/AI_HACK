// This file contains all the JavaScript functionality for the portfolio website. 
// It includes the initialization of animations, typing effects, smooth scrolling, 
// form handling, and other interactive features.

document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true
    });

    // Typing Animation
    const typingText = document.getElementById('typing-text');
    const phrases = [
        'Generative AI Engineer',
        'Ethical Hacker',
        'Security Researcher',
        'ML Engineer',
        'Prompt Engineer'
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function typeWriter() {
        if (!typingText) return;
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingText.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let typeSpeed = isDeleting ? 50 : 100;
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }
        
        setTimeout(typeWriter, typeSpeed);
    }
    
    // Start typing animation
    if (typingText) {
        setTimeout(typeWriter, 1000);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(10, 10, 10, 0.95)';
        } else {
            nav.style.background = 'rgba(10, 10, 10, 0.9)';
        }
    });

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const inputs = contactForm.querySelectorAll('input, textarea');
        
        // Define API URLs
        const API_URLS = [
            'http://localhost:3001/api/contact',
            'http://127.0.0.1:3001/api/contact'
        ];
        
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Disable form while processing
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            inputs.forEach(input => input.disabled = true);
            
            try {
                // Get form data
                const formData = {
                    name: this.querySelector('input[name="name"]').value.trim(),
                    email: this.querySelector('input[name="email"]').value.trim(),
                    message: this.querySelector('textarea[name="message"]').value.trim()
                };
                
                // Validate inputs
                if (!formData.name || !formData.email || !formData.message) {
                    throw new Error('Please fill in all fields.');
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    throw new Error('Please enter a valid email address.');
                }
                
                console.log('Sending message:', formData); // Debug log
                
                // Try each API URL until one works
                let response = null;
                let error = null;
                
                for (const url of API_URLS) {
                    try {
                        console.log('Trying API URL:', url); // Debug log
                        const res = await fetch(url, {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formData)
                        });
                        
                        if (res.ok) {
                            response = await res.json();
                            console.log('Server response:', response); // Debug log
                            break;
                        }
                        
                        const errorData = await res.json();
                        throw new Error(errorData.error || 'Failed to send message');
                    } catch (e) {
                        console.error('Error with URL', url, ':', e);
                        error = e;
                    }
                }
                
                if (!response) {
                    throw error || new Error('Failed to connect to server. Please check if the server is running.');
                }
                
                // Show success message
                submitButton.textContent = 'Message Sent!';
                submitButton.style.background = 'linear-gradient(45deg, #00ff00, #00aa00)';
                this.reset();
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    submitButton.textContent = 'Send Message';
                    submitButton.style.background = '';
                    submitButton.disabled = false;
                    inputs.forEach(input => input.disabled = false);
                }, 2000);
                
            } catch (error) {
                console.error('Contact form error:', error);
                
                // Show detailed error message
                let errorMessage = error.message;
                if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Unable to connect to server. Please ensure the server is running at http://localhost:3001';
                } else if (error.message.includes('NetworkError')) {
                    errorMessage = 'Network error. Please check your internet connection.';
                }
                
                // Create and show error message in a more user-friendly way
                const errorDiv = document.createElement('div');
                errorDiv.style.color = '#ff4444';
                errorDiv.style.padding = '10px';
                errorDiv.style.marginTop = '10px';
                errorDiv.style.borderRadius = '4px';
                errorDiv.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
                errorDiv.textContent = errorMessage || 'Failed to send message. Please try again.';
                
                // Remove any existing error message
                const existingError = contactForm.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
                
                errorDiv.className = 'error-message';
                contactForm.appendChild(errorDiv);
                
                // Remove error message after 5 seconds
                setTimeout(() => {
                    errorDiv.remove();
                }, 5000);
                
                // Reset form state
                submitButton.textContent = 'Send Message';
                submitButton.style.background = '';
                submitButton.disabled = false;
                inputs.forEach(input => input.disabled = false);
            }
        });
    }

    // Mobile menu toggle
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Parallax scrolling effect
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Add glitch effect to profile image
    const profileImg = document.querySelector('.profile-img');
    if (profileImg) {
        profileImg.addEventListener('mouseenter', function() {
            this.style.filter = 'hue-rotate(180deg) saturate(2)';
            this.style.animation = 'glitch 0.3s ease-in-out';
        });
        
        profileImg.addEventListener('mouseleave', function() {
            this.style.filter = 'none';
            this.style.animation = 'float 3s ease-in-out infinite';
        });
    }

    // Dynamic background particles
    function createParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.background = Math.random() > 0.5 ? '#00ffff' : '#ff00ff';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = '-10px';
        particle.style.opacity = '0.7';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '-1';
        
        document.body.appendChild(particle);
        
        let position = -10;
        const speed = Math.random() * 3 + 1;
        
        const animate = () => {
            position += speed;
            particle.style.top = position + 'px';
            
            if (position > window.innerHeight) {
                document.body.removeChild(particle);
            } else {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // Create particles periodically
    setInterval(createParticle, 1000);

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Matrix digital rain effect (optional)
    function createMatrixRain() {
        const canvas = document.createElement('canvas');
        canvas.className = 'matrix-bg';
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        document.body.appendChild(canvas);
        
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = [];
        
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
        
        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#00ff00';
            ctx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        setInterval(draw, 35);
        
        // Resize canvas on window resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // Uncomment to enable matrix effect
    // createMatrixRain();

    // Console easter egg
    console.log(`
    ╔═══════════════════════════════════════╗
    ║     Welcome to Hemanth's Portfolio     ║
    ║                                       ║
    ║  🚀 Generative AI Engineer            ║
    ║  🔒 Ethical Hacker                    ║
    ║  💻 Security Researcher               ║
    ║                                       ║
    ║  Interested in collaboration?         ║
    ║  Contact: hemanth.1si22ei049@gmail.com║
    ╚═══════════════════════════════════════╝
    `);

    // Konami code easter egg
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];

    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.code);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            // Activate special effect
            document.body.style.animation = 'rainbow 2s linear infinite';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 5000);
            
            alert('🎉 Konami Code Activated! You found the easter egg!');
            konamiCode = [];
        }
    });

    // Add CSS for rainbow effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
        
        @keyframes glitch {
            0%, 100% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
        }
        
        @media (max-width: 768px) {
            .nav-links.active {
                display: flex;
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                background: rgba(10, 10, 10, 0.95);
                flex-direction: column;
                padding: 1rem;
                border-top: 1px solid var(--glass-border);
            }
            
            .nav-links.active a {
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
        }
    `;
    document.head.appendChild(style);

    // Performance optimization: Lazy load images
    const images = document.querySelectorAll('img');
    if (images.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Add loading animation
    const loader = document.createElement('div');
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--primary-bg);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-size: 2rem;
        color: var(--accent-cyan);
    `;
    loader.innerHTML = 'Loading...';
    document.body.appendChild(loader);
    
    // Remove loader after page loads
    window.addEventListener('load', () => {
        loader.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(loader);
        }, 500);
    });
});