module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: ['plugin:vue/vue3-essential', '@vue/eslint-config-airbnb', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'prettier/prettier': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-template-target-blank': 'off',
    'vue/require-default-prop': 'off',
    'vue/html-button-has-type': 'off',
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'vuejs-accessibility/form-control-has-label': 'off',
    'vuejs-accessibility/anchor-has-content': 'off',
    'vuejs-accessibility/label-has-for': 'off',
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: ['_state', 'state'],
    }],
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
};
