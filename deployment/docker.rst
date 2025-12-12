.. _docker-deployment:

Docker and Containerization
============================

Comprehensive guide to containerizing and deploying Buildly applications with Docker.

.. contents:: Table of Contents
   :local:
   :depth: 2

Overview
--------

Docker enables consistent deployment across environments by packaging applications with their dependencies into containers. Buildly provides Docker configurations for both frontend and backend services.

Prerequisites
-------------

**Required Tools:**

- Docker 20.10+
- Docker Compose 2.0+
- Git

**Installation:**

.. code-block:: bash

   # macOS (using Homebrew)
   brew install --cask docker
   
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
   
   # Verify installation
   docker --version
   docker compose version

Quick Start
-----------

Buildly Core Docker Setup
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Clone Buildly Core
   git clone https://github.com/buildlyio/buildly-core.git
   cd buildly-core
   
   # Copy environment file
   cp .env.example .env
   
   # Edit environment variables
   nano .env
   
   # Build and start containers
   docker compose up --build
   
   # Access the application
   # API: http://localhost:8000
   # Admin: http://localhost:8000/admin

Dockerfile Structure
--------------------

Backend Dockerfile
~~~~~~~~~~~~~~~~~~

.. code-block:: dockerfile

   # Dockerfile for Buildly Core (Python/Django)
   
   # Base image with Python
   FROM python:3.11-slim as base
   
   # Set environment variables
   ENV PYTHONUNBUFFERED=1 \
       PYTHONDONTWRITEBYTECODE=1 \
       PIP_NO_CACHE_DIR=1 \
       PIP_DISABLE_PIP_VERSION_CHECK=1
   
   # Set working directory
   WORKDIR /app
   
   # Install system dependencies
   RUN apt-get update && apt-get install -y \
       build-essential \
       libpq-dev \
       git \
       && rm -rf /var/lib/apt/lists/*
   
   # Install Python dependencies
   COPY requirements.txt .
   RUN pip install --upgrade pip && \
       pip install -r requirements.txt
   
   # Copy application code
   COPY . .
   
   # Create non-root user
   RUN useradd -m -u 1000 buildly && \
       chown -R buildly:buildly /app
   
   USER buildly
   
   # Collect static files
   RUN python manage.py collectstatic --noinput
   
   # Expose port
   EXPOSE 8000
   
   # Run application
   CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "buildly.wsgi:application"]

Frontend Dockerfile
~~~~~~~~~~~~~~~~~~~

.. code-block:: dockerfile

   # Dockerfile for React frontend
   
   # Build stage
   FROM node:18-alpine as build
   
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   
   # Install dependencies
   RUN npm ci --production=false
   
   # Copy source code
   COPY . .
   
   # Build application
   RUN npm run build
   
   # Production stage
   FROM nginx:alpine
   
   # Copy built files
   COPY --from=build /app/build /usr/share/nginx/html
   
   # Copy nginx configuration
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   
   EXPOSE 80
   
   CMD ["nginx", "-g", "daemon off;"]

Multi-Stage Builds
~~~~~~~~~~~~~~~~~~

.. code-block:: dockerfile

   # Optimized multi-stage build
   
   # Stage 1: Builder
   FROM python:3.11-slim as builder
   
   WORKDIR /app
   
   # Install build dependencies
   RUN apt-get update && apt-get install -y build-essential libpq-dev
   
   # Install Python packages
   COPY requirements.txt .
   RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt
   
   # Stage 2: Runtime
   FROM python:3.11-slim
   
   WORKDIR /app
   
   # Install runtime dependencies only
   RUN apt-get update && apt-get install -y libpq5 && rm -rf /var/lib/apt/lists/*
   
   # Copy wheels from builder
   COPY --from=builder /app/wheels /wheels
   RUN pip install --no-cache /wheels/*
   
   # Copy application
   COPY . .
   
   EXPOSE 8000
   CMD ["gunicorn", "--bind", "0.0.0.0:8000", "buildly.wsgi:application"]

Docker Compose
--------------

Basic Configuration
~~~~~~~~~~~~~~~~~~~

.. code-block:: yaml

   # docker-compose.yml
   version: '3.8'
   
   services:
     db:
       image: postgres:15-alpine
       environment:
         POSTGRES_DB: buildly
         POSTGRES_USER: buildly_user
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data
       ports:
         - "5432:5432"
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U buildly_user"]
         interval: 10s
         timeout: 5s
         retries: 5
     
     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"
       volumes:
         - redis_data:/data
       healthcheck:
         test: ["CMD", "redis-cli", "ping"]
         interval: 10s
         timeout: 5s
         retries: 5
     
     backend:
       build:
         context: .
         dockerfile: Dockerfile
       command: gunicorn --bind 0.0.0.0:8000 --workers 4 buildly.wsgi:application
       volumes:
         - ./:/app
         - static_volume:/app/staticfiles
         - media_volume:/app/media
       ports:
         - "8000:8000"
       env_file:
         - .env
       depends_on:
         db:
           condition: service_healthy
         redis:
           condition: service_healthy
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
         interval: 30s
         timeout: 10s
         retries: 3
     
     frontend:
       build:
         context: ./frontend
         dockerfile: Dockerfile
       ports:
         - "3000:80"
       depends_on:
         - backend
       environment:
         - REACT_APP_API_URL=http://backend:8000
     
     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
         - static_volume:/static:ro
         - media_volume:/media:ro
         - ./nginx/ssl:/etc/nginx/ssl:ro
       depends_on:
         - backend
         - frontend
   
   volumes:
     postgres_data:
     redis_data:
     static_volume:
     media_volume:

Development Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: yaml

   # docker-compose.dev.yml
   version: '3.8'
   
   services:
     backend:
       build:
         context: .
         target: base
       command: python manage.py runserver 0.0.0.0:8000
       volumes:
         - ./:/app  # Mount source code for hot reload
       environment:
         - DEBUG=True
         - DJANGO_SETTINGS_MODULE=buildly.settings.development
       ports:
         - "8000:8000"
     
     frontend:
       build:
         context: ./frontend
         target: development
       command: npm start
       volumes:
         - ./frontend:/app
         - /app/node_modules  # Anonymous volume for node_modules
       ports:
         - "3000:3000"
       environment:
         - CHOKIDAR_USEPOLLING=true  # For file watching in Docker

Production Configuration
~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: yaml

   # docker-compose.prod.yml
   version: '3.8'
   
   services:
     backend:
       image: registry.buildly.io/buildly-core:latest
       restart: unless-stopped
       deploy:
         replicas: 3
         resources:
           limits:
             cpus: '0.5'
             memory: 512M
           reservations:
             cpus: '0.25'
             memory: 256M
       environment:
         - DEBUG=False
         - ALLOWED_HOSTS=api.yourdomain.com
       logging:
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"

Environment Variables
---------------------

.env File Structure
~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # .env
   
   # Django Settings
   DEBUG=False
   SECRET_KEY=your-secret-key-here
   ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
   
   # Database
   DB_ENGINE=postgresql
   DB_NAME=buildly
   DB_USER=buildly_user
   DB_PASSWORD=secure_password
   DB_HOST=db
   DB_PORT=5432
   
   # Redis
   REDIS_HOST=redis
   REDIS_PORT=6379
   
   # OAuth
   OAUTH_CLIENT_ID=your-client-id
   OAUTH_CLIENT_SECRET=your-client-secret
   
   # Email
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-password
   
   # AWS (if using S3)
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_STORAGE_BUCKET_NAME=your-bucket
   
   # Celery
   CELERY_BROKER_URL=redis://redis:6379/0
   CELERY_RESULT_BACKEND=redis://redis:6379/0

Networking
----------

Custom Networks
~~~~~~~~~~~~~~~

.. code-block:: yaml

   version: '3.8'
   
   services:
     backend:
       networks:
         - frontend-network
         - backend-network
     
     db:
       networks:
         - backend-network
     
     frontend:
       networks:
         - frontend-network
   
   networks:
     frontend-network:
       driver: bridge
     backend-network:
       driver: bridge
       internal: true  # No external access

Volumes
-------

Named Volumes
~~~~~~~~~~~~~

.. code-block:: yaml

   version: '3.8'
   
   services:
     db:
       volumes:
         - postgres_data:/var/lib/postgresql/data
     
     backend:
       volumes:
         - static_files:/app/staticfiles
         - media_files:/app/media
   
   volumes:
     postgres_data:
       driver: local
     static_files:
       driver: local
     media_files:
       driver: local

Bind Mounts
~~~~~~~~~~~

.. code-block:: yaml

   services:
     backend:
       volumes:
         # Bind mount for development
         - ./:/app
         # Named volume for node_modules
         - /app/node_modules

Deployment Commands
-------------------

Basic Commands
~~~~~~~~~~~~~~

.. code-block:: bash

   # Build images
   docker compose build
   
   # Start services
   docker compose up -d
   
   # Stop services
   docker compose down
   
   # View logs
   docker compose logs -f backend
   
   # Execute command in container
   docker compose exec backend python manage.py migrate
   
   # Scale services
   docker compose up -d --scale backend=3
   
   # Restart service
   docker compose restart backend
   
   # Remove volumes
   docker compose down -v

Database Operations
~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Run migrations
   docker compose exec backend python manage.py migrate
   
   # Create superuser
   docker compose exec backend python manage.py createsuperuser
   
   # Backup database
   docker compose exec db pg_dump -U buildly_user buildly > backup.sql
   
   # Restore database
   docker compose exec -T db psql -U buildly_user buildly < backup.sql
   
   # Access database shell
   docker compose exec db psql -U buildly_user -d buildly

Nginx Configuration
-------------------

Basic Setup
~~~~~~~~~~~

.. code-block:: nginx

   # nginx/nginx.conf
   
   upstream backend {
       server backend:8000;
   }
   
   upstream frontend {
       server frontend:80;
   }
   
   server {
       listen 80;
       server_name yourdomain.com;
       
       client_max_body_size 100M;
       
       # Frontend
       location / {
           proxy_pass http://frontend;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       # API
       location /api/ {
           proxy_pass http://backend;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       # Static files
       location /static/ {
           alias /static/;
           expires 30d;
           add_header Cache-Control "public, immutable";
       }
       
       # Media files
       location /media/ {
           alias /media/;
           expires 7d;
       }
   }

SSL Configuration
~~~~~~~~~~~~~~~~~

.. code-block:: nginx

   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /etc/nginx/ssl/cert.pem;
       ssl_certificate_key /etc/nginx/ssl/key.pem;
       
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       ssl_prefer_server_ciphers on;
       
       # ... rest of configuration
   }
   
   # Redirect HTTP to HTTPS
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }

Health Checks
-------------

Application Health Check
~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # health/views.py
   from django.http import JsonResponse
   from django.db import connection
   from django.core.cache import cache
   
   def health_check(request):
       """Health check endpoint"""
       health_status = {
           'status': 'healthy',
           'checks': {}
       }
       
       # Database check
       try:
           connection.ensure_connection()
           health_status['checks']['database'] = 'ok'
       except Exception as e:
           health_status['status'] = 'unhealthy'
           health_status['checks']['database'] = f'error: {str(e)}'
       
       # Cache check
       try:
           cache.set('health_check', 'ok', 10)
           if cache.get('health_check') == 'ok':
               health_status['checks']['cache'] = 'ok'
           else:
               health_status['checks']['cache'] = 'error'
       except Exception as e:
           health_status['status'] = 'unhealthy'
           health_status['checks']['cache'] = f'error: {str(e)}'
       
       status_code = 200 if health_status['status'] == 'healthy' else 503
       return JsonResponse(health_status, status=status_code)

Monitoring
----------

Logging Configuration
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: yaml

   version: '3.8'
   
   services:
     backend:
       logging:
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"
           labels: "service=backend"

**View Logs:**

.. code-block:: bash

   # View logs
   docker compose logs -f backend
   
   # Follow logs from all services
   docker compose logs -f
   
   # Logs from specific time
   docker compose logs --since 30m backend

Performance Optimization
------------------------

Image Optimization
~~~~~~~~~~~~~~~~~~

.. code-block:: dockerfile

   # Use specific versions
   FROM python:3.11-slim-bullseye
   
   # Minimize layers
   RUN apt-get update && apt-get install -y \
       package1 \
       package2 \
       && rm -rf /var/lib/apt/lists/*
   
   # Use .dockerignore
   # .dockerignore
   .git
   .gitignore
   *.md
   __pycache__
   *.pyc
   .pytest_cache
   .coverage
   htmlcov

Caching Strategies
~~~~~~~~~~~~~~~~~~

.. code-block:: dockerfile

   # Leverage layer caching
   # Copy requirements first (changes less frequently)
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   
   # Copy source code last (changes frequently)
   COPY . .

Best Practices
--------------

✅ **DO:**

- Use multi-stage builds
- Run containers as non-root user
- Use specific image versions (not `latest`)
- Implement health checks
- Use environment variables for configuration
- Keep images small and secure
- Use .dockerignore file
- Implement proper logging

❌ **DON'T:**

- Store secrets in images
- Run as root user
- Use mutable tags in production
- Install unnecessary packages
- Forget to clean up package caches
- Copy unnecessary files
- Run multiple processes in one container

Coming Soon
-----------

.. note::
   **Advanced Topics Coming Soon:**
   
   - Kubernetes deployment
   - CI/CD integration
   - Container registry setup
   - Advanced monitoring with Prometheus
   - Log aggregation with ELK stack

Next Steps
----------

**Further Reading:**

- :doc:`/backend/api-development` - Building containerized APIs
- :doc:`/frontend/index` - Frontend containerization
- Docker Documentation

**Video Resources:**

- `Buildly YouTube Channel <https://www.youtube.com/@buildlyio>`_ - Docker deployment tutorials and container orchestration
- `OpenBuild YouTube Channel <https://www.youtube.com/@openbuild7609>`_ - Production deployment strategies

.. note::
   For production deployments, consider using Kubernetes or Docker Swarm for orchestration and scaling.
