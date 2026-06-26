# Milano Parfums — Guía de instalación (100% gratuito)

Stack usado, todo gratis:

| Pieza | Para qué sirve | Costo |
|---|---|---|
| **GitHub Pages** | Hospeda tu landing page (el archivo `index.html`) | Gratis |
| **Google Sheets** | Tu base de datos: catálogo de productos, pedidos y suscriptores | Gratis |
| **Google Apps Script** | El "backend": conecta tu sitio con la hoja de cálculo | Gratis |
| **WhatsApp** | El checkout: el cliente confirma su pedido por chat | Gratis |

No necesitas servidor, hosting de pago, ni pasarela de pago para empezar.

---

## Paso 1 — Crear el Google Sheet (tu base de datos)

1. Ve a [sheets.google.com](https://sheets.google.com) y crea una hoja nueva llamada **Milano Parfums DB**.
2. Crea 3 pestañas (clic derecho en la pestaña inferior > Insertar hoja) con estos nombres **exactos**:
   - `Productos`
   - `Pedidos`
   - `Suscriptores`
3. En cada pestaña, escribe estos encabezados en la **fila 1**:

**Productos**
```
ID | Nombre | Casa | Nota | Genero | Precio | Categoria | Color | Stock | Activo
```
- `Categoria`: escribe `bestseller` o `nuevo` (controla en qué carrusel aparece)
- `Color`: un color hex para la botella, ej. `#6E1423`
- `Activo`: `SI` o `NO` (si pones `NO`, el producto se oculta del sitio)

Ejemplo de fila:
```
1 | Aurum Notte | Edición Milano | Especiado oriental · ámbar y vainilla | Unisex | 55 | bestseller | #6E1423 | 12 | SI
```

**Pedidos** (se llena sola, no escribas nada)
```
Fecha | Nombre | Telefono | Items | Total | Mensaje
```

**Suscriptores** (se llena sola)
```
Fecha | Email
```

4. Agrega tus productos reales en `Productos`, una fila por cada fragancia.

---

## Paso 2 — Publicar el backend con Apps Script

1. En tu Google Sheet, ve a **Extensiones > Apps Script**.
2. Borra el código de ejemplo y pega el contenido completo de **`Code.gs`** (te lo entregué aparte).
3. En las dos primeras líneas del código, reemplaza:
   - `SHEET_ID` → el ID de tu hoja. Lo encuentras en la URL:
     `https://docs.google.com/spreadsheets/d/`**`ESTE-ES-EL-ID`**`/edit`
   - `NOTIFICATION_EMAIL` → tu correo, para recibir aviso de cada pedido (o déjalo vacío `''`).
4. Guarda (ícono de disco o Ctrl+S).
5. Clic en **Implementar > Nueva implementación**.
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo (tu correo)**
   - Quién tiene acceso: **Cualquier usuario**
6. Autoriza los permisos cuando te lo pida (es tu propio script, es seguro).
7. Copia la **URL de la aplicación web** que te entrega. Se ve así:
   `https://script.google.com/macros/s/AKfycbx.../exec`

> Cada vez que modifiques `Code.gs`, debes volver a "Implementar > Gestionar implementaciones > editar (ícono lápiz) > Nueva versión" para que los cambios se publiquen.

---

## Paso 3 — Conectar el sitio con tu backend

1. Abre `index.html`.
2. Busca, cerca del inicio del `<script>`, el bloque `CONFIG`:
   ```js
   const CONFIG = {
     API_URL: "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT",
     WHATSAPP_NUMBER: "51900000000"
   };
   ```
3. Reemplaza `API_URL` con la URL que copiaste en el paso 2.
4. Reemplaza `WHATSAPP_NUMBER` con tu número de WhatsApp real, formato internacional sin "+" ni espacios (ej. número de Perú: `519XXXXXXXX`).

Con esto, el catálogo se carga directo desde tu Google Sheet: para añadir, editar o agotar un producto, **solo edita la hoja de cálculo** — no toques el código.

---

## Paso 4 — Publicar el sitio gratis con GitHub Pages

1. Crea una cuenta en [github.com](https://github.com) si no tienes una.
2. Crea un repositorio nuevo, por ejemplo `milano-parfums` (puede ser público).
3. Sube el archivo `index.html` a la raíz del repositorio (botón "Add file > Upload files").
4. Ve a **Settings > Pages** dentro del repositorio.
5. En "Branch", elige `main` y la carpeta `/ (root)`. Guarda.
6. Espera 1–2 minutos. Tu sitio quedará publicado en:
   `https://TU-USUARIO.github.io/milano-parfums/`

Puedes conectar un dominio propio (ej. `milanoparfums.pe`) en la misma sección de Pages, agregando un registro CNAME en tu proveedor de dominio.

---

## Cómo funciona el flujo de compra

1. El cliente agrega fragancias al carrito (se guarda en su navegador).
2. Al hacer clic en **"Finalizar por WhatsApp"**:
   - Se genera un mensaje con el detalle del pedido y el total.
   - Se registra automáticamente una fila en la pestaña `Pedidos` de tu Sheet (para que tengas respaldo aunque el chat se pierda).
   - Se abre WhatsApp con el mensaje ya armado, listo para que confirmes el pago y el envío con el cliente.
3. El formulario de newsletter guarda los correos en la pestaña `Suscriptores`, para que más adelante les escribas promociones (por ejemplo, con Gmail + "combinar correspondencia" o cualquier herramienta de email marketing gratuita).

---

## Próximos pasos posibles (cuando quieras crecer)

- **Imágenes reales de producto**: sube fotos a Google Drive o a la carpeta del repo y agrega una columna `ImagenURL` en `Productos`.
- **Pagos en línea**: cuando quieras cobrar con tarjeta sin depender solo de WhatsApp, podemos integrar una pasarela peruana (Niubiz, Mercado Pago, Culqi) — todas tienen planes gratuitos para empezar y cobran solo comisión por venta.
- **Dominio propio**: comprar `milanoparfums.pe` o `.com` (costo anual bajo) y apuntarlo a GitHub Pages.
- **Panel de pedidos**: como todo se guarda en Sheets, puedes crear un Google Data Studio / Looker Studio gratuito conectado a la hoja para ver tus ventas en un dashboard.
