# 🏪 Amora Inventarios

Sistema integral de gestión de ventas e inventario para tiendas de calzado, con integración a Google Sheets.

## � Inicio Rápido

### ¿Primera vez configurando Google Sheets?

📖 **[GUÍA COMPLETA DE CONFIGURACIÓN](GUIA_GOOGLE_SHEETS.md)** - Paso a paso detallado (10 pasos)

⚡ **[INICIO RÁPIDO](INICIO_RAPIDO.md)** - Resumen de 3 pasos

📋 **[PLANTILLAS](PLANTILLAS_GOOGLE_SHEETS.md)** - Encabezados para copiar/pegar

✅ **[RESUMEN](RESUMEN_CONFIGURACION.md)** - Todo lo que se configuró

### Verificar Configuración
```bash
npm run verify
```

---

## �📋 Características

### Módulos Principales

#### � Gestión de Productos
- Registro simplificado de productos disponibles para venta
- Campos: Fecha, Modelo, Talla(s), Cantidad
- Cada registro representa un nuevo stock
- Tallas individuales (38) o rangos (36-39)
- Lista completa de productos con estado de stock

#### 🛒 Gestión de Ventas
- Registro de ventas con validación de delivery
- Selección de ciudad de destino (Lima y Provincias)
- Captura de datos del cliente (WhatsApp)
- **Reglas de negocio implementadas:**
  - ✅ El delivery debe estar pagado para registrar la venta
  - ✅ El stock solo se descuenta si el delivery está confirmado
  - ✅ Si no hay pago de delivery, la venta no se registra

#### 📊 Inventario Inteligente
- Vista detallada por modelo y talla
- Filtros avanzados de búsqueda
- Indicadores visuales de stock:
  - ✅ Stock disponible (verde)
  - ⚠️ Stock bajo < 5 unidades (amarillo)
  - ❌ Sin stock (rojo)
- Estadísticas en tiempo real

#### 🔄 Gestión de Cambios de Talla
Sistema especializado para cambios de talla:
- Búsqueda de pedidos por número de WhatsApp
- Registro de talla que sale → talla que entra
- Estados: Pendiente / Realizado
- Indicadores visuales con colores (rojo sale / verde entra)
- Animación de flecha entre tallas

#### 📋 Políticas de la Empresa
Documentación completa de:
- Políticas de ventas
- Políticas de delivery
- Políticas de cambios y devoluciones
- Políticas de inventario
- Políticas de atención al cliente
- Políticas de precios

## 🚀 Tecnologías

- **Backend:** Node.js + Express
- **Template Engine:** EJS
- **Estilos:** CSS3 (Responsive)
- **Base de datos:** Google Sheets API
- **Contenedor:** Docker

## 📦 Instalación

### Con Docker (Recomendado)

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd Amora_inventarios
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Edita el archivo .env con tus credenciales
```

3. **Construir y ejecutar:**
```bash
# Producción
docker-compose up -d

# Desarrollo (con hot reload)
docker-compose -f docker-compose.dev.yml up
```

4. **Acceder a la aplicación:**
```
http://localhost:3000
```

### Sin Docker

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Edita el archivo .env
```

3. **Ejecutar:**
```bash
# Producción
npm start

# Desarrollo
npm run dev
```

## ⚙️ Configuración de Google Sheets

Ver [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) para instrucciones detalladas.

Variables requeridas en `.env`:
```env
GOOGLE_SHEETS_SPREADSHEET_ID=tu_id_de_hoja
GOOGLE_SHEETS_CLIENT_EMAIL=tu_servicio@proyecto.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 📁 Estructura del Proyecto

```
Amora_inventarios/
├── src/
│   ├── config/           # Configuraciones
│   ├── controllers/      # Lógica de negocio
│   │   ├── ventas.controller.js
│   │   ├── ingresos.controller.js
│   │   ├── cambios.controller.js
│   │   ├── inventario.controller.js
│   │   └── politicas.controller.js
│   ├── models/           # Modelos de datos
│   ├── routes/           # Rutas de la aplicación
│   ├── services/         # Servicios (Google Sheets)
│   ├── middlewares/      # Middlewares personalizados
│   └── views/            # Vistas EJS
│       ├── ingresos/
│       ├── ventas/
│       ├── cambios/
│       ├── inventario/
│       ├── politicas/
│       └── partials/
├── public/
│   ├── css/             # Estilos
│   ├── js/              # Scripts del cliente
│   └── images/          # Imágenes
├── Dockerfile           # Imagen de producción
├── Dockerfile.dev       # Imagen de desarrollo
├── docker-compose.yml   # Configuración Docker producción
└── docker-compose.dev.yml # Configuración Docker desarrollo
```

## 🎯 Uso del Sistema

### Flujo de Trabajo Típico

1. **Registrar Ingreso de Productos**
   - Ve a "Registrar Ingreso"
   - Ingresa fecha, modelo y cantidad por talla
   - Guarda el ingreso

2. **Realizar una Venta**
   - Ve a "Registrar Venta"
   - Selecciona modelo, talla y cantidad
   - Elige ciudad de destino
   - **IMPORTANTE:** Marca "Delivery Pagado"
   - Ingresa WhatsApp del cliente
   - Registra la venta

3. **Gestionar Cambios**
   - Ve a "Solicitar Cambio"
   - Selecciona el tipo de cambio
   - Completa los datos
   - El sistema genera el mensaje y enlace de WhatsApp

4. **Consultar Inventario**
   - Ve a "Ver Inventario"
   - Usa los filtros para buscar
   - Revisa el stock disponible por talla

## 🔐 Reglas de Negocio

### Ventas
- ✅ Delivery debe estar pagado = Stock se descuenta
- ❌ Delivery no pagado = Venta no se registra

### Stock
- Stock normal: ≥ 5 unidades
- Stock bajo: < 5 unidades (advertencia)
- Sin stock: 0 unidades (no disponible)

### Tallas
- Rango soportado: 35 - 40
- Control individual por talla

## 🎨 Características de Diseño

- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Interfaz intuitiva con iconos
- ✅ Indicadores visuales de estado
- ✅ Mensajes de confirmación y error
- ✅ Navegación con menú dropdown
- ✅ Formularios validados

## 📱 Responsive Design

El sistema está optimizado para:
- 📱 Móviles (< 768px)
- 💻 Tablets (768px - 1024px)
- 🖥️ Desktop (> 1024px)

## 🔄 Próximas Funcionalidades

- [ ] Reportes y estadísticas avanzadas
- [ ] Gráficos de ventas
- [ ] Exportación de datos
- [ ] Sistema de usuarios y roles
- [ ] Notificaciones automáticas
- [ ] Integración con WhatsApp Business API
- [ ] Gestión de proveedores
- [ ] Control de gastos

## 🐛 Troubleshooting

### El contenedor no inicia
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Error de Google Sheets
- Verifica las credenciales en `.env`
- Asegúrate de que la cuenta de servicio tiene acceso a la hoja

### Puerto 3000 ocupado
Cambia el puerto en `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Usa el puerto 8080 en su lugar
```

## 📄 Documentación Adicional

- [Guía de Docker](DOCKER_README.md)
- [Configuración de Google Sheets](GOOGLE_SHEETS_SETUP.md)

## 🤝 Contribuir

Este es un proyecto privado. Para contribuir, contacta al administrador.

## 📝 Licencia

ISC

---

**Desarrollado para Amora - Sistema de Gestión de Inventarios** 🏪
