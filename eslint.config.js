const globals = require('globals');
const js = require('@eslint/js');

module.exports = [
  {
    ignores: [
      'node_modules',
      'dist',
      'build',
      'public/build',
      'coverage',
      'src/assets',
      'src/public', // legacy location
      'src/x public - to be deleted', // legacy static assets slated for removal
      'src/x views - to be deleted', // legacy pug views slated for removal
      '**/*.min.js'
    ]
  },
  // Default: Node + Jest environment for backend code
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: { ...globals.node, ...globals.jest }
    },
    rules: {
      ...js.configs.recommended.rules,
      curly: ['error', 'all'],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-var': 'error',
      'prefer-const': 'warn'
    }
  },
  // Browser environment for front-end scripts in /public/js (now unified) and main bundle entry
  {
    files: ['public/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: { ...globals.browser }
    }
  }
];
