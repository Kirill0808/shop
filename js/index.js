import { items } from './items.js';

const content = document.getElementById('page_content');
const cartWrapper = document.getElementById('cartWrapper');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.querySelector('.cart-items');
const totalAmountElement = document.querySelector('.cart-summary p:nth-child(1) strong');
const totalPriceElement = document.querySelector('.cart-summary p:nth-child(2) strong');
const buyBtn = document.querySelector('.buy-btn');
const modalBody = document.getElementById('modalBody');
const productModal = new bootstrap.Modal(document.getElementById('productModal'));

let cart = {};
let currentSearch = '';

// ----------- РЕНДЕР ТОВАРОВ -----------
function renderProducts(products) {
   content.innerHTML = products
      .map((item) => {
         const { id, name, imgUrl, price, orderInfo } = item;
         const inStock = orderInfo?.inStock ?? 0;
         const reviews = orderInfo?.reviews ?? 0;
         const isAvailable = inStock > 0;

         return `
         <div class='product' id="${id}">
            <img class='images' src="img/${imgUrl}" alt="${name}">
            <div class="favorite">&#9825;</div>
            <h3 class="name">${name}</h3>

            <div class="stock ${isAvailable ? 'in-stock' : 'out-of-stock'}">
               <span class="icon">
                  ${
                     isAvailable
                        ? '<svg width="30" height="30" fill="green" viewBox="0 0 24 24"><path d="M9 11l3 3 7-7-1.41-1.41L12 12.17l-2.59-2.59L8 11z"/></svg>'
                        : '<svg width="30" height="30" fill="red" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6h2V7zm0 8h-2v2h2v-2z"/></svg>'
                  }
               </span>
               ${inStock} left in stock
            </div>

            <div class="price">Price: <b>${price} $</b></div>
            <button class="btn_product" ${!isAvailable ? 'disabled' : ''}>Add to cart</button>

            <div class="positiveMark">
               <div><span class="heart">❤️</span> <b>${reviews}%</b> Positive reviews</div>
               <div>Above average</div>
               <div><b>${inStock}</b> items in stock</div>
            </div>
         </div>
      `;
      })
      .join('');
}

// ----------- КОРЗИНА -----------
function addToCart(product) {
   const id = product.id;
   cart[id] = (cart[id] || 0) + 1;
   updateCartUI();
}

// Покупка
buyBtn.addEventListener('click', () => {
   alert('Thanks for your purchase!');
   cart = {};
   updateCartUI();
});

function removeFromCart(productId) {
   delete cart[productId];
   updateCartUI();
}

