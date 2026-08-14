const multer = require('multer');
const path = require('path');

const crearMulter = (carpeta) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `uploads/${carpeta}`);
        },

        filename: (req, file, cb) => {
            const nombre = Date.now() + path.extname(file.originalname);
            cb(null, nombre);
        }
    });

    return multer({ 
        storage,
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('El archivo debe ser una imagen'));
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    });
};

module.exports = crearMulter;