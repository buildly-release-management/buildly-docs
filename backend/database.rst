.. _database-design:

Database Design and Migrations
===============================

Comprehensive guide to database design, Django models, and migration management in Buildly.

.. contents:: Table of Contents
   :local:
   :depth: 2

Overview
--------

Buildly Core uses Django's ORM (Object-Relational Mapping) to interact with databases. This guide covers database design principles, model creation, relationships, and migration strategies.

Supported Databases
-------------------

Buildly Core supports multiple database backends:

- **PostgreSQL** (Recommended for production)
- **MySQL/MariaDB**
- **SQLite** (Development only)
- **Oracle** (Enterprise)

**Configuration:**

.. code-block:: python

   # settings.py
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'buildly_db',
           'USER': 'buildly_user',
           'PASSWORD': 'secure_password',
           'HOST': 'localhost',
           'PORT': '5432',
           'CONN_MAX_AGE': 600,
           'OPTIONS': {
               'connect_timeout': 10,
           }
       }
   }

Django Models
-------------

Basic Model Structure
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # myapp/models.py
   from django.db import models
   from django.contrib.auth import get_user_model
   from django.core.validators import MinValueValidator, MaxValueValidator
   
   User = get_user_model()
   
   class BaseModel(models.Model):
       """Abstract base model with common fields"""
       created_at = models.DateTimeField(auto_now_add=True)
       updated_at = models.DateTimeField(auto_now=True)
       
       class Meta:
           abstract = True
   
   class Category(BaseModel):
       """Product category"""
       name = models.CharField(max_length=100, unique=True)
       description = models.TextField(blank=True)
       parent = models.ForeignKey(
           'self',
           on_delete=models.CASCADE,
           null=True,
           blank=True,
           related_name='subcategories'
       )
       
       class Meta:
           verbose_name_plural = 'Categories'
           ordering = ['name']
       
       def __str__(self):
           return self.name

Field Types
~~~~~~~~~~~

.. code-block:: python

   class Product(BaseModel):
       # Character fields
       name = models.CharField(max_length=255)
       slug = models.SlugField(unique=True)
       sku = models.CharField(max_length=50, unique=True)
       
       # Text fields
       description = models.TextField()
       short_description = models.CharField(max_length=500, blank=True)
       
       # Numeric fields
       price = models.DecimalField(max_digits=10, decimal_places=2)
       stock = models.IntegerField(default=0)
       weight = models.FloatField(null=True, blank=True)
       
       # Boolean fields
       is_active = models.BooleanField(default=True)
       is_featured = models.BooleanField(default=False)
       
       # Date/Time fields
       published_at = models.DateTimeField(null=True, blank=True)
       
       # File fields
       image = models.ImageField(upload_to='products/', null=True, blank=True)
       datasheet = models.FileField(upload_to='documents/', null=True, blank=True)
       
       # JSON field (PostgreSQL)
       metadata = models.JSONField(default=dict, blank=True)
       
       # Foreign key
       category = models.ForeignKey(
           Category,
           on_delete=models.SET_NULL,
           null=True,
           related_name='products'
       )
       
       # Validators
       rating = models.IntegerField(
           validators=[MinValueValidator(1), MaxValueValidator(5)],
           null=True,
           blank=True
       )

Relationships
-------------

One-to-Many (ForeignKey)
~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   class Author(BaseModel):
       name = models.CharField(max_length=200)
       email = models.EmailField(unique=True)
       
       def __str__(self):
           return self.name
   
   class Book(BaseModel):
       title = models.CharField(max_length=300)
       author = models.ForeignKey(
           Author,
           on_delete=models.CASCADE,  # Delete books when author is deleted
           related_name='books'  # Access via author.books.all()
       )
       
       def __str__(self):
           return self.title

**ON_DELETE Options:**

.. code-block:: python

   # CASCADE - Delete related objects
   author = models.ForeignKey(Author, on_delete=models.CASCADE)
   
   # SET_NULL - Set to NULL (requires null=True)
   category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
   
   # PROTECT - Prevent deletion if related objects exist
   user = models.ForeignKey(User, on_delete=models.PROTECT)
   
   # SET_DEFAULT - Set to default value (requires default)
   status = models.ForeignKey(Status, on_delete=models.SET_DEFAULT, default=1)
   
   # DO_NOTHING - Do nothing (dangerous, use carefully)
   legacy = models.ForeignKey(Legacy, on_delete=models.DO_NOTHING)

