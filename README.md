# 🚀 Hemanth S Kumar's Portfolio Website

<div align="center">
  <img src="https://img.shields.io/badge/Generative%20AI-Expert-blue" alt="Generative AI Expert"/>
  <img src="https://img.shields.io/badge/Ethical%20Hacking-Professional-red" alt="Ethical Hacking Professional"/>
  <img src="https://img.shields.io/badge/Security%20Researcher-Active-green" alt="Security Researcher"/>
</div>

## 🌟 Overview

A modern, responsive portfolio website showcasing expertise in Generative AI and Cybersecurity. Features interactive elements, smooth animations, and a secure backend for contact form submissions.

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3 (with modern animations)
- JavaScript (ES6+)
- AOS (Animate On Scroll)

### Backend
- Node.js
- Express.js
- RESTful API

## ✨ Key Features

- 🎨 Modern, responsive design with mobile-first approach
- 🌈 Interactive animations and particle effects
- 📝 Secure contact form with backend integration
- 🎯 Smooth scrolling navigation
- 🎮 Interactive project cards and easter eggs
- 🔒 Secure message handling system
- 📱 Cross-browser compatibility

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/HEMANTH-S-KUMAR-1/AI_HACK.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Visit http://localhost:3001 in your browser

## 📁 Project Structure

```
portfolio-website/
├── index.html          # Main website page
├── admin.html          # Admin dashboard
├── styles.css          # Main stylesheet
├── script.js           # Frontend JavaScript
├── server.js           # Backend server
├── messages.json       # Message storage
└── assets/             # Static assets
    ├── profile.png
    └── resume.pdf
```

## 🔧 API Endpoints

- `POST /api/contact` - Submit contact form
- `GET /api/messages` - Retrieve messages (admin)
- `GET /health` - Server health check

## 🧩 Detailed Features

### Frontend Features
- Responsive navigation with mobile menu
- Dynamic typing animation
- Interactive project cards with hover effects
- Contact form with client-side validation
- Particle background effects
- Profile image hover effects
- Social media integration

### Backend Features
- Express server with CORS support
- JSON file-based message storage
- Input validation and sanitization
- Error handling middleware
- Admin dashboard for message management

## 🌐 Deployment

This portfolio is deployed using Cloudflare Pages and Workers. Here's how to deploy:

1. Push your code to GitHub repository
2. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

3. Login to Cloudflare:
   ```bash
   wrangler login
   ```

4. Create a KV namespace for messages:
   ```bash
   wrangler kv:namespace create "MESSAGES_KV"
   ```

5. Deploy the Worker:
   ```bash
   npm run deploy
   ```

6. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
7. Click "Create a project" and select your GitHub repository
8. Configure your build settings:
   - Build command: `npm run build`
   - Build output directory: `build`
   - Node.js version: 18 (or latest LTS)
9. Add environment variables:
   - `MESSAGES_KV`: Your KV namespace ID
10. Click "Save and Deploy"

### Custom Domain Setup (Optional)
1. In your Cloudflare Pages project, go to "Custom domains"
2. Click "Set up a custom domain"
3. Enter your domain name
4. Follow the DNS configuration instructions provided by Cloudflare

## 🛡️ Admin Dashboard

The admin dashboard (`admin.html`) now fetches messages directly from your Cloudflare Worker backend:

- Endpoint: `https://portfolio-backend.1si22im013.workers.dev/api/messages`
- To change the endpoint, update the `API_BASE_URL` constant in the `<script>` section of `admin.html`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss the proposed changes.

## 📝 License

This project is licensed under the ISC License.

## 📞 Contact

- Email: hemanth.1si22ei049@gmail.com
- GitHub: [HEMANTH-S-KUMAR-1](https://github.com/HEMANTH-S-KUMAR-1)

<div align="center">Made with ❤️ by Hemanth S Kumar</div>