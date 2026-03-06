module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
  },
  overrides: [
    {
      files: ['tests/**/*.js', 'playwright.config.js'],
      env: { node: true, browser: false },
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'import/extensions': 'off',
        'no-console': 'off',
        'no-restricted-syntax': 'off',
        'no-await-in-loop': 'off',
      },
    },
  ],
};
