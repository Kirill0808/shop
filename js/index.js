import { items } from './items.js';

const content = document.getElementById('page_content');
let cart = {}; // Глобальная корзина (id: количество)

// Функция рендера товаров
function renderProducts(products) {
   content.innerHTML = products
      .map((item) => {
         const inStock = item.orderInfo?.inStock || 0;
         const reviews = item.orderInfo?.reviews || 0;
         const isAvailable = inStock > 0;

         return `
            <div class='product' id="${item.id}">
               <img class='images' src="img/${item.imgUrl}" alt="${item.name}">
               <div class="favorite">&#9825;</div>

               <h3 class="name">${item.name}</h3>

               <div class="stock ${isAvailable ? 'in-stock' : 'out-of-stock'}">
                  <span class="icon">
                     ${
                        isAvailable
                           ? `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green"><path d="M9 11l3 3 7-7-1.41-1.41L12 12.17l-2.59-2.59L8 11z"/></svg>`
                           : `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6h2V7zm0 8h-2v2h2v-2z"/></svg>`
                     }
                  </span>
                  ${inStock} left in stock
               </div>

               <div class="price">Price: <b>${item.price} $</b></div>

               <button class="btn_product" ${!isAvailable ? 'disabled' : ''}>
                  Add to cart
               </button>

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

// Аккордеоны
document.querySelectorAll('.accordion').forEach((acc) => {
   acc.addEventListener('click', function () {
      this.classList.toggle('active');
      this.nextElementSibling.classList.toggle('show');
   });
});

// Модалка
const modalBody = document.getElementById('modalBody');
const productModal = new bootstrap.Modal(document.getElementById('productModal'));

document.addEventListener('click', (e) => {
   const target = e.target.closest('.product');
   if (!target || e.target.classList.contains('btn_product')) return;

   const id = +target.id;
   const product = items.find((item) => item.id === id);
   if (!product) return;

   const safeValue = (value, defaultValue = 'N/A') => (value || value === 0 ? value : defaultValue);

   modalBody.innerHTML = `
      <div class="modal-product" data-id="${product.id}">
         <div class="modal-product-left">
            <img src="img/${product.imgUrl}" alt="${product.name}">
         </div>

         <div class="modal-product-details">
            <h3 class="name">${safeValue(product.name)}</h3>

            <div class="modal-review">
               <div class="review-score">
                  ❤️ <strong>${safeValue(
                     product.orderInfo?.reviews ?? 0
                  )}%</strong> Positive reviews
               </div>
               <div class="review-orders">
                  <strong>${safeValue(product.orderInfo?.orders ?? 0)}</strong> orders
               </div>
            </div>

            <p><strong>Color:</strong> ${product.color.join(', ')}</p>
            <p><strong>Operating System:</strong> ${safeValue(product.os)}</p>
            <p><strong>Chip:</strong> ${safeValue(product.chip.name)} (${safeValue(
      product.chip.cores
   )} cores)</p>
            <p><strong>Height:</strong> ${safeValue(product.size?.height)} cm</p>
            <p><strong>Width:</strong> ${safeValue(product.size?.width)} cm</p>
            <p><strong>Depth:</strong> ${safeValue(product.size?.depth)} cm</p>
            <p><strong>Weight:</strong> ${safeValue(product.size?.weight)} kg</p>
            <p><strong>Category:</strong> ${safeValue(product.category)}</p>
         </div>

         <div class="modal-product-right">
            <div class="price">${safeValue(product.price)} $</div>
            <div class="stock ${product.orderInfo.inStock > 0 ? 'in-stock' : 'out-of-stock'}">
               Stock: <strong>${product.orderInfo.inStock}</strong> pcs.
            </div>
            <button class="btn_product" ${product.orderInfo.inStock === 0 ? 'disabled' : ''}>
               Add to cart
            </button>
         </div>
      </div>
   `;
   productModal.show();
});

// Обработчик для добавления товара в корзину
document.addEventListener('click', (e) => {
   // Проверяем, была ли нажата кнопка "Add to cart"
   if (e.target.classList.contains('btn_product')) {
      const productElement = e.target.closest('.product');
      const productId = +productElement.id; // ID товара
      const product = items.find((item) => item.id === productId);

      if (product) {
         addToCart(product);
      }
   }
});

// Функция для добавления товара в корзину
function addToCart(product) {
   const id = product.id;

   // Если товар уже есть в корзине, увеличиваем количество
   if (cart[id]) {
      cart[id]++;
   } else {
      cart[id] = 1; // Если товар еще не в корзине, добавляем его с количеством 1
   }

   updateCartUI(); // Обновляем интерфейс корзины
   console.log(cart); // Для отладки, выводим содержимое корзины в консоль
}

document.addEventListener('click', (e) => {
   // Если клик по кнопке "Add to cart" в модальном окне
   if (e.target.classList.contains('btn_product') && e.target.closest('.modal-product')) {
      const modalProduct = e.target.closest('.modal-product'); // Получаем родительский элемент модального продукта
      const productId = +modalProduct.dataset.id; // Получаем ID товара из data-id
      const product = items.find((item) => item.id === productId);

      if (product) {
         addToCart(product); // Добавляем товар в корзину
         productModal.hide(); // Закрываем модальное окно
      }
   }
});

// Функция для обновления UI корзины
function updateCartUI() {
   const cartItemsContainer = document.querySelector('.cart-items');
   const totalAmountElement = document.querySelector('.cart-summary p:nth-child(1) strong');
   const totalPriceElement = document.querySelector('.cart-summary p:nth-child(2) strong');
   const buyBtn = document.querySelector('.buy-btn');
   const cartCount = document.getElementById('cartCount');

   if (!cartItemsContainer) return; // Проверка на существование контейнера

   cartItemsContainer.innerHTML = ''; // очищаем старые товары

   let total = 0;
   let count = 0;

   // Проходим по всем товарам в корзине и добавляем их в корзину на странице
   for (const id in cart) {
      const product = items.find((item) => item.id === +id);
      const qty = cart[id];
      const price = product.price * qty;

      total += price;
      count += qty;

      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
         <p>${product.name} x${qty}</p>
         <p>${price.toFixed(2)}$</p>
         <button class="remove-btn" data-id="${product.id}">Remove</button>
      `;
      cartItemsContainer.appendChild(cartItem);
   }

   // Обновляем сообщение о пустой корзине
   const emptyText = cartItemsContainer.querySelector('.empty-text');
   if (count === 0) {
      if (!emptyText) {
         // Если элемент пустой, добавляем его
         const emptyTextElement = document.createElement('p');
         emptyTextElement.className = 'empty-text';
         emptyTextElement.textContent = 'Your cart is empty.';
         cartItemsContainer.appendChild(emptyTextElement);
      }
      buyBtn.disabled = true;
   } else {
      buyBtn.disabled = false;
   }

   // Обновляем количество и общую цену
   totalAmountElement.textContent = `${count} pcs.`;
   totalPriceElement.textContent = `${total.toFixed(2)}$`;

   // Обновляем счетчик на иконке корзины
   cartCount.textContent = count;
}

// Обработчик для удаления товара из корзины
document.addEventListener('click', (e) => {
   if (e.target.classList.contains('remove-btn')) {
      const productId = +e.target.dataset.id; // Получаем ID товара из атрибута data-id
      removeFromCart(productId); // Удаляем товар из корзины
   }
});

// Функция для удаления товара из корзины
function removeFromCart(productId) {
   delete cart[productId]; // Удаляем товар из объекта корзины
   updateCartUI(); // Обновляем UI корзины
}

// Корзина
document.getElementById('cartToggle').addEventListener('click', (e) => {
   e.preventDefault();
   const cart = document.getElementById('cartWrapper');
   cart.style.display = cart.style.display === 'none' ? 'block' : 'none';
});

// Поиск и фильтры
let currentSearch = '';

document.querySelector('.search-field').addEventListener('input', (e) => {
   currentSearch = e.target.value.toLowerCase().trim();
   filterProducts();
});

document.querySelectorAll('input').forEach((input) => {
   input.addEventListener('input', filterProducts);
});

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
   if (colors.length > 0) {
      filtered = filtered.filter((item) =>
         item.color.some((c) => colors.includes(c.toLowerCase()))
      );
   }

   const memory = getActiveFilters('.memory-filter').map((mem) => parseInt(mem));
   if (memory.length > 0) {
      filtered = filtered.filter((item) => memory.includes(item.storage));
   }

   const os = getActiveFilters('.os-filter').map((o) => o.toLowerCase());
   if (os.length > 0) {
      filtered = filtered.filter((item) => {
         if (!item.os) return false;
         return os.includes(item.os.toLowerCase());
      });
   }

   const displayFilters = getActiveFilters('.display-filter').map((range) => {
      const [min, max] = range.split('-').map(Number);
      return { min, max };
   });
   if (displayFilters.length > 0) {
      filtered = filtered.filter((item) =>
         displayFilters.some((range) => item.display >= range.min && item.display <= range.max)
      );
   }

   const from = parseFloat(document.querySelector('.input-from').value) || 0;
   const to = parseFloat(document.querySelector('.input-to').value) || Infinity;
   filtered = filtered.filter((item) => item.price >= from && item.price <= to);

   renderProducts(filtered);
}

// Первый рендер товаров
renderProducts(items);
