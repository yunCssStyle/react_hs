module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'plugin:storybook/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-unused-vars': 'warn',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'require-await': 'warn',
    'no-return-await': 'warn',
    'no-console': 'warn',
    'no-var': 'error',
    'prefer-const': 'warn',
    'prefer-arrow-callback': 'warn',
    // example of overriding a rule
    'storybook/hierarchy-separator': 'error',
    // example of disabling a rule
    'storybook/default-exports': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
  },
};
