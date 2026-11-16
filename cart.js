// Local Market Online Store - Modern Shopping Cart Controller
// High-Conversion UI/UX Dynamic Renderer

document.addEventListener('DOMContentLoaded', () => {
  const tableContainer = document.getElementById('cart-table-wrapper');
  const summaryContainer = document.getElementById('cart-summary-wrapper');
  const emptyStateContainer = document.getElementById('cart-empty-state');
  const cartContentGrid = document.getElementById('cart-content-grid');

  if (!tableContainer) return;

  function renderCart() {
    const items = Cart.getItems();

    if (items.length === 0) {
      if (cartContentGrid) cartContentGrid.style.display = 'none';
      if (emptyStateContainer) emptyStateContainer.style.display = 'block';
      return;
    }

    if (cartContentGrid) cartContentGrid.style.display = 'grid';
    if (emptyStateContainer) emptyStateContainer.style.display = 'none';

    const subtotal = Cart.getSubtotal();
    const shipping = Cart.getShipping(subtotal);
    const discount = Cart.getDiscount(subtotal);
    const grandTotal = Cart.getGrandTotal();
    const activePromo = localStorage.getItem(PROMO_STORAGE_KEY) || '';
    const totalCount = Cart.getCount();

    // Free delivery calculation (Threshold: ₹500)
    const freeDeliveryThreshold = 500;
    const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
    const amountToFree = freeDeliveryThreshold - subtotal;

    // 1. Render Left Column: Cart Items & Delivery Progress Meter
    tableContainer.innerHTML = `
      <div class="cart-items-card">
        
        <!-- Delivery Progress Threshold Meter -->
        <div class="delivery-threshold-box">
          <div class="delivery-threshold-header">
            <span class="delivery-icon">🚚</span>
            <div class="delivery-text-wrap">
              ${amountToFree > 0 ? `
                <p class="delivery-msg">Add <strong>${formatPrice(amountToFree)}</strong> more to unlock <strong>FREE Delivery!</strong></p>
              ` : `
                <p class="delivery-msg success">🎉 <strong>Congratulations!</strong> You qualify for <strong>FREE Local Delivery</strong>.</p>
              `}
            </div>
          </div>
          <div class="delivery-progress-track">
            <div class="delivery-progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>

        <!-- Cart Table Header Bar -->
        <div class="cart-card-header">
          <h2 class="cart-card-title">
            Shopping Cart Items
            <span class="items-count-pill">${totalCount} ${totalCount === 1 ? 'item' : 'items'}</span>
          </h2>
          <button type="button" class="btn-clear-cart" id="cart-clear-all-btn" title="Empty all items in cart">
            <span>🗑️</span> Clear Cart
          </button>
        </div>

        <!-- Table View for Desktop -->
        <div class="cart-table-responsive">
          <table class="modern-cart-table">
            <thead>
              <tr>
                <th class="th-product">Product Details</th>
                <th class="th-price">Price</th>
                <th class="th-qty">Quantity</th>
                <th class="th-subtotal">Subtotal</th>
                <th class="th-action">Remove</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr data-id="${item.id}" class="cart-item-row">
                  <td class="td-product">
                    <div class="cart-product-item">
                      <a href="product.html?id=${item.id}" class="cart-thumb-link">
                        <img 
                          class="cart-thumb-img" 
                          src="${item.image}" 
                          alt="${item.name}"
                          onerror="handleImageError(this, '${item.name}')"
                        >
                      </a>
                      <div class="cart-item-meta">
                        <span class="cart-vendor-pill">🏪 ${item.vendorName}</span>
                        <h3 class="cart-item-title">
                          <a href="product.html?id=${item.id}">${item.name}</a>
                        </h3>
                        <span class="cart-unit-label">Unit: ${item.unit}</span>
                      </div>
                    </div>
                  </td>
                  <td class="td-price">
                    <span class="cart-unit-price">${formatPrice(item.price)}</span>
                  </td>
                  <td class="td-qty">
                    <div class="stepper-wrap">
                      <button type="button" class="stepper-btn cart-qty-minus" data-id="${item.id}" aria-label="Decrease quantity">&minus;</button>
                      <input type="number" class="stepper-input cart-qty-val" data-id="${item.id}" value="${item.quantity}" min="1" max="99" aria-label="Item quantity">
                      <button type="button" class="stepper-btn cart-qty-plus" data-id="${item.id}" aria-label="Increase quantity">&#43;</button>
                    </div>
                  </td>
                  <td class="td-subtotal">
                    <span class="cart-line-subtotal">${formatPrice(item.price * item.quantity)}</span>
                  </td>
                  <td class="td-action">
                    <button type="button" class="cart-delete-btn cart-remove-btn" data-id="${item.id}" title="Remove this item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Cart Card Footer -->
        <div class="cart-card-bottom">
          <a href="products.html" class="btn-continue-shopping">
            &larr; Continue Shopping
          </a>
          <div class="cart-reassurance-chip">
            🌿 100% Direct Local Vendor Pay &bull; Zero Middleman Fees
          </div>
        </div>

      </div>
    `;

    // 2. Render Right Column: Sticky Order Summary Card
    summaryContainer.innerHTML = `
      <div class="order-summary-card">
        
        <div class="summary-header">
          <h3 class="summary-card-title">Order Summary</h3>
          <span class="security-badge">🔒 Secure Checkout</span>
        </div>

        <div class="summary-calculation-rows">
          <div class="summary-calc-row">
            <span class="calc-label">Items Subtotal (${totalCount} units):</span>
            <span class="calc-value">${formatPrice(subtotal)}</span>
          </div>

          <div class="summary-calc-row">
            <span class="calc-label">Neighborhood Delivery:</span>
            <span class="calc-value ${shipping === 0 ? 'text-success-free' : ''}">
              ${shipping === 0 ? 'FREE' : formatPrice(shipping)}
            </span>
          </div>

          ${discount > 0 ? `
            <div class="summary-calc-row discount-row">
              <span class="calc-label">Promo Discount (10% OFF):</span>
              <span class="calc-value text-discount">-${formatPrice(discount)}</span>
            </div>
          ` : ''}
        </div>

        <!-- Promo Code Input Group -->
        <div class="promo-box-wrapper">
          <label for="promo-code-input" class="promo-box-label">Have a Promo Coupon?</label>
          <div class="promo-input-group">
            <input 
              type="text" 
              class="promo-text-field" 
              id="promo-code-input" 
              placeholder="e.g. LOCAL10" 
              value="${activePromo}"
              aria-label="Promo code coupon"
            >
            <button type="button" class="btn-apply-promo" id="apply-promo-btn">
              Apply
            </button>
          </div>
          
          ${activePromo ? `
            <div class="promo-applied-badge">
              <span>✓ Coupon <strong>${activePromo}</strong> applied (-10%)</span>
              <button type="button" id="remove-promo-btn" class="btn-remove-promo" title="Remove promo">&times;</button>
            </div>
          ` : `
            <button type="button" class="promo-quick-chip" id="auto-apply-chip">
              🏷️ Tap to apply <strong>LOCAL10</strong> for 10% discount
            </button>
          `}
        </div>

        <!-- Grand Total Row -->
        <div class="grand-total-divider"></div>
        <div class="grand-total-row">
          <div>
            <span class="total-title">Total Amount</span>
            <small class="total-tax-note">(Inclusive of all local taxes)</small>
          </div>
          <span class="grand-total-amount">${formatPrice(grandTotal)}</span>
        </div>

        <!-- High-Conversion Primary CTA -->
        <div class="checkout-cta-wrap">
          <a href="checkout.html" class="btn-primary-checkout">
            Proceed to Checkout
            <span class="cta-arrow">&rarr;</span>
          </a>
        </div>

        <!-- Trust Badges & Guarantees -->
        <div class="trust-features-list">
          <div class="trust-feature-item">
            <span class="trust-icon">🔒</span>
            <div class="trust-text">
              <strong>256-Bit SSL Encrypted</strong>
              <small>Bank-grade safe & private checkout</small>
            </div>
          </div>
          <div class="trust-feature-item">
            <span class="trust-icon">⚡</span>
            <div class="trust-text">
              <strong>Same-Day Dispatch</strong>
              <small>Delivered fresh from local vendors</small>
            </div>
          </div>
          <div class="trust-feature-item">
            <span class="trust-icon">💵</span>
            <div class="trust-text">
              <strong>COD & UPI Accepted</strong>
              <small>Pay online or upon doorstep delivery</small>
            </div>
          </div>
          <div class="trust-feature-item">
            <span class="trust-icon">🌿</span>
            <div class="trust-text">
              <strong>Eco-Friendly Packaging</strong>
              <small>Zero single-use plastic crates</small>
            </div>
          </div>
        </div>

      </div>
    `;

    // 3. Attach Event Listeners to Cart Operations
    // Quantity Minus
    tableContainer.querySelectorAll('.cart-qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = items.find(i => i.id === id);
        if (item) {
          Cart.updateQuantity(id, item.quantity - 1);
          renderCart();
        }
      });
    });

    // Quantity Plus
    tableContainer.querySelectorAll('.cart-qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = items.find(i => i.id === id);
        if (item) {
          Cart.updateQuantity(id, item.quantity + 1);
          renderCart();
        }
      });
    });

    // Direct Quantity Input
    tableContainer.querySelectorAll('.cart-qty-val').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.getAttribute('data-id');
        const val = parseInt(input.value, 10);
        Cart.updateQuantity(id, val);
        renderCart();
      });
    });

    // Remove Single Item Button
    tableContainer.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        Cart.removeItem(id);
        renderCart();
      });
    });

    // Clear All Items Button
    const clearBtn = document.getElementById('cart-clear-all-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all items from your cart?')) {
          Cart.clear();
          renderCart();
        }
      });
    }

    // Apply Promo Code
    const promoBtn = document.getElementById('apply-promo-btn');
    const promoInput = document.getElementById('promo-code-input');
    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code === 'LOCAL10') {
          localStorage.setItem(PROMO_STORAGE_KEY, 'LOCAL10');
          showToast('✓ Coupon LOCAL10 applied: 10% discount added!');
          renderCart();
        } else if (code === '') {
          localStorage.removeItem(PROMO_STORAGE_KEY);
          renderCart();
        } else {
          showToast('⚠️ Invalid coupon code. Try LOCAL10', 'danger');
        }
      });
    }

    // 1-Click Quick Apply Chip
    const autoChip = document.getElementById('auto-apply-chip');
    if (autoChip) {
      autoChip.addEventListener('click', () => {
        localStorage.setItem(PROMO_STORAGE_KEY, 'LOCAL10');
        showToast('✓ Coupon LOCAL10 applied: 10% discount added!');
        renderCart();
      });
    }

    // Remove Promo Code Button
    const removePromoBtn = document.getElementById('remove-promo-btn');
    if (removePromoBtn) {
      removePromoBtn.addEventListener('click', () => {
        localStorage.removeItem(PROMO_STORAGE_KEY);
        showToast('ℹ️ Coupon removed', 'info');
        renderCart();
      });
    }
  }

  // Listen for global cart update events
  window.addEventListener('cartUpdated', renderCart);

  // Initial Render on page load
  renderCart();
});
