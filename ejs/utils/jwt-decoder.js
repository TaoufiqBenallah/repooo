const JWT = require('jsonwebtoken');

module.exports = (body) => {
  if (!body) {
    return new Error('invalid jwtdata');
  }

  const jwt =
    process.env.JWT_CUSTOMER_KEY && process.env.JWT_PSWD ? process.env.JWT_PSWD : process.env.JWT;

  return JWT.verify(body.toString('utf8'), jwt, {
    algorithm: 'HS256',
  });
};
