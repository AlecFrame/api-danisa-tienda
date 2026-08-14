const sharp = require('sharp');

const procesarImagen = async (rutaEntrada, rutaSalida) => {
    await sharp(rutaEntrada)
        .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({
            quality: 80
        })
        .toFile(rutaSalida);
};

module.exports = {
    procesarImagen
};