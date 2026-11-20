module.exports = [
  { ignores: ['build/**', 'node_modules/**', 'docs/**', '.idea/**'] },
  {
    files: ['src/**/*.js', 'webpack/**/*.js', '*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        module: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        document: 'readonly',
        window: 'readonly',
        IntersectionObserver: 'readonly',
        ResizeObserver: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        performance: 'readonly',
        Image: 'readonly',
        Float32Array: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error'
    }
  },
  {
    files: ['src/entries/**/*.js', 'src/modules/home-wave*.js'],
    languageOptions: { sourceType: 'module' }
  }
];