function updateCartUI() {
   cartItemsContainer.innerHTML = '';
   let total = 0;
   let count = 0;

   for (const id in cart) {
      const product = items.find((p) => p.id === +id);
      const qty = cart[id];
      const price = product.price * qty;

      total += price;
      count += qty;

      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
         <img src="img/${product.imgUrl}" alt="${product.name}" class="cart-item-img">
         <div class="cart-item-info">
            <h4>${product.name}</h4>
            <div class="cart-item-controls">
               <button class="qty-btn decrease" data-id="${product.id}">–</button>
               <span class="qty">${qty}</span>
               <button class="qty-btn increase" data-id="${product.id}">+</button>
            </div>
            <p><strong>${price.toFixed(2)}$</strong></p>
         </div>
         <button class="remove-btn" data-id="${product.id}">&times;</button>
      `;
      cartItemsContainer.appendChild(cartItem);
   }

   if (count === 0) {
      const emptyText = document.createElement('p');
      emptyText.className = 'empty-text';
      emptyText.textContent = 'Your cart is empty.';
      cartItemsContainer.appendChild(emptyText);
      buyBtn.disabled = true;
   } else {
      buyBtn.disabled = false;
   }

   cartCount.textContent = count;
   totalAmountElement.textContent = `${count} pcs.`;
   totalPriceElement.textContent = `${total.toFixed(2)}$`;
}

// ----------- СОБЫТИЯ ДЛЯ ДОБАВЛЕНИЯ В КОРЗИНУ -----------
document.addEventListener('click', (e) => {
   if (e.target.classList.contains('btn_product')) {
      const productCard = e.target.closest('.product') || e.target.closest('.modal-product');
      if (!productCard) return;
      const id = +productCard.id || +productCard.dataset.id;
      const product = items.find((p) => p.id === id);
      if (product) {
         addToCart(product);
         if (productCard.classList.contains('modal-product')) productModal.hide();
      }
   }

   if (e.target.classList.contains('remove-btn')) {
      const id = +e.target.dataset.id;
      removeFromCart(id);
   }
});

document.addEventListener('click', (e) => {
   const id = +e.target.dataset.id;
   if (e.target.classList.contains('increase')) {
      cart[id]++;
      updateCartUI();
   }
   if (e.target.classList.contains('decrease')) {
      if (cart[id] > 1) {
         cart[id]--;
      } else {
         delete cart[id]; // Удаляем товар, если кол-во стало 0
      }
      updateCartUI();
   }
});

// ----------- МОДАЛЬНОЕ ОКНО -----------

document.addEventListener('click', (e) => {
   const card = e.target.closest('.product');
   if (!card || e.target.classList.contains('btn_product')) return;

   const id = +card.id;
   const product = items.find((p) => p.id === id);
   if (!product) return;

   const safe = (val, def = 'N/A') => val ?? def;

   modalBody.innerHTML = `
      <div class="modal-product" data-id="${product.id}">
         <div class="modal-product-left">
            <img src="img/${product.imgUrl}" alt="${product.name}">
         </div>
         <div class="modal-product-details">
            <h3 class="name">${safe(product.name)}</h3>
            <div class="modal-review">
               <div class="review-score">❤️ <strong>${safe(
                  product.orderInfo?.reviews,
                  0
               )}%</strong> Positive reviews</div>
               <div class="review-orders"><strong>${safe(
                  product.orderInfo?.orders,
                  0
               )}</strong> orders</div>
            </div>
            <p><strong>Color:</strong> ${product.color.join(', ')}</p>
            <p><strong>Operating System:</strong> ${safe(product.os)}</p>
            <p><strong>Chip:</strong> ${safe(product.chip?.name)} (${safe(
      product.chip?.cores
   )} cores)</p>
            <p><strong>Size:</strong> ${safe(product.size?.height)} × ${safe(
      product.size?.width
   )} × ${safe(product.size?.depth)} cm</p>
            <p><strong>Weight:</strong> ${safe(product.size?.weight)} kg</p>
            <p><strong>Category:</strong> ${safe(product.category)}</p>
         </div>
         <div class="modal-product-right">
            <div class="price">${product.price} $</div>
            <div class="stock ${product.orderInfo?.inStock > 0 ? 'in-stock' : 'out-of-stock'}">
               Stock: <strong>${product.orderInfo?.inStock ?? 0}</strong> pcs.
            </div>
            <button class="btn_product" ${
               product.orderInfo?.inStock === 0 ? 'disabled' : ''
            }>Add to cart</button>
         </div>
      </div>
   `;

   productModal.show();
});

// ----------- АККОРДЕОНЫ -----------
document.querySelectorAll('.accordion').forEach((acc) => {
   acc.addEventListener('click', function () {
      this.classList.toggle('active');
      this.nextElementSibling.classList.toggle('show');
   });
});

// ----------- КОРЗИНА ПОКАЗ/СКРЫТИЕ -----------
document.getElementById('cartToggle').addEventListener('click', (e) => {
   e.preventDefault();
   cartWrapper.style.display = cartWrapper.style.display === 'none' ? 'block' : 'none';
});

// ----------- ФИЛЬТРЫ И ПОИСК -----------
function getActiveFilters(selector) {
   return Array.from(document.querySelectorAll(`${selector}:checked`)).map((el) =>
      el.id.toLowerCase()
   );
}

function filterProducts() {
   let filtered = [...items];

   if (currentSearch) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(currentSearch));
   }

   const colors = getActiveFilters('.color-filter');
   if (colors.length) {
      filtered = filtered.filter((item) =>
         item.color.some((c) => colors.includes(c.toLowerCase()))
      );
   }

   const memory = getActiveFilters('.memory-filter').map(Number);
   if (memory.length) {
      filtered = filtered.filter((item) => memory.includes(item.storage));
   }

   const os = getActiveFilters('.os-filter');
   if (os.length) {
      filtered = filtered.filter((item) => item.os && os.includes(item.os.toLowerCase()));
   }

   const displayRanges = getActiveFilters('.display-filter').map((r) => {
      const [min, max] = r.split('-').map(Number);
      return { min, max };
   });
   if (displayRanges.length) {
      filtered = filtered.filter((item) =>
         displayRanges.some((range) => item.display >= range.min && item.display <= range.max)
      );
   }

   const priceFrom = parseFloat(document.querySelector('.input-from').value) || 0;
   const priceTo = parseFloat(document.querySelector('.input-to').value) || Infinity;
   filtered = filtered.filter((item) => item.price >= priceFrom && item.price <= priceTo);

   renderProducts(filtered);
}

// Слушатели на фильтры и поиск
document.querySelector('.search-field').addEventListener('input', (e) => {
   currentSearch = e.target.value.toLowerCase().trim();
   filterProducts();
});

document.querySelectorAll('input').forEach((input) => {
   input.addEventListener('input', filterProducts);
});

// ----------- ПЕРВЫЙ РЕНДЕР -----------
renderProducts(items);
