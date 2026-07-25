/**
 * Chức năng: Băm và kiểm tra mật khẩu bằng PBKDF2 bất đồng bộ
 * Lý do tạo: Tránh lưu mật khẩu plain text và tránh block event loop khi hash
 */

const crypto = require('crypto');

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

const pbkdf2 = (password, salt) => new Promise((resolve, reject) => {
  crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (error, derivedKey) => {
    if (error) return reject(error);
    resolve(derivedKey.toString('hex'));
  });
});

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await pbkdf2(password, salt);
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
};

const verifyPassword = async (password, storedHash) => {
  const parts = String(storedHash).split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;

  const [, iterations, salt, hash] = parts;
  if (Number(iterations) !== ITERATIONS) return false;

  const candidate = await pbkdf2(password, salt);
  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'));
};

module.exports = { hashPassword, verifyPassword };
