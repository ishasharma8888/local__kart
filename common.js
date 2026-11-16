// Local Market Online Store - Common Utilities & Shopping Cart Management
// Shared Client-Side Utilities

const CART_STORAGE_KEY = 'localMarketCart_v1';
const PROMO_STORAGE_KEY = 'localMarketPromo_v1';
const ORDERS_STORAGE_KEY = 'localMarketOrders_v1';

// --------------------------------------------------------------------------
// Shopping Cart Operations (localStorage)
// --------------------------------------------------------------------------
const Cart = {
  // Retrieve raw cart items array from localStorage
  getItems() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading cart from localStorage', e);
      return [];
    }
  },

  // Save cart items array to localStorage
  saveItems(items) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      Cart.updateHeaderBadge();
      // Dispatch custom event for cross-component re-renders
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items } }));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  },

  // Add product to cart by ID (with optional card metadata override)
  addItem(productId, quantity = 1, customProductData = null) {
    const baseProduct = typeof MARKET_DATA !== 'undefined' 
      ? MARKET_DATA.products.find(p => p.id === productId) 
      : null;

    const product = customProductData
      ? Object.assign(
          { unit: 'item', vendorId: '', category: 'Local Product' },
          baseProduct || {},
          customProductData,
          { id: productId }
        )
      : baseProduct;

    if (!product) {
      console.warn('Product not found with ID:', productId);
      return false;
    }

    const items = Cart.getItems();
    const existingIndex = items.findIndex(item => item.id === productId);

    const qtyToAdd = parseInt(quantity, 10) || 1;

    if (existingIndex > -1) {
      items[existingIndex].quantity += qtyToAdd;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit || 'item',
        vendorId: product.vendorId || '',
        vendorName: product.vendorName,
        category: product.category,
        image: product.image,
        quantity: qtyToAdd
      });
    }

    Cart.saveItems(items);
    showToast(`Added ${product.name} (${qtyToAdd} ${product.unit || 'item'}) to your cart!`);
    return true;
  },

  // Update item quantity
  updateQuantity(productId, quantity) {
    const items = Cart.getItems();
    const index = items.findIndex(item => item.id === productId);
    const newQty = parseInt(quantity, 10);

    if (index > -1) {
      if (newQty <= 0) {
        items.splice(index, 1);
        showToast('Item removed from cart', 'info');
      } else {
        items[index].quantity = newQty;
      }
      Cart.saveItems(items);
    }
  },

  // Remove item from cart
  removeItem(productId) {
    const items = Cart.getItems().filter(item => item.id !== productId);
    Cart.saveItems(items);
    showToast('Item removed from cart', 'info');
  },

  // Clear all items
  clear() {
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(PROMO_STORAGE_KEY);
    Cart.updateHeaderBadge();
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: [] } }));
    showToast('Shopping cart cleared', 'info');
  },

  // Get total count of all units in cart
  getCount() {
    const items = Cart.getItems();
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  },

  // Calculate items subtotal
  getSubtotal() {
    const items = Cart.getItems();
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  // Calculate shipping (Free above 500, else 40)
  getShipping(subtotal = null) {
    const sub = subtotal !== null ? subtotal : Cart.getSubtotal();
    if (sub === 0) return 0;
    return sub >= 500 ? 0 : 40;
  },

  // Get active promo discount
  getDiscount(subtotal = null) {
    const sub = subtotal !== null ? subtotal : Cart.getSubtotal();
    const promo = localStorage.getItem(PROMO_STORAGE_KEY);
    if (promo === 'LOCAL10') {
      return Math.round(sub * 0.10); // 10% discount
    }
    return 0;
  },

  // Calculate Grand Total
  getGrandTotal() {
    const sub = Cart.getSubtotal();
    if (sub === 0) return 0;
    const shipping = Cart.getShipping(sub);
    const discount = Cart.getDiscount(sub);
    return Math.max(0, sub + shipping - discount);
  },

  // Update badge counter in the header
  updateHeaderBadge() {
    const badges = document.querySelectorAll('.cart-counter');
    const count = Cart.getCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }
};

