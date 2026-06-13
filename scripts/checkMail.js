require('dotenv').config();

const {
  verificarConfiguracionCorreo
} = require('../src/Services/mailService');

verificarConfiguracionCorreo()
  .then(() => {
    console.log('Configuración SMTP válida. Gmail aceptó las credenciales.');
  })
  .catch((error) => {
    console.error(`Configuración SMTP inválida: ${error.message}`);
    process.exitCode = 1;
  });
