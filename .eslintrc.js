module.exports = {
  root: true,
  env: {
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2020
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint"
  ],
  rules: {
    'comma-dangle': 'off',
    'class-methods-use-this': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/prefer-default-export': 'off',
    "vue/component-name-in-template-casing": ["error", "kebab-case", {
      "ignores": []
    }],
    'prettier/prettier': ['error', { 'singleQuote': true, 'endOfLine': 'auto' }]
  },
  overrides: [{
    files: [
      "**/__tests__/*.{j,t}s?(x)",
      "**/tests/unit/**/*.spec.{j,t}s?(x)"
    ],
    env: {
      mocha: true
    }
  }]
};
