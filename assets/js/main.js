// Buildly Documentation JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Initialize features
  initializeSearch();
  initializeTableOfContents();
  initializeThemeToggle();
  initializeNavigation();
  
  // Load documentation data
  loadDocumentationData();
});

// Search functionality
function initializeSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  if (!searchInput) return;
  
  let searchData = [];
  
  // Load search index
  fetch('/buildly-docs/assets/data/search-index.json')
    .then(response => response.json())
    .then(data => {
      searchData = data;
    })
    .catch(error => console.warn('Search index not found'));
  
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }
    
    const results = searchData.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
    ).slice(0, 5);
    
    displaySearchResults(results);
  });
  
  // Hide search results when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container')) {
      searchResults.style.display = 'none';
    }
  });
}

function displaySearchResults(results) {
  const searchResults = document.getElementById('search-results');
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result">No results found</div>';
  } else {
    searchResults.innerHTML = results.map(result => 
      `<div class="search-result" onclick="window.location.href='${result.url}'">
        <h6>${result.title}</h6>
        <p class="mb-0 text-muted">${result.excerpt}</p>
      </div>`
    ).join('');
  }
  
  searchResults.style.display = 'block';
}

// Table of Contents
function initializeTableOfContents() {
  const toc = document.getElementById('toc');
  if (!toc) return;
  
  const headings = document.querySelectorAll('h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    toc.innerHTML = '<p class="text-muted">No headings found</p>';
    return;
  }
  
  let tocHTML = '<ul>';
  let currentLevel = 2;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substr(1));
    const id = heading.id || `heading-${index}`;
    const text = heading.textContent;
    
    if (!heading.id) {
      heading.id = id;
    }
    
    if (level > currentLevel) {
      tocHTML += '<ul>'.repeat(level - currentLevel);
    } else if (level < currentLevel) {
      tocHTML += '</ul>'.repeat(currentLevel - level);
    }
    
    tocHTML += `<li><a href="#${id}">${text}</a></li>`;
    currentLevel = level;
  });
  
  tocHTML += '</ul>'.repeat(currentLevel - 1);
  toc.innerHTML = tocHTML;
  
  // Smooth scrolling for TOC links
  toc.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Theme toggle
function initializeThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  if (!themeToggle) return;
  
  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  
  themeToggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
  
  function updateThemeIcon(theme) {
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
}

// Navigation
function initializeNavigation() {
  // Highlight active navigation items
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href)) {
      link.classList.add('active');
    }
  });
  
  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('show');
    });
  }
}

// Load documentation data
async function loadDocumentationData() {
  try {
    const response = await fetch('/buildly-docs/buildly-documentation.json');
    const data = await response.json();
    
    // Update last updated timestamp
    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated && data.last_updated) {
      const date = new Date(data.last_updated).toLocaleDateString();
      lastUpdated.textContent = date;
    }
    
    // Update version
    const version = document.getElementById('version');
    if (version && data.version) {
      version.textContent = data.version;
    }
    
    // Load features if on features page
    if (window.location.pathname.includes('/features/')) {
      loadFeaturesGrid(data.features);
    }
    
  } catch (error) {
    console.warn('Could not load documentation data:', error);
  }
}

// Load features grid
function loadFeaturesGrid(features) {
  const featuresGrid = document.getElementById('features-grid');
  if (!featuresGrid || !features) return;
  
  const featureCards = Object.entries(features).map(([key, feature]) => {
    const badges = [];
    
    if (feature.ai_powered) {
      badges.push('<span class="badge bg-success me-1"><i class="fas fa-robot"></i> AI</span>');
    }
    
    if (feature.needs_documentation) {
      badges.push('<span class="badge bg-warning me-1">Needs Docs</span>');
    }
    
    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 feature-card">
          <div class="card-body">
            <h5 class="card-title">${feature.title}</h5>
            <p class="card-text">${feature.description}</p>
            <div class="mb-2">${badges.join('')}</div>
          </div>
          <div class="card-footer">
            <a href="/buildly-docs/features/${key}/" class="btn btn-primary btn-sm">Learn More</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  featuresGrid.innerHTML = featureCards;
}

// Utility functions
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    showToast('Copied to clipboard!');
  });
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  
  document.body.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
  
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 5000);
}