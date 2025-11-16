/* 
   FUNCIONALIDAD DEL CARRITO CON PERSONALIZACIÓN
   
*/

// Verificar si el usuario está logueado w
function isUserLoggedIn() {
    const user = localStorage.getItem('chilixUser');
    return user !== null;
}

// Obtener datos del usuario
function getCurrentUser() {
    const userStr = localStorage.getItem('chilixUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Actualizar enlace de usuario en navbar
function updateUserLink() {
    const userLink = document.getElementById('userLink');
    if (userLink) {
        if (isUserLoggedIn()) {
            const user = getCurrentUser();
            // Mostrar solo el nombre si existe
            const nombreCorto = user.nombre ? user.nombre.split(' ')[0] : 'Usuario';
            userLink.textContent = `👤 ${nombreCorto}`;
            userLink.href = '#';
            userLink.onclick = (e) => {
                e.preventDefault();
                if (confirm('¿Cerrar sesión?')) {
                    localStorage.removeItem('chilixUser');
                    window.location.href = 'index.html';
                }
            };
        } else {
            userLink.textContent = '👤 Iniciar sesión';
            userLink.href = 'login.html';
        }
    }
}

// Renderizar carrito
function renderCart() {
    const container = document.getElementById('cartContainer');
    
    // Si no existe el contenedor, no hacer nada (no estamos en la página del carrito)
    if (!container) {
        return;
    }
    
    // Cargar el carrito desde localStorage
    const cart = JSON.parse(localStorage.getItem('chilixCart') || '[]');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart" style="grid-column: 1 / -1;">
                <div class="empty-cart-icon">🛒</div>
                <h2>Tu carrito está vacío</h2>
                <p>¡Agrega algunos deliciosos snacks enchilados!</p>
                <a href="index.html#productos" class="continue-shopping">Ver productos</a>
            </div>
        `;
        return;
    }

    // Calcular totales
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const envio = 0; // Envío gratis en el CECyT 8
    const extrasTotal = calculateExtras(cart);
    const total = subtotal + envio + extrasTotal;

    // Renderizar items con personalización
    const itemsHTML = cart.map((item, index) => {
        const customizations = item.customizations || {};
        const hasCustomizations = Object.keys(customizations).length > 0;

        let customSummary = '';
        if (hasCustomizations) {
            const extras = [];
            if (customizations.chamoy) extras.push('Chamoy');
            if (customizations.miguelito) extras.push('Miguelito');
            if (customizations.limon) extras.push('Limón extra');
            if (customizations.sinSal) extras.push('Sin sal');

            const extrasText = extras.length > 0 ? extras.join(', ') : '';
            const commentsText = customizations.comments ? `Notas: "${customizations.comments}"` : '';

            if (extrasText || commentsText) {
                customSummary = `
                    <div class="customization-summary">
                        <strong>🎨 Personalización:</strong><br>
                        ${extrasText ? `${extrasText}<br>` : ''}
                        ${commentsText ? commentsText : ''}
                    </div>
                `;
            }
        }

        return `
            <div class="cart-item" id="item-${index}">
                <div class="item-header">
                    <div class="item-image">🌶️</div> <!-- íconos sacados de EmojiTerra -->
                    <div class="item-info">
                        <h3>${item.name}</h3>
                        <p style="color: var(--color-gray-light); font-size: 0.9rem;">
                            Precio unitario: $${item.price} MXN
                        </p>
                    </div>
                    <div class="item-price">$${item.price * item.quantity}</div>
                </div>
                
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    
                    <button class="customize-btn" onclick="toggleCustomization(${index})">
                         Personalizar
                    </button>
                    
                    <button class="remove-btn" onclick="removeItem(${index})">
                         Eliminar
                    </button>
                </div>
                
                ${customSummary}
                
                <div class="customization-panel" id="custom-${index}">
                    <h4>🎨 Personaliza tu ${item.name}</h4>
                    
                    <div class="custom-options">
                        <div class="custom-option">
                            <input type="checkbox" id="chamoy-${index}" 
                                ${customizations.chamoy ? 'checked' : ''}
                                onchange="updateCustomization(${index}, 'chamoy', this.checked)">
                            <label for="chamoy-${index}">
                                🍬 Agregar Chamoy (+$5)
                            </label>
                        </div>
                        
                        <div class="custom-option">
                            <input type="checkbox" id="miguelito-${index}"
                                ${customizations.miguelito ? 'checked' : ''}
                                onchange="updateCustomization(${index}, 'miguelito', this.checked)">
                            <label for="miguelito-${index}">
                                🌶️ Agregar Miguelito (+$5)
                            </label>
                        </div>
                        
                        <div class="custom-option">
                            <input type="checkbox" id="limon-${index}"
                                ${customizations.limon ? 'checked' : ''}
                                onchange="updateCustomization(${index}, 'limon', this.checked)">
                            <label for="limon-${index}">
                                🍋 Limón extra (Gratis)
                            </label>
                        </div>
                        
                        <div class="custom-option">
                            <input type="checkbox" id="sinSal-${index}"
                                ${customizations.sinSal ? 'checked' : ''}
                                onchange="updateCustomization(${index}, 'sinSal', this.checked)">
                            <label for="sinSal-${index}">
                                🧂 Sin sal (Gratis)
                            </label>
                        </div>
                        
                        <div style="margin-top: 1rem;">
                            <label style="color: var(--color-white); display: block; margin-bottom: 0.5rem;">
                                💬 Comentarios especiales:
                            </label>
                            <textarea 
                                class="custom-textarea" 
                                id="comments-${index}"
                                placeholder="Ej: Sin picante, más limón, etc."
                                onchange="updateCustomization(${index}, 'comments', this.value)"
                            >${customizations.comments || ''}</textarea>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Verificar si está logueado
    const isLoggedIn = isUserLoggedIn();
    const loginSection = !isLoggedIn ? `
        <div class="login-required">
            <p>⚠️ <strong>Necesitas iniciar sesión para completar tu compra</strong></p>
            <p>Crea una cuenta o inicia sesión para generar tu ticket y hacer seguimiento de tu pedido</p>
            <a href="login.html" class="login-btn">Iniciar sesión / Registrarse</a>
        </div>
    ` : '';

    // Renderizar resumen
    container.innerHTML = `
        <div class="cart-items">
            ${itemsHTML}
        </div>
        <div class="cart-summary">
            <h2 class="summary-title">Resumen del pedido</h2>
            
            <div class="summary-row">
                <span>Subtotal:</span>
                <span class="price">$${subtotal} MXN</span>
            </div>
            
            <div class="summary-row">
                <span>Extras:</span>
                <span class="price">$${extrasTotal} MXN</span>
            </div>
            
            <div class="summary-row">
                <span>Envío:</span>
                <span class="price">GRATIS</span>
            </div>
            
            <div class="delivery-info">
                <p>📍 <strong>Entrega en el CECyT 8</strong></p>
                <p>Recoge tu pedido en el punto de venta</p>
                <p>Horario: Lunes a Viernes, 10:00 - 16:00</p>
            </div>
            
            <div class="summary-row total">
                <span>Total:</span>
                <span class="price">$${total} MXN</span>
            </div>
            
            ${loginSection}
            
            <button class="checkout-btn" onclick="checkout()" ${!isLoggedIn ? 'disabled' : ''}>
                ${isLoggedIn ? 'Generar ticket y confirmar' : 'Inicia sesión para continuar'}
            </button>
            
            <a href="index.html#productos" style="display: block; text-align: center; margin-top: 1rem; color: var(--color-gray-light); text-decoration: none;">
                ← Seguir comprando
            </a>
        </div>
    `;
}

// Calcular extras
function calculateExtras(cart) {
    let total = 0;
    cart.forEach(item => {
        const custom = item.customizations || {};
        if (custom.chamoy) total += 5 * item.quantity;
        if (custom.miguelito) total += 5 * item.quantity;
    });
    return total;
}

// Toggle panel de personalización
function toggleCustomization(index) {
    const panel = document.getElementById(`custom-${index}`);
    if (panel) {
        panel.classList.toggle('active');
    }
}

// Actualizar personalización
function updateCustomization(index, key, value) {
    const cart = JSON.parse(localStorage.getItem('chilixCart') || '[]');

    if (!cart[index].customizations) {
        cart[index].customizations = {};
    }

    cart[index].customizations[key] = value;

    localStorage.setItem('chilixCart', JSON.stringify(cart));
    renderCart();
    
    // Mostrar notificación si existe la función
    if (typeof showNotification === 'function') {
        showNotification('Personalización actualizada ✅');
    }
}

// Actualizar cantidad
function updateQuantity(index, change) {
    const cart = JSON.parse(localStorage.getItem('chilixCart') || '[]');
    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem('chilixCart', JSON.stringify(cart));
    renderCart();
    
    // Actualizar contador si existe la función
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
}

// Eliminar item
function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('chilixCart') || '[]');
    const itemName = cart[index].name;

    if (confirm(`¿Eliminar ${itemName} del carrito?`)) {
        cart.splice(index, 1);
        localStorage.setItem('chilixCart', JSON.stringify(cart));
        renderCart();
        
        // Actualizar contador si existe la función
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
        
        // Mostrar notificación si existe la función
        if (typeof showNotification === 'function') {
            showNotification(`${itemName} eliminado del carrito`);
        }
    }
}

// Checkout y generar ticket
async function checkout() {
    if (!isUserLoggedIn()) {
        alert('Por favor inicia sesión para continuar');
        window.location.href = 'login.html';
        return;
    }

    const cart = JSON.parse(localStorage.getItem('chilixCart') || '[]');
    if (cart.length === 0) return;

    const user = getCurrentUser();

    // Calcular los totales
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const extras = calculateExtras(cart);
    const total = subtotal + extras;

    try {
        // Preparar items para el backend
        const items = cart.map(item => ({
            producto_id: getProductIdByName(item.name),
            cantidad: item.quantity,
            precio_unitario: item.price,
            personalizaciones: item.customizations || {}
        }));

        const response = await fetch('http://localhost:3000/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: parseInt(user.id),
                items: items,
                notas: 'Pedido desde la web'
            })
        });

        const data = await response.json();

        if (data.success) {
            // Generar ticket con los datos reales del backend
            generateTicket({
                user,
                cart,
                subtotal,
                extras,
                total,
                orderNumber: data.data.numero_orden,
                date: new Date().toLocaleString('es-MX'),
                pedido_id: data.data.pedido_id
            });

            // Limpiar carrito después de un momento
            setTimeout(() => {
                localStorage.setItem('chilixCart', JSON.stringify([]));
                // La recarga se hace desde generateTicket
            }, 2000);
        } else {
            alert('Error al crear pedido: ' + data.error);
        }

    } catch (error) {
        console.error('Error durante el checkout:', error);
        // Si falla el backend, generar ticket de todas formas (modo simulación)
        alert('⚠️ Backend no disponible. Generando ticket en modo simulación...');
        
        generateTicket({
            user,
            cart,
            subtotal,
            extras,
            total,
            orderNumber: 'SIM-' + Date.now(),
            date: new Date().toLocaleString('es-MX'),
            pedido_id: 'simulacion'
        });
        
        setTimeout(() => {
            localStorage.setItem('chilixCart', JSON.stringify([]));
        }, 2000);
    }
}

