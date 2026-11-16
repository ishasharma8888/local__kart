// Local Market Online Store - Product Details Script
// Individual Product View & Quantity Selector

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('product-details-view');
  const relatedContainer = document.getElementById('related-products-grid');

  if (!container || typeof MARKET_DATA === 'undefined') return;

  const LOCAL_IMAGE_MAP = {
    'prod-1': 'images/tomatoes_packet.jpg',
    'prod-2': 'images/white_bread.jpg',
    'prod-3': 'images/prod-3_fresh_milk.jpg',
    'prod-4': 'images/apples_packet.jpg',
    'prod-5': 'images/sweets_box.jpg',
    'prod-6': 'images/prod-6_water_bottles.jpg',
    'prod-7': 'images/tomatoes_packet.jpg',
    'prod-8': 'images/potatoes_packet.jpg',
    'prod-9': 'images/onions_packet.jpg',
    'prod-10': 'images/carrots.jpg',
    'prod-11': 'images/spinach_packet.jpg',
    'prod-12': 'images/prod-12_capsicum.jpg',
    'prod-13': 'images/apples_packet.jpg',
    'prod-14': 'images/bananas_packet.jpg',
    'prod-15': 'images/prod-15_mangoes.jpg',
    'prod-16': 'images/prod-16_oranges.jpg',
    'prod-17': 'images/prod-17_grapes.jpg',
    'prod-18': 'images/pomegranates.jpg',
    'prod-19': 'images/prod-19_curd.jpg',
    'prod-20': 'images/prod-20_paneer.jpg',
    'prod-21': 'images/butter.jpg',
    'prod-22': 'images/prod-22_cheese.jpg',
    'prod-23': 'images/prod-23_buttermilk.jpg',
    'prod-24': 'images/prod-24_brown_bread.jpg',
    'prod-25': 'images/prod-25_cookies.jpg',
    'prod-26': 'images/prod-26_chocolate_cake.jpg',
    'prod-27': 'images/prod-27_muffins.jpg',
    'prod-28': 'images/prod-28_biscuits.jpg',
    'prod-29': 'images/prod-29_rice.jpg',
    'prod-30': 'images/atta_packet.jpg',
    'prod-31': 'images/sugar.jpg',
    'prod-32': 'images/prod-32_cooking_oil.jpg',
    'prod-33': 'images/prod-33_lentils.jpg',
    'prod-34': 'images/salt.jpg',
    'prod-35': 'images/sweets_box.jpg',
    'prod-36': 'images/sweets_box.jpg',
    'prod-37': 'images/haldiram_namkeen.jpg',
    'prod-38': 'images/laddoo.jpg',
    'prod-39': 'images/lays_masala.jpg',
    'prod-40': 'images/salted_peanuts.jpg',
    'prod-41': 'images/gulab_jamun.jpg',
    'prod-42': 'images/kaju_katli_box.jpg',
    'prod-95': 'images/lays_tomato.jpg',
    'prod-43': 'images/prod-43_turmeric_powder.jpg',
    'prod-44': 'images/prod-44_red_chilli_powder.jpg',
    'prod-45': 'images/prod-45_coriander_powder.jpg',
    'prod-46': 'images/prod-43_turmeric_powder.jpg',
    'prod-47': 'images/prod-47_cumin_seeds.jpg',
    'prod-48': 'images/prod-48_black_pepper.jpg',
    'prod-49': 'images/cotton_tshirt.jpg',
    'prod-50': 'images/prod-50_casual_shirt.jpg',
    'prod-51': 'images/prod-51_traditional_kurta.jpg',
    'prod-52': 'images/handloom_scarf.jpg',
    'prod-53': 'images/prod-53_casual_sandals.jpg',
    'prod-54': 'images/prod-54_everyday_shoes.jpg',
    'prod-55': 'images/prod-55_storage_container.jpg',
    'prod-56': 'images/prod-56_lunch_box.jpg',
    'prod-57': 'images/ceramic_mug.jpg',
    'prod-58': 'images/kitchen_towel.jpg',
    'prod-59': 'images/prod-59_decorative_lamp.jpg',
    'prod-60': 'images/notebook.jpg',
    'prod-61': 'images/prod-61_pen_set.jpg',
    'prod-62': 'images/prod-62_drawing_book.jpg',
    'prod-63': 'images/prod-63_handmade_greeting_card.jpg',
    'prod-64': 'images/prod-64_decorative_plant_pot.jpg',
    'prod-65': 'images/prod-65_gift_hamper.jpg',
    'prod-66': 'images/prod-66_farm_fresh_brown_eggs.jpg',
    'prod-67': 'images/white_eggs.jpg',
    'prod-68': 'images/prod-68_country_chicken_eggs.jpg',
    'prod-69': 'images/red_roses.jpg',
    'prod-70': 'images/jasmine_garland.jpg',
    'prod-71': 'images/prod-71_money_plant_with_pot.jpg',
    'prod-72': 'images/prod-72_snake_plant_air_purifier.jpg',
    'prod-73': 'images/prod-73_fast_charging_usb_c_cable.jpg',
    'prod-74': 'images/prod-74_20w_power_adapter.jpg',
    'prod-75': 'images/prod-75_mobile_phone_stand.jpg',
    'prod-76': 'images/prod-76_tempered_glass_screen_protector.jpg',
    'prod-77': 'images/honey_jar.jpg',
    'prod-78': 'images/prod-78_organic_a2_cow_ghee.jpg',
    'prod-79': 'images/prod-79_organic_green_tea_leaves.jpg',
    'prod-80': 'images/rolled_oats.jpg',
    'prod-81': 'images/prod-81_instant_masala_noodles_pack.jpg',
    'prod-82': 'images/kissan_ketchup.jpg',
    'prod-83': 'images/kissan_jam.jpg',
    'prod-84': 'images/prod-84_breakfast_corn_flakes.jpg',
    'prod-85': 'images/vase.jpg',
    'prod-86': 'images/prod-86_floor_cleaner.jpg',
    'prod-87': 'images/candle.jpg',
    'prod-88': 'images/prod-88_slip_on_loafers.jpg',
    'prod-89': 'images/cocacola.jpg',
    'prod-90': 'images/real_juice.jpg',
    'prod-91': 'images/nestle_coffee.jpg'
  };

  const productId = getUrlParam('id') || 'prod-52';
  const product = MARKET_DATA.products.find(p => p.id === productId) || MARKET_DATA.products[0];
  const vendor = MARKET_DATA.vendors.find(v => v.id === product.vendorId);
  const productImage = LOCAL_IMAGE_MAP[product.id] || product.image;

  // Update Page Title
  document.title = `${product.name} | Local Market Online Store`;

  // Render Detailed Information
  container.innerHTML = `
    <div class="product-gallery-box">
      <img 
        class="product-gallery-img" 
        src="${productImage}" 
        alt="${product.name}" 
        id="main-product-img"
        onerror="handleImageError(this, '${product.name}')"
      >
      ${product.isOriginal ? '<span class="badge-tag badge-original" style="position: absolute; top: 16px; left: 16px; font-size: 0.85rem; padding: 6px 12px;">Original College Project Item</span>' : ''}
    </div>

    <div class="product-info-column">
      <nav class="details-breadcrumb">
        <a href="index.html">Home</a> &rsaquo;
        <a href="products.html">Products</a> &rsaquo;
        <a href="products.html?category=${product.categoryId}">${product.category}</a> &rsaquo;
        <span>${product.name}</span>
      </nav>

      <h1 class="details-title">${product.name}</h1>

      <!-- Vendor Card -->
      <div class="details-vendor-card">
        <div>
          <span style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-primary-dark); font-weight: 700;">Sold by Local Vendor</span>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary-dark);">${product.vendorName}</h4>
          <span style="font-size: 0.82rem; color: var(--color-text-muted);">${vendor ? vendor.tagline : 'Local Community Producer'}</span>
        </div>
        <a href="vendor-details.html?id=${product.vendorId}" class="btn btn-secondary btn-sm">
          Visit Shop &rarr;
        </a>
      </div>

      <div class="details-price-row">
        <span class="details-price-huge">${formatPrice(product.price)}</span>
        <span class="details-price-unit">per ${product.unit}</span>
        <span class="badge-stock" style="position: static; margin-left: auto; font-size: 0.85rem; padding: 4px 12px; background: var(--color-primary-tint);">
          ✓ In Stock (${product.stock} units available)
        </span>
      </div>

      <div class="product-rating" style="font-size: 0.95rem; margin-bottom: var(--space-md);">
        <span class="rating-stars">★★★★★</span>
        <span style="font-weight: 700; color: var(--color-text-main);">${product.rating}</span>
        <span style="color: var(--color-text-muted);">(${product.reviews} customer ratings & reviews)</span>
      </div>

      <p class="details-desc">${product.description}</p>

      <!-- Action Row (Quantity + Add to Cart) -->
      <div class="details-action-row">
        <div class="quantity-picker">
          <button class="qty-btn" id="qty-minus" type="button" aria-label="Decrease quantity">&minus;</button>
          <input class="qty-input" id="details-qty-input" type="number" value="1" min="1" max="${product.stock}">
          <button class="qty-btn" id="qty-plus" type="button" aria-label="Increase quantity">+</button>
        </div>

        <button class="btn btn-primary btn-lg" id="add-to-cart-details-btn" style="flex: 1;">
          🛒 Add to Shopping Cart
        </button>
      </div>

      <!-- Product Specifications Table -->
      <table class="product-specs-table">
        <tbody>
          <tr>
            <th>Product Code</th>
            <td>${product.id.toUpperCase()}</td>
          </tr>
          <tr>
            <th>Category</th>
            <td><a href="products.html?category=${product.categoryId}">${product.category}</a></td>
          </tr>
          <tr>
            <th>Vendor Name</th>
            <td><a href="vendor-details.html?id=${product.vendorId}">${product.vendorName}</a></td>
          </tr>
          <tr>
            <th>Packaging Unit</th>
            <td>1 ${product.unit}</td>
          </tr>
          <tr>
            <th>Source & Origin</th>
            <td>Locally Sourced from Verified Neighborhood Producers</td>
          </tr>
          <tr>
            <th>Freshness Guarantee</th>
            <td>100% Quality Inspected & Same-Day Dispatch</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  // Attach Quantity Picker Logic
  const qtyInput = document.getElementById('details-qty-input');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const addBtn = document.getElementById('add-to-cart-details-btn');

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) {
        qtyInput.value = val - 1;
      }
    });

    qtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val < product.stock) {
        qtyInput.value = val + 1;
      }
    });

    qtyInput.addEventListener('change', () => {
      let val = parseInt(qtyInput.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > product.stock) val = product.stock;
      qtyInput.value = val;
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const quantity = parseInt(qtyInput.value, 10) || 1;
      Cart.addItem(product.id, quantity);
    });
  }

  // Render Related Products (same category or vendor, excluding current)
  if (relatedContainer) {
    const related = MARKET_DATA.products
      .filter(p => p.id !== product.id && (p.categoryId === product.categoryId || p.vendorId === product.vendorId))
      .slice(0, 4);

    if (related.length > 0) {
      relatedContainer.innerHTML = related.map(item => `
        <div class="product-card">
          <div class="product-image-wrap">
            <span class="badge-stock">In Stock</span>
            <a href="product-details.html?id=${item.id}">
              <img class="product-img" src="${item.image}" alt="${item.name}" loading="lazy" onerror="handleImageError(this, '${item.name}')">
            </a>
          </div>
          <div class="product-body">
            <a href="vendor-details.html?id=${item.vendorId}" class="product-vendor-link">🏪 ${item.vendorName}</a>
            <h4 class="product-title"><a href="product-details.html?id=${item.id}">${item.name}</a></h4>
            <div class="product-footer">
              <div class="product-price-box">
                <span class="product-price">${formatPrice(item.price)}</span>
                <span class="product-unit">per ${item.unit}</span>
              </div>
              <button class="btn btn-primary btn-sm" data-action="add-to-cart" data-product-id="${item.id}">
                + Add
              </button>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      relatedContainer.parentElement.style.display = 'none';
    }
  }
});
