.. _api-development:

API Development with Django REST Framework
===========================================

Comprehensive guide to building RESTful APIs with Buildly Core and Django REST Framework.

.. contents:: Table of Contents
   :local:
   :depth: 2

Overview
--------

Buildly Core uses Django REST Framework (DRF) to provide powerful, flexible API development capabilities. This guide covers API design, implementation, authentication, and best practices.

Getting Started
---------------

Prerequisites
~~~~~~~~~~~~~

- Python 3.9+
- Django 4.0+
- Django REST Framework 3.14+
- Buildly Core installed

Quick Start
~~~~~~~~~~~

.. code-block:: bash

   # Clone Buildly Core
   git clone https://github.com/buildlyio/buildly-core.git
   cd buildly-core
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Run migrations
   python manage.py migrate
   
   # Create superuser
   python manage.py createsuperuser
   
   # Run development server
   python manage.py runserver

API Architecture
----------------

RESTful Principles
~~~~~~~~~~~~~~~~~~

Buildly APIs follow REST principles:

- **Resources:** Nouns representing entities (users, products, orders)
- **HTTP Methods:** Standard verbs (GET, POST, PUT, PATCH, DELETE)
- **Status Codes:** Meaningful HTTP status codes
- **Stateless:** Each request contains all necessary information

**URL Structure:**

.. code-block:: text

   /api/v1/resource/           # List and create
   /api/v1/resource/{id}/      # Retrieve, update, delete
   /api/v1/resource/{id}/action/  # Custom actions

Creating Models
---------------

Django Models
~~~~~~~~~~~~~

.. code-block:: python

   # myapp/models.py
   from django.db import models
   from django.contrib.auth import get_user_model
   
   User = get_user_model()
   
   class Product(models.Model):
       """Product model with comprehensive fields"""
       
       name = models.CharField(max_length=255)
       description = models.TextField(blank=True)
       price = models.DecimalField(max_digits=10, decimal_places=2)
       stock = models.IntegerField(default=0)
       is_active = models.BooleanField(default=True)
       created_by = models.ForeignKey(
           User, 
           on_delete=models.CASCADE,
           related_name='products'
       )
       created_at = models.DateTimeField(auto_now_add=True)
       updated_at = models.DateTimeField(auto_now=True)
       
       class Meta:
           ordering = ['-created_at']
           verbose_name_plural = 'Products'
           indexes = [
               models.Index(fields=['name']),
               models.Index(fields=['-created_at']),
           ]
       
       def __str__(self):
           return self.name
       
       @property
       def is_in_stock(self):
           return self.stock > 0

Serializers
-----------

Basic Serializers
~~~~~~~~~~~~~~~~~

.. code-block:: python

   # myapp/serializers.py
   from rest_framework import serializers
   from .models import Product
   
   class ProductSerializer(serializers.ModelSerializer):
       """Product serializer with validation"""
       
       created_by_name = serializers.CharField(
           source='created_by.username',
           read_only=True
       )
       is_in_stock = serializers.BooleanField(read_only=True)
       
       class Meta:
           model = Product
           fields = [
               'id',
               'name',
               'description',
               'price',
               'stock',
               'is_active',
               'created_by',
               'created_by_name',
               'is_in_stock',
               'created_at',
               'updated_at',
           ]
           read_only_fields = ['id', 'created_at', 'updated_at']
       
       def validate_price(self, value):
           """Validate price is positive"""
           if value <= 0:
               raise serializers.ValidationError("Price must be positive")
           return value
       
       def validate_stock(self, value):
           """Validate stock is non-negative"""
           if value < 0:
               raise serializers.ValidationError("Stock cannot be negative")
           return value

Nested Serializers
~~~~~~~~~~~~~~~~~~

.. code-block:: python

   class OrderItemSerializer(serializers.ModelSerializer):
       product = ProductSerializer(read_only=True)
       product_id = serializers.IntegerField(write_only=True)
       
       class Meta:
           model = OrderItem
           fields = ['id', 'product', 'product_id', 'quantity', 'price']
   
   class OrderSerializer(serializers.ModelSerializer):
       items = OrderItemSerializer(many=True, read_only=True)
       total_amount = serializers.DecimalField(
           max_digits=10,
           decimal_places=2,
           read_only=True
       )
       
       class Meta:
           model = Order
           fields = ['id', 'order_number', 'items', 'total_amount', 'status']

