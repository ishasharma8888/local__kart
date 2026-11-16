// LocalKart - Local Market Online Store
// Complete Order Placement & Checkout Controller

document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.getElementById('checkout-form');
  const placeOrderBtn = document.getElementById('place-order-btn');
  const placeOrderBtnText = document.getElementById('place-order-btn-text');
  const summaryItemsList = document.getElementById('checkout-summary-items');
  const summarySubtotal = document.getElementById('checkout-subtotal');
  const summaryShipping = document.getElementById('checkout-shipping');
  const summaryDiscount = document.getElementById('checkout-discount');
  const summaryTotal = document.getElementById('checkout-total');
  const confirmationModal = document.getElementById('order-confirmation-modal');
  const errorBanner = document.getElementById('checkout-error-banner');
  const emptyNotice = document.getElementById('checkout-empty-notice');
  const contentGrid = document.getElementById('checkout-content-grid');

  let isSubmitting = false;

  // 1. Check Cart Status
  const items = Cart.getItems();

  if (items.length === 0) {
    if (contentGrid) contentGrid.style.display = 'none';
    if (emptyNotice) emptyNotice.style.display = 'block';
    return;
  } else {
    if (contentGrid) contentGrid.style.display = 'grid';
    if (emptyNotice) emptyNotice.style.display = 'none';
  }

  // 2. Populate Order Summary Sidebar
  const subtotal = Cart.getSubtotal();
  const shipping = Cart.getShipping(subtotal);
  const discount = Cart.getDiscount(subtotal);
  const grandTotal = Cart.getGrandTotal();

  if (summaryItemsList) {
    summaryItemsList.innerHTML = items.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; font-size: 0.9rem; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed #e9ecef;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <img 
            src="${item.image || 'images/tomatoes_packet.jpg'}" 
            alt="${item.name}" 
            style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; flex-shrink: 0;"
            onerror="handleImageError(this, '${item.name}')"
          >
          <div>
            <strong style="color: #1b4332; display: block; line-height: 1.25;">${item.name}</strong>
            <span style="color: #6c757d; font-size: 0.82rem;">${item.quantity} × ${formatPrice(item.price)} (${item.unit || 'unit'})</span>
            <div style="font-size: 0.76rem; color: #2d6a4f; margin-top: 2px;">🏪 ${item.vendorName || 'Local Vendor'}</div>
          </div>
        </div>
        <div style="font-weight: 700; color: #1b4332; white-space: nowrap;">${formatPrice(item.price * item.quantity)}</div>
      </div>
    `).join('');
  }

  if (summarySubtotal) summarySubtotal.textContent = formatPrice(subtotal);
  if (summaryShipping) {
    summaryShipping.innerHTML = shipping === 0 
      ? '<strong style="color: #2d6a4f;">FREE</strong>' 
      : formatPrice(shipping);
  }
  if (summaryDiscount) summaryDiscount.textContent = discount > 0 ? `-${formatPrice(discount)}` : '₹0';
  if (summaryTotal) summaryTotal.textContent = formatPrice(grandTotal);

  // 3. Payment Method Radio Selection Styling
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.payment-radio-card').forEach(card => card.classList.remove('selected'));
      const parentLabel = radio.closest('.payment-radio-card');
      if (parentLabel) parentLabel.classList.add('selected');
    });
  });

  // 4. Inline Validation Helpers
  const fields = [
    { id: 'cust-name', errId: 'err-cust-name' },
    { id: 'cust-phone', errId: 'err-cust-phone' },
    { id: 'cust-email', errId: 'err-cust-email' },
    { id: 'cust-address', errId: 'err-cust-address' },
    { id: 'cust-city', errId: 'err-cust-city' },
    { id: 'cust-pincode', errId: 'err-cust-pincode' }
  ];

  function setFieldError(fieldId, errorMsg) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(`err-${fieldId}`);
    if (input) input.classList.add('input-error');
    if (errEl) {
      errEl.textContent = errorMsg;
      errEl.classList.add('visible');
    }
  }

  function clearFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(`err-${fieldId}`);
    if (input) input.classList.remove('input-error');
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.remove('visible');
    }
  }

  function clearAllErrors() {
    fields.forEach(f => clearFieldError(f.id));
    if (errorBanner) {
      errorBanner.textContent = '';
      errorBanner.style.display = 'none';
    }
  }

  // Real-time error clearing when user edits an input
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (el) {
      el.addEventListener('input', () => clearFieldError(f.id));
      el.addEventListener('change', () => clearFieldError(f.id));
    }
  });

  // 5. Form Validation & Place Order Handler
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Prevent duplicate order submission from rapid repeated clicks
      if (isSubmitting) return;

      clearAllErrors();

      // Collect form values
      const nameInput = document.getElementById('cust-name');
      const phoneInput = document.getElementById('cust-phone');
      const emailInput = document.getElementById('cust-email');
      const addressInput = document.getElementById('cust-address');
      const cityInput = document.getElementById('cust-city');
      const pincodeInput = document.getElementById('cust-pincode');
      const instructionsInput = document.getElementById('cust-instructions');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const address = addressInput ? addressInput.value.trim() : '';
      const city = cityInput ? cityInput.value.trim() : '';
      const pincode = pincodeInput ? pincodeInput.value.trim() : '';
      const instructions = instructionsInput ? instructionsInput.value.trim() : '';
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Cash on Delivery (COD)';

      let isValid = true;
      let firstInvalidInput = null;

      // Validation 1: Full Name
      if (!name || name.length < 3) {
        setFieldError('cust-name', 'Please enter your complete full name (minimum 3 characters).');
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = nameInput;
      } else if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
        setFieldError('cust-name', 'Name should only contain letters and standard characters.');
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = nameInput;
      }

      // Validation 2: 10-Digit Mobile Phone Number (Indian mobile format: 6-9 followed by 9 digits)
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phone) {
        setFieldError('cust-phone', 'Please enter your 10-digit mobile phone number.');
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = phoneInput;
      } else if (!phoneRegex.test(phone)) {
        setFieldError('cust-phone', 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = phoneInput;
      }

      // Validation 3: Email (Optional, but if given, must be valid)
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError('cust-email', 'Please enter a valid email address (or leave blank).');
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = emailInput;
      }

      // Validation 4: Delivery Street Address
      if (!address || address.length < 6) {
        setFieldError('cust-address', 'Please provide a detailed delivery address (house/flat no, street, locality).');
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = addressInput;
      }

      // Validation 5: City / Town
      if (!city || city.length < 2) {
        setFieldError('cust-city', 'Please specify your delivery town or city.');
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = cityInput;
      }

      // Validation 6: Postal PIN Code (6 digits)
      const pinRegex = /^\d{6}$/;
      if (!pincode) {
        setFieldError('cust-pincode', 'Please enter your 6-digit postal PIN code.');
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = pincodeInput;
      } else if (!pinRegex.test(pincode)) {
        setFieldError('cust-pincode', 'PIN code must be exactly 6 numeric digits.');
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = pincodeInput;
      }

      // Validation 7: Cart Check
      const currentCartItems = Cart.getItems();
      if (!currentCartItems || currentCartItems.length === 0) {
        if (errorBanner) {
          errorBanner.textContent = 'Your shopping cart is empty! Please add products before placing an order.';
          errorBanner.style.display = 'block';
        }
        isValid = false;
        return;
      }

      // If invalid, focus first error input
      if (!isValid) {
        if (firstInvalidInput) {
          firstInvalidInput.focus();
          firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Lock button to prevent double-submission
      isSubmitting = true;
      if (placeOrderBtn) {
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<span class="spinner-icon"></span> Placing Order...';
      }

      // 6. Save Order to Database (OrderStore / localStorage)
      const currentSubtotal = Cart.getSubtotal();
      const currentShipping = Cart.getShipping(currentSubtotal);
      const currentDiscount = Cart.getDiscount(currentSubtotal);
      const currentGrandTotal = Cart.getGrandTotal();

      const orderPayload = {
        customer: {
          name,
          phone,
          email,
          address,
          city,
          pincode,
          instructions
        },
        items: currentCartItems,
        subtotal: currentSubtotal,
        shipping: currentShipping,
        discount: currentDiscount,
        grandTotal: currentGrandTotal,
        paymentMethod,
        status: 'Order Placed'
      };

      // Call OrderStore persistence
      const savedOrder = typeof OrderStore !== 'undefined' && typeof OrderStore.saveOrder === 'function'
        ? OrderStore.saveOrder(orderPayload)
        : null;

      if (!savedOrder || !savedOrder.id) {
        // Fallback error handling if storage fails
        if (errorBanner) {
          errorBanner.textContent = 'Unable to save order details. Please check your storage settings and try again.';
          errorBanner.style.display = 'block';
        }
        isSubmitting = false;
        if (placeOrderBtn) {
          placeOrderBtn.disabled = false;
          placeOrderBtn.innerHTML = '<span>🛍️ Place Order &rarr;</span>';
        }
        return;
      }

      // 7. Clear Shopping Cart ONLY after successful order save
      Cart.clear();

      // 8. Populate & Display Order Confirmation Popup
      const modalOrderId = document.getElementById('modal-order-id');
      const modalCustomerName = document.getElementById('modal-customer-name');
      const modalOrderTotal = document.getElementById('modal-order-total');
      const modalTotalItems = document.getElementById('modal-total-items');
      const modalOrderStatus = document.getElementById('modal-order-status');

      if (modalOrderId) modalOrderId.textContent = savedOrder.id;
      if (modalCustomerName) modalCustomerName.textContent = savedOrder.customer.name;
      if (modalOrderTotal) modalOrderTotal.textContent = formatPrice(savedOrder.grandTotal);
      if (modalTotalItems) {
        modalTotalItems.textContent = `${savedOrder.itemCount} ${savedOrder.itemCount === 1 ? 'item' : 'items'}`;
      }
      if (modalOrderStatus) modalOrderStatus.textContent = 'Confirmed';

      // Show confirmation popup with animation
      if (confirmationModal) {
        confirmationModal.classList.add('active');
        // Prevent body scrolling while modal is open
        document.body.style.overflow = 'hidden';
      }

      // Reset button state
      isSubmitting = false;
      if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = '<span>✓ Order Placed</span>';
      }
    });
  }

  // 9. Modal Action Handlers
  const continueShoppingBtn = document.getElementById('modal-continue-shopping-btn');
  if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.style.overflow = '';
      if (confirmationModal) confirmationModal.classList.remove('active');
      window.location.href = 'products.html';
    });
  }
});
