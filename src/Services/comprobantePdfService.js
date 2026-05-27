function escaparTextoPdf(texto) {
    return String(texto || '')
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
}

function crearLinea(etiqueta, valor) {
    return `${etiqueta}: ${valor || '-'}`;
}

function generarComprobantePdf(inscripcion) {
    const lineas = [
        'Comprobante de inscripcion a practica profesionalizante',
        '',
        crearLinea('Estado', inscripcion.estado),
        crearLinea('DNI', inscripcion.alumno.dni),
        crearLinea('Apellido y nombre', inscripcion.alumno.apellidoNombre),
        crearLinea('Mail', inscripcion.alumno.email),
        crearLinea('Carrera', inscripcion.carreraAlumno.nombre),
        crearLinea('Practica', inscripcion.grupo.practica.nombre),
        crearLinea('Lugar', inscripcion.grupo.lugar),
        crearLinea('Dias y horario', `${inscripcion.grupo.dia}, ${inscripcion.grupo.horario}`),
        crearLinea('Profesor', inscripcion.grupo.profesor.apellidoNombre),
        crearLinea('Fecha de inscripcion', inscripcion.fechaInscripcion.toLocaleString('es-AR'))
    ];

    const texto = [
        'BT',
        '/F1 16 Tf',
        '50 780 Td',
        ...lineas.map((linea, index) => {
            const prefijo = index === 0 ? '' : '0 -24 Td ';
            return `${prefijo}(${escaparTextoPdf(linea)}) Tj`;
        }),
        'ET'
    ].join('\n');

    const objetos = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        `<< /Length ${Buffer.byteLength(texto, 'utf8')} >>\nstream\n${texto}\nendstream`
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objetos.forEach((objeto, index) => {
        offsets.push(Buffer.byteLength(pdf, 'utf8'));
        pdf += `${index + 1} 0 obj\n${objeto}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objetos.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    offsets.slice(1).forEach((offset) => {
        pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, 'utf8');
}

module.exports = {
    generarComprobantePdf
};
