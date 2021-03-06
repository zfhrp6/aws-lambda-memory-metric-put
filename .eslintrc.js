module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    "max-len": ["error", { "code": 120 }],
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "no-useless-constructor": "off",
    "@typescript-eslint/no-useless-constructor": "error",
  },
}
