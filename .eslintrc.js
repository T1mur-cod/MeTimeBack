module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    camelcase: 0,
    'max-len': 0,
    'no-underscore-dangle': 0,
    'no-restricted-syntax': 0,
    'no-console': 0,
  },
};
