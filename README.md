# Project SmartGlass

A collaborative, AI-powered platform for interactive learning, document sharing, live Q&A, quizzes, and analytics. SmartGlass integrates real-time features, document management, and advanced AI models to enhance educational and collaborative experiences.

## 🚀 Features
- **AI Model Integration:** Math solving, document embedding, and intelligent summarization.
- **Real-Time Collaboration:** Live Q&A, chat, and polling for interactive sessions.
- **Document Management:** Upload, share, and analyze documents securely.
- **Quiz & Poll System:** Create, participate, and view results in real-time.
- **User Authentication:** Secure login, signup, and role-based access.
- **Analytics:** Leaderboards and student analytics for performance tracking.

## 🗂️ Project Structure
```
Project-SmartGlass/
│
├── AI-Model/           # Python backend for AI features (math solver, embeddings, etc.)
│   ├── models/         # Pydantic schemas for AI models
│   └── ...
│
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React context (e.g., Auth)
│   │   ├── firebase/   # Firebase config
│   │   ├── pages/      # App pages (auth, chat, dashboard, etc.)
│   │   └── services/   # API and socket services
│   └── ...
│
├── server/             # Node.js/Express backend
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth and access control
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── services/       # External services (Firebase, Cloudinary)
│   ├── socket/         # Socket.io logic
│   └── utils/          # Utility functions
└── ...
```

## 🛠️ Tech Stack
- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Node.js, Express, MongoDB, Socket.io
- **AI Model:** Python (FastAPI/Flask suggested), Pydantic, Custom math/embedding logic
- **Authentication:** Firebase
- **Cloud Storage:** Cloudinary

## 🧑‍💻 Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Project-SmartGlass.git
cd Project-SmartGlass
```

### 2. Setup the AI Model (Python)
```bash
cd AI-Model
pip install -r requirements.txt
# Configure Astra/Vector DB and other settings in config.py
python main.py
```

### 3. Setup the Server (Node.js)
```bash
cd ../server
cp firebase-service-account.json_example firebase-service-account.json
npm install
npm start
```

### 4. Setup the Client (React)
```bash
cd ../client
cp firebaseConfig.json_example firebaseConfig.json
npm install
npm run dev
```

## 📦 Usage
- Visit the client at `http://localhost:5173` (or as specified by Vite)
- Backend runs on `http://localhost:5000` (default)
- AI Model runs on its configured port (see `AI-Model/main.py`)

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License.

## 📬 Contact
For questions, suggestions, or support:
- **GitHub Issues:** [Open an issue](https://github.com/your-username/Project-SmartGlass/issues)
- **Email:** your.email@example.com

---

*Empowering collaborative learning with AI and real-time interactivity.*
