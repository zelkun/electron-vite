// src/renderer/src/popup.js

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './Popup.vue';

import './assets/css/styles.css';

const theme = (await window.popupAPI.invoke('get-config-value', 'settings', 'theme')) || 'light';
document.documentElement.setAttribute('data-theme', theme);

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.mount('#app');
