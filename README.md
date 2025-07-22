# 🧠 Madira – Mindful Chat Platform

Madira is a mindful AI-powered chat platform designed to support users in improving their mental well-being. It leverages cutting-edge LLMs like OpenAI and Ollama to offer a calming, personalized chat experience. Madira supports user authentication, persistent chat history, context-based replies, and feedback collection.

## 🌟 Features

- 🔐 **User Authentication**

  - Email-based sign-up and login
  - OTP verification for added security
  - JWT-based session management

- 💬 **Smart Chat Interface**

  - Context-aware conversations with recent chat history
  - Seamless integration with OpenAI and Ollama models
  - Real-time AI responses for personalized wellness support

- 📚 **Chat History Persistence**

  - User-specific chat history stored and reloaded on login
  - Enables continuity and better personalization

- 📝 **Feedback Collection**

  - Prompts users for feedback before logout
  - Prevents multiple submissions
  - Simple and intuitive form UI

- 🧰 **Technology Stack**
  - **Frontend**: React, TypeScript, Tailwind CSS, Vite
  - **Backend**: Node.js, Express.js, MySQL
  - **Database**: MySQL with phpMyAdmin for visualization
  - **Authentication**: JWT, Email + OTP
  - **Deployment**: PM2, Virtualmin (or any cloud server)

---

## 🚀 Getting Started

### 🛠️ Prerequisites

- Node.js v18+
- MySQL server
- An OpenAI API key (if using OpenAI)
- Ollama installed (optional, for local LLM)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/madira.git
cd madira
```