// Helper para obtener ID del producto por nombre
function getProductIdByName(name) {
    const ids = {
        'ChiliX Snacks': 1,
        'ChiliX Mix': 2,
        'ChiliX Box': 3
    };
    return ids[name] || 1;
}

// Generar ticket de compra
function generateTicket(data) {
    const ticketWindow = window.open('', '_blank', 'width=400,height=700');

    // Crear detalles del ticket
    let itemsList = '';
    data.cart.forEach(item => {
        const custom = item.customizations || {};
        const extras = [];
        if (custom.chamoy) extras.push('Chamoy');
        if (custom.miguelito) extras.push('Miguelito');
        if (custom.limon) extras.push('Limón+');
        if (custom.sinSal) extras.push('Sin sal');

        const customText = extras.length > 0 ? `<br><small style="color: #888;">+ ${extras.join(', ')}</small>` : '';
        const commentsText = custom.comments ? `<br><small style="color: #888;">Nota: ${custom.comments}</small>` : '';

        itemsList += `
            <tr>
                <td style="padding: 8px; border-bottom: 1px dashed #ddd;">
                    ${item.name} x${item.quantity}
                    ${customText}
                    ${commentsText}
                </td>
                <td style="padding: 8px; border-bottom: 1px dashed #ddd; text-align: right;">
                    $${item.price * item.quantity}
                </td>
            </tr>
        `;
    });

    if (data.extras > 0) {
        itemsList += `
            <tr>
                <td style="padding: 8px; border-bottom: 1px dashed #ddd;">Extras personalizados</td>
                <td style="padding: 8px; border-bottom: 1px dashed #ddd; text-align: right;">$${data.extras}</td>
            </tr>
        `;
    }

    const ticketHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ticket - ChiliX #${data.orderNumber}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Courier New', monospace;
                    padding: 20px;
                    background: #f5f5f5;
                }
                .ticket {
                    max-width: 400px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                    border: 2px dashed #333;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .logo {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo-text {
                    font-size: 48px;
                    font-weight: 900;
                    font-family: 'Poppins', sans-serif;
                }
                .logo-chili { color: #FF2E2E; }
                .logo-x { color: #1A1A1A; }
                .slogan {
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 15px;
                }
                .section {
                    margin: 15px 0;
                    padding: 10px 0;
                    border-bottom: 1px dashed #ddd;
                }
                .section:last-child {
                    border-bottom: none;
                }
                .label {
                    font-weight: bold;
                    color: #333;
                }
                .value {
                    color: #666;
                }
                table {
                    width: 100%;
                    margin: 15px 0;
                }
                .total-row {
                    font-size: 18px;
                    font-weight: bold;
                    padding: 15px 8px !important;
                    background: #f9f9f9;
                    border-top: 2px solid #333 !important;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #ddd;
                    font-size: 11px;
                    color: #999;
                }
                .qr-placeholder {
                    width: 120px;
                    height: 120px;
                    margin: 15px auto;
                    background: #f0f0f0;
                    border: 2px dashed #ccc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: #999;
                    text-align: center;
                }
                .print-btn {
                    background: #FF2E2E;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 5px;
                    font-size: 14px;
                    cursor: pointer;
                    margin: 20px auto;
                    display: block;
                }
                .print-btn:hover {
                    background: #e62929;
                }
                @media print {
                    body { background: white; }
                    .print-btn { display: none; }
                    .ticket { border: none; box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="logo">
                    <div class="logo-text">
                        <span class="logo-chili">Chili</span><span class="logo-x">X</span>
                    </div>
                    <div class="slogan">🌶️ El sabor que pica y encanta 🌶️</div>
                </div>
                
                <div class="section">
                    <div><span class="label">Ticket #:</span> <span class="value">${data.orderNumber}</span></div>
                    <div><span class="label">Fecha:</span> <span class="value">${data.date}</span></div>
                    <div><span class="label">Cliente:</span> <span class="value">${data.user.nombre}</span></div>
                    <div><span class="label">Email:</span> <span class="value">${data.user.email}</span></div>
                </div>
                
                <div class="section">
                    <h3 style="margin-bottom: 10px;">Detalle del pedido:</h3>
                    <table>
                        ${itemsList}
                        <tr class="total-row">
                            <td style="padding: 15px 8px;">TOTAL:</td>
                            <td style="padding: 15px 8px; text-align: right;">$${data.total} MXN</td>
                        </tr>
                    </table>
                </div>
                
                <div class="section">
                    <div style="text-align: center; margin: 15px 0;">
                        <strong>📍 PUNTO DE ENTREGA</strong><br>
                        CECyT 8 "Narciso Bassols"<br>
                        Gabriel Mancera 1130<br>
                        Lun-Vie, 10:00 - 16:00
                    </div>
                </div>
                
                <div class="qr-placeholder">
                    <div>
                        🔲 Código QR<br>
                        (Requiere backend)
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>¡Gracias por tu compra!</strong></p>
                    <p>Fundado por David Velázquez</p>
                    <p>hola@chilix.mx | WhatsApp: 55 1234 5678</p>
                </div>
                
                <button class="print-btn" onclick="window.print()">
                    🖨️ Imprimir Ticket
                </button>
            </div>
        </body>
        </html>
    `;

    ticketWindow.document.write(ticketHTML);
    ticketWindow.document.close();

    // Limpiar carrito y recargar después de mostrar ticket
    setTimeout(() => {
        if (confirm('✅ Ticket generado.\n\n¿Deseas volver al inicio?')) {
            window.location.href = 'index.html';
        } else {
            window.location.reload();
        }
    }, 1500);
}

// Inicialización cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Actualizar enlace de usuario
    updateUserLink();
    
    // Renderizar carrito si estamos en esa página
    renderCart();
    
    // Cargar carrito y actualizar contador
    if (typeof loadCart === 'function') {
        loadCart();
    }
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
});