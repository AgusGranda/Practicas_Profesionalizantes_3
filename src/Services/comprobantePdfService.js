const PDFDocument = require('pdfkit');

function formatDate(value) {
  if (!value) {
    return 'No especificada';
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}

function generarComprobantePdf(inscripcion) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 52,
      info: {
        Title: `Comprobante de inscripción ${inscripcion.id}`,
        Author: 'Sistema de Gestión de Prácticas'
      }
    });
    const chunks = [];
    const alumno = inscripcion.alumno.usuario;
    const practica = inscripcion.practica;

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(0, 0, doc.page.width, 150).fill('#12346b');
    doc
      .fillColor('#ffffff')
      .fontSize(11)
      .text('GESTIÓN DE PRÁCTICAS', 52, 48, { characterSpacing: 1.4 });
    doc
      .fontSize(25)
      .text('Comprobante de inscripción', 52, 78);

    doc
      .fillColor('#17233b')
      .fontSize(11)
      .text(`Comprobante N.º ${inscripcion.id}`, 52, 180);

    const sections = [
      {
        title: 'Datos del alumno',
        rows: [
          ['Apellido y nombre', `${alumno.apellido}, ${alumno.nombre}`],
          ['DNI', alumno.dni],
          ['Correo electrónico', alumno.email]
        ]
      },
      {
        title: 'Datos de la práctica',
        rows: [
          ['Práctica', practica.titulo],
          ['Carrera', practica.materia.carrera.nombre],
          ['Materia', practica.materia.nombre],
          ['Profesor', `${practica.profesor.usuario.apellido}, ${practica.profesor.usuario.nombre}`],
          ['Lugar', practica.lugar],
          ['Período', `${formatDate(practica.fechaInicio)} al ${formatDate(practica.fechaFin)}`],
          ['Horario', `${practica.horarioInicio} a ${practica.horarioFin}`]
        ]
      },
      {
        title: 'Inscripción',
        rows: [
          ['Fecha de inscripción', formatDate(inscripcion.fechaInscripcion)],
          ['Estado', inscripcion.estado]
        ]
      }
    ];

    let y = 220;

    sections.forEach(section => {
      doc
        .fillColor('#12346b')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text(section.title, 52, y);
      y += 28;

      section.rows.forEach(([label, value]) => {
        doc
          .fillColor('#62708a')
          .font('Helvetica-Bold')
          .fontSize(9)
          .text(label.toUpperCase(), 52, y, { width: 150 });
        doc
          .fillColor('#17233b')
          .font('Helvetica')
          .fontSize(11)
          .text(String(value || '-'), 205, y - 1, { width: 330 });
        y += 25;
      });

      y += 15;
    });

    doc
      .moveTo(52, 760)
      .lineTo(543, 760)
      .strokeColor('#dbe4f0')
      .stroke();
    doc
      .fillColor('#62708a')
      .fontSize(9)
      .text(
        'Este comprobante fue generado por el Sistema de Gestión de Prácticas.',
        52,
        775,
        { align: 'center', width: 491 }
      );

    doc.end();
  });
}

module.exports = {
  generarComprobantePdf
};
