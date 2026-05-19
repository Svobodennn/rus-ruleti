/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  ignorePatterns: ['node_modules/', 'out/', 'dist/', '*.cjs', '*.js'],
  rules: {
    'no-console': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          { name: 'fs', message: 'fs is forbidden in preload — joke app must never touch the filesystem.' },
          { name: 'fs/promises', message: 'fs/promises forbidden in preload.' },
          { name: 'child_process', message: 'child_process forbidden in preload.' },
          { name: 'net', message: 'net forbidden in preload.' },
          { name: 'http', message: 'http forbidden in preload.' },
          { name: 'https', message: 'https forbidden in preload.' },
          { name: 'dgram', message: 'dgram forbidden in preload.' },
        ],
      },
    ],
  },
  overrides: [
    {
      // Main process now uses electron-log as its sole logging transport
      // (see src/main/logger.ts). The global `no-console: 'error'` applies
      // uniformly — any direct console.* in src/main is a bug.
      files: ['src/main/**/*.ts'],
      rules: {},
    },
    {
      files: ['src/preload/**/*.ts'],
      rules: {
        // Hard ban on filesystem / network / shell in preload.
        'no-restricted-imports': [
          'error',
          {
            paths: [
              { name: 'fs', message: 'BANNED in preload.' },
              { name: 'fs/promises', message: 'BANNED in preload.' },
              { name: 'child_process', message: 'BANNED in preload.' },
              { name: 'net', message: 'BANNED in preload.' },
              { name: 'http', message: 'BANNED in preload.' },
              { name: 'https', message: 'BANNED in preload.' },
              { name: 'dgram', message: 'BANNED in preload.' },
              { name: 'cluster', message: 'BANNED in preload.' },
              { name: 'vm', message: 'BANNED in preload.' },
              { name: 'os', message: 'os module banned in preload — use process.platform instead.' },
            ],
            patterns: [
              { group: ['electron/main'], message: 'Main electron imports banned in preload.' },
            ],
          },
        ],
      },
    },
  ],
};
