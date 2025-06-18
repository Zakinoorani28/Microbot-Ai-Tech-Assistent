# 🤖 MicroBot - AI Tech Assistant

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3-cyan?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Gemini-AI-orange?style=for-the-badge&logo=google" alt="Gemini AI" />
</div>

<div align="center">
  <h3>Your always-available AI assistant for tech products and instant support</h3>
  <p>Powered by Google's Gemini AI with Roman Urdu support</p>
</div>

---
## 🌟 Features

### 🎯 **Core Functionality**

- **Smart AI Conversations** - Powered by Google Gemini AI for accurate tech advice
- **Roman Urdu Support** - Automatic language detection and bilingual responses
- **Real-time Chat** - Instant responses with typing indicators
- **Markdown Rendering** - Beautiful formatting for code, tables, and text
- **Persistent Chat History** - All conversations saved locally

### 🎨 **User Interface**

- **Modern Dark/Light Theme** - MicroTech red-black/red-white color scheme
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **ChatGPT-like Experience** - Familiar and intuitive interface
- **Collapsible Sidebar** - Space-efficient chat management
- **Sticky Input** - Always accessible message input

### 📱 **Chat Management**

- **Multiple Conversations** - Organize chats with automatic titles
- **Rename & Delete** - Full control over chat history
- **Search & Navigate** - Easy access to previous conversations
- **Export Ready** - Conversations stored in structured format

### 🌍 **Language Intelligence**

- **English Support** - Full technical assistance in English
- **Roman Urdu Detection** - Automatic detection of Roman Urdu input
- **Bilingual Responses** - Roman Urdu with English technical terms
- **Context Awareness** - Maintains conversation context across languages

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/microbot-chatbot.git
   cd microbot-chatbot
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install

   # or

   yarn install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

   Add your Gemini API key to `.env.local`:
   \`\`\`env
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev

   # or

   yarn dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15** - React framework with App Router
- **React 18** - UI library with hooks and context
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library

### **AI Integration**

- **Google Gemini AI** - Advanced language model
- **Custom Language Detection** - Roman Urdu support
- **Streaming Responses** - Real-time message delivery

### **State Management**

- **React Hooks** - useState, useEffect, useCallback
- **Local Storage** - Persistent chat history
- **Context API** - Theme management

---

## 🎯 Usage Examples

### **English Conversation**

\`\`\`
User: "What's the best router for a small office?"
MicroBot: "For a small office, I'd recommend considering these factors..."
\`\`\`

### **Roman Urdu Conversation**

\`\`\`
User: "router ka price kya hai?"
MicroBot: "Router ki price specifications ke hisab se different hoti hai. Basic router 2000-5000 rupees mein mil jata hai..."
\`\`\`

### **Technical Comparisons**

MicroBot can create detailed comparison tables for tech products with proper formatting and analysis.

---

## 🔧 Configuration

### **Theme Customization**

Edit `app/globals.css` to customize the MicroTech color scheme:
\`\`\`css
:root {
--primary: 0 84.2% 60.2%; /_ Red primary color _/
--background: 0 0% 100%; /_ Light background _/
}

.dark {
--background: 0 0% 3.9%; /_ Dark background _/
}
\`\`\`

### **API Configuration**

Modify `app/api/gemini/route.ts` to adjust AI behavior:
\`\`\`typescript
generationConfig: {
temperature: 0.7, // Creativity level
maxOutputTokens: 1024, // Response length
}
\`\`\`

---

## 🌟 Key Features Explained

### **Smart Language Detection**

MicroBot automatically detects when you're writing in Roman Urdu and responds accordingly:

- Detects common Roman Urdu words and patterns
- Maintains technical terms in English
- Provides culturally appropriate responses

### **Responsive Design**

- **Desktop**: Full sidebar with collapsible option
- **Tablet**: Adaptive layout with touch-friendly controls
- **Mobile**: Hidden sidebar with hamburger menu

### **Chat Management**

- **Auto-generated titles** from first message
- **Rename functionality** with inline editing
- **Delete confirmation** to prevent accidents
- **Persistent storage** across browser sessions

---

## 🚀 Deployment

### **Vercel (Recommended)**

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `GOOGLE_GENERATIVE_AI_API_KEY` in environment variables
4. Deploy automatically

### **Other Platforms**

- **Netlify**: Add build command `npm run build`
- **Railway**: Configure environment variables
- **Docker**: Use the included Dockerfile

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain responsive design
- Add proper error handling
- Write meaningful commit messages

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful language processing
- **Vercel** for excellent deployment platform
- **shadcn/ui** for beautiful component library
- **Tailwind CSS** for utility-first styling
- **Next.js team** for the amazing framework

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Zakinoorani28/Microbot-Ai-Tech-Assistent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Zakinoorani28/Microbot-Ai-Tech-Assistent/discussions)
- **Email**: zakinoorani2006@gmail.com

---

<div align="center">
  <p>Made with ❤️ for the tech community</p>
  <p>
    <a href="#top">Back to Top</a> •
    <a href="https://microbot-demo.vercel.app">Live Demo</a> •
    <a href="[https://github.com/Zakinoorani28/Microbot-Ai-Tech-Assistent">GitHub</a>
  </p>
</div>
\`\`\`

Let's also create a simple example environment file:
