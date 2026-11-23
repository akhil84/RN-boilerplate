// Jest stub for CSS / CSS-module imports (styles are irrelevant to behaviour tests).
module.exports = new Proxy({}, { get: (_target, key) => (key === '__esModule' ? false : key) });
