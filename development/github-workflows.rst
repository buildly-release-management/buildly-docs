.. _github-workflows:

GitHub Workflows and Best Practices
====================================

Comprehensive guide to GitHub workflows, CI/CD, and collaboration best practices for Buildly projects.

.. contents:: Table of Contents
   :local:
   :depth: 2

Overview
--------

Buildly projects follow standardized GitHub workflows for collaboration, code review, and continuous integration. This guide covers branch strategies, pull requests, and automation.

Getting Started
---------------

Repository Setup
~~~~~~~~~~~~~~~~

**Repository Structure:**

.. code-block:: text

   my-buildly-app/
   ├── .github/
   │   ├── workflows/          # GitHub Actions
   │   ├── ISSUE_TEMPLATE/     # Issue templates
   │   ├── PULL_REQUEST_TEMPLATE.md
   │   └── CODEOWNERS
   ├── src/
   ├── tests/
   ├── docs/
   ├── .gitignore
   ├── README.md
   ├── CONTRIBUTING.md
   └── LICENSE

**Initial Setup:**

.. code-block:: bash

   # Clone repository
   git clone https://github.com/buildlyio/your-repo.git
   cd your-repo
   
   # Set up remote
   git remote -v
   
   # Create development branch
   git checkout -b develop

Branch Strategy
---------------

Git Flow
~~~~~~~~

**Main Branches:**

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development
- `bugfix/*` - Bug fixes
- `hotfix/*` - Emergency fixes
- `release/*` - Release preparation

**Branch Naming:**

.. code-block:: bash

   # Feature branches
   feature/user-authentication
   feature/api-integration
   
   # Bug fix branches
   bugfix/login-error
   bugfix/memory-leak
   
   # Hotfix branches
   hotfix/security-patch
   
   # Release branches
   release/v1.2.0

Workflow Example
~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Start new feature
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature
   
   # Work on feature
   git add .
   git commit -m "Add new feature implementation"
   
   # Keep branch updated
   git checkout develop
   git pull origin develop
   git checkout feature/new-feature
   git rebase develop
   
   # Push feature branch
   git push origin feature/new-feature
   
   # Create pull request on GitHub

Commit Guidelines
-----------------

Conventional Commits
~~~~~~~~~~~~~~~~~~~~

**Format:**

.. code-block:: text

   <type>(<scope>): <subject>
   
   <body>
   
   <footer>

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

.. code-block:: bash

   # Good commits
   git commit -m "feat(auth): implement OAuth2 authentication"
   git commit -m "fix(api): resolve null pointer exception in user endpoint"
   git commit -m "docs(readme): update installation instructions"
   git commit -m "test(api): add unit tests for product service"
   
   # Detailed commit
   git commit -m "feat(api): add product filtering
   
   - Add query parameters for filtering
   - Support multiple filter conditions
   - Update API documentation
   
   Closes #123"

Pull Requests
-------------

Creating Pull Requests
~~~~~~~~~~~~~~~~~~~~~~

**PR Template:**

.. code-block:: markdown

   ## Description
   Brief description of the changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added to complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   
   ## Related Issues
   Closes #123
   Related to #456

Code Review
~~~~~~~~~~~

**Review Checklist:**

✅ **Code Quality:**
- Follows style guide
- No code smells
- Proper error handling
- Efficient algorithms

✅ **Testing:**
- Unit tests included
- Test coverage adequate
- Edge cases covered

✅ **Documentation:**
- Code comments clear
- README updated
- API docs current

✅ **Security:**
- No vulnerabilities
- Input validation
- Secure dependencies

**Review Comments:**

.. code-block:: markdown

   # Constructive feedback
   ✅ "Great implementation! Consider extracting this into a separate function for reusability."
   ✅ "This could cause a race condition. Have you considered using a lock?"
   ✅ "Nice work! Could you add a test case for the error path?"
   
   # Avoid
   ❌ "This is wrong"
   ❌ "I would never write it this way"

GitHub Actions
--------------

CI/CD Pipeline
~~~~~~~~~~~~~~

**Basic Workflow:**

.. code-block:: yaml

   # .github/workflows/ci.yml
   name: CI
   
   on:
     push:
       branches: [ main, develop ]
     pull_request:
       branches: [ main, develop ]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       
       strategy:
         matrix:
           python-version: [3.9, 3.10, 3.11]
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Set up Python ${{ matrix.python-version }}
           uses: actions/setup-python@v4
           with:
             python-version: ${{ matrix.python-version }}
         
         - name: Install dependencies
           run: |
             python -m pip install --upgrade pip
             pip install -r requirements.txt
             pip install -r requirements-dev.txt
         
         - name: Lint with flake8
           run: |
             flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
             flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
         
         - name: Run tests
           run: |
             pytest --cov=. --cov-report=xml
         
         - name: Upload coverage
           uses: codecov/codecov-action@v3
           with:
             file: ./coverage.xml

