
const menuList = document.getElementById('draggable-menu');
const contentDropdownCategories = document.querySelector('.dropdown-categories_content')
const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-menu');

// Variables de Estado del Menú
let activeCategory = 'todos';
let menuData = null;
const categoriesList = ['todos', 'pizzas', 'hamburguesas', 'pastas', 'postres'];
let lastCategoryIndex = categoriesList.indexOf(activeCategory);

// Referencias del Modal de Producto
const productModal = document.getElementById('product-modal');
const modalContent = document.getElementById('modal-content');
const closeModalButton = document.getElementById('close-modal-button');
const modalImageContainer = document.getElementById('modal-image-container');
const modalName = document.getElementById('modal-name');
const modalPrice = document.getElementById('modal-price');
const modalLikeButtonOriginal = document.getElementById('modal-like-button');
const modalLikeIcon = document.getElementById('modal-like-icon');
const modalRating = document.getElementById('modal-rating');
const modalTime = document.getElementById('modal-time');
const modalIngredientsCount = document.getElementById('modal-ingredients-count');
const modalDescription = document.getElementById('modal-description');
const modalIngredientsList = document.getElementById('modal-ingredients-list');
const modalOrderButton = document.getElementById('modal-order-button');

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        
        // Mostrar Loader si hay búsqueda activa
        if (args[0] && args[0].length > 0) {
            productsContainer.innerHTML = '<div class="text-center p-8 text-xl text-gray-500 col-span-3">Buscando... 🔎</div>';
        }
        
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

function getLikes() {
    const likes = localStorage.getItem('dishLikes');
    return likes ? JSON.parse(likes) : {};
}

function saveLikes(likes) {
    localStorage.setItem('dishLikes', JSON.stringify(likes));
}

function toggleLike(dishName) {
    const likes = getLikes();
    const isLiked = likes[dishName];

    if (isLiked) {
        delete likes[dishName];
    } else {
        likes[dishName] = true;
    }
    saveLikes(likes);
    return !isLiked;
}

function createProductCard(product) {
    const likes = getLikes();
    const isLiked = likes[product.nombre];
    const heartClass = isLiked ? 'fa-solid text-red-500' : 'fa-regular text-gray-700 hover:text-red-500';

    // <img src="${product.imagen}" alt="${product.nombre}" class="rounded-xl w-auto aspect-square">
    return `
        <div class="border-b-1 border-gray-400 grid grid-cols-[30%_1fr] lg:grid-cols-auto gap-y-4 gap-x-5 items-center p-4">
            <div class="rounded-xl w-auto aspect-square overflow-hidden">
                <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-full object-cover object-center">
            </div>
            <div>
                <div class="grid grid-cols-[1fr_max-content] gap-x-3 items-center">
                    <p class="text-lg font-bold truncate">${product.nombre}</p>
                    <button type="button" 
                        class="like-button cursor-pointer text-md p-1 rounded-full hover:bg-gray-200 !w-max !h-max flex justify-center items-center"
                        data-dish-name="${product.nombre}"> 
                        <i class="${heartClass} fa-heart"></i>
                    </button>
                </div>
                <span class="text-md text-gray-700">${product.precio}</span>
                <p class="text-sm text-gray-500 mt-1 mb-2 line-clamp-2">${product.descripcion}</p>
                <button type="button" class="lg:w-full text-center view-button cursor-pointer text-md text-amber-500 px-4 py-1 rounded-full border-1 border-amber-500 hover:bg-amber-500 hover:text-white" data-dish-name="${product.nombre}">Ver</button>
            </div>
        </div>
    `;
}

function attachLikeListeners() {
    productsContainer.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', () => {
            const dishName = button.getAttribute('data-dish-name');
            const icon = button.querySelector('i');
            const isNowLiked = toggleLike(dishName);

            if (isNowLiked) {
                icon.classList.remove('fa-regular', 'text-gray-700', 'hover:text-red-500');
                icon.classList.add('fa-solid', 'text-red-500');
            } else {
                icon.classList.remove('fa-solid', 'text-red-500');
                icon.classList.add('fa-regular', 'text-gray-700', 'hover:text-red-500');
            }
        });
    });
}

