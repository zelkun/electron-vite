// src/renderer/src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

import './assets/css/styles.css';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// app.use(router)
// app.config.compilerOptions.isCustomElement = (tag) => tag === 'webview'
app.mount('#app');
