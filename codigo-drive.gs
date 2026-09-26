/**
 * Código para script.google.com
 * 1) Reemplaza 1oNV9TcA6NAfehFvsZbqBJ1MpMKBeAJcR con el ID de tu carpeta de Drive.
 * 2) Implementar > Nueva implementación > Aplicación web
 *    - Ejecutar como: tu cuenta
 *    - Quién tiene acceso: Cualquier usuario
 * 3) Copia la URL que termina en /exec y pégala en index.html
 */

var FOLDER_ID = "1oNV9TcA6NAfehFvsZbqBJ1MpMKBeAJcR";

function getFolder() {
  return DriveApp.getFolderById(FOLDER_ID);
}

// Devuelve la lista de fotos de la carpeta (usado por la galería)
function doGet(e) {
  var folder = getFolder();
  var files = folder.getFiles();
  var images = [];
  while (files.hasNext()) {
    var file = files.next();
    if (file.getMimeType().indexOf("image/") === 0) {
      images.push({
        id: file.getId(),
        name: file.getName(),
        date: file.getDateCreated().getTime(),
        url: "https://lh3.googleusercontent.com/d/" + file.getId()
      });
    }
  }
  images.sort(function (a, b) { return b.date - a.date; });
  return ContentService.createTextOutput(JSON.stringify({ images: images }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Recibe una foto nueva (form-data: data, filename, contentType) y la guarda
function doPost(e) {
  try {
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
