// src/renderer/src/main.js

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

import './assets/css/styles.css';
import './assets/css/settings.css';

const theme = (await window.electronAPI.invoke('get-config-value', 'settings', 'theme')) || 'light';
document.documentElement.setAttribute('data-theme', theme);

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// app.use(router)
// app.config.compilerOptions.isCustomElement = (tag) => tag === 'webview'
app.mount('#app');
