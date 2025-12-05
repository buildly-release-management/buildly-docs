.. _forge-marketplace:

Buildly Forge Marketplace
==========================

🔨 **Buildly Forge** is a revolutionary marketplace for open source applications that bridges the gap between traditional shareware and fully open source software. Located at `collab.buildly.io/forge <https://collab.buildly.io/forge>`_, the Forge empowers developers to monetize their work while ensuring long-term community ownership.

What is Buildly Forge?
----------------------

Buildly Forge is a unique marketplace where developers can publish and sell open source applications with **time-limited commercial licenses** that automatically convert to full open source after 2 years. This innovative model creates a sustainable ecosystem that benefits both creators and the community.

**Key Characteristics:**

- 🏪 **Marketplace for Open Source Apps** - Discover, purchase, and deploy ready-to-use applications
- 📜 **Pseudo-Commercial Licensing** - Initial commercial license with guaranteed open source conversion
- ⏰ **2-Year Conversion Timeline** - All apps become fully open source after 24 months
- 💰 **Fair Compensation** - Support developers who create quality open source tools
- 🌍 **Community-Driven** - Build a sustainable open source ecosystem together

How the Licensing Works
------------------------

Time-Limited Commercial License
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When you purchase an application on Buildly Forge, you receive a **lifetime commercial license** that includes:

✅ **Full Usage Rights**
  - Deploy and use the application indefinitely
  - Unlimited installations and users
  - Access to updates and patches during the commercial period
  - Commercial use without restrictions

✅ **Source Code Access**
  - Immediate access to complete source code
  - Ability to modify for internal use
  - Bug fixes and feature customization
  - Integration with your existing systems

✅ **Support & Updates**
  - Regular security updates and patches
  - Bug fixes and performance improvements
  - Documentation and implementation guides
  - Community forum access

🔒 **Commercial Period Restrictions** (0-24 months)
  - Source code cannot be publicly redistributed
  - Modified versions cannot be sold or shared publicly
  - Must maintain attribution to original creators
  - Cannot create competing commercial offerings

Automatic Open Source Conversion
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

After 2 years, the application **automatically transitions** to full open source:

🎉 **Full Open Source Rights**
  - Released under a standard open source license (typically MIT or Apache 2.0)
  - Complete freedom to modify, fork, and redistribute
  - Can be used as foundation for new projects
  - Contribute improvements back to the community
  - No ongoing fees or restrictions

📈 **Your Lifetime License Continues**
  - All benefits of your original purchase remain
  - Priority support may continue (depending on developer offering)
  - Access to premium features or service tiers
  - Special pricing on future products from the developer

**Example Timeline:**

.. code-block:: text

   Month 0:  Purchase "Amazing App v1.0" - Commercial license active
   Month 6:  Receive updates to v1.5 - Still under commercial license
   Month 12: Upgrade to v2.0 - Commercial license continues
   Month 18: Minor updates to v2.3 - Nearing open source transition
   Month 24: 🎊 Automatic conversion to open source!
             - All versions become MIT/Apache licensed
             - Your lifetime license benefits continue
             - Community can now fork and contribute

Why Pay for Open Source?
-------------------------

Supporting Quality Development
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Sustainable Open Source**
  Open source doesn't mean free to create. Developers invest significant time, expertise, and resources into building quality applications. Your purchase:
  
  - 💼 **Funds Development** - Enables developers to work full-time on open source projects
  - 🔬 **Ensures Quality** - Professional development standards and thorough testing
  - 🛡️ **Guarantees Support** - Dedicated teams for bug fixes and security updates
  - 🚀 **Drives Innovation** - Resources to build advanced features and capabilities
  - 📚 **Creates Documentation** - Comprehensive guides, tutorials, and examples

