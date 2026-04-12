#!/bin/bash

# StackOverflow Backend Setup Script

echo "================================"
echo "StackOverflow Backend Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env created. Please edit it with your configuration."
    echo ""
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✓ Docker is installed"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "✗ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✓ Docker Compose is installed"
echo ""

# Ask for setup mode
echo "Select setup mode:"
echo "1. Docker (recommended)"
echo "2. Local development"
read -p "Enter choice (1-2): " choice

case $choice in
    1)
        echo ""
        echo "Starting Docker Compose services..."
        docker-compose up -d
        
        echo ""
        echo "Waiting for services to start..."
        sleep 10
        
        echo "Running migrations..."
        docker-compose exec -T backend python manage.py migrate
        
        echo "Creating superuser..."
        docker-compose exec backend python manage.py createsuperuser
        
        echo ""
        echo "================================"
        echo "✓ Setup complete!"
        echo "================================"
        echo ""
        echo "Access the API at: http://localhost:8000/api/"
        echo "Health check: http://localhost:8000/api/health/"
        echo ""
        echo "Services running:"
        docker-compose ps
        ;;
    
    2)
        echo ""
        echo "Local development setup..."
        
        # Check Python
        if ! command -v python3 &> /dev/null; then
            echo "✗ Python 3 is not installed. Please install Python 3.11 or higher."
            exit 1
        fi
        
        python_version=$(python3 --version | awk '{print $2}')
        echo "✓ Python $python_version is installed"
        
        # Create virtual environment
        if [ ! -d "venv" ]; then
            echo "Creating virtual environment..."
            python3 -m venv venv
        fi
        
        # Activate virtual environment
        source venv/bin/activate
        echo "✓ Virtual environment activated"
        
        # Install dependencies
        echo "Installing Python dependencies..."
        pip install --upgrade pip
        pip install -r requirements.txt
        
        # Run migrations
        echo "Running migrations..."
        python manage.py migrate
        
        # Create superuser
        echo "Creating superuser..."
        python manage.py createsuperuser
        
        echo ""
        echo "================================"
        echo "✓ Setup complete!"
        echo "================================"
        echo ""
        echo "To start the development server:"
        echo "source venv/bin/activate"
        echo "python manage.py runserver"
        echo ""
        echo "In another terminal, start Celery worker:"
        echo "celery -A src.workers.celery worker -l info"
        ;;
    
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "Next steps:"
echo "1. Review the README.md for detailed documentation"
echo "2. Check .env configuration"
echo "3. Start using the API"
