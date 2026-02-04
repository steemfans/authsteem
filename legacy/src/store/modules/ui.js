const state = {
  savedPath: null,
};

const mutations = {
  savePath(_state, path) {
    _state.savedPath = path;
  },
};

const actions = {
  savePath({ commit }, path) {
    commit('savePath', path);
  },
};

export default {
  state,
  mutations,
  actions,
};