**Better Than Traditional Models**
  
  ❌ Traditional Closed Source:
    - No access to source code
    - Vendor lock-in forever
    - Uncertain future if company fails
    - No community contributions
    - Opaque security and privacy
  
  ❌ Free Open Source:
    - Often abandoned or unmaintained
    - No guaranteed support
    - Slower development cycles
    - Limited professional documentation
    - Sustainability challenges
  
  ✅ Buildly Forge Model:
    - Source code access from day one
    - Professional support during commercial period
    - Guaranteed open source conversion
    - Active development and maintenance
    - Best of both worlds!

Community Benefits
~~~~~~~~~~~~~~~~~~

**Growing the Commons**
  Every purchase on Buildly Forge contributes to the future open source ecosystem:
  
  🌱 **Building the Future**
    - Your payment today becomes free software tomorrow
    - Creates a pipeline of well-maintained open source tools
    - Reduces reliance on corporate-controlled software
    - Builds digital commons for future generations
  
  🤝 **Strengthening Community**
    - Sustainable funding model for open source developers
    - Encourages professional-quality open source development
    - Creates incentive for thorough documentation
    - Attracts talented developers to open source work
  
  💪 **Long-Term Value**
    - Applications remain useful after conversion
    - Community can maintain and extend after 2 years
    - No risk of project abandonment
    - Guaranteed ROI through eventual open source release

Business Value
~~~~~~~~~~~~~~

**Enterprise Benefits**
  
  📊 **Predictable Costs**
    - One-time payment vs. ongoing subscriptions
    - Lifetime access eliminates recurring fees
    - Budget-friendly for long-term planning
    - No surprise price increases
  
  🔐 **Security & Control**
    - Full source code access for security audits
    - Can fix critical bugs internally if needed
    - No dependency on vendor for security patches
    - Customize for compliance requirements
  
  ⚡ **Future-Proof Investment**
    - Will become open source - ultimate exit strategy
    - No vendor lock-in risk
    - Community support after conversion
    - Protects long-term business continuity

Deployment Options
------------------

Buildly Forge applications offer flexible deployment to match your needs and technical capabilities:

🚀 Multiple Deployment Options
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Deploy as standalone Docker container, GitHub Pages site, Kubernetes app, or with Buildly Core integration.

🐳 Docker Deployment
^^^^^^^^^^^^^^^^^^^^

**Easiest way to get started** - Run applications in isolated containers.

**Best For:**
  - Quick development and testing
  - Single-server deployments
  - Small to medium applications
  - Teams familiar with Docker

**Deployment Process:**

.. code-block:: bash

   # Download from Forge
   docker pull forge.buildly.io/username/amazing-app:latest
   
   # Run with configuration
   docker run -d \
     -p 8080:80 \
     -e DATABASE_URL=postgresql://... \
     -v /data:/app/data \
     forge.buildly.io/username/amazing-app:latest
   
   # Access at http://localhost:8080

**Included Support:**
  - Pre-configured Docker images
  - Environment variable documentation
  - Volume mount examples
  - Docker Compose files for complex setups

📄 GitHub Pages
^^^^^^^^^^^^^^^

**Perfect for static sites and JAMstack apps** - Deploy directly to GitHub Pages.

**Best For:**
  - Documentation sites
  - Marketing pages
  - Static web applications
  - Content-focused projects

**Deployment Process:**

.. code-block:: bash

   # Clone from Forge
   git clone https://forge.buildly.io/username/amazing-app.git
   cd amazing-app
   
   # Configure and deploy
   npm install
   npm run build
   
   # Push to GitHub Pages
   git subtree push --prefix dist origin gh-pages

**Included Support:**
  - GitHub Actions workflows
  - Build configuration
  - Custom domain setup guides
  - CDN optimization

☸️ Kubernetes
^^^^^^^^^^^^^

**Enterprise-grade orchestration** - Deploy scalable, resilient applications.

**Best For:**
  - Production workloads
  - High-availability requirements
  - Microservices architectures
  - Large-scale deployments

**Deployment Process:**

