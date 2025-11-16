// ========== MENÚ HAMBURGUESA ==========

// Obtener elementos
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Función del menú móvil
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animación del icono hamburguesa
        const spans = hamburger.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Cerrar menú al hacer clic en un enlace
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        
        // Resetear icono hamburguesa
        if (hamburger) {
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});

// SCROLL SUAVE Y NAVBAR ACTIVO 

// Cambiar estilo del navbar al hacer scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }
    }
});

// SISTEMA DE CARRITO DE COMPRAS 

// Array para almacenar los productos del carrito (en memoria)
let cart = [];

/**
 * Función para agregar productos al carrito
 * @param {string} productName - Nombre del producto
 * @param {number} price - Precio del producto
 */

function addToCart(productName, price) {
    // Crear objeto del producto
    const product = {
        id: Date.now(), // ID único basado en timestamp
        name: productName,
        price: price,
        quantity: 1
    };
    
    // Verificar si el producto ya existe en el carrito
    const existingProduct = cart.find(item => item.name === productName);
    
    if (existingProduct) {
        // Si existe, incrementar cantidad
        existingProduct.quantity += 1;
        showNotification(`Se agregó otro ${productName} al carrito (${existingProduct.quantity} unidades)`);
    } else {
        // Si no existe, agregarlo al carrito
        cart.push(product);
        showNotification(`¡${productName} agregado al carrito! 🌶️`);
    }
    
    // Actualizar contador del carrito (si existe en el HTML)
    updateCartCount();
    
    // Guardar carrito en localStorage (persistencia básica)
    saveCart();
    
    // Log para debugging
    console.log('Carrito actual:', cart);
}

/**
 * Función para mostrar notificaciones flotantes
 * @param {string} message - Mensaje a mostrar
 */
function showNotification(message) {
    const notification = document.getElementById('cartNotification');
    const messageElement = document.getElementById('cartMessage');
    
    if (notification && messageElement) {
        // Establecer el mensaje
        messageElement.textContent = message;
        
        // Mostrar notificación
        notification.classList.add('show');
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

/**
 * Función para actualizar el contador del carrito en la UI
 */
function updateCartCount() {
    // Calcular total de productos
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Log del total
    console.log('Total de productos en carrito:', totalItems);
    
    // Actualizar TODOS los badges del carrito 
    const badges = document.querySelectorAll('.cart-badge, #cartBadge, #cartBadgeNav');
    badges.forEach(badge => {
        if (badge) {
            badge.textContent = totalItems;
            // Si hay productos, ponerlo visible
            if (totalItems > 0) {
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    });
}

/**
 * Función para guardar el carrito en localStorage
 */
function saveCart() {
    localStorage.setItem('chilixCart', JSON.stringify(cart));
    console.log('Carrito guardado en localStorage');
}

/**
 * Función para cargar el carrito desde localStorage
 */
function loadCart() {
    const savedCart = localStorage.getItem('chilixCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
        console.log('Carrito cargado:', cart);
    }
}

/**
 * Función para vaciar el carrito
 */
function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
    showNotification('Carrito vaciado');
}

/**
 * Función para calcular el total del carrito
 * @returns {number} Total en pesos
 */
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Función para simular el proceso de checkout
 */
function checkout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío');
        return;
    }
    
    const total = getCartTotal();
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Simular proceso de compra
    const confirmed = confirm(
        `¿Confirmar compra?\n\n` +
        `Productos: ${itemCount}\n` +
        `Total: $${total} MXN\n\n` +
        `(Esta es una simulación)`
    );
    
    if (confirmed) {
        showNotification('¡Compra realizada con éxito! 🎉');
        clearCart();
    }
}

//  ANIMACIONES AL HACER SCROLL 

/**
 * Observador de intersección para animar elementos al aparecer
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar todas las cards
document.addEventListener('DOMContentLoaded', () => {
    // Cargar carrito guardado PRIMERO
    loadCart();
    
    // Actualizar enlace de usuario si existe la función
    if (typeof updateUserLink === 'function') {
        updateUserLink();
    }
    
    // Animar elementos al aparecer
    const cards = document.querySelectorAll('.about-card, .product-card, .policy-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

//  EFECTOS VISUALES ADICIONALES

/**
 * Efecto parallax suave en el hero
 */
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

/**
 * Efecto hover en botones de compra
 */
document.querySelectorAll('.btn-buy').forEach(button => {
    button.addEventListener('mouseenter', (e) => {
        e.target.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', (e) => {
        e.target.style.transform = 'scale(1)';
    });
});

// FUNCIONES AUXILIARES 

/**
 * Función para obtener información del carrito
 * @returns {Object} Información completa del carrito
 */
function getCartInfo() {
    return {
        items: cart,
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        total: getCartTotal()
    };
}

/**
 * Función para imprimir el carrito en consola (debugging)
 */
function printCart() {
    console.log('=== CARRITO DE COMPRAS ===');
    console.table(cart);
    console.log('Total:', getCartTotal(), 'MXN');
    console.log('===========================');
}

//  EXPOSICIÓN DE FUNCIONES GLOBALES 
// Estas funciones estarán disponibles en la consola del navegador
window.chilixCart = {
    add: addToCart,
    clear: clearCart,
    checkout: checkout,
    info: getCartInfo,
    print: printCart
};

// Log de bienvenida
console.log(' ChiliX Cargado!', 'color: #FF2E2E; font-size: 20px; font-weight: bold;');
console.log('Prueba las funciones del carrito con: window.chilixCart');

// Easter egg: Combo especial con teclas
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        showNotification('¡Código secreto activado!  Descuento especial aplicado');
        console.log('🎉 ¡Descubriste el código Konami! Aquí está tu descuento especial');
    }
});