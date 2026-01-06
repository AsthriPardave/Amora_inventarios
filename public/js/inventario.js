/**
 * Script para la gestión del inventario
 */

// ============ MODAL ============

function openModal() {
    document.getElementById('productModal').style.display = 'block';
    document.getElementById('productForm').reset();
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        closeModal();
    }
}

// ============ CRUD OPERATIONS ============

// Crear/Actualizar producto
document.getElementById('productForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        cantidad: document.getElementById('cantidad').value,
        precio: document.getElementById('precio').value,
        descripcion: document.getElementById('descripcion').value
    };

    try {
        const response = await fetch('/api/inventario/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            alert('Producto creado exitosamente');
            closeModal();
            location.reload(); // Recargar la página para ver el nuevo producto
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear el producto');
    }
});

// Editar producto
async function editProducto(id) {
    try {
        const response = await fetch(`/api/inventario/productos/${id}`);
        const result = await response.json();

        if (result.success) {
            const producto = result.data;
            
            // Llenar el formulario con los datos del producto
            document.getElementById('nombre').value = producto.nombre;
            document.getElementById('categoria').value = producto.categoria;
            document.getElementById('cantidad').value = producto.cantidad;
            document.getElementById('precio').value = producto.precio;
            document.getElementById('descripcion').value = producto.descripcion;

            openModal();

            // Cambiar el evento del formulario para actualizar
            const form = document.getElementById('productForm');
            form.onsubmit = async function(e) {
                e.preventDefault();
                await updateProducto(id);
            };
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el producto');
    }
}

// Actualizar producto
async function updateProducto(id) {
    const formData = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        cantidad: document.getElementById('cantidad').value,
        precio: document.getElementById('precio').value,
        descripcion: document.getElementById('descripcion').value
    };

    try {
        const response = await fetch(`/api/inventario/productos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            alert('Producto actualizado exitosamente');
            closeModal();
            location.reload();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar el producto');
    }
}

// Eliminar producto
async function deleteProducto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    try {
        const response = await fetch(`/api/inventario/productos/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert('Producto eliminado exitosamente');
            location.reload();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el producto');
    }
}