function attachViewListeners() {
    productsContainer.querySelectorAll('.view-button').forEach(button => {
        button.addEventListener('click', () => {
            const dishName = button.getAttribute('data-dish-name');
            // Buscar el producto completo en los datos
            const product = menuData.productos.find(p => p.nombre === dishName);
            
            if (product) {
                showProductDetails(product);
            }
        });
    });
}

function updateCategoryStyles(newCategory) {
    menuList.querySelectorAll('button').forEach(btn => {
        btn.className = 'cursor-pointer px-5 py-1 border-b-2 text-gray-400 border-gray-400';
    });

    const activeBtn = menuList.querySelector(`[data-category="${newCategory}"]`);
    if (activeBtn) {
        activeBtn.className = 'cursor-pointer px-5 py-1 border-b-2 text-amber-500 border-amber-500';
        document.getElementById('dropdown-categories_btn').textContent = newCategory;
    }
}

function renderProducts(newCategory, skipTransition = false) {
    if (!menuData) return;

    // 1. Lógica de Filtrado
    const filteredProducts = newCategory === 'todos' 
        ? menuData.productos 
        : menuData.productos.filter(p => p.categoria === newCategory);

    const isInitialRender = productsContainer.innerHTML === '';
    
    // Renderizado instantáneo (búsqueda, like en modal, o inicial)
    if (skipTransition || isInitialRender) {
        productsContainer.style.transition = 'none';
        productsContainer.style.opacity = 1;
        productsContainer.style.transform = 'translateX(0)';

        productsContainer.innerHTML = filteredProducts.map(createProductCard).join('');
        attachLikeListeners();
        attachViewListeners();
        return;
    }

    const newCategoryIndex = categoriesList.indexOf(newCategory);
    const direction = (newCategoryIndex > lastCategoryIndex) ? 1 : -1;
    lastCategoryIndex = newCategoryIndex;
    
    productsContainer.style.transition = 'opacity 200ms ease-out, transform 200ms ease-out';
    productsContainer.style.opacity = 0;
    productsContainer.style.transform = `translateX(${-direction * 50}px)`;

    setTimeout(() => { 
        productsContainer.innerHTML = filteredProducts.map(createProductCard).join('');
        attachLikeListeners();
        attachViewListeners();

        // Transición de Entrada (Mostrar)
        productsContainer.style.transition = 'none';
        productsContainer.style.opacity = 0;
        productsContainer.style.transform = `translateX(${direction * 100}%)`;

        // Forzar un repaint
        productsContainer.offsetHeight;

        productsContainer.style.transition = 'opacity 250ms ease-out 50ms, transform 250ms ease-out 50ms';
        productsContainer.style.opacity = 1;
        productsContainer.style.transform = 'translateX(0)';

    }, 100); 
}


function renderCategories() {
    if (!menuData) return;

    let categoriesHTML = '';
    let dropdownCategoriesHTML = '';
    
    menuData.categorias.forEach(category => {
        const isActive = category.clase === activeCategory;
        const textColor = isActive ? 'text-amber-500' : 'text-gray-400';
        const borderColor = isActive ? 'border-amber-500' : 'border-gray-400';
        
        categoriesHTML += `
            <li>
                <button type="button" 
                    class="cursor-pointer px-5 py-1 border-b-2 ${textColor} ${borderColor} item-mobile"
                    data-category="${category.clase}">
                    ${category.nombre}
                </button>
            </li>
        `;

        dropdownCategoriesHTML += `
            <li>
                <button type="button" data-category="${category.clase}" class="cursor-pointer px-3 py-1 hover:bg-gray-100">
                    ${category.nombre}
                </button>
            </li>
        `;
    });

    menuList.innerHTML = categoriesHTML;
    contentDropdownCategories.innerHTML = dropdownCategoriesHTML;
    const containers = [menuList, contentDropdownCategories];

    containers.forEach(container => {
        container.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                if (e.target.className.includes('item-mobile')) document.querySelector('section.menu').scrollIntoView();

                const newCategory = e.target.getAttribute('data-category');
                
                if (activeCategory === newCategory) return;
                
                searchInput.value = ''; 

                activeCategory = newCategory;
                updateCategoryStyles(newCategory);
                
                renderProducts(newCategory);
            });
        });
    })
}

