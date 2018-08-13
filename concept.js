const crypto = require('crypto');
const assert = require('assert')

const server = crypto.createDiffieHellman(128);
const serverKey = server.generateKeys();

const user = crypto.createDiffieHellman(server.getPrime(), server.getGenerator());
const userKey = user.generateKeys();

const serverSecret = server.computeSecret(userKey);
const userSecret = user.computeSecret(serverKey);

console.log(serverSecret.toString('hex'));

assert.strictEqual(userSecret.toString('hex'), serverSecret.toString('hex'));