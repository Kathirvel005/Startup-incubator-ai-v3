# 🚀 Startup Incubator AI (v3)
**Accredited AI Feasibility Modeling & Startup Validation Platform**

Welcome to **Startup Incubator AI**, a cutting-edge platform designed to help visionaries validate, build, and scale their next big idea. This project serves as a comprehensive tool to evaluate startup concepts using data-driven insights and AI-powered feasibility models.

**🌐 Live Demo:** [https://launchmind-ai.onrender.com](https://launchmind-ai.onrender.com)

---

## 🌟 Features

*   **AI Feasibility Score**: Instantly evaluate your startup idea with an advanced scoring model that outputs a success rate, risk rate, and an overall innovation score.
*   **Market Size Analysis**: Automatically generate Total Addressable Market (TAM), Serviceable Available Market (SAM), and Serviceable Obtainable Market (SOM) estimations tailored to your niche.
*   **SWOT Generation**: Automatically generate a complete Strengths, Weaknesses, Opportunities, and Threats (SWOT) analysis for strategic planning.
*   **Step-by-Step Execution Plan**: Get a phased roadmap (Concept -> MVP -> Beta -> Launch) tailored to your industry and budget.
*   **Profile Customization**: Users can seamlessly update their profile name, email, and upload custom profile avatars (with Base64 image support).
*   **Premium Glassmorphic UI**: A futuristic, stunning dark-mode interface built with modern aesthetic principles.

---

## 🛠️ Technology Stack

**Frontend:**
*   **React + Vite**: For a lightning-fast, modern Single Page Application (SPA).
*   **Lucide React**: For crisp, beautiful iconography.
*   **Vanilla CSS**: Leveraging CSS variables and glassmorphic designs for a premium look without heavy styling frameworks.

**Backend:**
*   **Node.js & Express**: A lightweight, robust backend server.
*   **Local JSON Database (`db.json`)**: Simple, file-based storage for users, authentication, and startup idea history.
*   **Custom Authentication**: Secure password hashing (SHA-256) and token-based authentication.
*   **Base64 Image Handling**: Supports receiving and saving large Base64 payload images for user profiles (configured up to 50MB payload limits).

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites
*   [Node.js](https://nodejs.org/en/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/Kathirvel005/Startup-incubator-ai-v3.git
cd "Startup-incubator-ai-v3"
```

### 2. Run the Backend
The backend runs on **port 5000** and serves the API for authentication and AI data generation.
```bash
cd backend
npm install
npm start
```

### 3. Run the Frontend
The frontend runs on **port 5173** using Vite.
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
Open your browser and navigate to:
**http://localhost:5173**

---

## 📁 Project Structure

```
Startup-incubator-ai-v3/
├── backend/
│   ├── data/
│   │   └── db.json          # File-based database
│   ├── server.js            # Express API Server
│   └── package.json
├── frontend/
│   ├── public/              # High-quality AI Generated Assets
│   ├── src/
│   │   ├── App.jsx          # Core routing and logic
│   │   ├── index.css        # Glassmorphic and modern styling variables
│   │   └── main.jsx         # React DOM Entry
│   ├── package.json
│   └── vite.config.js       # Vite configuration
└── README.md
```

---

## 🎓 College Mini-Project Highlight

This project was meticulously designed as a comprehensive mini-project showcasing full-stack capabilities, including:
1.  **State Management**: Complex React hooks managing global state (tokens, active tabs, idea models).
2.  **REST API Design**: Properly structured Express routes with custom middleware for auth verification.
3.  **Modern Web Design**: Utilization of advanced CSS properties (`backdrop-filter`, `text-fill-color`, etc.) to create a truly "wow" factor.
4.  **Data Processing**: Client-side `FileReader` parsing to convert uploaded images to Base64 to bypass the need for external bucket storage.

---

*Powered by Kathirvel T*
