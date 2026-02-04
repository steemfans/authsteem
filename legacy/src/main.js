import 'regenerator-runtime/runtime';
import '@/styles.less';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { upperFirst, camelCase } from 'lodash';
import urlParse from 'url-parse';
import App from '@/App.vue';
import router from '@/router';
import getPersistedData from '@/persisted';
import messages from '@/translation.json';
import numberFormats from '@/number.json';
import createIdleDetector from '@/helpers/idle';
import { isChromeExtension } from '@/helpers/utils';

let ipc = null;
if (typeof window !== 'undefined' && window.require) {
  ipc = window.require('electron').ipcRenderer;
}

// eslint-disable-next-line import/prefer-default-export
export const idleDetector = createIdleDetector({
  autostop: true,
});

// Helper functions for filters (Vue 3 doesn't have global filters)
export const dateHeaderFilter = value => new Date(value).toLocaleString();
export const parseUrlFilter = value => urlParse(value).host;
export const prettyFilter = value => {
  let json;
  try {
    json = JSON.stringify(JSON.parse(value), null, 2);
  } catch (e) {
    json = value;
  }
  return json;
};

getPersistedData(({ store, url }) => {
  store.dispatch('loadSettings');

  if (ipc) {
    ipc.on('handleProtocol', (e, arg) => {
      const newUrl = `/${arg.slice('steem://'.length)}`;

      router.push(newUrl);
    });
  }

  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages,
    numberFormats,
  });

  const app = createApp(App);

  // Register global components
  const requireComponent = require.context('./components', true, /[\w-]+\.vue$/);
  requireComponent.keys().forEach(fileName => {
    const componentConfig = requireComponent(fileName);
    const componentName = upperFirst(camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, '')));
    app.component(componentName, componentConfig.default || componentConfig);
  });

  // Provide filter functions globally via app.config.globalProperties
  app.config.globalProperties.$filters = {
    dateHeader: dateHeaderFilter,
    parseUrl: parseUrlFilter,
    pretty: prettyFilter,
  };

  app.use(i18n);
  app.use(router);
  app.use(store);

  app.config.productionTip = false;

  // Handle Chrome extension routing
  const { savedPath } = store.state.ui;

  if (isChromeExtension()) {
    if (url) {
      router.push(url);
    } else if (savedPath) {
      router.push(savedPath);
    }

    router.afterEach(to => {
      store.dispatch('savePath', to.path);
    });
  }

  app.mount('#app');
});
