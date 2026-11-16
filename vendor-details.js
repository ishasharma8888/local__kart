// Local Market Online Store - Vendor Details Script
// Individual Vendor Profile & Catalog

document.addEventListener('DOMContentLoaded', () => {
  const heroContainer = document.getElementById('vendor-hero-view');
  const productsContainer = document.getElementById('vendor-products-grid');
  const countHeading = document.getElementById('vendor-products-count-heading');

  if (!heroContainer || typeof MARKET_DATA === 'undefined') return;

  const vendorId = getUrlParam('id') || 'vendor-1';
  const vendor = MARKET_DATA.vendors.find(v => v.id === vendorId) || MARKET_DATA.vendors[0];

  // Set Page Title
  document.title = `${vendor.name} | Local Market Online Store`;

  // Filter vendor's specific products
  const vendorProducts = MARKET_DATA.products.filter(p => p.vendorId === vendor.id);

  // Render Vendor Hero Banner
  heroContainer.innerHTML = `
    <div class="vendor-hero-banner">
      <div class="vendor-hero-grid">
        <div class="vendor-avatar">
          <img src="${vendor.image}" alt="${vendor.name}" onerror="handleImageError(this, '${vendor.name}')">
        </div>
        <div class="vendor-hero-details">
          <span class="badge-tag badge-original" style="display: inline-block; margin-bottom: 8px;">
            ${vendor.badge}
          </span>
          <h1>${vendor.name}</h1>
          <p class="vendor-hero-tagline">${vendor.tagline}</p>
          <div class="vendor-stats-pill-group">
            <span class="vendor-stats-pill">🏷️ ${vendor.category}</span>
            <span class="vendor-stats-pill">⭐ ${vendor.rating} (${vendor.reviewCount} reviews)</span>
            <span class="vendor-stats-pill">👤 Owner: ${vendor.owner}</span>
            <span class="vendor-stats-pill">⏳ Est. ${vendor.since}</span>
            <span class="vendor-stats-pill">📦 ${vendorProducts.length} Active Items</span>
          </div>
          <p style="margin-top: var(--space-md); font-size: 0.95rem; color: #d8f3dc; max-width: 650px;">
            ${vendor.description}
          </p>
        </div>
        <div class="vendor-contact-card-sidebar">
          <h4 style="font-weight: 700; color: var(--color-primary-dark); border-bottom: 1px solid var(--color-border); padding-bottom: 4px;">
            Store Information
          </h4>
          <div>📞 <strong>Phone:</strong> ${vendor.phone}</div>
          <div>✉️ <strong>Email:</strong> ${vendor.email}</div>
          <div>🕒 <strong>Hours:</strong> ${vendor.openingHours}</div>
          <div>📍 <strong>Address:</strong> ${vendor.address}</div>
        </div>
      </div>
    </div>
  `;

  // Update Section Heading
  if (countHeading) {
    countHeading.textContent = `All Products from ${vendor.name} (${vendorProducts.length} Items)`;
  }

  // Render Products Grid
  if (productsContainer) {
    if (vendorProducts.length === 0) {
      productsContainer.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📦</div>
          <h3 class="empty-state-title">No products listed yet</h3>
          <p class="empty-state-desc">This vendor is currently restocking inventory. Check back shortly!</p>
          <a href="products.html" class="btn btn-primary">Browse All Products</a>
        </div>
      `;
      return;
    }

    productsContainer.innerHTML = vendorProducts.map(item => `
      <div class="product-card">
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
          <span class="vendor-category-pill" style="margin-bottom: 6px;">${item.category}</span>
          <h3 class="product-title">
            <a href="product-details.html?id=${item.id}">${item.name}</a>
          </h3>
          <p class="product-desc">${item.description}</p>
          <div class="product-rating">
            <span class="rating-stars">★★★★☆</span>
            <span>${item.rating} (${item.reviews})</span>
          </div>
          <div class="product-footer">
            <div class="product-price-box">
              <span class="product-price">${formatPrice(item.price)}</span>
              <span class="product-unit">per ${item.unit}</span>
            </div>
            <div class="product-card-actions">
              <a href="product-details.html?id=${item.id}" class="btn btn-secondary btn-sm">
                Details
              </a>
              <button class="btn btn-primary btn-sm" data-action="add-to-cart" data-product-id="${item.id}">
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
});