ViewSets
--------

ModelViewSet
~~~~~~~~~~~~

.. code-block:: python

   # myapp/views.py
   from rest_framework import viewsets, filters, status
   from rest_framework.decorators import action
   from rest_framework.response import Response
   from rest_framework.permissions import IsAuthenticated
   from django_filters.rest_framework import DjangoFilterBackend
   
   from .models import Product
   from .serializers import ProductSerializer
   from .permissions import IsOwnerOrReadOnly
   
   class ProductViewSet(viewsets.ModelViewSet):
       """
       API endpoint for products
       
       list: List all products
       create: Create a new product
       retrieve: Get product details
       update: Update a product
       partial_update: Partially update a product
       destroy: Delete a product
       """
       queryset = Product.objects.all()
       serializer_class = ProductSerializer
       permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
       filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
       filterset_fields = ['is_active', 'created_by']
       search_fields = ['name', 'description']
       ordering_fields = ['name', 'price', 'created_at']
       ordering = ['-created_at']
       
       def get_queryset(self):
           """Filter queryset based on user permissions"""
           queryset = super().get_queryset()
           if not self.request.user.is_staff:
               # Non-staff users only see their own products
               queryset = queryset.filter(created_by=self.request.user)
           return queryset
       
       def perform_create(self, serializer):
           """Set created_by to current user"""
           serializer.save(created_by=self.request.user)
       
       @action(detail=True, methods=['post'])
       def add_stock(self, request, pk=None):
           """Custom action to add stock"""
           product = self.get_object()
           amount = request.data.get('amount', 0)
           
           try:
               amount = int(amount)
               if amount <= 0:
                   return Response(
                       {'error': 'Amount must be positive'},
                       status=status.HTTP_400_BAD_REQUEST
                   )
               
               product.stock += amount
               product.save()
               
               serializer = self.get_serializer(product)
               return Response(serializer.data)
           except ValueError:
               return Response(
                   {'error': 'Invalid amount'},
                   status=status.HTTP_400_BAD_REQUEST
               )
       
       @action(detail=False, methods=['get'])
       def low_stock(self, request):
           """List products with low stock"""
           threshold = int(request.query_params.get('threshold', 10))
           products = self.get_queryset().filter(stock__lt=threshold)
           
           page = self.paginate_queryset(products)
           if page is not None:
               serializer = self.get_serializer(page, many=True)
               return self.get_paginated_response(serializer.data)
           
           serializer = self.get_serializer(products, many=True)
           return Response(serializer.data)

Custom Views
~~~~~~~~~~~~

.. code-block:: python

   from rest_framework.views import APIView
   from rest_framework.response import Response
   from rest_framework import status
   
   class ProductStatsView(APIView):
       """Get product statistics"""
       permission_classes = [IsAuthenticated]
       
       def get(self, request):
           products = Product.objects.filter(created_by=request.user)
           
           stats = {
               'total_products': products.count(),
               'active_products': products.filter(is_active=True).count(),
               'out_of_stock': products.filter(stock=0).count(),
               'total_value': sum(
                   p.price * p.stock for p in products
               ),
           }
           
           return Response(stats)

URL Configuration
-----------------

Router Configuration
~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # myapp/urls.py
   from django.urls import path, include
   from rest_framework.routers import DefaultRouter
   from .views import ProductViewSet, ProductStatsView
   
   router = DefaultRouter()
   router.register(r'products', ProductViewSet, basename='product')
   
   urlpatterns = [
       path('', include(router.urls)),
       path('products/stats/', ProductStatsView.as_view(), name='product-stats'),
   ]
   
   # Main urls.py
   from django.urls import path, include
   
   urlpatterns = [
       path('api/v1/', include('myapp.urls')),
   ]

Authentication
--------------

OAuth 2.0
~~~~~~~~~

Buildly Core uses OAuth 2.0 for authentication:

.. code-block:: python

   # settings.py
   INSTALLED_APPS = [
       # ...
       'oauth2_provider',
       'rest_framework',
   ]
   
   REST_FRAMEWORK = {
       'DEFAULT_AUTHENTICATION_CLASSES': [
           'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
           'rest_framework.authentication.SessionAuthentication',
       ],
       'DEFAULT_PERMISSION_CLASSES': [
           'rest_framework.permissions.IsAuthenticated',
       ],
   }

**Token Endpoint:**

.. code-block:: bash

   # Get access token
   curl -X POST http://localhost:8000/oauth/token/ \
     -d "grant_type=password" \
     -d "username=user@example.com" \
     -d "password=password123" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET"

Custom Permissions
~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # myapp/permissions.py
   from rest_framework import permissions
   
   class IsOwnerOrReadOnly(permissions.BasePermission):
       """
       Custom permission to only allow owners to edit
       """
       def has_object_permission(self, request, view, obj):
           # Read permissions for any request
           if request.method in permissions.SAFE_METHODS:
               return True
           
           # Write permissions only for owner
           return obj.created_by == request.user
   
   class IsAdminOrReadOnly(permissions.BasePermission):
       """
       Admin can do anything, others read-only
       """
       def has_permission(self, request, view):
           if request.method in permissions.SAFE_METHODS:
               return True
           return request.user and request.user.is_staff

Filtering and Searching
------------------------

Django Filter
~~~~~~~~~~~~~

.. code-block:: python

   # Install django-filter
   # pip install django-filter
   
   # myapp/filters.py
   import django_filters
   from .models import Product
   
   class ProductFilter(django_filters.FilterSet):
       min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
       max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
       name = django_filters.CharFilter(lookup_expr='icontains')
       
       class Meta:
           model = Product
           fields = ['is_active', 'created_by', 'min_price', 'max_price', 'name']
   
   # In viewset
   class ProductViewSet(viewsets.ModelViewSet):
       filterset_class = ProductFilter

**Usage:**

.. code-block:: bash

   # Filter by price range
   GET /api/v1/products/?min_price=10&max_price=100
   
   # Search by name
   GET /api/v1/products/?name=phone
   
   # Multiple filters
   GET /api/v1/products/?is_active=true&min_price=50

Pagination
----------

Configuration
~~~~~~~~~~~~~

.. code-block:: python

   # settings.py
   REST_FRAMEWORK = {
       'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
       'PAGE_SIZE': 20,
   }

Custom Pagination
~~~~~~~~~~~~~~~~~

.. code-block:: python

   from rest_framework.pagination import PageNumberPagination
   
   class StandardResultsSetPagination(PageNumberPagination):
       page_size = 20
       page_size_query_param = 'page_size'
       max_page_size = 100
   
   class ProductViewSet(viewsets.ModelViewSet):
       pagination_class = StandardResultsSetPagination

API Versioning
--------------

URL Path Versioning
~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # settings.py
   REST_FRAMEWORK = {
       'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.URLPathVersioning',
       'DEFAULT_VERSION': 'v1',
       'ALLOWED_VERSIONS': ['v1', 'v2'],
   }
   
   # urls.py
   urlpatterns = [
       path('api/v1/', include('myapp.urls_v1')),
       path('api/v2/', include('myapp.urls_v2')),
   ]

Header Versioning
~~~~~~~~~~~~~~~~~

.. code-block:: python

   REST_FRAMEWORK = {
       'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.AcceptHeaderVersioning',
   }

.. code-block:: bash

   # Request with version header
   curl -H "Accept: application/json; version=v2" \
     http://localhost:8000/api/products/

Error Handling
--------------

Custom Exception Handler
~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # myapp/exceptions.py
   from rest_framework.views import exception_handler
   from rest_framework.response import Response
   
   def custom_exception_handler(exc, context):
       response = exception_handler(exc, context)
       
       if response is not None:
           custom_response = {
               'error': {
                   'status_code': response.status_code,
                   'message': response.data.get('detail', 'An error occurred'),
                   'errors': response.data if isinstance(response.data, dict) else None
               }
           }
           response.data = custom_response
       
       return response
   
   # settings.py
   REST_FRAMEWORK = {
       'EXCEPTION_HANDLER': 'myapp.exceptions.custom_exception_handler'
   }

Validation Errors
~~~~~~~~~~~~~~~~~

