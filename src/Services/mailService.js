const store = require('../Data/store');
const { generarComprobantePdf } = require('./comprobantePdfService');

async function enviarComprobanteInscripcion(inscripcion) {
    const pdf = generarComprobantePdf(inscripcion);
    const mail = {
        para: inscripcion.alumno.email,
        asunto: 'Comprobante de inscripcion a practica profesionalizante',
        texto: `Hola ${inscripcion.alumno.apellidoNombre}, adjuntamos el comprobante de tu inscripcion.`,
        adjunto: {
            nombre: `comprobante-inscripcion-${inscripcion.id}.pdf`,
            tipo: 'application/pdf',
            bytes: pdf.length
        }
    };

    await store.registrarMailEnviado(mail);
    console.log(`Mail simulado enviado a ${mail.para} con ${mail.adjunto.nombre}`);

    return mail;
}

module.exports = {
    enviarComprobanteInscripcion
};
