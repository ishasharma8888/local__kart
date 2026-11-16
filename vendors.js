// Local Market Online Store - Vendors Directory Script
// 20 Local Vendors Directory Engine

document.addEventListener('DOMContentLoaded', () => {
  const vendorsContainer = document.getElementById('vendors-grid');
  const searchInput = document.getElementById('vendor-search');
  const categorySelect = document.getElementById('vendor-category-filter');
  const countDisplay = document.getElementById('vendor-count-display');

  if (!vendorsContainer || typeof MARKET_DATA === 'undefined') return;

  // 1. Populate Category Filter from categories
  if (categorySelect) {
    categorySelect.innerHTML = '<option value="">All Categories</option>';
    MARKET_DATA.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.icon} ${cat.name}`;
      categorySelect.appendChild(opt);
    });
  }

  // 2. Render Vendors List
  function renderVendors() {
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedCategory = categorySelect ? categorySelect.value : '';

    const filtered = MARKET_DATA.vendors.filter(v => {
      const matchSearch = !searchTerm ||
        v.name.toLowerCase().includes(searchTerm) ||
        v.category.toLowerCase().includes(searchTerm) ||
        v.description.toLowerCase().includes(searchTerm) ||
        v.owner.toLowerCase().includes(searchTerm);

      const matchCategory = !selectedCategory || v.categoryId === selectedCategory;

      return matchSearch && matchCategory;
    });

    if (countDisplay) {
      countDisplay.textContent = `Showing ${filtered.length} of ${MARKET_DATA.vendors.length} Verified Local Vendors`;
    }

    if (filtered.length === 0) {
      vendorsContainer.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🏪</div>
          <h3 class="empty-state-title">No vendors match your search</h3>
          <p class="empty-state-desc">Try clearing the search query or selecting a different category.</p>
        </div>
      `;
      return;
    }

    vendorsContainer.innerHTML = filtered.map(v => {
      // Count products belonging to this vendor
      const productCount = MARKET_DATA.products.filter(p => p.vendorId === v.id).length;

      return `
        <div class="vendor-card" data-id="${v.id}">
          <div class="vendor-image-banner">
            <img class="vendor-banner-img" src="${v.image}" alt="${v.name}" loading="lazy" onerror="handleImageError(this, '${v.name}')">
            <span class="vendor-badge">${v.badge}</span>
          </div>
          <div class="vendor-body">
            <span class="vendor-category-pill">${v.category}</span>
            <h3 class="vendor-name">
              <a href="vendor-details.html?id=${v.id}">${v.name}</a>
            </h3>
            <p class="vendor-tagline">${v.tagline}</p>
            <p class="vendor-desc">${v.description}</p>
            
            <div class="vendor-meta-list">
              <div class="vendor-meta-item">
                <span>⭐</span>
                <strong>${v.rating}</strong> (${v.reviewCount} customer reviews)
              </div>
              <div class="vendor-meta-item">
                <span>📦</span>
                <span><strong>${productCount}</strong> products catalogued</span>
              </div>
              <div class="vendor-meta-item">
                <span>📍</span>
                <span>${v.address}</span>
              </div>
            </div>

            <div class="vendor-footer">
              <a href="vendor-details.html?id=${v.id}" class="btn btn-primary btn-sm">
                View Shop
              </a>
              <a href="products.html?vendor=${v.id}" class="btn btn-secondary btn-sm">
                View Products (${productCount})
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Event Listeners
  if (searchInput) searchInput.addEventListener('input', renderVendors);
  if (categorySelect) categorySelect.addEventListener('change', renderVendors);

  // Initial Render
  renderVendors();
});
