import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['lib/', 'node_modules/', 'coverage/', '*.config.js', 'scripts/'] },
  ...tseslint.configs.recommended
);