.. code-block:: python

   from rest_framework import serializers
   from rest_framework.exceptions import ValidationError
   
   class ProductSerializer(serializers.ModelSerializer):
       def validate(self, data):
           """Cross-field validation"""
           if data.get('stock') == 0 and data.get('is_active'):
               raise ValidationError(
                   "Cannot activate product with zero stock"
               )
           return data

Testing APIs
------------

Unit Tests
~~~~~~~~~~

.. code-block:: python

   # myapp/tests.py
   from django.test import TestCase
   from django.contrib.auth import get_user_model
   from rest_framework.test import APIClient
   from rest_framework import status
   from .models import Product
   
   User = get_user_model()
   
   class ProductAPITest(TestCase):
       def setUp(self):
           self.client = APIClient()
           self.user = User.objects.create_user(
               username='testuser',
               email='test@example.com',
               password='testpass123'
           )
           self.client.force_authenticate(user=self.user)
           
           self.product = Product.objects.create(
               name='Test Product',
               price=99.99,
               stock=10,
               created_by=self.user
           )
       
       def test_list_products(self):
           response = self.client.get('/api/v1/products/')
           self.assertEqual(response.status_code, status.HTTP_200_OK)
           self.assertEqual(len(response.data['results']), 1)
       
       def test_create_product(self):
           data = {
               'name': 'New Product',
               'price': 149.99,
               'stock': 5
           }
           response = self.client.post('/api/v1/products/', data)
           self.assertEqual(response.status_code, status.HTTP_201_CREATED)
           self.assertEqual(Product.objects.count(), 2)
       
       def test_update_product(self):
           data = {'price': 89.99}
           response = self.client.patch(
               f'/api/v1/products/{self.product.id}/',
               data
           )
           self.assertEqual(response.status_code, status.HTTP_200_OK)
           self.product.refresh_from_database()
           self.assertEqual(self.product.price, 89.99)
       
       def test_delete_product(self):
           response = self.client.delete(
               f'/api/v1/products/{self.product.id}/'
           )
           self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
           self.assertEqual(Product.objects.count(), 0)

API Documentation
-----------------

OpenAPI/Swagger
~~~~~~~~~~~~~~~

.. code-block:: bash

   # Install drf-yasg
   pip install drf-yasg
   
   # Or install drf-spectacular
   pip install drf-spectacular

**Configuration:**

.. code-block:: python

   # settings.py
   INSTALLED_APPS = [
       # ...
       'drf_yasg',
   ]
   
   # urls.py
   from rest_framework import permissions
   from drf_yasg.views import get_schema_view
   from drf_yasg import openapi
   
   schema_view = get_schema_view(
       openapi.Info(
           title="Buildly API",
           default_version='v1',
           description="API documentation for Buildly",
           contact=openapi.Contact(email="contact@buildly.io"),
       ),
       public=True,
       permission_classes=(permissions.AllowAny,),
   )
   
   urlpatterns = [
       path('swagger/', schema_view.with_ui('swagger', cache_timeout=0)),
       path('redoc/', schema_view.with_ui('redoc', cache_timeout=0)),
   ]

Best Practices
--------------

✅ **DO:**

- Use proper HTTP status codes
- Implement pagination for list endpoints
- Add filtering and search capabilities
- Version your APIs
- Write comprehensive tests
- Document your APIs
- Implement rate limiting
- Use serializers for validation
- Handle errors gracefully

❌ **DON'T:**

- Expose sensitive data in responses
- Use GET requests for state-changing operations
- Return huge payloads without pagination
- Ignore authentication and permissions
- Skip input validation
- Use deprecated packages
- Hardcode configuration values

Next Steps
----------

**Further Reading:**

- :doc:`/backend/database` - Database design and migrations
- :doc:`/deployment/docker` - Deploying your APIs
- Django REST Framework Documentation

**External Resources:**

- `Buildly Core Repository <https://github.com/buildlyio/buildly-core>`_
- `Django REST Framework <https://www.django-rest-framework.org/>`_
- `OAuth 2.0 <https://oauth.net/2/>`_

.. note::
   This guide covers the essentials. Check Buildly Core's GitHub repository for advanced patterns and examples.
