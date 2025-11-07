const globals = require('globals');
const js = require('@eslint/js');

module.exports = [
  {
    ignores: ['node_modules', 'dist', 'build', 'coverage', 'src/public', '**/*.min.js']
  },
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
  }
];