function filterProductsBySearch(searchTerm) {
    if (!menuData) return;

    const term = searchTerm.toLowerCase().trim();

    if (term.length === 0) {
        renderProducts('todos', true); 
        return;
    }
    
    const filteredProducts = menuData.productos.filter(p => 
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term)
    );

    if (filteredProducts.length > 0) {
        productsContainer.innerHTML = filteredProducts.map(createProductCard).join('');
        attachLikeListeners();
        attachViewListeners();
    } else {
        productsContainer.innerHTML = `<div class="text-center p-8 text-lg text-gray-500 col-span-3">No se encontraron resultados para "${searchTerm}".</div>`;
    }
    
    productsContainer.style.transition = 'none';
    productsContainer.style.opacity = 1;
    productsContainer.style.transform = 'translateX(0)';
}

const debouncedFilter = debounce(filterProductsBySearch, 300);

if (closeModalButton) {
    closeModalButton.addEventListener('click', () => {
        productModal.classList.add('opacity-0');
        modalImageContainer.classList.add('opacity-0');
        modalContent.classList.add('translate-y-[200px]');
        modalContent.classList.remove('translate-y-[-20px]'); 
        document.documentElement.style.overflow = 'auto';
        
        setTimeout(() => {
            productModal.classList.add('pointer-events-none');
        }, 550);
    });
}

function showProductDetails(product) {
    modalImageContainer.style.backgroundImage = `url('${product.imagen}')`;
    modalName.textContent = product.nombre;
    modalPrice.textContent = `${product.precio}`;
    modalRating.textContent = product.rating || 'N/A';
    modalTime.textContent = product.tiempo_preparacion || '20 min';
    modalDescription.textContent = product.descripcion;
    
    const ingredientsArray = product.ingredientes || [];
    modalIngredientsCount.textContent = `${ingredientsArray.length} Ingr`;

    modalIngredientsList.innerHTML = ingredientsArray.map(ing => `
        <li class="flex items-center gap-x-2">
            <i class="fa-solid fa-circle text-[4px]"></i> 
            <span>${ing}</span>
        </li>
    `).join('');
    
    const likes = getLikes();
    const isLiked = likes[product.nombre];

    let currentLikeButton = document.getElementById('modal-like-button');

    let iconElement = currentLikeButton.querySelector('i'); 
    iconElement.className = isLiked 
        ? 'fa-solid fa-heart text-red-500' 
        : 'fa-regular fa-heart text-gray-700';

    if (currentLikeButton && currentLikeButton.parentNode) {
        const newLikeButton = currentLikeButton.cloneNode(true);
        currentLikeButton.parentNode.replaceChild(newLikeButton, currentLikeButton);
        
        currentLikeButton = newLikeButton; 
        iconElement = currentLikeButton.querySelector('i'); 
    }

    if (currentLikeButton) {
        currentLikeButton.addEventListener('click', () => {
            const isNowLiked = toggleLike(product.nombre);
            
            iconElement.className = isNowLiked 
                ? 'fa-solid fa-heart text-red-500' 
                : 'fa-regular fa-heart text-gray-700';

            renderProducts(activeCategory, true); 
        });
    }

    const phoneNumber = '584129219793';
    const message = `Hola! 👋 Vi su menú web. Estoy interesado en pedir: *${product.nombre}*. ¿Me toman el pedido?`;
    const whatsappMessage = encodeURIComponent(message);
    modalOrderButton.href = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

    productModal.classList.remove('opacity-0', 'pointer-events-none');
    modalImageContainer.classList.remove('opacity-0');
    modalContent.classList.remove('translate-y-[200px]');
    modalContent.classList.add('translate-y-[-20px]');
    document.documentElement.style.overflow = 'hidden';
}

function fetchMenuData() {
    productsContainer.innerHTML = '<div class="text-center p-8 text-xl text-gray-500 col-span-3">Cargando menú... ⏳</div>';
    menuList.innerHTML = '';

    return new Promise(resolve => {
        setTimeout(() => {
            fetch('menu.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error de red al cargar el JSON.');
                    }
                    return response.json();
                })
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    console.error('Error de carga:', error);
                    productsContainer.innerHTML = '<div class="text-center p-8 text-xl text-red-600 col-span-3">Error al cargar los datos.</div>';
                    resolve(null);
                });
        }, 150);
    });
}

fetchMenuData().then(data => {
    if (data) {
        menuData = data;
        
        renderCategories(); 
        renderProducts(activeCategory, true);
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            
            activeCategory = 'todos';
            updateCategoryStyles('todos');
            
            debouncedFilter(searchTerm);
        });
    }
});