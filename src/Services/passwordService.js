const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;
const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$/;

function isPasswordHash(password) {
  return typeof password === 'string' && BCRYPT_PATTERN.test(password);
}

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, storedPassword) {
  if (isPasswordHash(storedPassword)) {
    return bcrypt.compare(password, storedPassword);
  }

  // Compatibilidad temporal para usuarios creados antes de incorporar bcrypt.
  return password === storedPassword;
}

module.exports = {
  hashPassword,
  isPasswordHash,
  verifyPassword
};
