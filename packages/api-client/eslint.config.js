const base = require('@starter/tooling/eslint');
const { boundaries } = require('@starter/tooling/eslint-boundaries');

module.exports = [...base, ...boundaries('api-client')];
