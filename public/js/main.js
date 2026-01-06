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
});
