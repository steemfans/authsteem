// Rationale behind those persistent forms is exactly the same as Metamask's:
// https://github.com/MetaMask/metamask-extension/blob/develop/docs/form_persisting_architecture.md
// The only difference is in the implementation (Metamask uses localStorage), in this case we
// save form state to Vuex which is synced to the background script.

const state = {
  login: {
    username: '',
    key: '',
  },
  import: {
    step: 1,
    username: '',
    password: '',
    key: '',
    keyConfirmation: '',
  },
};

const mutations = {
  saveLoginUsername(_state, username) {
    _state.login.username = username;
  },
  saveLoginKey(_state, key) {
    _state.login.key = key;
  },
  saveImportStep(_state, step) {
    _state.import.step = step;
  },
  saveImportUsername(_state, username) {
    _state.import.username = username;
  },
  saveImportPassword(_state, password) {
    _state.import.password = password;
  },
  saveImportKey(_state, key) {
    _state.import.key = key;
  },
  saveImportKeyConfirmation(_state, keyConfirmation) {
    _state.import.keyConfirmation = keyConfirmation;
  },
};

const actions = {};

export default { state, mutations, actions };
