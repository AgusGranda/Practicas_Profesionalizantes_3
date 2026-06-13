const nodemailer = require('nodemailer');

function mailIsConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  );
}

function smtpPassword() {
  return String(process.env.SMTP_PASSWORD || '').replace(/\s/g, '');
}

function validateMailConfiguration() {
  if (!mailIsConfigured()) {
    throw new Error('El correo SMTP no está configurado.');
  }

  if (
    process.env.SMTP_HOST === 'smtp.gmail.com' &&
    smtpPassword().length !== 16
  ) {
    throw new Error(
      'SMTP_PASSWORD debe ser una contraseña de aplicación de Google de 16 caracteres.'
    );
  }
}

function createTransporter() {
  validateMailConfiguration();

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    family: Number(process.env.SMTP_FAMILY || 4),
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: {
      user: process.env.SMTP_USER,
      pass: smtpPassword()
    },
    tls: {
      servername: process.env.SMTP_HOST
    }
  });
}

function mailFrom() {
  const name = process.env.MAIL_FROM_NAME || 'Gestión de Prácticas';
  return `"${name}" <${process.env.SMTP_USER}>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendMail(options) {
  const transporter = createTransporter();

  return transporter.sendMail({
    from: mailFrom(),
    ...options
  });
}

async function verificarConfiguracionCorreo() {
  const transporter = createTransporter();
  await transporter.verify();
  return true;
}

async function enviarNotificacionNuevoProfesor({
  destinatarios,
  usuario,
  carreras,
  materias
}) {
  const emails = [...new Set(destinatarios.filter(Boolean))];

  if (emails.length === 0) {
    throw new Error('No se encontró un correo de administrador para notificar.');
  }

  const nombreProfesor = `${usuario.apellido}, ${usuario.nombre}`;
  const carrerasTexto = carreras.map(carrera => carrera.nombre).join(', ');
  const materiasTexto = materias.map(materia => materia.nombre).join(', ');

  return sendMail({
    to: emails.join(', '),
    subject: `Nueva solicitud de profesor: ${nombreProfesor}`,
    text: [
      'Se registró una nueva solicitud de profesor.',
      '',
      `Profesor: ${nombreProfesor}`,
      `DNI: ${usuario.dni}`,
      `Correo: ${usuario.email}`,
      `Carreras: ${carrerasTexto}`,
      `Materias: ${materiasTexto}`,
      '',
      'Ingresá al panel de administración para aprobar o rechazar la solicitud.'
    ].join('\n'),
    html: `
      <h2>Nueva solicitud de profesor</h2>
      <p>Se registró un nuevo profesor que requiere aprobación.</p>
      <ul>
        <li><strong>Profesor:</strong> ${escapeHtml(nombreProfesor)}</li>
        <li><strong>DNI:</strong> ${escapeHtml(usuario.dni)}</li>
        <li><strong>Correo:</strong> ${escapeHtml(usuario.email)}</li>
        <li><strong>Carreras:</strong> ${escapeHtml(carrerasTexto)}</li>
        <li><strong>Materias:</strong> ${escapeHtml(materiasTexto)}</li>
      </ul>
      <p>Ingresá al panel de administración para revisar la solicitud.</p>
    `
  });
}

async function enviarRecuperacionPassword({ usuario, resetUrl }) {
  return sendMail({
    to: usuario.email,
    subject: 'Restablecer contraseña',
    text: [
      `Hola ${usuario.nombre},`,
      '',
      'Recibimos una solicitud para restablecer tu contraseña.',
      `Abrí este enlace dentro de los próximos 30 minutos: ${resetUrl}`,
      '',
      'Si no solicitaste el cambio, podés ignorar este correo.'
    ].join('\n'),
    html: `
      <h2>Restablecer contraseña</h2>
      <p>Hola ${escapeHtml(usuario.nombre)}, recibimos una solicitud para restablecer tu contraseña.</p>
      <p>
        <a href="${escapeHtml(resetUrl)}"
           style="display:inline-block;padding:12px 18px;color:#fff;background:#1d5bbf;text-decoration:none;border-radius:8px">
          Crear nueva contraseña
        </a>
      </p>
      <p>El enlace vence en 30 minutos. Si no solicitaste el cambio, ignorá este correo.</p>
    `
  });
}

async function enviarSolicitudInscripcion({ profesor, alumno, practica, panelUrl }) {
  const nombreAlumno = `${alumno.apellido}, ${alumno.nombre}`;

  return sendMail({
    to: profesor.email,
    subject: `Nueva solicitud para ${practica.titulo}`,
    text: [
      `Hola ${profesor.nombre},`,
      '',
      `${nombreAlumno} solicitó inscribirse en la práctica "${practica.titulo}".`,
      `DNI: ${alumno.dni}`,
      `Correo: ${alumno.email}`,
      '',
      `Revisá la solicitud en: ${panelUrl}`
    ].join('\n'),
    html: `
      <h2>Nueva solicitud de inscripción</h2>
      <p>${escapeHtml(nombreAlumno)} quiere inscribirse en <strong>${escapeHtml(practica.titulo)}</strong>.</p>
      <ul>
        <li><strong>DNI:</strong> ${escapeHtml(alumno.dni)}</li>
        <li><strong>Correo:</strong> ${escapeHtml(alumno.email)}</li>
      </ul>
      <p><a href="${escapeHtml(panelUrl)}">Revisar solicitudes pendientes</a></p>
    `
  });
}

async function enviarInscripcionAceptada({ inscripcion, pdf }) {
  const alumno = inscripcion.alumno.usuario;
  const practica = inscripcion.practica;

  return sendMail({
    to: alumno.email,
    subject: `Inscripción aceptada: ${practica.titulo}`,
    text: [
      `Hola ${alumno.nombre},`,
      '',
      `Tu solicitud para la práctica "${practica.titulo}" fue aceptada.`,
      'Adjuntamos el comprobante de inscripción en formato PDF.'
    ].join('\n'),
    html: `
      <h2>Inscripción aceptada</h2>
      <p>Hola ${escapeHtml(alumno.nombre)}, tu solicitud para <strong>${escapeHtml(practica.titulo)}</strong> fue aceptada.</p>
      <p>Encontrarás el comprobante de inscripción adjunto a este correo.</p>
    `,
    attachments: [{
      filename: `comprobante-inscripcion-${inscripcion.id}.pdf`,
      content: pdf,
      contentType: 'application/pdf'
    }]
  });
}

async function enviarInscripcionRechazada({ inscripcion }) {
  const alumno = inscripcion.alumno.usuario;

  return sendMail({
    to: alumno.email,
    subject: `Solicitud no aceptada: ${inscripcion.practica.titulo}`,
    text: `Hola ${alumno.nombre}, tu solicitud para la práctica "${inscripcion.practica.titulo}" no fue aceptada.`,
    html: `
      <h2>Solicitud no aceptada</h2>
      <p>Hola ${escapeHtml(alumno.nombre)}, tu solicitud para <strong>${escapeHtml(inscripcion.practica.titulo)}</strong> no fue aceptada.</p>
    `
  });
}

module.exports = {
  enviarInscripcionAceptada,
  enviarInscripcionRechazada,
  enviarNotificacionNuevoProfesor,
  enviarRecuperacionPassword,
  enviarSolicitudInscripcion,
  mailIsConfigured,
  verificarConfiguracionCorreo
};
