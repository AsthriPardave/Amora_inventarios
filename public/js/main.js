/**
 * Script principal de la aplicación
 */

// Función para manejar errores de forma general
function handleError(error) {
    console.error('Error:', error);
    alert('Ha ocurrido un error. Por favor, intenta de nuevo.');
}

// Función para mostrar mensajes de éxito
function showSuccess(message) {
    alert(message);
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Amora Inventarios - Sistema cargado correctamente');
    
    // ============ MENÚ MÓVIL ============
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navDropdowns = document.querySelectorAll('.nav-dropdown');
    
    // Toggle menú principal en móvil
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Cambiar icono
            const icon = this.querySelector('i') || this;
            if (navMenu.classList.contains('active')) {
                icon.textContent = '✕';
            } else {
                icon.textContent = '☰';
            }
        });
    }
    
    // Dropdown mejorado - funciona tanto en escritorio como móvil
    navDropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        const menu = dropdown.querySelector('.nav-dropdown-menu');
        let closeTimeout;
        
        if (toggle && menu) {
            // Click en el toggle
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                
                // En móvil, toggle el dropdown
                if (window.innerWidth <= 768) {
                    dropdown.classList.toggle('active');
                } else {
                    // En escritorio, mostrar el menú
                    dropdown.classList.add('show');
                }
            });
            
            // Mantener el menú abierto en escritorio con hover
            if (window.innerWidth > 768) {
                dropdown.addEventListener('mouseenter', function() {
                    clearTimeout(closeTimeout);
                    dropdown.classList.add('show');
                });
                
                dropdown.addEventListener('mouseleave', function() {
                    closeTimeout = setTimeout(() => {
                        dropdown.classList.remove('show');
                    }, 300); // Delay de 300ms antes de cerrar
                });
            }
        }
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.navbar')) {
            navMenu?.classList.remove('active');
            navDropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
            if (navToggle) {
                const icon = navToggle.querySelector('i') || navToggle;
                icon.textContent = '☰';
            }
        }
    });
    
    // Ajustar menú al cambiar tamaño de ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu?.classList.remove('active');
            navDropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
            if (navToggle) {
                const icon = navToggle.querySelector('i') || navToggle;
                icon.textContent = '☰';
            }
        }
    });
});