// --------------------------------------------------------------------------
// Order Management Store (localStorage persistence)
// --------------------------------------------------------------------------
const OrderStore = {
  // Retrieve all orders (newest first)
  getOrders() {
    try {
      const data = localStorage.getItem(ORDERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading orders from localStorage', e);
      return [];
    }
  },

  // Find order by ID
  getOrderById(orderId) {
    if (!orderId) return null;
    const orders = OrderStore.getOrders();
    return orders.find(o => o.id === orderId || o.orderId === orderId) || null;
  },

  // Save new order to persistent storage
  saveOrder(orderData) {
    try {
      const orders = OrderStore.getOrders();
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const generatedId = orderData.id || orderData.orderId || `LMO-${new Date().getFullYear()}-${randomNum}`;

      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) + ' at ' + now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const newOrder = {
        id: generatedId,
        orderId: generatedId,
        createdAt: now.toISOString(),
        orderDate: formattedDate,
        status: orderData.status || 'Order Placed',
        customer: {
          name: orderData.customer?.name || '',
          phone: orderData.customer?.phone || '',
          email: orderData.customer?.email || '',
          address: orderData.customer?.address || '',
          city: orderData.customer?.city || '',
          pincode: orderData.customer?.pincode || '',
          instructions: orderData.customer?.instructions || ''
        },
        items: Array.isArray(orderData.items) ? orderData.items : [],
        itemCount: Array.isArray(orderData.items)
          ? orderData.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
          : 0,
        subtotal: Number(orderData.subtotal) || 0,
        shipping: Number(orderData.shipping) || 0,
        discount: Number(orderData.discount) || 0,
        grandTotal: Number(orderData.grandTotal) || 0,
        paymentMethod: orderData.paymentMethod || 'Cash on Delivery (COD)'
      };

      orders.unshift(newOrder); // Prepend to store newest first
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent('ordersUpdated', { detail: { order: newOrder } }));
      return newOrder;
    } catch (e) {
      console.error('Error saving order to localStorage', e);
      return null;
    }
  },

  // Clear orders (testing helper)
  clearOrders() {
    try {
      localStorage.removeItem(ORDERS_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('ordersUpdated', { detail: { orders: [] } }));
    } catch (e) {
      console.error('Error clearing orders', e);
    }
  }
};

// Expose globally for cross-file use
if (typeof window !== 'undefined') {
  window.OrderStore = OrderStore;
}

// --------------------------------------------------------------------------
// Toast Notification Utility
// --------------------------------------------------------------------------
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'danger' ? 'toast-danger' : ''}`;
  
  const icon = type === 'danger' ? '⚠️' : '🛒';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// --------------------------------------------------------------------------
// Currency Formatter
// --------------------------------------------------------------------------
function formatPrice(amount) {
  const num = Number(amount) || 0;
  return '₹' + num.toLocaleString('en-IN');
}

// --------------------------------------------------------------------------
// URL Query Parameter Helper
// --------------------------------------------------------------------------
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// --------------------------------------------------------------------------
// Image Fallback Handling (Ensures offline / broken links show clean SVG)
// --------------------------------------------------------------------------
function handleImageError(img, title = 'Local Market') {
  img.onerror = null; // Prevent infinite loop
  const cleanTitle = encodeURIComponent(title.substring(0, 15));
  img.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%232d6a4f"/><text x="50%" y="45%" font-size="32" text-anchor="middle" dominant-baseline="middle" fill="%23d8f3dc">🛒</text><text x="50%" y="70%" font-size="14" font-family="sans-serif" text-anchor="middle" fill="%23ffffff" font-weight="bold">${cleanTitle}</text></svg>`;
}

// --------------------------------------------------------------------------
// Global Navigation & DOM Ready Initializer
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize cart count
  Cart.updateHeaderBadge();

  // 2. Mobile Menu Toggle
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // 3. Highlight Current Navigation Link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
    }
  });

  // 4. Header Search Form Redirection to products.html?search=...
  const headerSearchForms = document.querySelectorAll('.header-search-form');
  headerSearchForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.header-search-input');
      if (input && input.value.trim()) {
        const query = encodeURIComponent(input.value.trim());
        window.location.href = `products.html?search=${query}`;
      }
    });
  });

  // 5. Global Delegated "Add to Cart" button handler
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-action="add-to-cart"]');
    if (addBtn) {
      e.preventDefault();
      const productId = addBtn.getAttribute('data-product-id');
      const qtyInput = document.getElementById('details-qty-input');
      const quantity = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;

      // Read optional inline card metadata so curated local products never depend on remote URLs
      const customName = addBtn.getAttribute('data-product-name');
      const customPrice = addBtn.getAttribute('data-product-price');
      const customImage = addBtn.getAttribute('data-product-image');
      const customVendor = addBtn.getAttribute('data-product-vendor');
      const customCategory = addBtn.getAttribute('data-product-category');

      const customProductData =
        customName || customPrice || customImage || customVendor || customCategory
          ? {
              ...(customName ? { name: customName } : {}),
              ...(customPrice ? { price: parseFloat(customPrice) } : {}),
              ...(customImage ? { image: customImage } : {}),
              ...(customVendor ? { vendorName: customVendor } : {}),
              ...(customCategory ? { category: customCategory } : {}),
            }
          : null;

      Cart.addItem(productId, quantity, customProductData);

      // Provide quick visual confirmation on product card Add to Cart buttons
      if (addBtn.classList.contains('add-cart-btn') && !addBtn.dataset.adding) {
        const originalText = addBtn.textContent;
        addBtn.dataset.adding = 'true';
        addBtn.classList.add('added');
        addBtn.textContent = '✓ Added!';
        setTimeout(() => {
          addBtn.classList.remove('added');
          addBtn.textContent = originalText;
          delete addBtn.dataset.adding;
        }, 1200);
      }
    }
  });

  // 6. Global image error listener
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      handleImageError(img, img.getAttribute('alt') || 'Local Product');
    });
  });
});
