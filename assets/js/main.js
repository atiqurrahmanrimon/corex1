document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .scale-up, .slide-up, .slide-right');
    animatedElements.forEach(el => observer.observe(el));

    // Navbar color toggle based on section
    const sections = document.querySelectorAll('section');
    const navbar = document.querySelector('.navbar');

    const sectionObserverOptions = {
        root: null,
        rootMargin: '-50px 0px -50px 0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('light-section')) {
                    navbar.classList.add('light-mode');
                } else {
                    navbar.classList.remove('light-mode');
                }
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => sectionObserver.observe(section));
    
    // Trigger animation on load for items in viewport
    setTimeout(() => {
        animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 100);

    // Mobile Menu Link Click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) navLinks.classList.remove('active');
        });
    });
});

// Mobile menu global function
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
}

// --- Shopping Cart Logic ---
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('corex_cart')) || [];
        this.initUI();
        this.updateUI();
    }

    initUI() {
        // Inject Cart Drawer HTML
        if (!document.getElementById('cartDrawer')) {
            const drawerHTML = `
                <div class="cart-overlay" id="cartOverlay" onclick="cart.toggle()"></div>
                <div class="cart-drawer" id="cartDrawer">
                    <div class="cart-header">
                        <h2>Your Cart</h2>
                        <button class="close-cart" onclick="cart.toggle()">&times;</button>
                    </div>
                    <div class="cart-items" id="cartItemsContainer">
                        <!-- Items will be injected here -->
                    </div>
                    <div class="cart-footer">
                        <div class="cart-total">
                            <span>Total</span>
                            <span id="cartTotalValue">0 ৳</span>
                        </div>
                        <a href="order.html?checkout=cart" class="btn-checkout">Checkout</a>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', drawerHTML);
        }

        // Add Cart button to navbar
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !document.getElementById('navCartBtn')) {
            navLinks.insertAdjacentHTML('beforeend', `<li><a href="#" id="navCartBtn" onclick="event.preventDefault(); cart.toggle()">Cart (<span id="cartBadge">0</span>)</a></li>`);
        }
    }

    add(product, price, img, variant = '') {
        const cleanPrice = parseFloat(price.toString().replace(/[^0-9.]/g, ''));
        
        // Check if item exists
        const existingIndex = this.cart.findIndex(item => item.product === product && item.variant === variant);
        
        if (existingIndex > -1) {
            this.cart[existingIndex].qty = (this.cart[existingIndex].qty || 1) + 1;
        } else {
            this.cart.push({ product, price: cleanPrice, img, variant, qty: 1 });
        }
        
        this.save();
        this.updateUI();
        this.toggle(true); // Open drawer
    }

    updateQty(index, delta) {
        if (!this.cart[index]) return;
        
        this.cart[index].qty = (this.cart[index].qty || 1) + delta;
        
        if (this.cart[index].qty <= 0) {
            this.remove(index);
        } else {
            this.save();
            this.updateUI();
        }
    }

    remove(index) {
        this.cart.splice(index, 1);
        this.save();
        this.updateUI();
    }

    save() {
        localStorage.setItem('corex_cart', JSON.stringify(this.cart));
    }

    toggle(forceOpen = false) {
        const drawer = document.getElementById('cartDrawer');
        const overlay = document.getElementById('cartOverlay');
        if (forceOpen || !drawer.classList.contains('open')) {
            drawer.classList.add('open');
            overlay.classList.add('show');
        } else {
            drawer.classList.remove('open');
            overlay.classList.remove('show');
        }
    }

    updateUI() {
        // Update badges
        const totalItems = this.cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        
        const badge = document.getElementById('cartBadge');
        if (badge) badge.innerText = totalItems;
        
        const mobileBadge = document.getElementById('mobileCartCount');
        if (mobileBadge) mobileBadge.innerText = totalItems;

        // Render items
        const container = document.getElementById('cartItemsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        let total = 0;

        if (this.cart.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center; margin-top: 50px;">Your cart is empty.</p>';
        } else {
            this.cart.forEach((item, index) => {
                const itemQty = item.qty || 1;
                total += item.price * itemQty;
                const imgClass = item.variant ? item.variant : '';
                container.innerHTML += `
                    <div class="cart-item">
                        <img src="${item.img}" class="${imgClass}" alt="${item.product}">
                        <div class="cart-item-details">
                            <h4>${item.product}</h4>
                            <p>${item.price.toLocaleString()} ৳</p>
                            <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                                <div style="display: flex; align-items: center; background: #333; border-radius: 6px; overflow: hidden;">
                                    <button onclick="cart.updateQty(${index}, -1)" style="background: none; border: none; color: #fff; padding: 2px 10px; cursor: pointer; font-size: 1.2rem;">-</button>
                                    <span style="padding: 0 10px; font-size: 0.9rem;">${itemQty}</span>
                                    <button onclick="cart.updateQty(${index}, 1)" style="background: none; border: none; color: #fff; padding: 2px 10px; cursor: pointer; font-size: 1.2rem;">+</button>
                                </div>
                                <button class="remove-item" onclick="cart.remove(${index})" style="margin: 0;">Remove</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        // Update total
        const totalValue = document.getElementById('cartTotalValue');
        if (totalValue) totalValue.innerText = total.toLocaleString() + ' ৳';
    }
}

