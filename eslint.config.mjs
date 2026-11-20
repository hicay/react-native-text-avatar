import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['lib/', 'node_modules/', 'coverage/', '*.config.js', 'scripts/', 'gradient.js'] },
  ...tseslint.configs.recommended
);