.. code-block:: bash

   # Download Kubernetes manifests
   kubectl apply -f https://forge.buildly.io/username/amazing-app/k8s/
   
   # Or use Helm chart
   helm repo add buildly-forge https://forge.buildly.io/charts
   helm install amazing-app buildly-forge/amazing-app \
     --set database.host=postgres.example.com \
     --set replicas=3

**Included Support:**
  - Kubernetes manifests (Deployments, Services, Ingress)
  - Helm charts for easy installation
  - Auto-scaling configurations
  - Health checks and monitoring setup

⚡ Buildly Core Integration
^^^^^^^^^^^^^^^^^^^^^^^^^^^

**Seamless integration** - Deploy as part of the Buildly ecosystem.

**Best For:**
  - Multi-service architectures
  - Complex workflow requirements
  - API orchestration
  - Unified authentication and permissions

**Deployment Process:**

.. code-block:: bash

   # Add to Buildly Core instance
   buildly-cli add-service amazing-app
   
   # Configure through Buildly UI or API
   buildly-cli configure amazing-app \
     --enable-sso \
     --connect-to-core

**Included Support:**
  - Buildly Core connector modules
  - OAuth/SSO integration
  - Unified data layer access
  - Workflow engine integration

Free vs. Paid Deployment Support
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**🆓 Free - DIY Deployment**

Included with every purchase:
  - Complete documentation and guides
  - Docker images and deployment configs
  - Community forum support
  - Example configurations and tutorials
  - GitHub issues for bugs and questions

**Best for teams with:**
  - DevOps experience
  - Time to troubleshoot
  - Standard deployment requirements
  - Internal infrastructure expertise

**💰 Paid - Professional Deployment Assistance**

Optional paid services for hassle-free deployment:

**Starter Support** ($199-$499 one-time)
  - Video call walkthrough of deployment
  - Review your infrastructure requirements
  - Configuration assistance
  - Basic troubleshooting support
  - Email support for 30 days

**Managed Deployment** ($999-$2,499 one-time)
  - Complete deployment setup
  - Infrastructure configuration
  - Performance optimization
  - Security hardening
  - 90 days of priority support

**Enterprise Deployment** (Custom pricing)
  - Multi-region deployment
  - High-availability setup
  - Custom integrations
  - Dedicated support team
  - SLA guarantees
  - Ongoing maintenance options

**Best for teams that:**
  - Need deployment urgency
  - Lack internal DevOps resources
  - Have complex requirements
  - Want guaranteed success
  - Prefer to focus on their core business

Build Local and Deploy Yourself
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Complete Freedom**

All Forge applications include everything you need to build and deploy independently:

✅ **Source Code**
  - Complete, commented source code
  - Build scripts and tooling
  - Development environment setup
  - Testing suites

✅ **Documentation**
  - Architecture overview
  - Development setup guide
  - Deployment instructions
  - Configuration reference

✅ **Infrastructure as Code**
  - Terraform modules
  - Ansible playbooks
  - Docker Compose files
  - CI/CD pipeline examples

✅ **No Vendor Lock-In**
  - Deploy anywhere (AWS, Azure, GCP, on-premise)
  - Modify to fit your infrastructure
  - Integrate with existing systems
  - Full control over hosting environment

Community Support Model
-----------------------

How the Community Supports Forge
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Active Marketplace Community**

🗣️ **Community Forums**
  - Dedicated discussion boards for each application
  - Share configurations and deployment strategies
  - Help troubleshoot common issues
  - Request features and improvements

👥 **User Groups**
  - Regular meetups and webinars
  - Share best practices and use cases
  - Collaborate on integrations
  - Network with other users

📖 **Community Documentation**
  - User-contributed guides and tutorials
  - Real-world deployment examples
  - Integration patterns and recipes
  - Troubleshooting wikis

💻 **Code Contributions**
  - Report bugs and issues
  - Submit feature requests
  - Contribute pull requests (after open source conversion)
  - Help maintain and improve applications