Many-to-Many
~~~~~~~~~~~~

.. code-block:: python

   class Tag(BaseModel):
       name = models.CharField(max_length=50, unique=True)
       
       def __str__(self):
           return self.name
   
   class Article(BaseModel):
       title = models.CharField(max_length=300)
       content = models.TextField()
       tags = models.ManyToManyField(Tag, related_name='articles')
       
       def __str__(self):
           return self.title

**With Through Model:**

.. code-block:: python

   class Student(BaseModel):
       name = models.CharField(max_length=200)
       
   class Course(BaseModel):
       name = models.CharField(max_length=200)
       students = models.ManyToManyField(
           Student,
           through='Enrollment',
           related_name='courses'
       )
   
   class Enrollment(BaseModel):
       student = models.ForeignKey(Student, on_delete=models.CASCADE)
       course = models.ForeignKey(Course, on_delete=models.CASCADE)
       enrolled_date = models.DateField(auto_now_add=True)
       grade = models.CharField(max_length=2, blank=True)
       
       class Meta:
           unique_together = ['student', 'course']

One-to-One
~~~~~~~~~~

.. code-block:: python

   class UserProfile(BaseModel):
       user = models.OneToOneField(
           User,
           on_delete=models.CASCADE,
           related_name='profile'
       )
       bio = models.TextField(blank=True)
       avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
       phone = models.CharField(max_length=20, blank=True)
       
       def __str__(self):
           return f"Profile of {self.user.username}"

Model Methods
-------------

Instance Methods
~~~~~~~~~~~~~~~~

.. code-block:: python

   class Order(BaseModel):
       order_number = models.CharField(max_length=20, unique=True)
       user = models.ForeignKey(User, on_delete=models.CASCADE)
       status = models.CharField(max_length=20, default='pending')
       total_amount = models.DecimalField(max_digits=10, decimal_places=2)
       
       def get_absolute_url(self):
           """Return URL for order detail"""
           return f'/orders/{self.order_number}/'
       
       def calculate_total(self):
           """Calculate order total from items"""
           return sum(item.subtotal for item in self.items.all())
       
       def can_be_cancelled(self):
           """Check if order can be cancelled"""
           return self.status in ['pending', 'processing']
       
       def cancel(self):
           """Cancel the order"""
           if self.can_be_cancelled():
               self.status = 'cancelled'
               self.save()
               return True
           return False

Class Methods and Managers
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   class ProductManager(models.Manager):
       """Custom manager for Product"""
       
       def active(self):
           """Return only active products"""
           return self.filter(is_active=True, stock__gt=0)
       
       def featured(self):
           """Return featured products"""
           return self.active().filter(is_featured=True)
       
       def by_category(self, category_id):
           """Filter by category"""
           return self.active().filter(category_id=category_id)
   
   class Product(BaseModel):
       # ... fields ...
       
       objects = ProductManager()
       
       @classmethod
       def create_with_defaults(cls, name, **kwargs):
           """Create product with default values"""
           defaults = {
               'is_active': True,
               'stock': 0,
           }
           defaults.update(kwargs)
           return cls.objects.create(name=name, **defaults)
       
       def save(self, *args, **kwargs):
           """Override save to add custom logic"""
           if not self.slug:
               from django.utils.text import slugify
               self.slug = slugify(self.name)
           super().save(*args, **kwargs)

Indexes and Optimization
-------------------------

Database Indexes
~~~~~~~~~~~~~~~~

.. code-block:: python

   class Product(BaseModel):
       name = models.CharField(max_length=255, db_index=True)
       sku = models.CharField(max_length=50, unique=True)
       category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
       
       class Meta:
           indexes = [
               models.Index(fields=['name']),
               models.Index(fields=['category', '-created_at']),
               models.Index(fields=['is_active', 'stock']),
           ]
           # Unique together constraint
           unique_together = [['name', 'category']]

