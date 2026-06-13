const nodemailer = require('nodemailer');

function mailIsConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  );
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function enviarNotificacionNuevoProfesor({
  destinatarios,
  usuario,
  carrera,
  materia
}) {
  const emails = [...new Set(destinatarios.filter(Boolean))];

  if (emails.length === 0) {
    console.warn('No se encontró un correo de administrador para notificar.');
    return { sent: false, reason: 'missing_recipient' };
  }

  if (!mailIsConfigured()) {
    console.warn('El correo SMTP no está configurado. Revisá las variables SMTP_*.');
    return { sent: false, reason: 'missing_configuration' };
  }

  const transporter = createTransporter();
  const nombreProfesor = `${usuario.apellido}, ${usuario.nombre}`;
  const htmlData = {
    nombreProfesor: escapeHtml(nombreProfesor),
    dni: escapeHtml(usuario.dni),
    email: escapeHtml(usuario.email),
    carrera: escapeHtml(carrera.nombre),
    materia: escapeHtml(materia.nombre)
  };

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: emails.join(', '),
    subject: `Nueva solicitud de profesor: ${nombreProfesor}`,
    text: [
      'Se registró una nueva solicitud de profesor.',
      '',
      `Profesor: ${nombreProfesor}`,
      `DNI: ${usuario.dni}`,
      `Correo: ${usuario.email}`,
      `Carrera: ${carrera.nombre}`,
      `Materia: ${materia.nombre}`,
      '',
      'Ingresá al panel de administración para aprobar o rechazar la solicitud.'
    ].join('\n'),
    html: `
      <h2>Nueva solicitud de profesor</h2>
      <p>Se registró un nuevo profesor que requiere aprobación.</p>
      <ul>
        <li><strong>Profesor:</strong> ${htmlData.nombreProfesor}</li>
        <li><strong>DNI:</strong> ${htmlData.dni}</li>
        <li><strong>Correo:</strong> ${htmlData.email}</li>
        <li><strong>Carrera:</strong> ${htmlData.carrera}</li>
        <li><strong>Materia:</strong> ${htmlData.materia}</li>
      </ul>
      <p>Ingresá al panel de administración para revisar la solicitud.</p>
    `
  });

  return { sent: true, messageId: info.messageId };
}

module.exports = {
  enviarNotificacionNuevoProfesor,
  mailIsConfigured
};
