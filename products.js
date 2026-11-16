// Local Market Online Store - Products Catalog Script
// Multi-filter & Sort Engine

document.addEventListener('DOMContentLoaded', () => {
  const productsContainer = document.getElementById('products-grid');
  const countDisplay = document.getElementById('catalog-count');
  const searchInput = document.getElementById('filter-search');
  const categorySelect = document.getElementById('filter-category');
  const vendorSelect = document.getElementById('filter-vendor');
  const sortSelect = document.getElementById('filter-sort');
  const minPriceInput = document.getElementById('filter-min-price');
  const maxPriceInput = document.getElementById('filter-max-price');
  const resetBtn = document.getElementById('filter-reset-btn');
  const activeTagsContainer = document.getElementById('active-filters-tags');

  if (!productsContainer || typeof MARKET_DATA === 'undefined') return;

  // 1. Populate Category Select
  if (categorySelect) {
    categorySelect.innerHTML = '<option value="">All Categories</option>';
    MARKET_DATA.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.icon} ${cat.name}`;
      categorySelect.appendChild(opt);
    });
  }

  // 2. Populate Vendor Select
  if (vendorSelect) {
    vendorSelect.innerHTML = '<option value="">All 20 Local Vendors</option>';
    MARKET_DATA.vendors.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.name;
      vendorSelect.appendChild(opt);
    });
  }

  // 3. Pre-fill filters from URL parameters if present
  const urlCategory = getUrlParam('category');
  const urlVendor = getUrlParam('vendor');
  const urlSearch = getUrlParam('search');

  if (urlCategory && categorySelect) {
    categorySelect.value = urlCategory;
  }
  if (urlVendor && vendorSelect) {
    vendorSelect.value = urlVendor;
  }
  if (urlSearch && searchInput) {
    searchInput.value = decodeURIComponent(urlSearch);
  }

  // 4. Core Render Function
  function renderProducts() {
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedCategory = categorySelect ? categorySelect.value : '';
    const selectedVendor = vendorSelect ? vendorSelect.value : '';
    const sortBy = sortSelect ? sortSelect.value : 'default';
    const minPrice = minPriceInput && minPriceInput.value ? parseFloat(minPriceInput.value) : 0;
    const maxPrice = maxPriceInput && maxPriceInput.value ? parseFloat(maxPriceInput.value) : Infinity;

    // Filter Logic
    let filtered = MARKET_DATA.products.filter(item => {
      // Search match
      const matchSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm) || 
        item.description.toLowerCase().includes(searchTerm) ||
        item.vendorName.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm);

      // Category match
      const matchCategory = !selectedCategory || item.categoryId === selectedCategory;

      // Vendor match
      const matchVendor = !selectedVendor || item.vendorId === selectedVendor;

      // Price match
      const matchPrice = item.price >= minPrice && item.price <= maxPrice;

      return matchSearch && matchCategory && matchVendor && matchPrice;
    });

    // Sorting Logic
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    // Update count display
    if (countDisplay) {
      countDisplay.textContent = `Showing ${filtered.length} of ${MARKET_DATA.products.length} products`;
    }

    // Update Active Filter Tags
    updateActiveFilterTags(searchTerm, selectedCategory, selectedVendor, minPrice, maxPrice);

    // Empty state
    if (filtered.length === 0) {
      productsContainer.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">No products match your criteria</h3>
          <p class="empty-state-desc">Try clearing filters or searching for another grocery, vegetable, or artisan item.</p>
          <button class="btn btn-primary" id="empty-reset-btn">Reset All Filters</button>
        </div>
      `;
      const emptyReset = document.getElementById('empty-reset-btn');
      if (emptyReset) {
        emptyReset.addEventListener('click', resetAllFilters);
      }
      return;
    }

    // Render HTML Cards
    productsContainer.innerHTML = filtered.map(item => `
      <div class="product-card" data-id="${item.id}">
        <div class="product-image-wrap">
          <div class="product-badge-group">
            ${item.isOriginal ? '<span class="badge-tag badge-original">Original Item</span>' : ''}
            ${item.featured ? '<span class="badge-tag badge-featured">Featured</span>' : ''}
          </div>
          <span class="badge-stock">In Stock (${item.stock})</span>
          <a href="product-details.html?id=${item.id}">
            <img class="product-img" src="${item.image}" alt="${item.name}" loading="lazy" onerror="handleImageError(this, '${item.name}')">
          </a>
        </div>
        <div class="product-body">
          <a href="vendor-details.html?id=${item.vendorId}" class="product-vendor-link">
            🏪 ${item.vendorName}
          </a>
          <h3 class="product-title">
            <a href="product-details.html?id=${item.id}">${item.name}</a>
          </h3>
          <p class="product-desc">${item.description}</p>
          <div class="product-rating">
            <span class="rating-stars">★★★★☆</span>
            <span>${item.rating} (${item.reviews} reviews)</span>
          </div>
          <div class="product-footer">
            <div class="product-price-box">
              <span class="product-price">${formatPrice(item.price)}</span>
              <span class="product-unit">per ${item.unit}</span>
            </div>
            <div class="product-card-actions">
              <a href="product-details.html?id=${item.id}" class="btn btn-secondary btn-sm" title="View details">
                Details
              </a>
              <button class="btn btn-primary btn-sm" data-action="add-to-cart" data-product-id="${item.id}" title="Add to cart">
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Update Active Tags
  function updateActiveFilterTags(search, catId, venId, minP, maxP) {
    if (!activeTagsContainer) return;
    const tags = [];

    if (search) {
      tags.push({ label: `Search: "${search}"`, clear: () => { searchInput.value = ''; } });
    }
    if (catId) {
      const cat = MARKET_DATA.categories.find(c => c.id === catId);
      tags.push({ label: `Category: ${cat ? cat.name : catId}`, clear: () => { categorySelect.value = ''; } });
    }
    if (venId) {
      const ven = MARKET_DATA.vendors.find(v => v.id === venId);
      tags.push({ label: `Vendor: ${ven ? ven.name : venId}`, clear: () => { vendorSelect.value = ''; } });
    }
    if (minP > 0 || maxP < Infinity) {
      tags.push({ 
        label: `Price: ₹${minP} - ${maxP === Infinity ? 'Any' : '₹' + maxP}`, 
        clear: () => { minPriceInput.value = ''; maxPriceInput.value = ''; } 
      });
    }

    if (tags.length === 0) {
      activeTagsContainer.innerHTML = '';
      return;
    }

    activeTagsContainer.innerHTML = '<span style="font-weight: 600; color: var(--color-text-muted);">Active Filters:</span> ' +
      tags.map((t, idx) => `
        <span class="filter-tag">
          ${t.label}
          <span class="filter-tag-remove" data-tag-idx="${idx}">&times;</span>
        </span>
      `).join('');

    // Attach click handlers to remove individual tags
    activeTagsContainer.querySelectorAll('.filter-tag-remove').forEach(el => {
      el.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-tag-idx'), 10);
        if (tags[idx]) {
          tags[idx].clear();
          renderProducts();
        }
      });
    });
  }

  // Reset all filters
  function resetAllFilters() {
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = '';
    if (vendorSelect) vendorSelect.value = '';
    if (sortSelect) sortSelect.value = 'default';
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';
    // Clear URL parameters cleanly
    window.history.replaceState({}, document.title, window.location.pathname);
    renderProducts();
  }

  // Event Listeners for Filters
  if (searchInput) searchInput.addEventListener('input', renderProducts);
  if (categorySelect) categorySelect.addEventListener('change', renderProducts);
  if (vendorSelect) vendorSelect.addEventListener('change', renderProducts);
  if (sortSelect) sortSelect.addEventListener('change', renderProducts);
  if (minPriceInput) minPriceInput.addEventListener('input', renderProducts);
  if (maxPriceInput) maxPriceInput.addEventListener('input', renderProducts);
  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);

  // Initial Render
  renderProducts();
});
