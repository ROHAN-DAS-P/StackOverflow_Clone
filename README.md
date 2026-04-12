# StackOverflow Clone - Full Stack Application

A complete, production-grade **StackOverflow-like knowledge sharing platform** built with modern technologies. Includes a robust Django REST backend with PostgreSQL, Redis, and Elasticsearch, plus a React frontend with Vite.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

This is a complete full-stack application that replicates the core functionality of Stack Overflow with additional modern features:

- **24+ REST API endpoints** with JWT authentication
- **Real-time notifications** using Celery
- **Full-text search** powered by Elasticsearch
- **Caching layer** with Redis
- **Role-based access control** (RBAC)
- **Admin dashboard** for content management
- **Responsive frontend** with React and Vite

---

## 🛠 Tech Stack

### Backend

- **Framework:** Django 4.2 + Django REST Framework
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Search:** Elasticsearch 8.11
- **Task Queue:** Celery 5.3 + Redis
- **Auth:** JWT (PyJWT)
- **Server:** Gunicorn + PostgreSQL

### Frontend

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** Zustand
- **Routing:** React Router v6
- **UI Components:** Tailwind CSS + Custom Components

### DevOps

- **Containerization:** Docker & Docker Compose
- **Version Control:** Git

---

## 📁 Project Structure

```
stackoverflw/
├── backend/                      # Django REST API
│   ├── src/
│   │   ├── models/              # Database models
│   │   ├── serializers/         # DRF serializers
│   │   ├── controllers/         # API views/controllers
│   │   ├── services/            # Business logic
│   │   ├── repositories/        # Data access layer
│   │   ├── middleware/          # Auth, logging, rate limiting
│   │   ├── jobs/                # Celery tasks
│   │   ├── workers/             # Celery configuration
│   │   ├── utils/               # Utilities (cache, search)
│   │   ├── routes/              # URL routing
│   │   ├── config/              # Configuration
│   │   ├── conf.py              # Django settings
│   │   └── wsgi.py              # WSGI application
│   ├── manage.py                # Django CLI
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile               # Container definition
│   ├── .env.example             # Environment template
│   └── README.md                # Backend documentation
│
├── frontend/                     # React + Vite app
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── common/          # Header, Footer, Navigation
│   │   │   ├── forms/           # Form components
│   │   │   ├── cards/           # Card components
│   │   │   └── ui/              # UI components
│   │   ├── pages/               # Page components
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── questions/       # Questions pages
│   │   │   ├── answers/         # Answers pages
│   │   │   └── profile/         # User profile
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API client services
│   │   ├── store/               # Zustand store
│   │   ├── utils/               # Utility functions
│   │   ├── styles/              # Global CSS
│   │   ├── App.jsx              # Root component
│   │   └── main.jsx             # Entry point
│   ├── public/                  # Static assets
│   ├── package.json             # npm dependencies
│   ├── vite.config.js           # Vite config
│   ├── tailwind.config.js       # Tailwind CSS config
│   ├── postcss.config.js        # PostCSS config
│   ├── .env.example             # Environment template
│   ├── Dockerfile               # Container definition
│   └── README.md                # Frontend documentation
│
├── docker-compose.yml           # Multi-container orchestration
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Backend:** Python 3.10+, PostgreSQL, Redis
- **Frontend:** Node.js 18+, npm/yarn
- **Optional:** Docker & Docker Compose

### Using Docker (Recommended - Easiest)

```bash
# Clone the repository
git clone https://github.com/ROHAN-DAS-P/StackOverflow_clone.git
cd StackOverflow_clone

# Build and start all services
docker-compose up -d

# Backend will run on http://localhost:8000
# Frontend will run on http://localhost:5173

# Create superuser for admin panel
docker-compose exec backend python manage.py createsuperuser

# Access the application
# Admin:    http://localhost:8000/admin/
# API:      http://localhost:8000/api/
# Frontend: http://localhost:5173
```

---

## 🔧 Backend Setup (Local Development)

### 1. Prerequisites

```bash
# PostgreSQL should be running
# Redis should be running
```

### 2. Install Dependencies

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Database Setup

```bash
python manage.py makemigrations src
python manage.py migrate
python manage.py createsuperuser
```

### 5. Run Development Server

```bash
# Terminal 1: Django server
python manage.py runserver

# Terminal 2: Celery worker
celery -A src.workers worker -l info -P solo