// Initialize globally so inline onclick handlers can access it
let cart;
document.addEventListener('DOMContentLoaded', () => {
    cart = new CartManager();
});

// Dynamic Catalog Rendering
// Usage: renderCatalog(containerId)                  → all products
//        renderCatalog(containerId, ['key1','key2']) → specific keys
//        renderCatalog(containerId, null, 'lamp')    → filter by category
window.renderCatalog = function(containerId, productKeys = null, category = null) {
    const container = document.getElementById(containerId);
    if (!container || typeof productDatabase === 'undefined') return;

    container.innerHTML = '';

    let keysToRender;
    if (productKeys) {
        keysToRender = productKeys;
    } else if (category) {
        keysToRender = Object.keys(productDatabase).filter(k =>
            productDatabase[k].category === category
        );
    } else {
        keysToRender = Object.keys(productDatabase);
    }

    if (keysToRender.length === 0) {
        container.innerHTML = '<p style="color:#555; text-align:center; padding: 40px; grid-column:1/-1;">No products in this category yet.</p>';
        return;
    }

    keysToRender.forEach((key, index) => {
        const prod = productDatabase[key];
        if (!prod) return;

        const delay = (index % 4) * 0.1;
        const item = document.createElement('div');
        item.className = 'catalog-item fade-in visible';
        item.style.transitionDelay = delay + 's';

        const variantParam = prod.variant ? '&variant=' + prod.variant : '';
        const variantClass = prod.variant ? 'class="' + prod.variant + '"' : '';
        const safeName = encodeURIComponent(prod.name);

        const shortDesc = prod.desc.length > 60 ? prod.desc.substring(0, 57) + '...' : prod.desc;

        item.innerHTML = `
            <a href="product.html?id=${key}" style="text-decoration: none;">
                <img src="${prod.img}" ${variantClass} alt="${prod.name}">
                <h3>${prod.name}</h3>
            </a>
            <p>${shortDesc}</p>
            <div class="catalog-price">${prod.price.toLocaleString()} ৳</div>
            <div class="catalog-buttons">
                <button class="catalog-add-cart" onclick="cart.add('${prod.name.replace(/'/g, "\\'")}', ${prod.price}, '${prod.img}', '${prod.variant || ''}')">Add to Cart</button>
                <a href="order.html?product=${safeName}&price=${prod.price}&img=${prod.img}${variantParam}" class="catalog-buy">Buy Now</a>
            </div>
        `;
        container.appendChild(item);
    });
};

