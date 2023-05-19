module.exports = {
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'linebreak-style': 0,
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['spec/**/*', 'spec-integration/**/*'] }],
    'no-plusplus': 0,
    'no-unused-vars': 0,
    'no-await-in-loop': 0,
    'prefer-default-export': 0,
    'import/prefer-default-export': 0,
    'import/no-import-module-exports': 0,
    'no-restricted-syntax': 0,
    'class-methods-use-this': 1,
    'max-len': ['error', { code: 180 }],
    'no-param-reassign': 1,
    'no-return-assign': 1,
    'no-use-before-define': 0,
    'comma-dangle': 0,
    'object-curly-newline': 0,
    camelcase: 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