Query Optimization
~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # Bad - N+1 queries problem
   products = Product.objects.all()
   for product in products:
       print(product.category.name)  # Additional query for each product
   
   # Good - Use select_related for ForeignKey
   products = Product.objects.select_related('category').all()
   for product in products:
       print(product.category.name)  # No additional queries
   
   # Good - Use prefetch_related for ManyToMany
   articles = Article.objects.prefetch_related('tags').all()
   for article in articles:
       for tag in article.tags.all():  # No additional queries
           print(tag.name)

Migrations
----------

Creating Migrations
~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Create migrations for all app changes
   python manage.py makemigrations
   
   # Create migration for specific app
   python manage.py makemigrations myapp
   
   # Create empty migration (for data migrations)
   python manage.py makemigrations --empty myapp

Applying Migrations
~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Apply all migrations
   python manage.py migrate
   
   # Apply migrations for specific app
   python manage.py migrate myapp
   
   # Apply specific migration
   python manage.py migrate myapp 0003
   
   # Show migration status
   python manage.py showmigrations
   
   # Rollback migration
   python manage.py migrate myapp 0002

Data Migrations
~~~~~~~~~~~~~~~

.. code-block:: python

   # Generated migration file
   # myapp/migrations/0004_populate_defaults.py
   
   from django.db import migrations
   
   def populate_categories(apps, schema_editor):
       """Forward migration - populate data"""
       Category = apps.get_model('myapp', 'Category')
       
       categories = [
           {'name': 'Electronics', 'description': 'Electronic products'},
           {'name': 'Books', 'description': 'Books and publications'},
           {'name': 'Clothing', 'description': 'Apparel and accessories'},
       ]
       
       for cat_data in categories:
           Category.objects.create(**cat_data)
   
   def remove_categories(apps, schema_editor):
       """Reverse migration - remove data"""
       Category = apps.get_model('myapp', 'Category')
       Category.objects.filter(
           name__in=['Electronics', 'Books', 'Clothing']
       ).delete()
   
   class Migration(migrations.Migration):
       dependencies = [
           ('myapp', '0003_auto_20231201_1234'),
       ]
       
       operations = [
           migrations.RunPython(populate_categories, remove_categories),
       ]

Complex Migrations
~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # myapp/migrations/0005_complex_migration.py
   
   from django.db import migrations, models
   
   class Migration(migrations.Migration):
       dependencies = [
           ('myapp', '0004_populate_defaults'),
       ]
       
       operations = [
           # Add field
           migrations.AddField(
               model_name='product',
               name='discount_percentage',
               field=models.IntegerField(default=0),
           ),
           
           # Remove field
           migrations.RemoveField(
               model_name='product',
               name='old_field',
           ),
           
           # Rename field
           migrations.RenameField(
               model_name='product',
               old_name='desc',
               new_name='description',
           ),
           
           # Alter field
           migrations.AlterField(
               model_name='product',
               name='price',
               field=models.DecimalField(max_digits=12, decimal_places=2),
           ),
           
           # Add index
           migrations.AddIndex(
               model_name='product',
               index=models.Index(fields=['name', 'category'], name='prod_name_cat_idx'),
           ),
       ]

Database Queries
----------------

Basic Queries
~~~~~~~~~~~~~

.. code-block:: python

   # Get all objects
   products = Product.objects.all()
   
   # Get filtered objects
   active_products = Product.objects.filter(is_active=True)
   
   # Get single object
   product = Product.objects.get(id=1)
   
   # Get or create
   product, created = Product.objects.get_or_create(
       sku='ABC123',
       defaults={'name': 'New Product', 'price': 99.99}
   )
   
   # Update or create
   product, created = Product.objects.update_or_create(
       sku='ABC123',
       defaults={'price': 89.99}
   )

Complex Queries
~~~~~~~~~~~~~~~

.. code-block:: python

   from django.db.models import Q, F, Count, Sum, Avg, Max, Min
   
   # Q objects for complex queries
   products = Product.objects.filter(
       Q(name__icontains='phone') | Q(description__icontains='phone'),
       Q(price__gte=100) & Q(price__lte=1000)
   )
   
   # F expressions for field comparisons
   discounted = Product.objects.filter(price__lt=F('original_price') * 0.8)
   
   # Aggregations
   stats = Product.objects.aggregate(
       total=Count('id'),
       avg_price=Avg('price'),
       max_price=Max('price'),
       min_price=Min('price'),
       total_stock=Sum('stock')
   )
   
   # Annotate
   categories = Category.objects.annotate(
       product_count=Count('products'),
       avg_price=Avg('products__price')
   ).filter(product_count__gt=0)