Frontend Workflow
~~~~~~~~~~~~~~~~~

.. code-block:: yaml

   # .github/workflows/frontend.yml
   name: Frontend CI
   
   on:
     push:
       branches: [ main, develop ]
     pull_request:
       branches: [ main, develop ]
   
   jobs:
     build:
       runs-on: ubuntu-latest
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Lint
           run: npm run lint
         
         - name: Run tests
           run: npm test -- --coverage
         
         - name: Build
           run: npm run build

Docker Build Workflow
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: yaml

   # .github/workflows/docker.yml
   name: Docker Build
   
   on:
     push:
       branches: [ main ]
       tags: [ 'v*' ]
   
   jobs:
     build-and-push:
       runs-on: ubuntu-latest
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Set up Docker Buildx
           uses: docker/setup-buildx-action@v2
         
         - name: Login to Docker Hub
           uses: docker/login-action@v2
           with:
             username: ${{ secrets.DOCKER_USERNAME }}
             password: ${{ secrets.DOCKER_PASSWORD }}
         
         - name: Extract metadata
           id: meta
           uses: docker/metadata-action@v4
           with:
             images: buildlyio/buildly-core
         
         - name: Build and push
           uses: docker/build-push-action@v4
           with:
             context: .
             push: true
             tags: ${{ steps.meta.outputs.tags }}
             labels: ${{ steps.meta.outputs.labels }}
             cache-from: type=gha
             cache-to: type=gha,mode=max

Issue Management
----------------

Issue Templates
~~~~~~~~~~~~~~~

**Bug Report:**

.. code-block:: markdown

   ---
   name: Bug Report
   about: Report a bug
   ---
   
   ## Bug Description
   Clear description of the bug
   
   ## Steps to Reproduce
   1. Step one
   2. Step two
   3. Step three
   
   ## Expected Behavior
   What should happen
   
   ## Actual Behavior
   What actually happens
   
   ## Environment
   - OS: [e.g., macOS 12.0]
   - Python version: [e.g., 3.10]
   - Buildly version: [e.g., 1.2.0]
   
   ## Additional Context
   Any other relevant information

**Feature Request:**

.. code-block:: markdown

   ---
   name: Feature Request
   about: Suggest a new feature
   ---
   
   ## Feature Description
   Clear description of the feature
   
   ## Problem Statement
   What problem does this solve?
   
   ## Proposed Solution
   How should it work?
   
   ## Alternatives Considered
   Other approaches you've thought about
   
   ## Additional Context
   Any other relevant information

Project Management
------------------

GitHub Projects
~~~~~~~~~~~~~~~

**Board Columns:**

- Backlog
- To Do
- In Progress
- In Review
- Done

**Issue Labels:**

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority:high` - High priority
- `priority:medium` - Medium priority
- `priority:low` - Low priority

Security
--------

Secret Management
~~~~~~~~~~~~~~~~~

.. code-block:: yaml

   # Use GitHub Secrets for sensitive data
   
   - name: Deploy
     env:
       API_KEY: ${{ secrets.API_KEY }}
       DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
     run: ./deploy.sh

Dependabot
~~~~~~~~~~

.. code-block:: yaml

   # .github/dependabot.yml
   version: 2
   updates:
     - package-ecosystem: "pip"
       directory: "/"
       schedule:
         interval: "weekly"
     
     - package-ecosystem: "npm"
       directory: "/frontend"
       schedule:
         interval: "weekly"
     
     - package-ecosystem: "github-actions"
       directory: "/"
       schedule:
         interval: "weekly"

Best Practices
--------------

✅ **DO:**

- Write clear commit messages
- Keep PRs small and focused
- Add tests for new features
- Update documentation
- Respond to review comments
- Use branch protection rules
- Run tests before pushing
- Keep branches up to date

❌ **DON'T:**

- Commit directly to main
- Push untested code
- Ignore review feedback
- Mix unrelated changes
- Leave TODOs in production code
- Commit secrets or credentials
- Force push to shared branches

Resources
---------

**Documentation:**

- `GitHub Docs <https://docs.github.com/>`_
- `GitHub Actions <https://github.com/features/actions>`_
- `Buildly Contributing Guide <https://github.com/buildlyio/buildly-core/blob/main/CONTRIBUTING.md>`_

**Tools:**

- GitHub CLI
- GitHub Desktop
- VS Code GitHub extension

.. note::
   For Buildly-specific workflows, always refer to the CONTRIBUTING.md file in each repository.
