#!/bin/bash

# MedRetain CRM - Backend Startup Script
# Initializes environment and starts the FastAPI backend

set -e

echo "================================"
echo "MedRetain CRM - Backend Startup"
echo "================================"

# Change to backend directory
cd "$(dirname "$0")/backend"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

# Display Python version
echo "✅ Python version: $(python3 --version)"

# Create .env file if it doesn't exist
if [ ! -f ../.env ]; then
    echo "📝 Creating .env file..."
    cat > ../.env << 'EOF'
# Database Configuration
DATABASE_URL=sqlite:///./medretain.db

# JWT Configuration
JWT_SECRET_KEY=medretain-crm-super-secret-key-change-in-production-2026
JWT_EXPIRE_MINUTES=480

# Encryption Configuration
ENCRYPTION_KEY=your-encryption-key-here-32-chars-long-for-fernet

# HIMS Configuration
HIMS_DOCTOR247_BASE_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
LOG_LEVEL=INFO

# Twilio (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

# Server
PORT=8000
EOF
    echo "✅ .env file created"
fi

# Install/upgrade dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Initialize database
echo "🗄️  Initializing database..."
python3 -c "from database import init_db; init_db()" || true

# Start the backend
echo "🚀 Starting FastAPI backend on port 8000..."
echo ""
echo "📍 API Documentation: http://localhost:8000/docs"
echo "📍 Default Login: admin / medretain@admin123"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
