#!/bin/bash

echo "🚀 Setting up Skill Swap Platform..."

echo "📦 Installing dependencies..."

echo "Backend dependencies..."
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..

echo "Frontend dependencies..."
cd frontend
npm install
cd ..

echo "🔧 Setting up environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from example"
fi

if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.local.example frontend/.env.local
    echo "✅ Created frontend/.env.local from example"
fi

echo "🗄️ Setting up database..."

echo "Please ensure PostgreSQL is running and create a database named 'skillswap'"
echo "Example commands:"
echo "  sudo -u postgres createuser -P skillswap"
echo "  sudo -u postgres createdb -O skillswap skillswap"

echo "⚙️ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "  Backend: cd backend && python run.py"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "📝 Don't forget to:"
echo "  1. Update database credentials in backend/.env"
echo "  2. Ensure PostgreSQL is running"
echo "  3. Install pg_trgm extension in PostgreSQL"
echo ""
echo "💡 Default admin account will be created with:"
echo "  Email: admin@admin.com"
echo "  Password: password123"