# Terminal 3: Celery Beat (scheduled tasks)
celery -A src.workers beat -l info
```

Backend server runs on `http://localhost:8000`

---

## ⚛️ Frontend Setup (Local Development)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with API URL
VITE_API_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 📚 API Documentation

### Base URL

```
http://localhost:8000/api
```

### Authentication

All authenticated endpoints require Bearer token:

```
Authorization: Bearer <access_token>
```

### Main Endpoints

#### Authentication

```
POST   /auth/register/      - Register new user
POST   /auth/login/         - Login & get tokens
```

#### Questions

```
GET    /questions/          - List all questions
POST   /questions/          - Create question
GET    /questions/{id}/     - Get question detail
PUT    /questions/{id}/     - Update question
DELETE /questions/{id}/     - Delete question
GET    /questions/trending/ - Trending questions
GET    /questions/unanswered/ - Unanswered questions
```

#### Answers

```
GET    /answers/            - List answers
POST   /answers/            - Create answer
PUT    /answers/{id}/       - Update answer
DELETE /answers/{id}/       - Delete answer
POST   /answers/{id}/accept/ - Accept as best answer
```

#### Voting

```
POST   /votes/              - Vote on question/answer
```

#### Search

```
POST   /search/             - Full-text search
```

#### Users

```
GET    /users/              - List users
GET    /users/{id}/         - User profile
```

#### Notifications

```
GET    /notifications/      - Get notifications
POST   /notifications/mark-read/ - Mark as read
```

#### Health

```
GET    /health/             - Health check
```

### Response Format

**Success (200):**

```json
{
  "id": 1,
  "title": "How to use Django?",
  "content": "I want to learn Django REST framework",
  "author": "testuser",
  "created_at": "2026-04-12T17:00:00Z",
  "votes_count": 5,
  "answers_count": 2
}
```

**Error (400):**

```json
{
  "error": "Invalid input",
  "details": {
    "title": ["This field is required"]
  }
}
```

For complete API documentation, see [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

---

## ✨ Features Implemented

### Backend Features

- ✅ User registration & authentication (JWT)
- ✅ User profiles & reputation system
- ✅ Create/read/update/delete questions
- ✅ Create/read/update/delete answers
- ✅ Accept best answer
- ✅ Upvote/downvote system
- ✅ Tag-based filtering
- ✅ Full-text search (Elasticsearch)
- ✅ Real-time notifications
- ✅ Admin panel for content management
- ✅ Rate limiting
- ✅ Request logging
- ✅ Caching layer
- ✅ Background jobs (email, indexing, reputation sync)

### Frontend Features (To be implemented)

- ⏳ User authentication (register/login)
- ⏳ Browse questions list
- ⏳ View question details with answers
- ⏳ Create new questions
- ⏳ Post answers
- ⏳ Vote system UI
- ⏳ Search functionality
- ⏳ User profiles
- ⏳ Admin dashboard
- ⏳ Responsive design

---

## 🐳 Docker Deployment

### Build Images

```bash
docker-compose build
```

### Start Services

```bash
docker-compose up -d
```

### Services Running

- **Backend:** http://localhost:8000
- **Frontend:** http://localhost:5173
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379
- **Elasticsearch:** localhost:9200

### View Logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services

```bash
docker-compose down
```

---

## 📖 Additional Documentation

- [Backend README](backend/README.md) - Detailed backend setup & API reference
- [Frontend README](frontend/README.md) - Frontend development guide
- [Architecture Documentation](backend/ARCHITECTURE.md) - System design & patterns
- [Developer Guide](backend/DEVELOPER_GUIDE.md) - Development workflow
- [API Documentation](backend/API_DOCUMENTATION.md) - Complete API reference

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

- Backend: Follow Django best practices, use type hints
- Frontend: Use React hooks, maintain component isolation
- Tests: Write tests for new features
- Documentation: Update docs for API changes

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Rohan Das**

- GitHub: [@ROHAN-DAS-P](https://github.com/ROHAN-DAS-P)
- Email: rohan@example.com

---

## 🙏 Acknowledgments

- Django & Django REST Framework community
- React & Vite community
- PostgreSQL, Redis, Elasticsearch teams

---

## 📞 Support

For issues, questions, or suggestions:

1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Join our discussions

---

**Happy coding! 🚀**
