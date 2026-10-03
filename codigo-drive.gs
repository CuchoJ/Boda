/**
 * Código para script.google.com
 * 1) Reemplaza PON_AQUI_EL_ID_DE_TU_CARPETA con el ID de tu carpeta de Drive.
 * 2) Implementar > Nueva implementación > Aplicación web
 *    - Ejecutar como: tu cuenta
 *    - Quién tiene acceso: Cualquier usuario
 * 3) Copia la URL que termina en /exec y pégala en index.html
 */

var FOLDER_ID = "1oNV9TcA6NAfehFvsZbqBJ1MpMKBeAJcR";

function getFolder() {
  return DriveApp.getFolderById(FOLDER_ID);
}

// Devuelve la lista de fotos y videos de la carpeta (usado por la galería)
function doGet(e) {
  var folder = getFolder();
  var files = folder.getFiles();
  var images = [];
  while (files.hasNext()) {
    var file = files.next();
    var mime = file.getMimeType();
    if (mime.indexOf("image/") === 0 || mime.indexOf("video/") === 0) {
      images.push({
        id: file.getId(),
        name: file.getName(),
        date: file.getDateCreated().getTime(),
        mimeType: mime,
        url: "https://lh3.googleusercontent.com/d/" + file.getId()
      });
    }
  }
  images.sort(function (a, b) { return b.date - a.date; });
  return ContentService.createTextOutput(JSON.stringify({ images: images }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Recibe una foto nueva (form-data: data, filename, contentType) y la guarda,
// o finaliza un archivo subido directo a Drive por el invitado (action=finalize, fileId)
function doPost(e) {
  try {
    if (e.parameter.action === "finalize") {
      return finalizeUpload(e.parameter.fileId);
    }

    var folder = getFolder();
    var data = e.parameter.data;
    var filename = e.parameter.filename || ("foto_" + new Date().getTime() + ".jpg");
    var contentType = e.parameter.contentType || "image/jpeg";
    var decoded = Utilities.base64Decode(data);
    var blob = Utilities.newBlob(decoded, contentType, filename);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return ContentService.createTextOutput(JSON.stringify({ success: true, id: file.getId() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// El invitado ya subió el archivo directo a su Drive (sin límite de tamaño) e inició sesión.
// Aquí lo compartimos como visible para cualquiera y lo añadimos a la carpeta de la boda.
function finalizeUpload(fileId) {
  try {
    var folder = getFolder();
    var file = DriveApp.getFileById(fileId);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    folder.addFile(file);
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