Developer Support for Customers
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**During Commercial Period (0-24 months)**

🎯 **Professional Support**
  - Bug fixes and security patches
  - Regular updates and improvements
  - Email support (response times vary by developer)
  - Documentation updates

📊 **Development Roadmap**
  - Public feature roadmap
  - Customer input on priorities
  - Transparent development process
  - Regular release schedule

🔧 **Custom Development**
  - Optional paid custom features
  - Integration assistance
  - Performance optimization
  - Training and consulting

**After Open Source Conversion (24+ months)**

🌍 **Community Maintenance**
  - Original developer may continue maintaining
  - Community can fork and maintain independently
  - Commercial support may still be available
  - Ecosystem of service providers may emerge

💪 **Long-Term Sustainability**
  - Healthy ecosystem of contributors
  - Multiple support options
  - Reduced dependency on single vendor
  - Continuous community improvement

Finding Applications on Buildly Forge
--------------------------------------

**Browse by Category**

🏗️ **Development Tools**
  - API gateways and management
  - Code generation tools
  - Testing frameworks
  - CI/CD components

📊 **Business Applications**
  - CRM and customer management
  - Project management tools
  - Analytics dashboards
  - Reporting systems

🔐 **Security & Authentication**
  - OAuth providers
  - Identity management
  - API security tools
  - Audit and compliance

🎨 **Frontend Components**
  - UI component libraries
  - Admin dashboards
  - Design systems
  - Mobile app templates

🔌 **Integrations & Connectors**
  - Third-party API connectors
  - Data sync tools
  - Webhook processors
  - ETL pipelines

**Search and Filter**
  - By programming language
  - By deployment type
  - By license type
  - By price range
  - By popularity or ratings

Getting Started with Buildly Forge
-----------------------------------

**Step 1: Explore the Marketplace**
  Visit `collab.buildly.io/forge <https://collab.buildly.io/forge>`_ and browse available applications.

**Step 2: Review Application Details**
  - Read descriptions and features
  - Check deployment requirements
  - Review pricing and licensing
  - Read user reviews and ratings

**Step 3: Purchase or Try**
  - Many apps offer free trials or demos
  - Purchase with credit card or enterprise billing
  - Instant access to downloads and documentation

**Step 4: Choose Deployment Option**
  - Evaluate your technical capabilities
  - Select deployment method (Docker, K8s, etc.)
  - Decide if you want deployment assistance

**Step 5: Deploy and Use**
  - Follow deployment guides
  - Configure for your environment
  - Get support from community or developer
  - Start building value

**Step 6: Stay Engaged**
  - Join community discussions
  - Provide feedback to developers
  - Share your use cases
  - Contribute back when apps become open source

Benefits Summary
----------------

**For Purchasers:**
  ✅ Professional-quality applications with support
  ✅ Source code access from day one
  ✅ Guaranteed open source conversion
  ✅ Lifetime license with no recurring fees
  ✅ Multiple deployment options
  ✅ Optional professional deployment help
  ✅ Active community support

**For Developers:**
  ✅ Sustainable revenue for open source work
  ✅ Professional platform for distribution
  ✅ Built-in customer base
  ✅ Automatic marketing and discovery
  ✅ Fair compensation model
  ✅ Contributes to open source commons

**For the Community:**
  ✅ Pipeline of well-maintained open source tools
  ✅ Professional development standards
  ✅ Comprehensive documentation
  ✅ Sustainable open source ecosystem
  ✅ Growing digital commons
  ✅ Reduced corporate software dependency

.. note::
   Buildly Forge represents a new model for sustainable open source development. By purchasing applications, you're not just getting a tool—you're investing in the future of open source software.

----

**Ready to explore Buildly Forge?**

Visit `collab.buildly.io/forge <https://collab.buildly.io/forge>`_ to discover amazing open source applications! 🚀
