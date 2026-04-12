@echo off
REM StackOverflow Backend Setup Script for Windows

echo.
echo ================================
echo StackOverflow Backend Setup
echo ================================
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo. & echo Environment file created. Please edit .env with your configuration.
    echo.
) else (
    echo Environment file already exists.
)

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker is not installed. Please install Docker Desktop.
    pause
    exit /b 1
)

echo OK - Docker is installed

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Docker Compose is not installed. Please install Docker Desktop.
    pause
    exit /b 1
)

echo OK - Docker Compose is installed
echo.

REM Check if user wants Docker or Local setup
echo Select setup mode:
echo 1 - Docker (recommended)
echo 2 - Local development
set /p choice="Enter choice (1-2): "

if "%choice%"=="1" (
    goto docker_setup
) else if "%choice%"=="2" (
    goto local_setup
) else (
    echo Invalid choice. Exiting.
    pause
    exit /b 1
)

:docker_setup
echo.
echo Starting Docker Compose services...
docker-compose up -d

echo.
echo Waiting for services to start...
timeout /t 10

echo Running migrations...
docker-compose exec -T backend python manage.py migrate

echo Creating superuser...
docker-compose exec backend python manage.py createsuperuser

echo.
echo ================================
echo Setup complete!
echo ================================
echo.
echo Access the API at: http://localhost:8000/api/
echo Health check: http://localhost:8000/api/health/
echo.
echo Services running:
docker-compose ps

pause
exit /b 0

:local_setup
echo.
echo Local development setup...
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3.11 or higher.
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version') do set python_version=%%i
echo OK - Python %python_version% is installed

REM Create virtual environment
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat
echo OK - Virtual environment activated

REM Install dependencies
echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Run migrations
echo Running migrations...
python manage.py migrate

REM Create superuser
echo Creating superuser...
python manage.py createsuperuser

echo.
echo ================================
echo Setup complete!
echo ================================
echo.
echo To start the development server:
echo venv\Scripts\activate.bat
echo python manage.py runserver
echo.
echo In another terminal, start Celery worker:
echo celery -A src.workers.celery worker -l info

pause
