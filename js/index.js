import { items } from './items.js';

const content = document.getElementById('page_content');

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

// Активируем аккордеоны
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
   if (!target) return;

   const id = +target.id;
   const product = items.find((item) => item.id === id);
   if (!product) return;

   // Функция для безопасного вывода значений
   const safeValue = (value, defaultValue = 'N/A') => (value || value === 0 ? value : defaultValue);

   // Получаем категорию товара, если она есть
   const categoryContent = product.category ? product.category : 'No category';

   // Заполняем тело модального окна
   modalBody.innerHTML = `
<div class="modal-product">
  <!-- Левая часть: картинка -->
  <img src="img/${product.imgUrl}" class="modal-product-img" alt="${product.name}">

  <!-- Центральная часть: информация о товаре -->
  <div class="modal-product-details">
    <h3 class="name">${safeValue(product.name)}</h3>
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

  <!-- Правая часть: цена, количество товара и кнопка -->
  <div class="modal-product-right">
    <div class="price">${safeValue(product.price)} $</div>
    <div class="stock ${product.orderInfo.inStock > 0 ? 'in-stock' : 'out-of-stock'}">
      ${product.orderInfo.inStock} left in stock
    </div>
    <button class="btn_product" ${product.orderInfo.inStock === 0 ? 'disabled' : ''}>
      Add to cart
    </button>
  </div>
</div>
`;

   productModal.show();
});

// Глобальное хранилище строки поиска
let currentSearch = '';

// Обработчик поиска
document.querySelector('.search-field').addEventListener('input', (e) => {
   currentSearch = e.target.value.toLowerCase().trim();
   filterProducts();
});

// Обработчики событий для всех чекбоксов и инпутов
document.querySelectorAll('input').forEach((input) => {
   input.addEventListener('input', filterProducts);
});

// Функция для получения активных фильтров
function getActiveFilters(selector) {
   return Array.from(document.querySelectorAll(`${selector}:checked`)).map((el) =>
      el.id.toLowerCase()
   );
}
function filterProducts() {
   let filtered = [...items];

   // Фильтрация по имени
   if (currentSearch) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(currentSearch));
   }

   // Фильтрация по цвету
   const colors = getActiveFilters('.color-filter');
   if (colors.length > 0) {
      filtered = filtered.filter((item) =>
         item.color.some((c) => colors.includes(c.toLowerCase()))
      );
   }

   // Фильтрация по памяти (storage)
   const memory = getActiveFilters('.memory-filter').map((mem) => parseInt(mem));
   if (memory.length > 0) {
      filtered = filtered.filter((item) => memory.includes(item.storage));
   }

   // Фильтрация по ОС
   const os = getActiveFilters('.os-filter').map((o) => o.toLowerCase());
   if (os.length > 0) {
      filtered = filtered.filter((item) => {
         if (!item.os) return false; // Отфильтровываем товары без ОС
         const itemOs = item.os.toLowerCase();
         return os.includes(itemOs);
      });
   }

   // Фильтрация по дисплею
   const displayFilters = getActiveFilters('.display-filter').map((range) => {
      const [min, max] = range.split('-').map(Number);
      return { min, max };
   });
   if (displayFilters.length > 0) {
      filtered = filtered.filter((item) =>
         displayFilters.some((range) => item.display >= range.min && item.display <= range.max)
      );
   }

   // Фильтрация по цене
   const from = parseFloat(document.querySelector('.input-from').value) || 0;
   const to = parseFloat(document.querySelector('.input-to').value) || Infinity;
   filtered = filtered.filter((item) => item.price >= from && item.price <= to);

   // Отображаем отфильтрованные товары
   renderProducts(filtered);
}

// Первоначальный рендер
renderProducts(items);
