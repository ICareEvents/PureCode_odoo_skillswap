# Skill Swap Platform - Odoo Hackathon - Team 3322

A mskill exchange platform built with Next.js and FastAPI, allowing users to connect and trade skills with each other.
Team Members: Kumari Ankita, Swarnima Kumari, Roopesh Ranjan
Drive Link: https://drive.google.com/drive/u/2/folders/1zorfVTcC251dd1Fd-RVlLAm2bpyvWkju

## 🌟 Features

- **User Authentication** - Secure JWT-based authentication with refresh tokens
- **Profile Management** - Rich user profiles with skill offerings and requests
- **Real-time Communication** - WebSocket notifications for swap updates
- **Skill Search & Discovery** - Advanced search with filters and pagination
- **Swap Management** - Complete request workflow with ratings system
- **Admin Dashboard** - User and content moderation tools
- **Responsive Design** - Mobile-first design that works on all devices
- **Rating System** - 5-star rating system with comments

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database with trigram search
- **SQLAlchemy** - ORM and database migrations
- **JWT** - Authentication with httpOnly cookies
- **WebSockets** - Real-time notifications
- **bcrypt** - Password hashing

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **SWR** - Data fetching and caching
- **Zustand** - State management
- **React Hook Form** - Form handling with validation

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd skill-swap
```

### 2. Setup the project
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Configure PostgreSQL
```bash
# Create database and user
sudo -u postgres createuser -P skillswap
sudo -u postgres createdb -O skillswap skillswap

# Enable pg_trgm extension
sudo -u postgres psql skillswap -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
```

### 4. Update environment variables
```bash
# Backend configuration
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Frontend configuration
cp frontend/.env.local.example frontend/.env.local
# No changes needed for local development
```

### 5. Start the application

**Terminal 1 - Backend:**
```bash
cd backend
source .venv/bin/activate
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 👥 Default Accounts

The system creates demo accounts on first run:

**Regular Users:**
- Email: `ankita@demo.com` / Password: `password123`
- Email: `roopesh@demo.com` / Password: `password123`

**Admin:**
- Email: `admin@admin.com` / Password: `password123`

## 📁 Project Structure

```
skill-swap/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Auth, security, middleware
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── utils/          # Helper functions
│   ├── alembic/            # Database migrations
│   ├── requirements.txt
│   └── run.py
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/          # Utilities and API
│   │   ├── store/        # State management
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── tailwind.config.js
└── setup.sh              # Setup script
```

## 🔧 Configuration

### Backend Environment Variables
```env
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/skillswap
CORS_ORIGINS=["http://localhost:3000"]
ADMIN_EMAIL_DOMAINS=["admin.com"]
```

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api
```

## 📊 Database Schema

The platform uses a normalized PostgreSQL schema with the following key tables:

- **users** - User profiles and authentication
- **skills** - Available skills catalog
- **skills_offered/wanted** - Many-to-many relationships
- **swap_requests** - Skill exchange requests
- **ratings** - User rating system

## 🔌 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### User Endpoints
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/{id}` - Get public user profile
- `GET /api/users` - Search users

### Skill Endpoints
- `GET /api/skills` - List all skills
- `GET /api/skills/search` - Search skills with pagination
- `POST /api/skills` - Create new skill

### Swap Endpoints
- `POST /api/swaps` - Create swap request
- `GET /api/swaps/my` - Get user's swaps
- `PUT /api/swaps/{id}` - Update swap status
- `DELETE /api/swaps/{id}` - Delete swap request

## 🔄 Real-time Features

The platform uses WebSockets for real-time notifications:

- New swap requests
- Swap status updates
- Rating notifications
- Connection status monitoring

## 🧪 Testing

### Backend Tests
```bash
cd backend
source .venv/bin/activate
pytest --cov=app --fail-under=80
```

### Frontend Linting
```bash
cd frontend
npm run lint
```

## 🚀 Deployment

### Using Docker (Optional)
```bash
docker-compose up -d
```

### Manual Deployment
1. Set up PostgreSQL database
2. Configure environment variables for production
3. Build frontend: `npm run build`
4. Deploy backend with a WSGI server like Gunicorn
5. Serve frontend with a web server like Nginx

## 🔒 Security Features

- JWT authentication with httpOnly cookies
- Password hashing with bcrypt (work factor 12)
- CSRF protection with SameSite cookies
- Rate limiting (5 requests/second per IP)
- Input validation with Pydantic
- XSS protection through React
- SQL injection prevention via ORM

## 📱 Responsive Design

The platform is built mobile-first with responsive breakpoints:
- xs: 375px (mobile)
- sm: 480px (large mobile)
- md: 768px (tablet)
- lg: 1024px (desktop)
- xl: 1280px (large desktop)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project will be licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🏗️ Development Assumptions

1. **Local Development**: Designed for offline laptop development
2. **Database**: PostgreSQL with pg_trgm extension for fuzzy search
3. **Authentication**: JWT with httpOnly cookies for security
4. **Real-time**: WebSocket connections for live updates
5. **File Storage**: Local filesystem for avatar uploads
6. **Email**: No email service integration (can be added)
7. **Payment**: No payment integration (skill exchange is free)
8. **Geolocation**: No location-based matching (can be added)

## 📚 References

The implementation follows modern web development best practices and is inspired by:
- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)
- [Next.js Documentation](https://nextjs.org/docs)
- [Material Design Guidelines](https://material.io/design)
- [OWASP Security Guidelines](https://owasp.org/)