Raw SQL
~~~~~~~

.. code-block:: python

   # Raw queries when ORM is not sufficient
   products = Product.objects.raw(
       'SELECT * FROM myapp_product WHERE price > %s',
       [100]
   )
   
   # Execute custom SQL
   from django.db import connection
   
   with connection.cursor() as cursor:
       cursor.execute("UPDATE myapp_product SET stock = stock + %s WHERE id = %s", [10, 1])
       cursor.execute("SELECT name, price FROM myapp_product WHERE price > %s", [100])
       results = cursor.fetchall()

Transactions
------------

Atomic Operations
~~~~~~~~~~~~~~~~~

.. code-block:: python

   from django.db import transaction
   
   # Function decorator
   @transaction.atomic
   def create_order_with_items(user, items_data):
       """Create order and items atomically"""
       order = Order.objects.create(
           user=user,
           order_number=generate_order_number(),
           status='pending'
       )
       
       for item_data in items_data:
           OrderItem.objects.create(
               order=order,
               product_id=item_data['product_id'],
               quantity=item_data['quantity'],
               price=item_data['price']
           )
       
       return order
   
   # Context manager
   def process_payment(order):
       with transaction.atomic():
           # Both operations succeed or both fail
           Payment.objects.create(
               order=order,
               amount=order.total_amount,
               status='completed'
           )
           order.status = 'paid'
           order.save()

Savepoints
~~~~~~~~~~

.. code-block:: python

   from django.db import transaction
   
   with transaction.atomic():
       # Main transaction
       order = Order.objects.create(...)
       
       # Create a savepoint
       sid = transaction.savepoint()
       
       try:
           # Risky operation
           process_payment(order)
           transaction.savepoint_commit(sid)
       except Exception:
           # Rollback to savepoint
           transaction.savepoint_rollback(sid)
           order.status = 'payment_failed'
           order.save()

Database Constraints
--------------------

Field Constraints
~~~~~~~~~~~~~~~~~

.. code-block:: python

   class Product(BaseModel):
       name = models.CharField(max_length=255, unique=True)
       sku = models.CharField(max_length=50, unique=True)
       price = models.DecimalField(
           max_digits=10,
           decimal_places=2,
           validators=[MinValueValidator(0)]
       )
       stock = models.IntegerField(
           default=0,
           validators=[MinValueValidator(0)]
       )
       
       class Meta:
           constraints = [
               # Check constraint
               models.CheckConstraint(
                   check=models.Q(price__gte=0),
                   name='price_non_negative'
               ),
               models.CheckConstraint(
                   check=models.Q(stock__gte=0),
                   name='stock_non_negative'
               ),
               # Unique constraint
               models.UniqueConstraint(
                   fields=['name', 'category'],
                   name='unique_product_per_category'
               ),
           ]

Best Practices
--------------

✅ **DO:**

- Use PostgreSQL for production
- Create indexes for frequently queried fields
- Use `select_related` and `prefetch_related`
- Write data migrations for complex changes
- Use transactions for related operations
- Add appropriate constraints
- Keep models focused and cohesive
- Use abstract base models for common fields

❌ **DON'T:**

- Use SQLite in production
- Create unnecessary indexes (they slow writes)
- Perform queries in loops (N+1 problem)
- Edit migration files after applying them
- Use raw SQL unless necessary
- Store sensitive data without encryption
- Create overly complex models
- Ignore database constraints

Coming Soon
-----------

.. note::
   **Advanced Topics Coming Soon:**
   
   - Multi-database routing
   - Database sharding strategies
   - Advanced query optimization
   - Database replication setup
   - Backup and restore procedures

Next Steps
----------

**Further Reading:**

- :doc:`/backend/api-development` - Building APIs with these models
- :doc:`/deployment/docker` - Database deployment
- Django ORM Documentation

**Video Resources:**

- `Buildly YouTube Channel <https://www.youtube.com/@buildlyio>`_ - Database design and Django ORM tutorials
- `OpenBuild YouTube Channel <https://www.youtube.com/@openbuild7609>`_ - Database optimization and best practices

.. note::
   For production deployments, always use PostgreSQL with proper indexing and optimization strategies.
