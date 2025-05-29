// This file contains all the JavaScript functionality for the portfolio website. 
// It includes the initialization of animations, typing effects, smooth scrolling, 
// form handling, and other interactive features.

// API endpoint configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS with error handling
    try {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            disable: 'mobile' // Disable on mobile for better performance
        });
    } catch (error) {
        console.error('Error initializing AOS:', error);
    }

    // Typing Animation with cleanup
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
    let typingTimeout;
    
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
        
        typingTimeout = setTimeout(typeWriter, typeSpeed);
    }
    
    // Start typing animation with cleanup
    if (typingText) {
        typingTimeout = setTimeout(typeWriter, 1000);
    }

    // Cleanup function for typing animation
    function cleanupTyping() {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
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

    // Enhanced scroll handling
    let lastScroll = 0;
    const nav = document.querySelector('nav');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Navbar background
        if (currentScroll > 100) {
            nav.style.background = 'rgba(10, 10, 10, 0.95)';
        } else {
            nav.style.background = 'rgba(10, 10, 10, 0.9)';
        }
        
        // Hide/show navbar on scroll
        if (currentScroll > lastScroll && currentScroll > 100) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });

    // Enhanced form handling with debounce
    let isSubmitting = false;
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const inputs = contactForm.querySelectorAll('input, textarea');
        
        async function sendMessage(formData) {
            if (isSubmitting) return;
            isSubmitting = true;
            
            try {
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;
                inputs.forEach(input => input.disabled = true);

                const response = await fetch('http://localhost:3001/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to send message');
                }
                
                showNotification('Message sent successfully!', 'success');
                contactForm.reset();
            } catch (error) {
                console.error('Error:', error);
                showNotification('Failed to send message. Please try again.', 'error');
            } finally {
                isSubmitting = false;
                submitButton.textContent = 'Send Message';
                submitButton.disabled = false;
                inputs.forEach(input => input.disabled = false);
            }
        }

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            sendMessage(data);
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Enhanced mobile menu
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
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

    // Optimize particle animation
    let particleInterval;
    const maxParticles = 50;
    let activeParticles = 0;

    function createParticle() {
        if (activeParticles >= maxParticles) return;
        activeParticles++;

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
        
        function animate() {
            position += speed;
            particle.style.top = position + 'px';
            
            if (position > window.innerHeight) {
                document.body.removeChild(particle);
                activeParticles--;
            } else {
                requestAnimationFrame(animate);
            }
        }
        
        animate();
    }

    // Start particle animation with cleanup
    particleInterval = setInterval(createParticle, 1000);

    // Cleanup function
    function cleanup() {
        cleanupTyping();
        if (particleInterval) {
            clearInterval(particleInterval);
        }
        document.querySelectorAll('.particle').forEach(particle => {
            document.body.removeChild(particle);
        });
    }

    // Add cleanup on page unload
    window.addEventListener('unload', cleanup);

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