const Auditoria = require('../models/Auditoria');
const os = require('os');

async function crearAuditoria(
    entidad,
    idEntidad,
    accion,
    descripcion,
    usuario,
    datoExtra
) {
    try {
        /*
        console.log('[crearAuditoria] Recibido:', {
            entidad,
            idEntidad,
            accion,
            descripcion,
            usuario,
            datoExtra
        });
        */

        const auditoria = await Auditoria.create({
            entidad,
            idEntidad,
            accion,
            descripcion,
            fecha: new Date(),
            usuario,
            datoExtra
        });

        console.log('[crearAuditoria] Auditoría creada:', auditoria);

        return auditoria;
    } catch (error) {
        console.error('[crearAuditoria] ERROR AL CREAR:', error);
        console.error('[crearAuditoria] Mensaje:', error.message);
        console.error('[crearAuditoria] Stack:', error.stack);

        throw error;
    }
}

// Obtener IP local
function obtenerIPLocal() {
    const interfaces = os.networkInterfaces();

    // Priorizar la interfaz Ethernet
    if (interfaces['Ethernet']) {
        for (const net of interfaces['Ethernet']) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }

    // Si Ethernet no está disponible, buscar otra IPv4
    for (const nombre of Object.keys(interfaces)) {
        for (const net of interfaces[nombre]) {
            if (
                net.family === 'IPv4' &&
                !net.internal &&
                !nombre.toLowerCase().includes('radmin') &&
                !nombre.toLowerCase().includes('virtual')
            ) {
                return net.address;
            }
        }
    }

    return 'No encontrada';
}

function obtenerIPLocal2() {
    const interfaces = os.networkInterfaces();

    for (const nombre of Object.keys(interfaces)) {
        for (const net of interfaces[nombre]) {

            if (net.family !== 'IPv4' || net.internal) {
                continue;
            }

            // Ignorar interfaces virtuales
            const nombreLower = nombre.toLowerCase();

            if (
                nombreLower.includes('radmin') ||
                nombreLower.includes('virtual') ||
                nombreLower.includes('vmware') ||
                nombreLower.includes('vpn')
            ) {
                continue;
            }

            // Red local privada
            if (
                net.address.startsWith('192.168.') ||
                net.address.startsWith('10.') ||
                (net.address.startsWith('172.') &&
                 parseInt(net.address.split('.')[1]) >= 16 &&
                 parseInt(net.address.split('.')[1]) <= 31)
            ) {
                return net.address;
            }
        }
    }

    return 'No encontrada';
}

module.exports = {
    crearAuditoria,
    obtenerIPLocal,
    obtenerIPLocal2
};