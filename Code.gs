/**
 * MILANO PARFUMS — Backend gratuito con Google Apps Script + Google Sheets
 * ---------------------------------------------------------------------
 * Qué hace:
 *  - doGet  -> devuelve el catálogo de productos (pestaña "Productos") como JSON
 *  - doPost -> guarda pedidos (pestaña "Pedidos") y suscriptores (pestaña "Suscriptores")
 *
 * CÓMO INSTALARLO (ver README-setup.md para el paso a paso con capturas):
 *  1. Crea un Google Sheet con 3 pestañas: Productos, Pedidos, Suscriptores
 *  2. Extensiones > Apps Script > pega este código
 *  3. Reemplaza SHEET_ID y NOTIFICATION_EMAIL abajo
 *  4. Implementar > Nueva implementación > Aplicación web
 *     - Ejecutar como: Yo
 *     - Quién tiene acceso: Cualquier usuario
 *  5. Copia la URL que te entrega y pégala en CONFIG.API_URL dentro de index.html
 */

// 1) Reemplaza con el ID de tu Google Sheet (está en la URL, entre /d/ y /edit)
const SHEET_ID = 'PON_AQUI_EL_ID_DE_TU_GOOGLE_SHEET';

// 2) Correo donde quieres recibir una notificación cada vez que llega un pedido
//    (déjalo como '' si no quieres recibir correos)
const NOTIFICATION_EMAIL = 'tu-correo@gmail.com';

/* ======================= ENDPOINTS ======================= */

function doGet(e) {
  const action = (e.parameter.action || 'productos').toLowerCase();
  if (action === 'productos') {
    return jsonResponse(getProductos());
  }
  return jsonResponse({ error: 'Acción no reconocida: ' + action });
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'JSON inválido' });
  }

  switch (data.action) {
    case 'pedido':
      return jsonResponse(guardarPedido(data));
    case 'suscriptor':
      return jsonResponse(guardarSuscriptor(data));
    default:
      return jsonResponse({ ok: false, error: 'Acción no reconocida: ' + data.action });
  }
}

/* ======================= LÓGICA ======================= */

function getSheet(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
}

// Lee la pestaña "Productos" y la convierte en una lista de objetos JSON.
// Encabezados esperados en la fila 1:
// ID | Nombre | Casa | Nota | Genero | Precio | Categoria | Color | Stock | Activo
function getProductos() {
  const sheet = getSheet('Productos');
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();
  const idxActivo = headers.indexOf('Activo');

  return rows
    .filter(r => r[0] !== '') // ignora filas vacías
    .filter(r => idxActivo === -1 || String(r[idxActivo]).toUpperCase() !== 'NO')
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = r[i]; });
      return obj;
    });
}

// Agrega una fila a "Pedidos" y envía un correo de notificación (opcional).
// Columnas: Fecha | Nombre | Telefono | Items | Total | Mensaje
function guardarPedido(data) {
  const sheet = getSheet('Pedidos');
  const itemsTexto = (data.items || [])
    .map(it => `${it.nombre} x${it.cantidad} (S/. ${it.precio})`)
    .join(' | ');

  sheet.appendRow([
    new Date(),
    data.nombre || '',
    data.telefono || '',
    itemsTexto,
    data.total || 0,
    data.mensaje || ''
  ]);

  if (NOTIFICATION_EMAIL) {
    MailApp.sendEmail(
      NOTIFICATION_EMAIL,
      'Nuevo pedido — Milano Parfums',
      `Cliente: ${data.nombre || '(sin nombre)'}\n` +
      `Teléfono: ${data.telefono || '(no proporcionado)'}\n\n` +
      `Items:\n${itemsTexto}\n\n` +
      `Total: S/. ${data.total}`
    );
  }

  return { ok: true };
}

// Agrega un correo a "Suscriptores" evitando duplicados.
// Columnas: Fecha | Email
function guardarSuscriptor(data) {
  const sheet = getSheet('Suscriptores');
  const email = (data.email || '').trim().toLowerCase();
  if (!email) return { ok: false, error: 'Email vacío' };

  const existentes = sheet.getDataRange().getValues().map(r => String(r[1]).toLowerCase());
  if (existentes.includes(email)) {
    return { ok: true, mensaje: 'ya estaba suscrito' };
  }

  sheet.appendRow([new Date(), email]);
  return { ok: true };
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
